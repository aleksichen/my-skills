# Using Linear Routing Test Prompts

## 11 Primary Prompts

1. 我看到一个 Pine 指标写法很巧，帮我记录一个 Spike，后面评估我们编译器能不能支持。  
Expected: `using-linear -> linear-capture`

2. 先帮我记一个需求：支持 ta.bb，暂时不排期。  
Expected: `using-linear -> linear-capture`

3. 发现 bug：varip 在 replay 场景结果不稳定，帮我建 bug。  
Expected: `using-linear -> linear-capture`

4. 后续方向想做回测引擎和实盘接入，先在 Linear 留痕。  
Expected: `using-linear -> linear-capture`

5. demo 以后要接真实行情数据，先记一个 feature。  
Expected: `using-linear -> linear-capture`

6. 基于现在 Linear 的情况，你建议我今天先做什么？  
Expected: `using-linear -> linear-priority-council`

7. 我要做 ta.ema 和 ta.bb，先后顺序怎么排？  
Expected: `using-linear -> linear-priority-council`

8. 这个修复我担心是临时补丁，帮我看会不会影响后续并导致回归。  
Expected: `using-linear -> linear-execution-sync`

9. 这个功能你帮我拍板：要不要做，什么时候做最合适？  
Expected: `using-linear -> linear-priority-council`

10. 我要发版本了，按最新 cycle 抽取正式变更说明。  
Expected: `using-linear -> linear-release-drafter`

11. 这个任务做完了，帮我把 Linear 的状态和关联信息都同步好。  
Expected: `using-linear -> linear-execution-sync`

## 5 Ambiguous Prompts

12. 先记 ta.bb，再告诉我它该排在 ta.ema 前还是后。  
Expected phases: `linear-capture` -> `linear-priority-council` (manual step-by-step)

13. 把这个 bug 标记完成，并顺便生成这周发布说明。  
Expected phases: `linear-execution-sync` -> `linear-release-drafter` (manual step-by-step)

14. 我不确定要不要做实时数据接入，你先帮我判断，再决定是否建单。  
Expected phases: `linear-priority-council` -> optional `linear-capture`

15. 把本周 Done 变更写进 changelog，并给我一版发布说明。  
Expected: `linear-release-drafter`, confirm before writing `CHANGELOG.md`

16. 这个任务 done 吗？如果可以就帮我收尾更新状态、补 root cause 和回归测试说明。  
Expected: `linear-execution-sync` with done gate

