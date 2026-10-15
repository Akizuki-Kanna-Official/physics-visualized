// 画布通用：字号缩放钩子、圆角矩形、富文本（斜体变量 + 叠式分数）、刻度步长、HiDPI 后备像素（自第 2 页 V10 抽出）
const $=id=>document.getElementById(id);
// 画布文字随字号缩放：拦截 ctx.font 中的 px
(()=>{const P0=CanvasRenderingContext2D.prototype,fd=Object.getOwnPropertyDescriptor(P0,"font");Object.defineProperty(P0,"font",{get(){return fd.get.call(this)},set(v){const k=this._fz||1;fd.set.call(this,k===1?v:String(v).replace(/([\d.]+)px/,(m,n)=>(n*k).toFixed(2)+"px"))}});})();
const GF="'Source Serif 4','Noto Serif SC',serif",GI="italic 13px 'Source Serif 4',Georgia,serif";
const GC={b:"#C9A24A",k:"#8A6440",q:"#C96442",tot:"#1F1E1D",d:"rgba(201,100,66,.20)",s2:"rgba(111,127,99,.28)",grid:"rgba(31,30,29,.06)",ax:"rgba(31,30,29,.55)"};
let dpr=window.devicePixelRatio||1,SC=1;
// 以全局 ctx 画圆角矩形路径（页面脚本定义 ctx）
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function rrx(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function niceStep(r,n){const raw=r/n,p=Math.pow(10,Math.floor(Math.log10(raw))),q=raw/p;return (q<1.5?1:q<3?2:q<7?5:10)*p;}
// rich text: segments [text, italic?, 分数q?]
function rich(x,segs,X,Y,size,align,color){x.save();x.fillStyle=x.strokeStyle=color||"#3D3929";const fnt=(it,sz)=>(it?"italic ":"")+(sz||size)+"px "+(it?"'Source Serif 4',Georgia,serif":GF);
const fs=size*.82,wq=q=>{if(q.d===1n){x.font=fnt(0);return x.measureText(String(q.n)).width;}x.font=fnt(0,fs);return Math.max(x.measureText(String(q.n<0n?-q.n:q.n)).width,x.measureText(String(q.d)).width)+4+(q.n<0n?8:0);};
const wsg=s=>{if(s[2])return wq(s[2])+(isBig(s[2])?(x.font=fnt(0,size*.8),x.measureText(" ≈"+apx(qv(s[2]))).width):0);x.font=fnt(s[1]);return x.measureText(s[0]).width;};
let w=0;segs.forEach(s=>w+=wsg(s));let cx=align==="center"?X-w/2:align==="right"?X-w:X;if(x._lw&&!x._nc)cx=Math.max(2,Math.min(cx,x._lw-w-4));x.textAlign="left";
segs.forEach(s=>{const q=s[2];if(q){if(q.d===1n){x.font=fnt(0);x.fillText(String(q.n),cx,Y);}else{let ox=cx;if(q.n<0n){x.font=fnt(0);x.fillText("−",cx,Y);ox+=8;}x.font=fnt(0,fs);const n=String(q.n<0n?-q.n:q.n),dd=String(q.d),ww=wq(q)-(q.n<0n?8:0),kz=x._fz||1,by=Y-size*kz*.33;
x.textAlign="center";x.fillText(n,ox+ww/2,by-2);x.fillText(dd,ox+ww/2,by+fs*kz*.95);x.textAlign="left";x.lineWidth=1;x.beginPath();x.moveTo(ox+1,by+.5);x.lineTo(ox+ww-1,by+.5);x.stroke();}
let ww2=wq(q);if(isBig(q)){x.font=fnt(0,size*.8);x.save();x.fillStyle="#7A776D";x.fillText(" ≈"+apx(qv(q)),cx+ww2,Y);x.restore();}cx+=wsg(s);}
else{x.font=fnt(s[1]);x.fillText(s[0],cx,Y);cx+=x.measureText(s[0]).width;}});x.restore();return w;}
function backing(c,x,lw,lh){const cw=c.offsetWidth,ch=c.offsetHeight,bw=Math.max(1,Math.round(cw*SC*dpr)),bh=Math.max(1,Math.round(ch*SC*dpr));if(c.width!==bw)c.width=bw;if(c.height!==bh)c.height=bh;x.setTransform(bw/lw,0,0,bh/lh,0,0);x._lw=lw;}
