// 能量饼图：每帧向目标插值 25%，定格后图例追加精确分数（自第 2 页 V10 抽出）
// PIE={c,x,w,h}；tgt=各部分占比数组；fr=精确占比（分母 ≤4 位才显示）；done=是否已定格；frUnit=分数后缀
function pieRender(PIE,tgt,cols,names,done,fr,reset0,frUnit){
if(!PIE.d||reset0)PIE.d=tgt.slice();else PIE.d=PIE.d.map((v,i)=>v+(tgt[i]-v)*.25);const x=PIE.x,w=PIE.w,h=PIE.h;x.clearRect(0,0,w,h);
const cx=w/2,cy=h/2,R0=Math.min(w,h)/2-4;let a=-Math.PI/2;
PIE.d.forEach((p,i)=>{if(p<=0)return;const b=a+p*Math.PI*2;x.fillStyle=cols[i];x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,R0,a,b);x.closePath();x.fill();x.strokeStyle="#FCFBF8";x.lineWidth=2;x.stroke();
if(p>.08){const mid=(a+b)/2;x.fillStyle="#fff";x.font="600 "+(Math.max(R0*.15,14*(x._fz||1))/(x._fz||1))+"px "+GF;x.textAlign="center";x.fillText((p*100).toFixed(1)+"%",cx+Math.cos(mid)*R0*.58,cy+Math.sin(mid)*R0*.58+R0*.05);}a=b;});
const u=frUnit==null?" <i class=f>E</i>₀":frUnit;
const html=PIE.d.map((p,i)=>`<div><s style="background:${cols[i]}"></s>${names[i]}<b>${(p*100).toFixed(p<.01?2:1)}%${done&&fr&&fr[i]&&fr[i].d<=9999n?" = "+exH(fr[i])+u:""}</b></div>`).join("");
if(html!==PIE.last){$("pieLeg").innerHTML=html;PIE.last=html;}}
