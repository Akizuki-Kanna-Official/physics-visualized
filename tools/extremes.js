// 用法: node extremes.js 页面.html —— 把每个参数分别取最小值、最大值（其余为默认），跑仿真，检查 NaN / 异常 / 卡死
const fs=require("fs"),vm=require("vm"),path=require("path");
const file=process.argv[2];const html=fs.readFileSync(file,"utf8");
const src=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>s.includes("const M="))[0];
const ctx={console,Math,BigInt,Number,String,JSON,Object,Array,Infinity,isFinite};vm.createContext(ctx);ctx.P={};ctx.PX={};
vm.runInContext(fs.readFileSync(path.join(__dirname,"../common/exact.js"),"utf8").replace(/^if\(typeof module[\s\S]*$/m,""),ctx);
vm.runInContext("const C={clay:'',ink:'',muted:'',brass:'',wood2:'',slate:'',sage:'',plum:''};let H=[],K=100,VIEW={};const $=()=>null;"+src+";this.M=M;this.defs=defs;",ctx);
let bad=0;
for(const d of ctx.defs)for(const val of [d[3],d[4]]){
const r=vm.runInContext(`(function(){P={};PX={};defs.forEach(d=>{P[d[0]]=d[6];PX[d[0]]=qparse(String(d[6]));});P["${d[0]}"]=${val};PX["${d[0]}"]=qparse("${val}");
try{X=M.exact(PX,P);}catch(e){return "exact 异常 "+e.message;}
var s=M.init(P),T=Math.min(M.tPre(P),40),n=0,t0=Date.now();try{while(s.t<T&&n<3e6){M.step(s,Math.min(M.h(s,P),T-s.t+1e-12),P);n++;}var r=M.rec(s,P);}catch(e){return "仿真异常 "+e.message;}
var js=JSON.stringify(r);if(/null|NaN/.test(js)||!isFinite(s.t))return "非数值 "+js;if(n>=3e6)return "步数过多 t="+s.t.toFixed(3)+"/"+T;return "ok";})()`,Object.assign(ctx,{X:null}));
if(r!=="ok"){bad++;console.log(`✗ ${d[0]}=${val}: ${r}`);}}
console.log(bad?`✗ ${bad} 个极值情形有问题`:"✓ 所有参数极值均正常");
