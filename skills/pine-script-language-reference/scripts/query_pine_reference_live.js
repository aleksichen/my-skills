#!/usr/bin/env node
/**
 * Live Pine v6 reference query without local index files.
 *
 * It follows the runtime path:
 * loadReference -> getReference(v6) -> dynamic chunk(s) -> module export.
 */

const https = require("https");
const vm = require("vm");

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "GET",
        headers: {
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          accept: "text/html,application/javascript,*/*;q=0.9",
          "accept-language": "en-US,en;q=0.9",
          connection: "keep-alive",
          referer: "https://www.tradingview.com/",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(fetch(res.headers.location));
        }
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function parseArgs(argv) {
  const args = {
    term: "",
    prefix: false,
    limit: 20,
    listModules: false,
    module: "",
    moduleListEntries: false,
    json: false,
    evidence: false,
  };
  const rest = [...argv];
  while (rest.length) {
    const token = rest.shift();
    if (token === "--prefix") args.prefix = true;
    else if (token === "--limit") args.limit = Number(rest.shift() || "20");
    else if (token === "--list-modules") args.listModules = true;
    else if (token === "--module") args.module = String(rest.shift() || "").trim();
    else if (token === "--module-list-entries") args.moduleListEntries = true;
    else if (token === "--json") args.json = true;
    else if (token === "--evidence") args.evidence = true;
    else if (!args.term) args.term = token;
  }
  if (!args.term && !args.listModules && !args.module) {
    throw new Error(
      "Usage: query_pine_reference_live.js <term> [--prefix] [--limit N] [--json] [--evidence] | --list-modules [--limit N] [--json] | --module <name> [--module-list-entries] [--limit N] [--json]"
    );
  }
  return args;
}

function normalizeName(name) {
  return String(name || "").trim().replace(/\(\)$/, "");
}

function categoryFromKey(key) {
  switch (key) {
    case "variables":
      return "Variables";
    case "constants":
      return "Constants";
    case "functions":
    case "methods":
      return "Functions";
    case "keywords":
      return "Keywords";
    case "types":
      return "Types";
    case "operators":
      return "Operators";
    case "annotations":
      return "Annotations";
    default:
      return "Unknown";
  }
}

function extractHtmlScriptUrls(html) {
  return [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
}

function findRuntimeUrl(urls) {
  const runtime = urls.find((u) => /\/runtime\.[^/]+\.js$/.test(u));
  if (!runtime) throw new Error("Runtime bundle not found from page HTML.");
  return runtime;
}

async function findReferenceChunkUrl(urls) {
  // Prefer known chunk naming when available, but do not rely on it.
  const preferred = urls.find((u) => /\/37403\.[^/]+\.js$/.test(u));
  if (preferred) return preferred;

  // Dynamic fallback: detect the bundle that defines getReference/loadReference logic.
  for (const url of urls) {
    try {
      const source = await fetch(url);
      if (
        source.includes("getReference:()=>") &&
        source.includes("PineLanguage.V6") &&
        source.includes("Promise.all")
      ) {
        return url;
      }
    } catch (_) {
      // Ignore candidate failures.
    }
  }
  throw new Error("Reference logic chunk not found from page scripts.");
}

function parseV6LoadChain(referenceChunkSource) {
  const v6Case = referenceChunkSource.match(
    /case\s+[A-Za-z_$][\w$]*\.PineLanguage\.V6\s*:\s*[A-Za-z_$][\w$]*\s*=\s*\(await\s+Promise\.all\(\[(.*?)\]\)\.then\([A-Za-z_$][\w$]*\.bind\([A-Za-z_$][\w$]*,\s*(\d+)\)\)\)\.default/
  );
  if (!v6Case) {
    throw new Error("Could not parse V6 load chain from reference chunk.");
  }

  const chunkExpr = v6Case[1];
  const chunkIds = [...chunkExpr.matchAll(/[A-Za-z_$][\w$]*\.e\((\d+)\)/g)].map((m) => Number(m[1]));
  const moduleId = Number(v6Case[2]);
  if (!chunkIds.length || !Number.isFinite(moduleId)) {
    throw new Error("Parsed V6 load chain is incomplete.");
  }
  return { chunkIds, moduleId };
}

function resolveChunkFilename(runtimeSource, chunkId) {
  const langConcatPattern = new RegExp(
    `if\\(${chunkId}===e\\)return"__LANG__\\."\\+e\\+"\\.([a-f0-9]+)\\.js"`
  );
  const langConcatMatch = runtimeSource.match(langConcatPattern);
  if (langConcatMatch) return `__LANG__.${chunkId}.${langConcatMatch[1]}.js`;

  const ifPattern = new RegExp(`if\\(${chunkId}===e\\)return"([^"]+)"`);
  const ifMatch = runtimeSource.match(ifPattern);
  if (ifMatch) return ifMatch[1];

  const mapPattern = new RegExp(`(?:\\{|,|\\s)${chunkId}:"([a-f0-9]+)"`);
  const mapMatch = runtimeSource.match(mapPattern);
  if (mapMatch) return `${chunkId}.${mapMatch[1]}.js`;

  throw new Error(`Unable to resolve filename for chunk id ${chunkId}.`);
}

function replaceLangToken(filename, lang = "en") {
  return filename.replace("__LANG__", lang);
}

function runtimeBaseUrl(runtimeUrl) {
  const idx = runtimeUrl.lastIndexOf("/");
  return runtimeUrl.slice(0, idx + 1);
}

function createWebpackRuntime() {
  const modules = {};
  const cache = {};
  const self = { webpackChunktradingview: [] };
  self.webpackChunktradingview.push = (chunk) => Object.assign(modules, chunk[1]);

  const context = vm.createContext({
    self,
    window: {},
    document: {},
    navigator: {},
    location: {},
    console,
  });

  const req = (id) => {
    if (cache[id]) return cache[id].exports;
    if (!modules[id]) throw new Error(`Missing webpack module ${id}`);
    const module = { exports: {} };
    cache[id] = module;
    modules[id](module, module.exports, req);
    return module.exports;
  };
  req.d = (exports, definition) => {
    for (const key in definition) {
      if (req.o(definition, key) && !req.o(exports, key)) {
        Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
      }
    }
  };
  req.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  req.r = (exports) => {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
  };
  req.n = (mod) => {
    const getter = mod && mod.__esModule ? () => mod.default : () => mod;
    req.d(getter, { a: getter });
    return getter;
  };

  // Minimal translation shim expected by TradingView bundles.
  req.i18next = (_ctx, _opts, value) => {
    if (Array.isArray(value)) return String(value[0] ?? "");
    if (typeof value === "string") return value;
    if (value == null) return "";
    if (typeof value === "object" && Array.isArray(value.default)) return String(value.default[0] ?? "");
    if (typeof value === "object" && typeof value.default === "string") return value.default;
    return String(value);
  };

  return { context, req };
}

function flattenDocs(docObject) {
  const keys = ["variables", "constants", "functions", "methods", "keywords", "types", "operators", "annotations"];
  const entries = [];
  for (const key of keys) {
    const list = Array.isArray(docObject[key]) ? docObject[key] : [];
    for (const item of list) {
      entries.push({
        source_category: key,
        category: categoryFromKey(key),
        name: item.name,
        normalized_name: normalizeName(item.name),
        description: item.desc || [],
        syntax: item.syntax || [],
        arguments: item.args || [],
        returns: item.returns || [],
        remarks: item.remarks || [],
      });
    }
  }
  return entries;
}

function getModuleName(entryName) {
  const name = normalizeName(entryName);
  if (!name.includes(".")) return "_global";
  return name.split(".")[0] || "_global";
}

function buildModuleStats(entries) {
  const stats = new Map();
  for (const entry of entries) {
    const mod = getModuleName(entry.name);
    if (!stats.has(mod)) {
      stats.set(mod, { module: mod, count: 0, categories: new Set(), samples: [] });
    }
    const row = stats.get(mod);
    row.count += 1;
    row.categories.add(entry.category);
    if (row.samples.length < 3) row.samples.push(entry.name);
  }
  return [...stats.values()]
    .map((r) => ({
      module: r.module,
      count: r.count,
      categories: [...r.categories].sort(),
      samples: r.samples,
    }))
    .sort((a, b) => b.count - a.count || a.module.localeCompare(b.module));
}

function filterByModule(entries, moduleName) {
  const target = moduleName.trim();
  return entries.filter((e) => getModuleName(e.name) === target);
}

function queryEntries(entries, term, prefix) {
  const normalized = normalizeName(term);
  if (prefix) {
    return entries.filter((e) => e.name.startsWith(term) || e.normalized_name.startsWith(normalized));
  }
  const exact = entries.filter(
    (e) =>
      e.name === term ||
      e.name === normalized ||
      e.name === `${term}()` ||
      e.name === `${normalized}()` ||
      e.normalized_name === normalized
  );
  if (exact.length) return exact;
  return entries.filter((e) => e.name.includes(term) || e.normalized_name.includes(normalized));
}

function toFirstLine(value) {
  if (Array.isArray(value) && value.length) return String(value[0]).replace(/\s+/g, " ").trim();
  if (typeof value === "string") return value.replace(/\s+/g, " ").trim();
  return "";
}

function buildEvidence(term, matches) {
  if (!matches.length) {
    return {
      support: "unknown",
      match: "none",
      entry: term,
      category: "unknown",
      syntax: "",
      returns: "",
      evidence: "",
      source: "live TradingView JS modules",
    };
  }

  const exact = matches.some((m) => normalizeName(m.name) === normalizeName(term));
  const best = matches[0];
  const evidenceLine = toFirstLine(best.description) || toFirstLine(best.remarks);
  return {
    support: exact ? "supported" : "candidate",
    match: exact ? "exact" : "partial",
    entry: term,
    category: best.category || "unknown",
    syntax: toFirstLine(best.syntax),
    returns: toFirstLine(best.returns),
    evidence: evidenceLine,
    source: "live TradingView JS modules",
  };
}

function printModules(modules, limit, jsonMode) {
  if (jsonMode) {
    console.log(
      JSON.stringify(
        {
          mode: "modules",
          total: modules.length,
          items: modules.slice(0, limit),
        },
        null,
        2
      )
    );
    return;
  }

  if (!modules.length) {
    console.log("No modules found.");
    return;
  }
  console.log("Modules:");
  console.log("");
  for (const m of modules.slice(0, limit)) {
    const sample = m.samples.length ? ` | sample: ${m.samples.join(", ")}` : "";
    console.log(`- ${m.module} (${m.count}) | categories: ${m.categories.join(", ")}${sample}`);
  }
  if (modules.length > limit) {
    console.log(`... and ${modules.length - limit} more`);
  }
}

function printModuleEntries(moduleName, entries, limit, jsonMode) {
  if (jsonMode) {
    console.log(
      JSON.stringify(
        {
          mode: "module_entries",
          module: moduleName,
          total: entries.length,
          items: entries.slice(0, limit),
        },
        null,
        2
      )
    );
    return;
  }

  if (!entries.length) {
    console.log(`Module '${moduleName}' has no entries.`);
    return;
  }
  console.log(`Module: ${moduleName}`);
  console.log(`Entries: ${entries.length}`);
  console.log("");
  for (const e of entries.slice(0, limit)) {
    console.log(`- [${e.category}] ${e.name}`);
  }
  if (entries.length > limit) {
    console.log(`... and ${entries.length - limit} more`);
  }
}

function printMatches(term, matches, limit, jsonMode, evidenceMode) {
  const evidence = buildEvidence(term, matches);
  if (jsonMode) {
    console.log(
      JSON.stringify(
        {
          mode: "symbol_query",
          ...evidence,
          items: matches.slice(0, limit),
        },
        null,
        2
      )
    );
    return;
  }

  if (evidenceMode) {
    console.log(`Support: ${evidence.support}`);
    console.log(`Match: ${evidence.match}`);
    console.log(`Category: ${evidence.category}`);
    console.log(`Entry: ${evidence.entry}`);
    console.log(`Syntax: ${evidence.syntax || "N/A"}`);
    console.log(`Returns: ${evidence.returns || "N/A"}`);
    console.log(`Evidence: ${evidence.evidence || "N/A"}`);
    console.log(`Source: ${evidence.source}`);
    return;
  }

  if (!matches.length) {
    console.log("Match: none");
    console.log("Entry:", term);
    console.log("Source: live TradingView JS modules");
    return;
  }
  const exact = matches.some((m) => normalizeName(m.name) === normalizeName(term));
  console.log("Match:", exact ? "exact" : "partial");
  console.log("Entry:", term);
  console.log("Source: live TradingView JS modules");
  console.log("");
  for (const m of matches.slice(0, limit)) {
    const desc = Array.isArray(m.description) && m.description.length ? String(m.description[0]) : "";
    const line = desc ? `${desc.replace(/\s+/g, " ").slice(0, 160)}` : "";
    if (line) console.log(`- [${m.category}] ${m.name}: ${line}${line.length >= 160 ? "..." : ""}`);
    else console.log(`- [${m.category}] ${m.name}`);
  }
  if (matches.length > limit) {
    console.log(`... and ${matches.length - limit} more`);
  }
}

async function main() {
  const { term, prefix, limit, listModules, module, moduleListEntries, json, evidence } = parseArgs(
    process.argv.slice(2)
  );
  const pageUrl = "https://www.tradingview.com/pine-script-reference/v6/";

  const html = await fetch(pageUrl);
  const scriptUrls = extractHtmlScriptUrls(html);
  const runtimeUrl = findRuntimeUrl(scriptUrls);
  const referenceChunkUrl = await findReferenceChunkUrl(scriptUrls);

  const runtimeSource = await fetch(runtimeUrl);
  const refSource = await fetch(referenceChunkUrl);
  const { chunkIds, moduleId } = parseV6LoadChain(refSource);

  const lang = "en";
  const base = runtimeBaseUrl(runtimeUrl);
  const dynamicUrls = chunkIds.map((id) => `${base}${replaceLangToken(resolveChunkFilename(runtimeSource, id), lang)}`);

  // Load all page scripts + required dynamic scripts for v6 docs.
  const allUrls = [...new Set([...scriptUrls, ...dynamicUrls])];
  const { context, req } = createWebpackRuntime();
  for (const url of allUrls) {
    try {
      const code = await fetch(url);
      vm.runInContext(code, context, { timeout: 15000 });
    } catch (_) {
      // Ignore unrelated bundle failures and continue.
    }
  }

  const docs = req(moduleId).default;
  const entries = flattenDocs(docs);

  if (listModules) {
    const modules = buildModuleStats(entries);
    printModules(modules, limit, json);
    return;
  }

  if (module) {
    const moduleEntries = filterByModule(entries, module);
    if (moduleListEntries) {
      printModuleEntries(module, moduleEntries, limit, json);
      return;
    }
    // Default module mode: print module summary + top entries.
    const modules = buildModuleStats(moduleEntries);
    if (!modules.length) {
      console.log(`Module '${module}' not found.`);
      return;
    }
    if (json) {
      console.log(
        JSON.stringify(
          {
            mode: "module_summary",
            module: modules[0],
            total_entries: moduleEntries.length,
            entries: moduleEntries.slice(0, limit),
          },
          null,
          2
        )
      );
      return;
    }
    printModules(modules, 1, false);
    console.log("");
    printModuleEntries(module, moduleEntries, limit, false);
    return;
  }

  const matches = queryEntries(entries, term, prefix);
  printMatches(term, matches, limit, json, evidence);
}

main().catch((err) => {
  console.error(err.message || String(err));
  process.exit(1);
});
