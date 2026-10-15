#!/usr/bin/env python3
"""连续运行测试（无头）：固定 60 fps 调用 frame()，两种子弹时间模式各 30 s。
检查：run 始终为 true（不自行停止）、错误、主物体屏幕位置在画布内、相邻帧屏幕速度比；并测试三按钮逻辑。
页面模型可定义 M.track(st,P) → 世界 x 列表（被跟踪物体）。用法: runtest.py 页面.html [秒数]"""
import sys,os,subprocess,re,json,html
src=sys.argv[1];secs=float(sys.argv[2]) if len(sys.argv)>2 else 30
s=open(src,encoding='utf8').read()
head="""<script>try{localStorage.clear()}catch(e){};Element.prototype.animate=function(){return{cancel(){},finish(){},set onfinish(f){}}};window.requestAnimationFrame=function(){return 0};window.__e=[];window.onerror=function(m,u,l){__e.push(m+' @'+l)};</script>"""
tail="""<script>(function(){const R={};try{
// 按钮逻辑
const B=id=>document.getElementById(id),bs=()=>[B('play').disabled,B('pause').disabled,B('pause').textContent,B('rst').disabled,run,+st.t.toFixed(6)];
const L=[];L.push(['初始',bs()]);B('play').click();frame(0);frame(16.7);frame(33.3);L.push(['开始',bs()]);B('pause').click();frame(50);frame(66);L.push(['暂停',bs()]);
B('pause').click();frame(83);frame(100);L.push(['继续',bs()]);B('rst').click();frame(116);L.push(['重置',bs()]);R.btn=L;
for(const mode of [1,0]){const bt=B('bt');bt.checked=!!mode;bt.onchange();reset();run=true;lastT=null;
let pts=null,maxTs=1,prev=null,pv=null,maxR=1,maxRi=-1,minX=1e9,maxX=-1e9,stopped=false,n=Math.round(%f*60),offs=0,jumps=[];
for(let i=0;i<=n;i++){frame(i*1000/60);if(!run)stopped=true;if(typeof TSc!=='undefined'&&TSc){if(pts)maxTs=Math.max(maxTs,TSc/pts,pts/TSc);pts=TSc;}
const tr=(M.track?M.track(st,P):[]).map(x=>VIEW.X(x));if(tr.length){const sx=tr[0];minX=Math.min(minX,sx);maxX=Math.max(maxX,sx);if(sx<0||sx>CW)offs++;
if(prev!=null){const v=sx-prev;if(pv!=null&&Math.abs(v)>0.5&&Math.abs(pv)>0.5){const r=Math.max(Math.abs(v/pv),Math.abs(pv/v));if(r>maxR){maxR=r;maxRi=i;}if(r>1.15&&jumps.length<6)jumps.push([i,+st.t.toFixed(5),+r.toFixed(3),+pv.toFixed(2),+v.toFixed(2)]);}pv=v;}prev=sx;}}
R['bt'+mode]={maxTsRatio:+maxTs.toFixed(4),t:+st.t.toFixed(4),stopped,maxR:+maxR.toFixed(4),maxRi,minX:+minX.toFixed(1),maxX:+maxX.toFixed(1),offFrames:offs,jumps,status:M.status(st,P)};}
}catch(e){__e.push(String(e&&e.stack||e).slice(0,400))}R.err=__e;document.documentElement.setAttribute('data-r',JSON.stringify(R));})();</script>"""%secs
s=s.replace('<head>','<head>'+head,1);i=s.rfind('</body>');s=s[:i]+tail+s[i:]
d=os.path.dirname(os.path.abspath(src));tmp=os.path.join(d,'.__rt_'+os.path.basename(src));open(tmp,'w',encoding='utf8').write(s)
r=subprocess.run(['google-chrome','--headless=new','--no-sandbox','--disable-gpu','--window-size=1920,1080','--timeout=60000','--dump-dom','file://'+tmp],capture_output=True,text=True,timeout=300)
os.remove(tmp)
m=re.search(r'data-r="([^"]*)"',r.stdout)
if not m:print('NO RESULT',r.stderr[-500:]);sys.exit(1)
R=json.loads(html.unescape(m.group(1)))
R['btn']=[[a]+b for a,b in R['btn']]
for k,v in R.items():print(k,json.dumps(v,ensure_ascii=False))
