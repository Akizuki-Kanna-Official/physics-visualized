// 舞台与交互通用：参数栏、三按钮 + 子弹时间开关、标签页、分页、字号、Clawd 开关、16:9 缩放、Claude 弹簧动效（自第 2 页 V10 抽出）
// 页面需定义全局：KEY（localStorage 前缀）、CW CH cv ctx、defs、st run lastT slow、reset() draw()、GMAP={gv:GV,...}、GT GN、PIE drawPie()
function springKF(k,c,m,from,to,dur){const w0=Math.sqrt(k/m),z=c/(2*Math.sqrt(m*k)),wd=w0*Math.sqrt(1-z*z),kf=[],N=30;
for(let i=0;i<=N;i++){const t=dur*i/N,p=1-Math.exp(-z*w0*t)*(Math.cos(wd*t)+z/Math.sqrt(1-z*z)*Math.sin(wd*t));kf.push(from+(to-from)*p);}kf[N]=to;return kf;}
const BOUNCY=[600,30,1],SNAPPY=[320,28,1];
const TAGS={g:["题目给的","tg-g"],e:["示例数值","tg-e"],a:["动画补设","tg-a"]};
// defs=[[id,标签,单位,min,max,step,默认,标注g/e/a?]]；带标注者用「数值输入框 + 滑块」
function buildParams(){$("params").innerHTML=defs.map(d=>{const lab=d[7]?d[1].replace(/ ([A-Za-zθμ][^ ]*)$/," <span class=\"f\">$1</span>"):d[1].replace(/ ([mMfL]|v₀)$/," <span class=\"f\">$1</span>");
if(!d[7])return `<div class="p"><div class="k">${lab}</div><div class="val"><span id="${d[0]}v"></span><small>${d[2]}</small></div><input id="${d[0]}" type="range" min="${d[3]}" max="${d[4]}" step="${d[5]}" value="${d[6]}"></div>`;
const t=TAGS[d[7]];return `<div class="p"><div class="k">${lab}<span class="tg ${t[1]}">${t[0]}</span></div><div class="val"><input class="num" id="${d[0]}n" type="number" min="${d[3]}" max="${d[4]}" step="${d[5]}" value="${d[6]}"><small>${d[2]}</small></div><input id="${d[0]}" type="range" min="${d[3]}" max="${d[4]}" step="${d[5]}" value="${d[6]}"></div>`;}).join("");}
// 读取参数：P 浮点，PX 精确分数（滑块字符串十进制精确转分数）
function readParams(){P={};PX={};defs.forEach(d=>{const nn=$(d[0]+"n"),v=nn&&nn.value.trim()!==""?nn.value.trim():$(d[0]).value;PX[d[0]]=qparse(v);P[d[0]]=+v;const s=$(d[0]+"v");if(s)s.textContent=P[d[0]];const n=$(d[0]+"n");if(n&&document.activeElement!==n)n.value=v;});}
function cwButtons(){document.querySelectorAll("button").forEach(b=>{let sc=1;
b.addEventListener("pointerdown",()=>{b.animate([{transform:`scale(${sc})`},{transform:"scale(0.96)"}],{duration:120,easing:"cubic-bezier(.32,.72,0,1)",fill:"forwards"});sc=.96;});
const up=()=>{if(sc===1)return;b.animate(springKF(...BOUNCY,.96,1,.3).map(v=>({transform:`scale(${v})`})),{duration:300,fill:"forwards"});sc=1;};
b.addEventListener("pointerup",up);b.addEventListener("pointerleave",up);});
// 入场上浮（motionMessageFadeUp：opacity 0,y 12 → SPRING_SNAPPY）
document.querySelectorAll(".left .stage,.p,.right").forEach((el,i)=>{const kf=springKF(...SNAPPY,0,1,.45);el.animate(kf.map(p=>({opacity:Math.min(1,p),transform:`translateY(${12*(1-p)}px)`})),{duration:450,delay:i*30,fill:"backwards"});});}
// 三按钮：开始播放 / 暂停·继续 / 重置（重置不自动播放）
function updBtns(){const started=st&&st.t>0;$("play").disabled=run;$("pause").disabled=!(started||run);$("pause").textContent=run?"⏸ 暂停":"▶ 继续";$("rst").disabled=!started&&!run;}
function cwPlayback(){$("play").onclick=()=>{if(run)return;if(st.t>0)reset();run=true;lastT=null;updBtns();};
$("pause").onclick=()=>{if(!(st.t>0)&&!run)return;run=!run;lastT=null;updBtns();};
$("rst").onclick=()=>{reset();updBtns();};
const bt=$("bt");try{const v=localStorage.getItem(KEY+".bt");if(v!==null)bt.checked=v==="1";}catch(e){}slow=bt.checked;bt.onchange=()=>{slow=bt.checked;try{localStorage.setItem(KEY+".bt",slow?"1":"0")}catch(e){}if(typeof onBT==="function")onBT();};}
// ===== 16:9 舞台布局、清晰度、字号、标签页 =====
let APP,LS,FZ=1,TAB="sol",GSEL="gv";const PG={};let LEGS="";
function pager(id){const el=$(id),nav=el.nextElementSibling,W=el.clientWidth,gap=48;el.style.columnWidth=W+"px";
const n=Math.max(1,Math.round((el.scrollWidth+gap)/(W+gap)));let p=Math.min(PG[id]||0,n-1);PG[id]=p;el.scrollLeft=p*(W+gap);
nav.hidden=n<2;nav.innerHTML=n<2?"":`<button data-d="-1" ${p?"":"disabled"}>‹</button><span class="dots">${Array.from({length:n},(_,i)=>`<i class="${i===p?"on":""}"></i>`).join("")}</span><button data-d="1" ${p<n-1?"":"disabled"}>›</button>`;
nav.querySelectorAll("button").forEach(b=>b.onclick=()=>{PG[id]=Math.max(0,Math.min(n-1,p+ +b.dataset.d));el.scrollTo({left:PG[id]*(W+gap),behavior:"smooth"});pager(id);});}
function layoutTab(){
if(TAB==="sol")pager("pg-sol");
if(TAB==="gr"){const el=$("pg-gr"),gb=$("gb"),lg=$("gleg");LEGS=LEG[GSEL]||"";lg.innerHTML=`<p class="gn">${FZ>=1.5?"<b>"+GT[GSEL]+"</b>：":""}${GN[GSEL]}</p>`+LEGS;$("gtitle").innerHTML=GT[GSEL];$("gtitle").style.display=FZ>=1.5?"none":"";
const W=el.clientWidth,H=el.clientHeight,th=FZ>=1.5?0:$("gtitle").offsetHeight+6;lg.style.breakBefore="auto";gb.style.height="";el.style.columnWidth=W+"px";
const lh=lg.offsetHeight;let ch=H-th-lh-6;if(ch<H*.55){ch=H-th-8;lg.style.breakBefore="column";gb.style.height=(H-2)+"px";}
const g=GMAP[GSEL];g.c.style.height=ch+"px";g.w=W;g.h=ch;g.x._fz=FZ;backing(g.c,g.x,W,ch);pager("pg-gr");}
if(TAB==="en"){const el=$("pg-en"),W=el.clientWidth,H=el.clientHeight,sz=Math.max(120,Math.min(W*.8,H*.5));PIE.c.style.width=PIE.c.style.height=sz+"px";PIE.w=PIE.h=sz;PIE.x._fz=FZ;backing(PIE.c,PIE.x,sz,sz);PIE.last="";drawPie();pager("pg-en");}
if(typeof draw==="function"&&st)draw();}
function layout(){dpr=window.devicePixelRatio||1;const vw=innerWidth,vh=innerHeight;SC=Math.min(vw/1920,vh/1080);
APP.style.transform=`translate(${(vw-1920*SC)/2}px,${(vh-1080*SC)/2}px) scale(${SC})`;
APP.style.setProperty("--fz",FZ);APP.style.setProperty("--fzc",FZ<1?FZ:Math.min(1.6,1+(FZ-1)*.3));$("fz").value=Math.round(Math.min(400,Math.max(50,FZ*100)));$("fzv").textContent=Math.round(FZ*100)+"%";
const L=document.querySelector(".left"),hh=$("hint").offsetHeight+8,aw=L.clientWidth,ah=L.clientHeight-hh,w=Math.min(aw,ah*CW/CH);
const sc=$("scene");sc.style.width=w+"px";cv.style.width=w+"px";cv.style.height=w*CH/CW+"px";ctx._fz=Math.min(FZ,1.25);backing(cv,ctx,CW,CH);placeClawd();
moveInd(false);layoutTab();}
function moveInd(anim){const b=document.querySelector(`#tabs button[data-t="${TAB}"]`),ind=$("ind"),L0=parseFloat(ind.dataset.l||b.offsetLeft),W0=parseFloat(ind.dataset.w||b.offsetWidth),L1=b.offsetLeft,W1=b.offsetWidth;
ind.style.left=L1+"px";ind.style.width=W1+"px";ind.dataset.l=L1;ind.dataset.w=W1;
if(anim&&ind.animate){const kf=springKF(...SNAPPY,0,1,.4);ind.animate(kf.map(p=>({left:L0+(L1-L0)*p+"px",width:W0+(W1-W0)*p+"px"})),{duration:400});}}
function setFZ(v){FZ=Math.max(.3,Math.round(v*100)/100);try{LS.setItem(KEY+".fz",FZ)}catch(e){}layout();}
// 初始化（页面脚本末尾调用）。onParam：参数改变时的回调（默认 reset + layoutTab）
function cwInit(onParam){APP=$("app");LS=window.localStorage;FZ=+(LS&&LS.getItem(KEY+".fz"))||1;GSEL=Object.keys(GMAP)[0];
cwButtons();cwPlayback();
document.querySelectorAll("#tabs button").forEach(b=>b.onclick=()=>{if(TAB===b.dataset.t)return;TAB=b.dataset.t;document.querySelectorAll("#tabs button").forEach(x=>x.classList.toggle("on",x===b));
document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on",t.id==="t-"+TAB));moveInd(true);layoutTab();
const t=$("t-"+TAB);if(t.animate){const kf=springKF(...SNAPPY,0,1,.4);t.animate(kf.map(p=>({opacity:Math.min(1,p),transform:`translateY(${10*(1-p)}px) scale(${.98+.02*p})`})),{duration:400});}});
document.querySelectorAll("#seg button").forEach(b=>b.onclick=()=>{GSEL=b.dataset.g;document.querySelectorAll("#seg button").forEach(x=>x.classList.toggle("on",x===b));Object.keys(GMAP).forEach(i=>$(i).classList.toggle("on",i===GSEL));PG["pg-gr"]=0;layoutTab();
const c=$(GSEL);if(c.animate){const kf=springKF(...SNAPPY,0,1,.35);c.animate(kf.map(p=>({opacity:Math.min(1,p)})),{duration:350});}});
$("fz").oninput=e=>setFZ(e.target.value/100);$("fzm").onclick=()=>setFZ(FZ-.1);$("fzp").onclick=()=>setFZ(FZ+.1);
const cOn=$("clawdOn");const cH=/clawdOn/i.test(location.hash),cOff=/clawdOff/i.test(location.hash);cOn.checked=cOff?false:(cH||!!(LS&&LS.getItem(KEY+".clawd")==="1"));const applyC=()=>{$("clawd").style.display=cOn.checked?"":"none";try{LS.setItem(KEY+".clawd",cOn.checked?"1":"0")}catch(e){}};cOn.onchange=applyC;applyC();
const op=onParam||(()=>{reset();layoutTab();});
defs.forEach(d=>{const n=$(d[0]+"n");$(d[0]).oninput=()=>{if(n)n.value=$(d[0]).value;op();};
// 数值输入框：可输入任意小数（精确转分数），超出范围夹到端点；滑块同步到最近刻度
if(n)n.onchange=()=>{let v=+n.value;if(n.value.trim()===""||!isFinite(v))n.value=String(d[6]);else if(v<d[3])n.value=String(d[3]);else if(v>d[4])n.value=String(d[4]);$(d[0]).value=n.value;op();};});
window.addEventListener("resize",layout);
(function watchDPR(){const mq=matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);const h=()=>{layout();watchDPR();};mq.addEventListener?mq.addEventListener("change",h,{once:true}):mq.addListener(h);})();
if(document.fonts)document.fonts.ready.then(layout);
// 图例在每帧更新后同步
setInterval(()=>{if(TAB==="gr"){if(LEGS!==(LEG[GSEL]||""))layoutTab();}},300);}
