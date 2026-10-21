"""页面骨架（与第 2 页 V10 相同的 DOM 结构），生成 第 N 页 HTML 的 v0。之后的版本直接在 HTML 上修改。"""
FONTS='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400;1,8..60,600&display=swap">'
def page(title,tag,h1,q,note,graphs,pie_title,script,hint="动画按时间缩放播放"):
    segs=''.join(f'<button data-g="{g}"{" class=\"on\"" if i==0 else ""}>{lab}</button>' for i,(g,lab) in enumerate(graphs))
    cvs=''.join(f'<canvas id="{g}"{" class=\"on\"" if i==0 else ""}></canvas>' for i,(g,lab) in enumerate(graphs))
    mods=''.join(f'<script src="../../common/{m}.js"></script>' for m in ['exact','canvas','graph','pie','clawd','scene','ui','draw'])
    return f'''<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
{FONTS}
<title>{title}</title>
<link rel="stylesheet" href="../../common/cw.css">
</head><body><div id="app">
<header class="top"><span class="tag">{tag}</span><h1>{h1}</h1>
<div class="tools"><label class="sw"><input type="checkbox" id="clawdOn"><i></i>显示小人</label>
<div class="fzc"><span>字号</span><button id="fzm" aria-label="减小字号">A−</button><input type="range" id="fz" min="50" max="400" step="10" value="100"><button id="fzp" aria-label="增大字号">A＋</button><b id="fzv">100%</b></div></div></header>
<main class="main">
<section class="left"><div class="stage" id="scene"><canvas id="c"></canvas><div id="clawd" class="clawd"></div></div><div class="hint chip" id="hint">{hint}</div></section>
<section class="right"><nav class="tabs" id="tabs"><i class="ind" id="ind"></i><button data-t="sol" class="on">解题过程</button><button data-t="gr">运动图像</button><button data-t="en">能量饼图</button></nav>
<div class="tabbody">
<div class="tab on" id="t-sol"><div class="pager" id="pg-sol"><p class="q">{q}</p>
<p class="fnote">{note}</p><h3>解答</h3><div id="ans"></div></div><div class="pgnav"></div></div>
<div class="tab" id="t-gr"><div class="seg" id="seg">{segs}</div>
<div class="pager" id="pg-gr"><div id="gb"><h4 id="gtitle"></h4>{cvs}</div><div class="gleg" id="gleg"></div></div><div class="pgnav"></div></div>
<div class="tab" id="t-en"><div class="pager" id="pg-en"><h3>{pie_title}</h3><canvas id="pie"></canvas><div id="pieLeg" class="pleg"></div><h3>实时数据</h3><div id="live" class="live"></div></div><div class="pgnav"></div></div>
</div></section></main>
<footer class="bot"><div class="ctl"><div class="btns"><button class="primary" id="play">▶ 开始播放</button><button id="pause">⏸ 暂停</button><button id="rst">↺ 重置</button></div><label class="sw bt"><input type="checkbox" id="bt" checked><i></i>子弹时间</label></div><div class="params" id="params"></div></footer>
</div>
{mods}
<script>
{script}
</script>
<script src="../../common/engine.js"></script>
<script>engineStart();</script>
</body></html>
'''
