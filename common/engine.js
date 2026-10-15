// 通用动画引擎（V11 起第 3–16 页使用）
// 页面定义全局 M（模型）与 defs、KEY，然后调用 engineStart()。
// M 接口：
//   exact(PX,P)→X  精确解；sol(X,P)→解答 HTML
//   init(P)→st（含 t）；h(st,P)→最大子步长；step(st,h,P) 推进 h（物理积分）
//   fast(st,P)→是否处于极短过程（撞击/打入），用于子弹时间
//   tsBase(P)→关闭子弹时间时的统一播放倍率（物理秒/真实秒）；tsSlow(P)→子弹时间里极短过程的播放倍率
//   tPre(P)→预演时长；tg(EV,P)→图像定格时刻；events(st,EV) 预演中记录关键事件
//   rec(st,P)→图像采样 {v:{},x:{},E:{}}；G={gv:{…},gx:{…},ge:{…}} 图像配置
//   world(view,st,P) 画场景；view={K,ox,oy,cam,X(x),Y(y),main}
//   camFocus(st,P)→镜头追踪的世界 x（null=不跟随）；camAnchor 画布 x
//   bars(st,P)→[[名称,速度,颜色,最大值]]；status(st,P)→状态文字；mag(st,P)→放大镜 {x,y,z,r:[x,y,w,h],title} 或 null
//   pie(st,P,X)→{tgt,cols,names,done,fr}；live(st,P)→[[名称,值]]
let P,PX,X,st,run=false,slow=true,lastT=null,H=[],EV={},FIV=[],TG=1,cam={x:0,v:0},TSc=null,MAG={z:1},K=100,VIEW;
const cv=$("c"),ctx=cv.getContext("2d"),CW=1040,CH=480;
const PIE={c:$("pie"),x:$("pie").getContext("2d"),w:300,h:300};
const GMAP={};let GT={},GN={};
function tagsNote(){const g={g:[],e:[],a:[]};defs.forEach(d=>{if(d[7])g[d[7]].push(`${d[1].replace(/ ([A-Za-zθμ][^ ]*)$/," <i class=f>$1</i>")} = ${exH(PX[d[0]])}${d[2]?" "+d[2]:""}`);});
const ex=M.extraTags?M.extraTags(P):{};["g","e","a"].forEach(k=>{if(ex[k])g[k].push(...ex[k]);});
return ["g","e","a"].filter(k=>g[k].length).map(k=>`<div class="lbl"><span class="tg ${TAGS[k][1]}">${TAGS[k][0]}</span>${g[k].join("；")}</div>`).join("");}
function prerun(){const s=M.init(P);H=[{t:0,...M.rec(s,P)}];FIV=[];EV={};const T=M.tPre(P);let inF=false,a=0,last=0,n=0;const dtr=T/800;
while(s.t<T&&n<4e6){const h=Math.min(M.h(s,P),T-s.t+1e-12);M.step(s,h,P);n++;const f=M.fast(s,P);if(f&&!inF){inF=true;a=s.t;}if(!f&&inF){inF=false;FIV.push([a,s.t]);}
if(M.events)M.events(s,EV,P);if(f||s.t-last>=dtr){H.push({t:s.t,...M.rec(s,P)});last=s.t;}}
if(inF)FIV.push([a,s.t]);TG=M.tg(EV,P);}
function reset(){readParams();X=M.exact(PX,P);$("ans").innerHTML=tagsNote()+M.sol(X,P);st=M.init(P);prerun();cam={x:0,v:0};TSc=null;MAG={z:1,on:false};run=false;PIE.d=null;chipLast="";if(M.onReset)M.onReset(P);updBtns();if(typeof draw==="function"&&VIEW)draw();}
// 播放倍率：子弹时间开时，在极短过程前后放慢（提前量按当前倍率估算），全部按真实时间连续缓动
function tsTarget(){const b=M.tsBase(P);if(!slow)return b;const s=M.tsSlow(P),lead=(TSc||b)*1.6,hold=s*0.6;for(const[a,e]of FIV){if(st.t>=a-lead&&st.t<=e+hold)return s;}return b;}
function advance(dS){let rem=dS,n=0;while(rem>1e-15&&n<2e5){const h=Math.min(M.h(st,P),rem);M.step(st,h,P);rem-=h;n++;}}
function frame(t){if(lastT==null)lastT=t;const dt=Math.min((t-lastT)/1000,.05);lastT=t;
if(run){const tg=tsTarget();TSc=slow?tsEase2(TSc,tg,dt,0.35):tg;advance(dt*TSc);
const f=M.camFocus?M.camFocus(st,P):null;if(f!=null){const tgt=Math.max(M.camMin==null?0:M.camMin,(f*K+VIEW.ox)-(M.camAnchor||CW/2));const T1=M.camNeg?tgt:Math.max(0,tgt);cam.tv=cam.lt==null?0:(T1-cam.lt)/Math.max(dt,1e-6);cam.lt=T1;camStep(cam,T1,dt,M.camW||2.2,cam.tv);}
const mg=M.mag?M.mag(st,P):null;if(mg){MAG.on=true;MAG.z+=(mg.z-MAG.z)*(1-Math.exp(-dt/0.6));}}
draw();chipUpd();requestAnimationFrame(frame);}
function chipUpd(){const ts=run||st.t>0?(TSc||tsTarget()):tsTarget();chipSet(slow,1/ts);}
function mkView(){const v=M.view(P);K=v.K;VIEW={K,mainK:K,ox:v.ox,gy:v.gy,cam:cam.x,X:x=>v.ox+x*K-cam.x,Y:y=>v.gy-y*K,main:1};return VIEW;}
function draw(){ctx.clearRect(0,0,CW,CH);mkView();
if(M.ground!==false)drawGround({gy:VIEW.gy,cam:cam.x,K,ox:VIEW.ox,label:M.groundLabel,neg:1});
M.world(VIEW,st,P);
// 放大镜：同一 world() 以更大比例重画，中心跟随目标点（物体始终在视野内）；倍率连续变化后定格
const mg=M.mag?M.mag(st,P):null;if(mg&&MAG.on){const[rx,ry,rw,rh]=mg.r,z=Math.max(1,MAG.z),Kz=K*z;ctx.save();ctx.fillStyle="#F6F3EC";rr(rx,ry,rw,rh,12);ctx.fill();ctx.strokeStyle=C.line;ctx.lineWidth=1;ctx.stroke();rr(rx,ry,rw,rh,12);ctx.clip();
const v2={K:Kz,mainK:K,ox:rx+rw/2-mg.x*Kz,gy:ry+rh/2+mg.y*Kz,cam:0,X:x=>rx+rw/2+(x-mg.x)*Kz,Y:y=>ry+rh/2-(y-mg.y)*Kz,main:0,z};
if(M.ground!==false){ctx.strokeStyle=C.ink;ctx.lineWidth=1.2;const gyy=v2.Y(0);ctx.beginPath();ctx.moveTo(rx,gyy);ctx.lineTo(rx+rw,gyy);ctx.stroke();}
M.world(v2,st,P);ctx.restore();ctx.fillStyle=C.muted;ctx.font="12px "+GF;ctx.fillText((mg.title||"放大镜")+"（约 ×"+z.toFixed(z<10?1:0)+"）",rx+10,ry+16);}
// 左上：时间、状态；右上：速度条
ctx.fillStyle=C.muted;ctx.font="12px "+GF;ctx.fillText("时间",44,34);ctx.fillStyle=C.ink;ctx.font="600 20px 'Source Serif 4',Georgia,serif";ctx.fillText(st.t<1?fx(st.t*1000,1)+" ms":fx(st.t,3)+" s",44,58);
ctx.fillStyle=C.clay;ctx.font="600 13px "+GF;ctx.fillText("● "+M.status(st,P),44,84);
const bars=M.bars(st,P);bars.forEach((b,i)=>{const y=30+i*24,x=640;ctx.fillStyle=C.muted;ctx.font="12px "+GF;ctx.fillText(b[0],x,y+4);ctx.fillStyle="#EFECE3";rr(x+80,y-4,200,8,4);ctx.fill();
const fr=Math.min(1,Math.abs(b[1])/b[3]);ctx.fillStyle=b[2];if(b[1]>=0){rr(x+180,y-4,Math.max(3,fr*100),8,4);}else{rr(x+180-Math.max(3,fr*100),y-4,Math.max(3,fr*100),8,4);}ctx.fill();ctx.fillStyle="rgba(31,30,29,.35)";ctx.fillRect(x+179.5,y-7,1,14);
ctx.fillStyle=C.ink;ctx.font="600 13px 'Source Serif 4',Georgia,serif";ctx.fillText(fx(b[1],2)+" m/s",x+290,y+5);});
if(bars.length){ctx.fillStyle=C.muted;ctx.font="11px "+GF;ctx.fillText("（水平速度，向右为正）",640,30+bars.length*24+2);}
drawGraphs();drawPie();
const lv=M.live(st,P);$("live").innerHTML=lv.map(r=>`<div class="r"><span>${r[0]}</span><b>${r[1]}</b></div>`).join("");}
function drawPie(){const p=M.pie(st,P,X);pieRender(PIE,p.tgt,p.cols,p.names,p.done,p.fr,st.t===0,p.unit);}
// 图像：预演记录的仿真数据，画到 min(t, TG) 后定格
function drawGraphs(){const now=Math.min(st.t,TG);const hs=H.filter(h=>h.t<=now+1e-12);
for(const id in M.G){const g=M.G[id],gg=GMAP[id],x=gg.x;let lo=g.ymin!=null?g.ymin:Infinity,hi=g.ymax!=null?g.ymax:-Infinity;
if(g.ymin==null||g.ymax==null)H.forEach(h=>{if(h.t>TG)return;g.s.forEach(s=>{const v=h[g.f][s.k];if(v<lo)lo=v;if(v>hi)hi=v;});});
if(g.ymin==null)lo=Math.min(0,lo);const pad=(hi-lo)*0.08||1;const A=frameAxes(gg,TG,g.ymax!=null?g.ymax:hi+pad,g.ylab,g.mark!=null?g.mark(EV):null,g.fmt||(v=>+v.toFixed(2)+""),g.ymin!=null?g.ymin:(lo<0?lo-pad:0));
if(g.dash)g.dash.forEach(d=>line(x,A,[[0,d.y],[TG,d.y]],d.c,1.3,[6,4]));
g.s.forEach(s=>line(x,A,hs.map(h=>[h.t,h[g.f][s.k]]),s.c,s.w||2.3,s.dash));
if(g.extra)g.extra(x,A,now,EV);
legend(x,g.leg?g.leg(X):g.s.map(s=>({c:s.c,line:1,t:s.t})));}}
function engineStart(){TU={k:1,u:"s"};document.title=M.title;buildParams();$("params").classList.add("np");$("params").style.setProperty("--np",defs.length);
Object.keys(M.G).forEach(id=>{GMAP[id]=mk(id);GT[id]=M.G[id].title;GN[id]=M.G[id].note;});
if(M.clawdX!=null)CLAWD_X=M.clawdX;if(M.clawdY!=null)CLAWD_Y=M.clawdY;
cwInit();reset();layout();requestAnimationFrame(frame);requestAnimationFrame(clawdTick);}
