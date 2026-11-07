import React from 'react'
import {I} from './Icon'
export const PRESETS=[['a1','ball','#A3FF12','#2f6b00','#080B0A','grad'],['a2','trophy','#F5C451','#a8741a','#080B0A','grad'],['a3','flame','#FF8A3D','#b3341a','#ffffff','grad'],['a4','bolt','#5AA9FF','#2744b8','#ffffff','grad'],['a5','crown','#B388FF','#5b2bb8','#ffffff','grad'],['a6','star','#FF6FB5','#a8205f','#ffffff','grad'],['a7','target','#34D399','#0b6b4a','#ffffff','ring'],['a8','medal','#22D3EE','#0a6b86','#ffffff','ring'],['a9','sparkles','#FFD166','#c2410c','#080B0A','solid'],['a10','eye','#C084FC','#4c1d95','#ffffff','solid'],['a11','cpu','#94A3B8','#1e293b','#ffffff','ring'],['a12','crosshair','#FB7185','#9f1239','#ffffff','solid']].map(([id,icon,c1,c2,fg,st])=>({id,icon,c1,c2,fg,st}));
export function AvatarArt({a,s=40}){
 if(!a)return null;
 if(a.kind==='upload')return <img src={a.src} alt="" className="rounded-full object-cover shrink-0" style={{width:s,height:s}}/>;
 const p=PRESETS.find(x=>x.id===a.id)||PRESETS[0];
 const st=p.st==='ring'?{background:'rgb(var(--card))',border:`2px solid ${p.c1}`,color:p.c1}:p.st==='solid'?{background:p.c1,color:p.fg}:{background:`linear-gradient(145deg,${p.c1},${p.c2})`,color:p.fg};
 return <div className="rounded-full grid place-items-center shrink-0" style={{width:s,height:s,...st}}><I n={p.icon} s={s*.48}/></div>}
