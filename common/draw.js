// 场景物体绘制（V11 起新页面使用）：v 为视图 {K,X(x),Y(y)}，世界坐标单位 m，y 向上
const C={clay:"#C96442",ink:"#1F1E1D",muted:"#7A776D",line:"#E3E0D5",wood:"#B98A5E",wood2:"#9C7048",sage:"#6F7F63",brass:"#C9A24A",slate:"#5D6B86",plum:"#8E5B7A"};
const WOOD=["#C99B6E","#A87A50"],STEEL=["#9AA3B5","#6E778A"],CLAYG=["#D98B6E","#B5573A"];
function wBlock(v,x,y,w,h,label,grad,r){const X0=v.X(x),Y0=v.Y(y+h),W=w*v.K,Hh=h*v.K;grad=grad||WOOD;ctx.save();ctx.shadowColor="rgba(80,60,30,.16)";ctx.shadowBlur=10;ctx.shadowOffsetY=4;rr(X0,Y0,W,Hh,Math.min(r==null?6:r,W/3,Hh/3));
const g=ctx.createLinearGradient(0,Y0,0,Y0+Hh);g.addColorStop(0,grad[0]);g.addColorStop(1,grad[1]);ctx.fillStyle=g;ctx.fill();ctx.restore();
if(label&&W>14){ctx.fillStyle="rgba(255,255,255,.95)";ctx.font="italic 600 "+Math.max(11,Math.min(18,Hh*.42))+"px 'Source Serif 4',Georgia,serif";ctx.textAlign="center";ctx.fillText(label,X0+W/2,Y0+Hh/2+Math.min(18,Hh*.42)*.35);ctx.textAlign="left";}}
// 平板车：x 左端，len 长度，deck 上表面高度，th 板厚，wr 轮半径
function wCart(v,x,len,deck,th,wr,label){const yb=deck-th;wBlock(v,x,yb,len,th,"",["#B8B3A6","#8F8A7D"],4);
[0.18,0.82].forEach(f=>{const cx=v.X(x+len*f),cy=v.Y(wr),R=wr*v.K;ctx.fillStyle="#5E5A50";ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.fill();ctx.fillStyle="#D9D4C6";ctx.beginPath();ctx.arc(cx,cy,R*.35,0,7);ctx.fill();});
if(label){ctx.fillStyle="#fff";ctx.font="italic 600 15px 'Source Serif 4',Georgia,serif";ctx.textAlign="center";ctx.fillText(label,v.X(x+len*.5),v.Y(yb+th/2)+5);ctx.textAlign="left";}}
// 子弹：tip 弹头世界 x，y 中心高度，长度按屏幕 24 px（放大镜中按比例）
function wBullet(v,tip,y,len){const L=(len||24/(v.mainK||K))*v.K,px=v.X(tip),hy=v.Y(y),hh=Math.max(2.2,Math.min(L*5/24,30)),nl=Math.min(L*14/24,hh*2.8);ctx.fillStyle=C.brass;ctx.beginPath();ctx.moveTo(px,hy);ctx.quadraticCurveTo(px-nl*.43,hy-hh,px-nl,hy-hh);ctx.lineTo(px-L,hy-hh);ctx.lineTo(px-L,hy+hh);ctx.lineTo(px-nl,hy+hh);ctx.quadraticCurveTo(px-nl*.43,hy+hh,px,hy);ctx.fill();ctx.fillStyle="#A8842F";ctx.fillRect(px-L,hy-hh,Math.max(2,L*3/24),hh*2);}
function wBulletL(v,tip,y,len){ctx.save();const px=v.X(tip);ctx.translate(px,0);ctx.scale(-1,1);ctx.translate(-px,0);wBullet(v,tip,y,len);ctx.restore();}
function wBall(v,x,y,r,col,label){const cx=v.X(x),cy=v.Y(y),R=Math.max(2,r*v.K),g=ctx.createRadialGradient(cx-R*.35,cy-R*.35,R*.1,cx,cy,R);g.addColorStop(0,"#fff");g.addColorStop(1,col||"#6E778A");ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.fill();ctx.strokeStyle="rgba(0,0,0,.25)";ctx.lineWidth=1;ctx.stroke();
if(label){ctx.fillStyle=C.ink;ctx.font="italic 600 14px 'Source Serif 4',Georgia,serif";ctx.fillText(label,cx+R+4,cy-R);}}
// 弹簧：从 x1 到 x2（世界），高度 y，圈数 n，幅度 a（世界 m）
function wSpring(v,x1,x2,y,n,a,col){const X1=v.X(x1),X2=v.X(x2),Y0=v.Y(y),A=a*v.K,L=X2-X1,e=Math.min(8,Math.abs(L)*.1)*Math.sign(L||1);ctx.strokeStyle=col||"#5D6B86";ctx.lineWidth=1.8;ctx.lineJoin="round";ctx.beginPath();ctx.moveTo(X1,Y0);ctx.lineTo(X1+e,Y0);
const m=n*2;for(let i=1;i<=m;i++){const xx=X1+e+(L-2*e)*(i-.5)/m;ctx.lineTo(xx,Y0+(i%2?-A:A));}ctx.lineTo(X2-e,Y0);ctx.lineTo(X2,Y0);ctx.stroke();}
// 竖直墙（右侧为墙面）
function wWall(v,x,y0,y1,side){const X0=v.X(x),Ya=v.Y(y1),Yb=v.Y(y0);ctx.strokeStyle=C.ink;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(X0,Ya);ctx.lineTo(X0,Yb);ctx.stroke();ctx.strokeStyle="#B9B4A6";ctx.lineWidth=1;const s=side||-1;for(let y=Ya+4;y<Yb;y+=9){ctx.beginPath();ctx.moveTo(X0,y);ctx.lineTo(X0+s*7,y+7);ctx.stroke();}}
// 速度箭头
function wArrow(v,x,y,vx,scale,col,lab){const X0=v.X(x),Y0=v.Y(y),L=vx*scale;if(Math.abs(L)<3)return;ctx.strokeStyle=ctx.fillStyle=col||C.clay;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X0,Y0);ctx.lineTo(X0+L,Y0);ctx.stroke();const s=Math.sign(L);ctx.beginPath();ctx.moveTo(X0+L,Y0);ctx.lineTo(X0+L-8*s,Y0-4.5);ctx.lineTo(X0+L-8*s,Y0+4.5);ctx.fill();
if(lab){ctx.font="12px "+GF;ctx.textAlign="center";ctx.fillText(lab,X0+L/2,Y0-7);ctx.textAlign="left";}}
// 屏幕外指示：若物体屏幕 x 超出 [40, CW-40]，在边缘画箭头标签
function offscreen(v,x,y,label){if(!v.main)return false;const X0=v.X(x),Y0=Math.max(110,Math.min(CH-40,v.Y(y)));if(X0>CW-36){edgeArrow(CW-30,Y0,1,label);return true;}if(X0<36){edgeArrow(30,Y0,-1,label);return true;}return false;}
function wText(v,x,y,t,col,size,align){ctx.fillStyle=col||C.ink;ctx.font=(size||12)+"px "+GF;ctx.textAlign=align||"center";ctx.fillText(t,v.X(x),v.Y(y));ctx.textAlign="left";}
