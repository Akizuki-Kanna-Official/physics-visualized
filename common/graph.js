// 运动图像通用绘制：坐标轴、曲线、面积填充、斜线阴影、HTML 图例（自第 2 页 V10 抽出）
// TU：时间轴单位（第 2 页为 ms：k=1000）。页面可改写 TU={k:1,u:"s"}。
let TU={k:1000,u:"ms"};
const mk=id=>({c:$(id),x:$(id).getContext("2d"),w:600,h:400});
function frameAxes(g,xmax,ymax,ylab,xt,yfmt,ymin){const x=g.x,k=x._fz||1,l=58*k,r=g.w-14*k,t=16*k,b=g.h-40*k;x.clearRect(0,0,g.w,g.h);ymin=ymin||0;
const X=v=>l+v/xmax*(r-l),Y=v=>b-(v-ymin)/(ymax-ymin)*(b-t);const xs=niceStep(xmax,Math.max(2,Math.min(6,(r-l)/(80*k)))),ys=niceStep(ymax-ymin,Math.max(2,Math.min(5,(b-t)/(45*k))));
x.lineWidth=1;x.font="11.5px "+GF;x.fillStyle="#7A776D";
for(let v=Math.ceil(ymin/ys-1e-9)*ys;v<=ymax*1.0001;v+=ys){x.strokeStyle=GC.grid;x.beginPath();x.moveTo(l,Y(v));x.lineTo(r,Y(v));x.stroke();x.textAlign="right";x.fillText(yfmt(Math.abs(v)<1e-12?0:v),l-7*k,Y(v)+4*k);}
for(let v=0;v<=xmax*1.0001;v+=xs){x.strokeStyle=GC.grid;x.beginPath();x.moveTo(X(v),t);x.lineTo(X(v),b);x.stroke();x.textAlign="center";x.fillText(+(v*TU.k).toFixed(3)+"",X(v),b+16*k);}
x.strokeStyle=GC.ax;x.lineWidth=1.2;x.beginPath();x.moveTo(l,t-4);x.lineTo(l,b);x.lineTo(r+4,b);x.stroke();
if(ymin<0){x.strokeStyle=GC.ax;x.lineWidth=1;x.beginPath();x.moveTo(l,Y(0));x.lineTo(r,Y(0));x.stroke();}
rich(x,[["时间 ",0],["t",1],[" / "+TU.u,0]],r,b+33*k,12.5,"right","#3D3929");
x.save();x.translate(14*k,(t+b)/2);x.rotate(-Math.PI/2);x._nc=1;rich(x,ylab,0,4*k,12.5,"center","#3D3929");x._nc=0;x.restore();
// 关键时刻虚线
if(xt!=null){x.setLineDash([3,4]);x.strokeStyle="rgba(201,100,66,.45)";x.beginPath();x.moveTo(X(xt),t);x.lineTo(X(xt),b);x.stroke();x.setLineDash([]);}
return{X,Y,l,r,t,b};}
function series(fn,t1,n=160){const a=[];for(let i=0;i<=n;i++){const t=t1*i/n;a.push([t,fn(t)]);}return a;}
function line(x,A,pts,col,w,dash){if(pts.length<2)return;x.strokeStyle=col;x.lineWidth=w||2.2;x.setLineDash(dash||[]);x.lineJoin="round";x.beginPath();pts.forEach((p,i)=>{const X=A.X(p[0]),Y=A.Y(p[1]);i?x.lineTo(X,Y):x.moveTo(X,Y);});x.stroke();x.setLineDash([]);}
function fillBetween(x,A,up,lo,col){if(up.length<2)return;x.fillStyle=col;x.beginPath();up.forEach((p,i)=>{i?x.lineTo(A.X(p[0]),A.Y(p[1])):x.moveTo(A.X(p[0]),A.Y(p[1]));});for(let i=lo.length-1;i>=0;i--)x.lineTo(A.X(lo[i][0]),A.Y(lo[i][1]));x.closePath();x.fill();}
function hatch(x,A,up,lo){x.save();x.beginPath();up.forEach((p,i)=>{i?x.lineTo(A.X(p[0]),A.Y(p[1])):x.moveTo(A.X(p[0]),A.Y(p[1]));});for(let i=lo.length-1;i>=0;i--)x.lineTo(A.X(lo[i][0]),A.Y(lo[i][1]));x.closePath();x.clip();
x.strokeStyle="rgba(201,162,74,.55)";x.lineWidth=1;for(let k=-400;k<1000;k+=7){x.beginPath();x.moveTo(k,A.b);x.lineTo(k+(A.b-A.t),A.t);x.stroke();}x.restore();}
const LEG={};function segH(t){return t.map(g=>g[2]?exH(g[2]):g[0]===""?"":g[1]?`<i class="f">${g[0]}</i>`:g[0]).join("");}
function legend(x,items){const h=items.map(it=>`<div><s class="${it.line?"ln":""}" style="background:${it.hatch?"repeating-linear-gradient(135deg,rgba(201,162,74,.9) 0 1.5px,transparent 1.5px 4px)":it.c}"></s><span>${segH(it.t)}</span></div>`).join("");LEG[x.canvas.id]=h;}
