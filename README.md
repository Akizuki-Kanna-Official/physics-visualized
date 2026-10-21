# 动量守恒四大模型 动起来讲 · physics-visualized

高中物理「动量守恒」专题的**交互式 HTML 可视化课件**：把课件第 2–16 页的典型例题做成可播放、可调参数的动画，配合逐步解题过程、运动图像（v–t / x–t 等）和能量饼图，把动量守恒的四大模型「动起来讲」。

- 模型一：子弹—木块　· 模型二：滑块—木板　· 模型三：簧类　· 模型四：滑块—曲面
- 解答使用精确分数 / 根式显示，并经 sympy 独立求解与数值仿真双重核对
- 纯静态页面，字体已本地化，**离线、国内网络均可直接打开**

## 页面列表

| 页 | 文件 | 内容 |
|---|---|---|
| 2 | `动量专题/page2/page2-bullet-block-v11.html` | 模型一 · 子弹打木块：共同速度、作用时间、位移与打入深度、木块最小长度 |
| 3 | `动量专题/page3/page3-bullet-plank-cart-v0.html` | 模型一 · 子弹射穿物块 A，A 在平板车 B 上滑动至共速；拓展求车的最小长度 |
| 4 | `动量专题/page4/page4-sandbag-pendulum-v0.html` | 模型一 · 弹丸射入沙箱摆：机械能损失随 M、m、v、L 的变化（选择题）及射入瞬间绳拉力 |
| 5 | `动量专题/page5/page5-ball-block-plank-v0.html` | 模型二 · 小球撞物块后反弹，物块在木板上滑动：共速、损失机械能、板的最小长度与滑行时间 |
| 6 | `动量专题/page6/page6-bullet-block-baffles-v0.html` | 模型二 · 子弹射入物块，物块在带弹性挡板的长木板上滑动，恰好不碰挡板时求动摩擦因数 |
| 7 | `动量专题/page7/page7-plank-vt-graph-v0.html` | 模型二 · 由 v–t 图像分析板块模型（多选）：木板动能、系统损失机械能、最小长度、μ |
| 8 | `动量专题/page8/page8-bullet-spring-two-blocks-v0.html` | 模型三 · 子弹打 A，A、B 由轻弹簧相连：弹性势能最大时刻与 B 的最大速度 |
| 9 | `动量专题/page9/page9-arc-spring-cart-v2.html` | 模型三 · 物块沿靠墙小车上的 1/4 圆弧滑下并压缩弹簧（有摩擦）：最大压缩量、弹性势能、小车最大速度 |
| 10 | `动量专题/page10/page10-collide-stick-spring-wall-v0.html` | 模型三 · C 撞 A 粘合后压缩靠墙弹簧：初速度、最大弹性势能、墙对 B 的冲量、B 离墙后的运动 |
| 11 | `动量专题/page11/page11-slide-stick-spring-projectile-v0.html` | 模型三 · A 从曲面滑下与 B 粘合，弹簧推 C 从桌边平抛：碰后速度、最大弹性势能、落点 |
| 12 | `动量专题/page12/page12-ball-movable-arc-v1.html` | 模型四 · 小球滑上质量 2m 的可动光滑圆弧轨道：最大高度、分离速度、对轨道做功 |
| 13 | `动量专题/page13/page13-ball-groove-cart-v0.html` | 模型四 · 小球滑入等质量弧形槽小车（多选）：最高点速度、离车后做自由落体 |
| 14 | `动量专题/page14/page14-ball-semicircle-groove-v0.html` | 模型四 · 小球落入可动光滑半圆槽（多选）：离槽后竖直上抛、槽的往复运动 |
| 15 | `动量专题/page15/page15-block-wedge-v1.html` | 模型四 · 物块冲上可动光滑楔形物体（多选）：水平动量守恒与机械能守恒关系式 |
| 16 | `动量专题/page16/page16-bullet-pendulum-cart-v0.html` | 模型四 · 子弹射入悬挂在可动小车下的木块：产生热量、最大摆高、小车最大速度 |

各页 `history/` 目录保存早期版本，供对照修改过程。

## 如何打开

用浏览器（Chrome / Edge / Firefox / Safari）打开页面即可，无需安装、无需联网。

### 群聊 / 临时分享：单文件包

Release 里的 `physics-visualized-1.1.0-standalone.zip` 中，第 2–16 页各是一个独立的 `.html`。`common/*.js`、`common/cw.css` 和本专题用到的字体子集都写在文件里面。把其中一页发到群里，对方下载后双击就能看到动画。

同目录的 `index.html` 是目录页，和这些页面放在一起使用。每个 `page*.html` 自己就能打开。

重新生成：

```bash
pip install -r tools/requirements-pack.txt
python3 tools/pack.py
```

输出在 `dist/standalone/`（构建产物，不入库）。`python3 tools/pack.py --smoke` 会再用无头 Chrome 抽查第 2、9、16 页是否能播起来。打包依赖 `fonttools` 和 `brotli`，只在导出时需要。

西文字体 Source Serif 4 带有 OFL 保留字体名 Source。单文件里的子集改名为 **CW Latin**，许可全文在每个 html 源码的 `font-license` 一段。开发源码里的页面继续使用 `common/fonts/` 里的原字体名。

### 克隆仓库看源码、改题

源码布局是 `动量专题/pageN/*.html` 与旁边的 `common/`。从仓库里打开页面时，浏览器读取 `../../common/` 下的脚本、样式和字体。改题、对答案、对照 `history/` 都用这套文件。

仓库：<https://github.com/Akizuki-Kanna-Official/physics-visualized> 。想跟踪后续页面，可以在 GitHub 上 Star 这个仓库。

页面操作：开始 / 暂停 / 重置三按钮、「子弹时间」开关（瞬间过程放慢）、参数滑块与数值输入框、解题过程 / 运动图像 / 能量饼图标签页、字号调节（50%–400%，适合投屏）。

### URL 参数

| 写法 | 作用 |
|---|---|
| `页面.html#clawdOn` | 显示 Clawd 小人（默认关闭） |
| `页面.html#clawdOff` | 强制关闭小人（忽略本地记忆） |

页面右上角「显示小人」开关的选择会记在浏览器 localStorage 中。

## 开发工具（`tools/`）

需要 Node.js、Python 3（`verify.py` 需 sympy）、`google-chrome`（无头截图 / 测试）。

| 命令 | 用途 |
|---|---|
| `bash tools/jscheck.sh 页面.html` | 通用模块 + 页面内联脚本拼接后做 `node --check` 语法检查 |
| `python3 tools/verify.py` | 用 sympy 独立求解各页默认参数下的精确答案（生成 `expected.json` 的依据） |
| `node tools/phys.js 页面.html p3` | 将页面精确答案与 `expected.json` 比较，并跑数值仿真打印关键事件 |
| `node tools/extremes.js 页面.html` | 各参数分别取最小 / 最大值跑仿真，检查 NaN、异常、卡死 |
| `python3 tools/runtest.py 页面.html [秒数]` | 无头连续运行测试：按钮逻辑、物体是否在画面内、帧间速度突变 |
| `python3 tools/shot.py 页面.html 输出.png 帧数 [tab=sol\|gr\|en] [fz=1] [w=1920] [h=1080]` | 预推进 N 帧后无头截图 |
| `tools/skel.py` | 页面骨架生成器（新页面 v0 的模板） |
| `pip install -r tools/requirements-pack.txt` 然后 `python3 tools/pack.py` | 把第 2–16 页导出为 `dist/standalone/` 下的离线单文件。`--smoke` 抽查播放 |

完整制作流程见 [`WORKFLOW.md`](WORKFLOW.md)，进度记录见 [`PROGRESS.md`](PROGRESS.md)，版本变化见 [`CHANGELOG.md`](CHANGELOG.md)。

## 目录结构

```
动量专题/pageN/      第 N 页的页面（当前版本）及 history/ 旧版本。开发时的源码
common/              通用模块：cw.css 样式，exact.js 精确数，engine/scene/draw 绘图与仿真，
                     graph.js 运动图像，pie.js 能量饼图，ui.js 交互，clawd.js 小人
common/fonts/        本地字体（woff2 分片 + fonts.css + OFL.txt）
tools/               校验、测试、截图，以及 pack.py（单文件导出）
dist/standalone/     pack.py 生成的单文件页面（不入库，见 Release 的 zip）
WORKFLOW.md  PROGRESS.md  CHANGELOG.md
LICENSE  LICENSE-CONTENT
```

## 许可

- **代码**（`.html` / `.js` / `.css` / `tools/` 脚本）：[MIT](LICENSE)
- **文档与媒体**（README、WORKFLOW、PROGRESS、CHANGELOG 等文字、题目讲解内容、截图与图片）：[CC BY 4.0](LICENSE-CONTENT)
- **字体**：`common/fonts/` 中的 Noto Serif SC、Source Serif 4 遵循 SIL Open Font License 1.1，见 [`common/fonts/OFL.txt`](common/fonts/OFL.txt)

## 相关

- 源码与 Star：<https://github.com/Akizuki-Kanna-Official/physics-visualized>
- 宣传视频在单独的仓库中维护，不包含在本仓库内。
