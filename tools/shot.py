#!/usr/bin/env python3
"""无头截图：生成预推进的临时副本（rAF 在无头模式不推进，用 frame() 手动按 60 fps 推进 N 帧）
用法: shot.py 页面.html 输出.png 帧数 [tab=sol|gr|en] [g=gv] [fz=1] [bt=1] [w=1920] [h=1080] [dsf=1]"""
import sys,os,subprocess,re,shutil,tempfile
src,out,N=sys.argv[1],sys.argv[2],int(sys.argv[3])
kw=dict(a.split('=',1) for a in sys.argv[4:])
tab=kw.get('tab','sol');gsel=kw.get('g','');fz=kw.get('fz','1');bt=kw.get('bt','1');pg=kw.get('pg','0')
s=open(src,encoding='utf8').read()
head="""<script>try{localStorage.clear()}catch(e){};Element.prototype.animate=function(){return{cancel(){},finish(){},set onfinish(f){}}};window.requestAnimationFrame=function(){return 0};window.__e=[];window.onerror=function(m,u,l){__e.push(m+' @'+l);document.documentElement.setAttribute('data-err',__e.join(' || '))};</script>"""
tail="""<script>(function(){try{
const bt=document.getElementById('bt');bt.checked=%s;bt.onchange&&bt.onchange();slow=bt.checked;
FZ=%s;layout();
if(%d>0){run=true;lastT=null;for(let i=0;i<=%d;i++)frame(i*1000/60);}
const tb=document.querySelector('#tabs button[data-t="%s"]');if(tb)tb.click();
const gs=document.querySelector('#seg button[data-g="%s"]');if(gs)gs.click();
const fin=()=>{layout();draw();clawdTick(0);for(const id of ['pg-sol','pg-gr','pg-en']){PG[id]=%s;}layoutTab();
let of=[];const A=document.getElementById('app').getBoundingClientRect();
document.querySelectorAll('#app *').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width)return;if(r.bottom>A.bottom+1||(!e.closest('.pager')&&r.right>A.right+1))of.push((e.id||e.className||e.tagName)+'');});
document.documentElement.setAttribute('data-of',of.slice(0,8).join('|'));
document.documentElement.setAttribute('data-st',JSON.stringify({t:st.t}));};
fin();if(document.fonts)document.fonts.ready.then(fin);
}catch(e){__e.push(String(e&&e.stack||e).slice(0,300));document.documentElement.setAttribute('data-err',__e.join(' || '))}})();</script>"""%('true' if bt=='1' else 'false',fz,N,N,tab,gsel,pg)
s=s.replace('<head>','<head>'+head,1)
i=s.rfind('</body>');s=s[:i]+tail+s[i:]
d=os.path.dirname(os.path.abspath(src));tmp=os.path.join(d,'.__shot_'+os.path.basename(src))
open(tmp,'w',encoding='utf8').write(s)
w,h,dsf=kw.get('w','1920'),kw.get('h','1080'),kw.get('dsf','1')
base=['google-chrome','--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars',f'--window-size={w},{h}',f'--force-device-scale-factor={dsf}','--timeout=6000']
subprocess.run(base+[f'--screenshot={out}','file://'+tmp],capture_output=True)
r=subprocess.run(base+['--dump-dom','file://'+tmp],capture_output=True,text=True)
m=re.findall(r'data-(err|of|st)="([^"]*)"',r.stdout[:3000])
print(os.path.basename(out),m)
os.remove(tmp)
