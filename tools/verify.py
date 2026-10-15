# 独立求解全部默认参数下的精确答案（sympy）
from sympy import *
g=10;R_=Rational
out={}
# p3 示例：m0=1/50,v0=600,v=100,mA=2,mB=3,mu=1/2
m0,v0,v,mA,mB,mu=R_(1,50),600,100,2,3,R_(1,2)
vA=m0*(v0-v)/mA; vc=mA*vA/(mA+mB); L=mB*vA**2/(2*mu*g*(mA+mB)); t=(vA-vc)/(mu*g)
out['p3']=dict(vA=vA,vc=vc,Lmin=L,t=t,Qfric=R_(1,2)*mA*vA**2-R_(1,2)*(mA+mB)*vc**2,Qpen=R_(1,2)*m0*(v0**2-v**2)-R_(1,2)*mA*vA**2)
# p4 示例 m=1/100,M=99/100,v=100,L=1
m,M,v,L=R_(1,100),R_(99,100),100,1
vp=m*v/(m+M); dE=m*M*v**2/(2*(m+M)); T=(m+M)*g+(m+M)*vp**2/L; h=vp**2/(2*g)
out['p4']=dict(vp=vp,dE=dE,T=T,h=h,cos=1-h/L)
# p5 m=1,v=10,mA=2,mB=4,mu=2/5
m,v,mA,mB,mu=1,10,2,4,R_(2,5)
vA=(m*v+m*R_(v,5))/mA; vc=mA*vA/(mA+mB); L=mB*vA**2/(2*mu*g*(mA+mB)); t=mB*vc/(mu*mA*g)
out['p5']=dict(vA=vA,vc=vc,Lmin=L,t=t,e=(vA+R_(v,5))/v,Ecol=R_(1,2)*m*v**2-R_(1,2)*m*(R_(v,5))**2-R_(1,2)*mA*vA**2)
# p6
mA,mB,mC,v0,L=R_(1,50),R_(12,25),R_(1,2),100,2
v1=mA*v0/(mA+mB); v2=(mA+mB)*v1/(mA+mB+mC); mu=(R_(1,2)*(mA+mB)*v1**2-R_(1,2)*(mA+mB+mC)*v2**2)/((mA+mB)*g*L/2)
out['p6']=dict(v1=v1,v2=v2,mu=mu,t=(v1-v2)/(mu*g))
# p7
m,v0=2,2; mA=m*v0/1-m; out['p7']=dict(mA=mA,EkA=R_(1,2)*mA,dE=R_(1,2)*m*4-R_(1,2)*(m+mA),dx=R_(3,2)-R_(1,2),mu=R_(1,10))
# p8 m0=1/10,mA=9/10,mB=3,v0=40
m0,mA,mB,v0=R_(1,10),R_(9,10),3,40
vA=m0*v0/(m0+mA); mm=m0+mA; vc=mm*vA/(mm+mB)
out['p8']=dict(vA=vA,vc=vc,Ep=R_(1,2)*mm*vA**2-R_(1,2)*(mm+mB)*vc**2,vB=2*mm*vA/(mm+mB),vA2=(mm-mB)*vA/(mm+mB),Qpen=R_(1,2)*m0*v0**2-R_(1,2)*mm*vA**2)
# p9
M,m,R,mu,L=3,1,R_(4,5),R_(1,10),2
vB=sqrt(2*g*R); v=m*vB/(m+M); x=(R_(1,2)*m*vB**2-R_(1,2)*(m+M)*v**2)/(mu*m*g)/2-L
Ep=R_(1,2)*m*vB**2-R_(1,2)*(m+M)*v**2-mu*m*g*(L+x); k=2*Ep/x**2
x1=mu*m*g/k; Q=mu*m*g*(L+x+(x-x1)); KE=R_(1,2)*m*vB**2-Q-R_(1,2)*k*x1**2
V=symbols('V'); sols=solve(Eq((m*vB-M*V)**2/(2*m)+M*V**2/2,KE),V)
out['p9']=dict(vB=vB,v=v,x=x,Ep=Ep,k=k,dE=m*g*R-R_(1,2)*(m+M)*v**2,cartmax=[nsimplify(s) for s in sols],refwrong=1+sqrt(3)/3)
# p10
mA,mB,mC,v=4,6,2,2
v0=(mA+mC)*v/mC; Ep=R_(1,2)*(mA+mC)*v**2; I=(mA+mC)*2*v; vp=(mA+mC)*v/(mA+mB+mC); Ep2=Ep-R_(1,2)*(mA+mB+mC)*vp**2; vBm=2*(mA+mC)*v/(mA+mB+mC)
out['p10']=dict(v0=v0,Ep=Ep,I=I,vp=vp,Ep2=Ep2,vBmax=vBm,vACmin=(mA+mC-mB)*v/(mA+mB+mC),ext=R_(6,2),Ecol=R_(1,2)*mC*v0**2-Ep)
# p11
mA,mB,mC,h,H=1,2,3,R_(9,5),5
vA=sqrt(2*g*h); v1=mA*vA/(mA+mB); v2=(mA+mB)*v1/6; Ep=R_(1,2)*3*v1**2-R_(1,2)*6*v2**2; vC=2*3*v1/6; t=sqrt(2*H/g)
out['p11']=dict(vA=vA,v1=v1,Ep=Ep,vC=vC,vAB=(3-3)*v1/6,x=vC*t)
# p12 m=1,v0=6
m,v0=1,6; out['p12']=dict(v=R_(v0,3),h=R_(v0**2,3*g),v1=-R_(v0,3),v2=R_(2*v0,3),W=R_(4,9)*m*v0**2)
# p13 m=1,v0=4
out['p13']=dict(v=2,h=R_(16,4*g),vball=0,vcar=4,W=8)
# p14 m=1,M=2,R=1/2,h=9/20
m,M,Rr,h=1,2,R_(1,2),R_(9,20)
vin=sqrt(2*g*h); # bottom speeds: m u + M U=0, ½mu²+½MU²=mg(h+R)
u=sqrt(2*g*(h+Rr)*M/(m+M)); U=m*u/M
out['p14']=dict(vin=vin,ubottom=u,Ubottom=U,shift=2*Rr*m/(m+M))
# p15 m=1,M=3,cos=4/5,v0=5
m,M,c,v0=1,3,R_(4,5),5
v=m*v0*c/(m+M); h=(R_(1,2)*m*v0**2-R_(1,2)*(m+M)*v**2)/(m*g); hC=(v0*R_(3,5))**2/(2*g)
out['p15']=dict(v=v,h=h,hC=hC)
# p16 m=1/10,v0=6
m,v0=R_(1,10),6
v1=v0/R_(3); v2=v0/R_(6); Q=R_(1,2)*m*v0**2-R_(1,2)*3*m*v1**2; h=(R_(1,2)*3*m*v1**2-R_(1,2)*6*m*v2**2)/(3*m*g)
out['p16']=dict(v1=v1,v2=v2,Q=Q,h=h,vAmax=2*3*m*v1/(6*m))
for k,d in out.items(): print(k,{a:(b if isinstance(b,list) else (b, float(b))) for a,b in d.items()})
