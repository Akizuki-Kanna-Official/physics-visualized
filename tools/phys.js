// node 物理核对：载入 exact.js 与页面模型脚本，(1) 精确答案与 python 独立解（expected.json）比较；(2) 跑数值仿真，打印关键事件与末态
// 用法: node phys.js 页面.html 页键(p3)
const fs=require("fs"),vm=require("vm"),path=require("path");
const [,,file,key]=process.argv;const html=fs.readFileSync(file,"utf8");
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>s.includes("const M="));
const ctx={console,Math,BigInt,Number,String,JSON,Object,Array,Infinity,isFinite};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,"../common/exact.js"),"utf8").replace(/^if\(typeof module[\s\S]*$/m,""),ctx);
vm.runInContext("const C={clay:'',ink:'',muted:'',brass:'',wood2:'',slate:'',sage:'',plum:''};let H=[],K=100,VIEW={};const $=()=>null;"+scripts[0]+";this.M=M;this.defs=defs;",ctx);
const exp=JSON.parse(fs.readFileSync(path.join(__dirname,"expected.json"),"utf8"))[key]||{};
vm.runInContext(`var P={},PX={};defs.forEach(d=>{P[d[0]]=d[6];PX[d[0]]=qparse(String(d[6]));});var X=M.exact(PX,P);`,ctx);
let bad=0;for(const k in exp){const x=ctx.X[k];let v;if(x==null){console.log("缺少",k);bad++;continue;}v=x.n!==undefined?Number(x.n)/Number(x.d):x.r?ctx.sval(x):x;
const ok=Math.abs(v-exp[k])<1e-9*Math.max(1,Math.abs(exp[k]));if(!ok)bad++;console.log((ok?"✓":"✗")+" "+k+" = "+(x.n!==undefined?(x.d===1n?x.n:x.n+"/"+x.d):v)+"  (python "+exp[k]+")");}
// 仿真
vm.runInContext(`var s=M.init(P),T=M.tPre(P)*${process.argv[4]||1},n=0,EV={};var ev=[];var lastph=s.ph;while(s.t<T&&n<2e7){M.step(s,Math.min(M.h(s,P),T-s.t+1e-12),P);n++;if(M.events)M.events(s,EV,P);if(s.ph!==lastph){ev.push([s.ph,+s.t.toFixed(6)]);lastph=s.ph;}}`,ctx);
console.log("仿真阶段切换 [ph,t]:",JSON.stringify(ctx.ev));console.log("事件:",JSON.stringify(ctx.EV));
const r=ctx.M.rec(ctx.s,ctx.P);console.log("末态 rec:",JSON.stringify(r,(k,v)=>typeof v==="number"?+v.toFixed(6):v));
if(ctx.M.check)console.log("模型自检:",JSON.stringify(ctx.M.check(ctx.s,ctx.EV,ctx.P)));
console.log(bad?`✗ ${bad} 项不符`:"✓ 精确答案全部与 python 一致");process.exit(bad?1:0);
