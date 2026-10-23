function harnessResolveHazardAxis(state,p,cfg,preferredAxis,dt){
 if(cfg.name!=='professional'||state.challenge||state.stage<4)return preferredAxis;
 const hp=playerHitbox(),prior=p.hHazardObservation;
 const elapsed=prior?state.simT-prior.t:0;
 const continuous=prior&&prior.stage===state.stage&&elapsed>0&&elapsed<=Math.min(.05,dt*1.5);
 const positions={};
 const hazards=state.e.filter(e=>e.hp>0).map(e=>{
  const he=enemyCollisionHitbox(e),old=continuous&&prior.positions[e.id];
  const valid=old&&Math.hypot(e.x-old.x,e.y-old.y)<=32;
  positions[e.id]={x:e.x,y:e.y};
  return{x:e.x,y:e.y,vx:valid?(e.x-old.x)/elapsed:0,vy:valid?(e.y-old.y)/elapsed:0,
   w:hp.w+he.w+12,h:hp.h+he.h+12};
 });
 p.hHazardObservation={stage:state.stage,t:state.simT,positions};
 for(const b of state.eb){
  if(b.vy<=0)continue;
  hazards.push({x:b.x,y:b.y,vx:b.vx||0,vy:b.vy,w:hp.w+8,h:hp.h+8});
 }
 const clearance=axis=>{
  let nearest=Infinity;
  for(let step=1;step<=2;step++){
   const x=cl(p.x+axis*p.s*dt*cfg.moveMul*step,hp.w+2,PLAY_W-hp.w-2);
   for(const h of hazards){
    nearest=Math.min(nearest,Math.max(Math.abs(x-h.x-h.vx*dt*step)/h.w,Math.abs(p.y-h.y-h.vy*dt*step)/h.h));
   }
  }
  return nearest;
 };
 if(clearance(preferredAxis)>=1)return preferredAxis;
 let bestAxis=0,bestClearance=clearance(0);
 for(const axis of [-1,1]){
  const value=clearance(axis);
  if(value>bestClearance+1e-9){bestAxis=axis;bestClearance=value;}
 }
 return bestAxis;
}
