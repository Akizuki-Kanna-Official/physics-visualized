// 场景通用：地面斜线 + 世界坐标刻度（随镜头滚动）、镜头跟随、播放倍率缓动、子弹时间说明条、放大镜缩放曲线（自第 2 页 V10 抽出并推广）
function niceTick(m){for(const c of [0.001,0.002,0.005,0.01,0.02,0.05,0.1,0.2,0.5,1,2,5,10,20,50])if(c>=m)return c;return 100;}
function fmtLen(v,stp){return stp<0.01?(v*1000).toFixed(0)+" mm":stp<1?(v*100).toFixed(stp<0.1?1:0).replace(/\.0$/,"")+" cm":v.toFixed(stp<10?0:0)+" m";}
// 地面：o={gy 地面线 y, cam 镜头位移(px), K 比例尺(px/m), ox 世界原点画布 x（未移镜头时）, L,Rr 左右边界, tickPx 期望刻度间距(px), label}
function drawGround(o){const gy=o.gy,cam=o.cam||0,K=o.K,ox=o.ox,L=o.L==null?40:o.L,Rr=o.Rr==null?CW-40:o.Rr,x0=ox-cam;
ctx.strokeStyle=C.line;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,gy);ctx.lineTo(Rr,gy);ctx.stroke();
ctx.save();ctx.beginPath();ctx.rect(L,gy,Rr-L,40);ctx.clip();ctx.strokeStyle="#ECE9DF";ctx.lineWidth=1;const h0=((cam%14)+14)%14;for(let x=L+10-h0;x<Rr+14;x+=14){ctx.beginPath();ctx.moveTo(x,gy+1);ctx.lineTo(x-8,gy+9);ctx.stroke();}
const tM=niceTick((o.tickPx||110)/K),i0=Math.floor((L+cam-ox)/K/tM);ctx.font="11px 'Source Serif 4','Noto Serif SC',serif";ctx.textAlign="center";
for(let i=i0;;i++){const xw=i*tM,x=x0+xw*K;if(x>Rr)break;if(x<L)continue;ctx.strokeStyle="#C9C4B5";ctx.beginPath();ctx.moveTo(x,gy);ctx.lineTo(x,gy+(i%5===0?10:6));ctx.stroke();if((o.neg||i>=0)&&x>(o.lblL==null?150:o.lblL)&&x<Rr-20){ctx.fillStyle="#A7A294";ctx.fillText(fmtLen(xw,tM),x,gy+24);}}
ctx.textAlign="left";ctx.restore();
if(o.label!==""){ctx.fillStyle=C.muted;ctx.font="12px 'Source Serif 4','Noto Serif SC',serif";ctx.fillText(o.label||"光滑水平面",L+4,gy+26);}}
// 播放倍率缓动（第 2 页 V10 公式）：对数空间指数缓动，τ = 0.5 s 真实时间
function tsEase(cur,tgt,dt,tau){if(!cur)return tgt;return cur*Math.pow(tgt/cur,1-Math.exp(-dt/(tau||0.5)));}
// V11 起新页面使用：在对数空间指数缓动，且每 1/60 s 变化不超过 ×1.10（保证相邻帧屏幕速度比 ≤ 1.10）
function tsEase2(cur,tgt,dt,tau){if(!cur)return tgt;let d=Math.log(tgt/cur)*(1-Math.exp(-dt/(tau||0.35)));const lim=Math.log(1.10)*dt*60;d=Math.max(-lim,Math.min(lim,d));return cur*Math.exp(d);}
// 镜头：临界阻尼弹簧追踪目标（px），按真实时间推进；返回新状态 {x,v}
function camStep(c,target,dt,w){w=w||2.2;const a=w*w*(target-c.x)-2*w*c.v;c.v+=a*dt;c.x+=c.v*dt;return c;}
// 子弹时间说明条
let chipLast="";
function chipSet(slow,N,extra){const Nr=N>=100?Math.round(N/10)*10:N>=10?Math.round(N):+N.toFixed(N<1?2:1);
const h=slow?`子弹时间：快速过程已放慢，画面速度的变化由播放倍率造成，不是物理过程 · 当前播放 <b>×1/${Nr}</b>${extra||""}`:`真实比例播放：屏幕速度与物理速度严格成正比（<b>×1/${Nr}</b>）${extra||""}`;
if(h!==chipLast){const e=$("hint");e.innerHTML=h;e.classList.toggle("off",!slow);chipLast=h;}}
// 放大镜：先连续放大/缩小、后定格平移。u=位移·ppm0/span；屏幕位置 E=sx0+span·tanh u；倍率 ppm 平滑趋于 ppmMin；pan ≥ 0
function magZoom(dispMM,ppm0,ppmMin,sx0,span){span=span||432;const uu=dispMM*ppm0/span,th=uu>1e-9?Math.tanh(uu)/uu:1,ppm=ppmMin+(ppm0-ppmMin)*th,exE=sx0+span*Math.tanh(uu),pan=Math.max(0,dispMM-(exE-sx0)/ppm);return{ppm,exE,pan};}
// 边缘箭头：物体离开画面时在边缘画指示（dir=±1）
function edgeArrow(x,y,dir,label,col){col=col||C.clay;ctx.save();ctx.fillStyle="rgba(252,251,248,.92)";const w=Math.max(60,ctx.measureText?0:0);ctx.font="12px "+GF;const tw=ctx.measureText(label).width,bx=dir>0?x-tw-44:x+4;rr(bx,y-13,tw+40,26,8);ctx.fill();ctx.strokeStyle="rgba(201,100,66,.3)";ctx.lineWidth=1;ctx.stroke();
ctx.fillStyle=col;ctx.beginPath();if(dir>0){ctx.moveTo(x-4,y);ctx.lineTo(x-16,y-7);ctx.lineTo(x-16,y+7);}else{ctx.moveTo(x+4,y);ctx.lineTo(x+16,y-7);ctx.lineTo(x+16,y+7);}ctx.fill();
ctx.fillStyle="#9E4429";ctx.textAlign="left";ctx.fillText(label,dir>0?bx+8:bx+22,y+4);ctx.restore();}
