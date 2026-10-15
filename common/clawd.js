// Clawd 待机小人（用户提供的造型与 idle 动作；自第 2 页 V10 抽出）
const smoothK=t=>t*t*(3-2*t);
function keyK(t,pts){for(let i=1;i<pts.length;i++){if(t<=pts[i][0]){const a=pts[i-1],b=pts[i];return a[1]+(b[1]-a[1])*smoothK((t-a[0])/(b[0]-a[0]));}}return pts[pts.length-1][1];}
function clawdSVG(frame){const t=(frame%180)/180,y=4*(1-Math.cos(t*Math.PI*2))/2,bl=keyK(t,[[0,1],[.38,1],[.41,.12],[.43,.12],[.47,1],[1,1]]);
let s='<ellipse cx="60" cy="102" rx="40" ry="3" fill="#3D3929" opacity=".10"/>';
[31,51,69,89].forEach(x=>{s+='<rect x="'+(x-6)+'" y="'+(70+y)+'" width="12" height="'+Math.max(10,95-(70+y))+'" fill="#D77757"/>';});
s+='<g transform="translate(0 '+y+')"><rect x="0" y="30" width="20" height="20" fill="#D77757"/><rect x="100" y="30" width="20" height="20" fill="#D77757"/><rect x="20" y="10" width="80" height="60" fill="#D77757"/>';
s+='<rect x="38" y="'+(31-6*bl)+'" width="10" height="'+(12*bl)+'" fill="#171717"/><rect x="72" y="'+(31-6*bl)+'" width="10" height="'+(12*bl)+'" fill="#171717"/></g>';
return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -55 160 175" shape-rendering="crispEdges">'+s+'</svg>';}
let cf=0,cprev=null;
function clawdTick(now){if(cprev!==null)cf=(cf+Math.min(now-cprev,100)*60/1000)%180;cprev=now;$("clawd").innerHTML=clawdSVG(Math.floor(cf));requestAnimationFrame(clawdTick);}
// 脚底(viewBox y=95)对齐场景讲解栏底线 CLAWD_Y（逻辑坐标），水平位置 CLAWD_X（默认居中）
let CLAWD_Y=118,CLAWD_X=null;
function placeClawd(){const k=cv.offsetWidth/CW,el=$("clawd");const W0=120,H0=W0*175/160;el.style.width=W0*k+"px";el.style.height=H0*k+"px";
el.style.top=(CLAWD_Y*k-(95+55)/175*H0*k)+"px";el.style.left=(((CLAWD_X==null?CW/2:CLAWD_X)-W0/2)*k)+"px";}
