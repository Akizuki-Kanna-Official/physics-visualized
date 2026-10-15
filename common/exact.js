// 精确有理数 / 根式运算与 HTML 渲染（自第 2 页 V10 抽出；node 可直接 require）
const Bg=BigInt;
function gcdB(a,b){a=a<0n?-a:a;b=b<0n?-b:b;while(b){[a,b]=[b,a%b];}return a;}
function R(n,d=1n){n=Bg(n);d=Bg(d);if(d<0n){n=-n;d=-d;}const g=gcdB(n,d)||1n;return{n:n/g,d:d/g};}
const qa=(a,b)=>R(a.n*b.d+b.n*a.d,a.d*b.d),qs=(a,b)=>R(a.n*b.d-b.n*a.d,a.d*b.d),qm=(a,b)=>R(a.n*b.n,a.d*b.d),qd=(a,b)=>R(a.n*b.d,a.d*b.n),qv=a=>Number(a.n)/Number(a.d);
function qparse(s){s=String(s).trim();const[i,f=""]=s.split(".");return R(Bg(i+f),10n**Bg(f.length));}
function sqExtract(N){let out=1n,p=2n,it=0;while(p*p<=N&&it<2e6){while(N%(p*p)===0n){N/=p*p;out*=p;}p+=p===2n?1n:2n;it++;}return[out,N];}
// √q = k√n
function qsqrt(q){const[s,n]=sqExtract(q.n*q.d);return{k:R(s,q.d),n};}
const sv=s=>qv(s.r)+qv(s.k)*Math.sqrt(Number(s.n));
const isBig=q=>(q.n<0n?-q.n:q.n)>99999n||q.d>99999n;
function apx(x){const a=Math.abs(x);return a===0?"0":a>=100?x.toFixed(1):a>=1?x.toPrecision(4):x.toPrecision(3);}
// HTML 渲染
function fracH(q,num){const neg=q.n<0n,n=neg?-q.n:q.n,nn=num!=null?num:(n===1n&&num===""?"":n);
if(q.d===1n&&num==null)return(neg?"−":"")+n;return(neg?"−":"")+`<span class="fr"><span>${num!=null?num:n}</span><span>${q.d}</span></span>`;}
function exH(q,unit){return fracH(q)+(unit?" "+unit:"")+(isBig(q)?` <small class="ap">≈ ${apx(qv(q))}</small>`:"");}
function surdH(s,unit){if(s.n===1n){const q=qa(s.r,s.k);return exH(q,unit);}
const kn=s.k.n<0n?-s.k.n:s.k.n,rad=`${kn===1n?"":kn}<span class="rt">√<span>${s.n}</span></span>`;let h="";
if(s.r.n!==0n)h+=fracH(s.r)+(s.k.n<0n?" − ":" + ");else if(s.k.n<0n)h+="−";
h+=s.k.d===1n?rad:fracH(R(kn,s.k.d),rad);const big=isBig(s.r)||isBig(s.k)||s.n>99999n;
return h+(unit?" "+unit:"")+(big?` <small class="ap">≈ ${apx(sv(s))}</small>`:"");}
// —— 以下为 V11 起新增的通用工具 ——
const qi=n=>R(n),qneg=a=>R(-a.n,a.d),qeq=(a,b)=>a.n===b.n&&a.d===b.d,qsq=a=>qm(a,a);
// 根式 s = r + k√n；n=1 时化为有理数
function Sd(r,k=R(0),n=1n){n=Bg(n);if(n===1n||k.n===0n)return{r:qa(r,n===1n?k:R(0)),k:R(0),n:1n};return{r,k,n};}
// 有理数开方：q ≥ 0 → 根式 k√n
function qroot(q){const s=qsqrt(q);return Sd(R(0),s.k,s.n);}
const sneg=s=>({r:qneg(s.r),k:qneg(s.k),n:s.n}),sadd=(a,b)=>{if(a.n!==b.n&&a.k.n!==0n&&b.k.n!==0n)throw"surd";const n=a.k.n!==0n?a.n:b.n;return Sd(qa(a.r,b.r),qa(a.k,b.k),n);},
smq=(s,q)=>Sd(qm(s.r,q),qm(s.k,q),s.n),sval=s=>qv(s.r)+qv(s.k)*Math.sqrt(Number(s.n));
// 数值近似显示
const fx=(x,n=3)=>(+x).toFixed(n);
if(typeof module!=="undefined")module.exports={R,qa,qs,qm,qd,qv,qparse,qsqrt,sqExtract,isBig,apx,fracH,exH,surdH,qi,qneg,qeq,qsq,Sd,qroot,sneg,sadd,smq,sval,sv,fx,Bg,gcdB};
