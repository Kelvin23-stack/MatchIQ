import React,{useState} from 'react'
import {BADGES} from './compData'
import {I} from './Icon'
import {Sheet} from './Sheet'

export const BadgeIcon=({icon,color,on=true,s=56})=><div className={`relative grid place-items-center rounded-2xl shrink-0 overflow-hidden ${on?'':'grayscale opacity-40'}`} style={{width:s,height:s,background:`linear-gradient(145deg,${color}33,${color}0d)`,border:`1px solid ${color}${on?'88':'33'}`,color,boxShadow:on?`0 8px 28px -14px ${color}`:'none'}}><I n={icon} s={s*.46}/>{on&&<span className="shine absolute inset-0"/>}</div>;

export function Badges({compact}){
 const [b,setB]=useState(null);const got=BADGES.filter(x=>x.have).length;
 return <div>
  <p className="text-sm text-mute mb-4">{got} of {BADGES.length} unlocked</p>
  <div className={`grid gap-3 ${compact?'grid-cols-3 sm:grid-cols-5 lg:grid-cols-9':'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>{BADGES.map((x,i)=><button key={x.id} onClick={()=>setB(x)} style={{animationDelay:i*50+'ms'}} className={`up rounded-2xl border border-line p-3 sm:p-4 text-center transition hover:-translate-y-1 ${x.have?'bg-card':'bg-card/50'}`}>
   <div className="mx-auto w-fit relative"><BadgeIcon icon={x.icon} color={x.color} on={x.have} s={compact?48:60}/>{!x.have&&<span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-bg2 border border-line grid place-items-center text-mute"><I n="lock" s={10}/></span>}</div>
   <p className={`mt-3 text-xs sm:text-sm font-bold leading-tight ${x.have?'':'text-mute'}`}>{x.name}</p>
   {!compact&&<p className="text-[11px] text-mute mt-1 leading-snug">{x.have?'Unlocked':x.req}</p>}</button>)}</div>
  {b&&<Sheet title="Achievement" onClose={()=>setB(null)}><div className="text-center">
   <div className="mx-auto w-fit"><BadgeIcon icon={b.icon} color={b.color} on={b.have} s={96}/></div>
   <h4 className="text-2xl font-extrabold mt-5">{b.name}</h4>
   <span className={`inline-block mt-2 text-xs font-bold rounded-full px-3 py-1 border ${b.have?'text-emerald-400 border-emerald-400/30 bg-emerald-400/10':'text-mute border-line'}`}>{b.have?'Unlocked':'Locked'}</span>
   <p className="text-mute text-sm mt-4">{b.desc}</p>
   <div className="mt-5 rounded-xl bg-card border border-line p-4 text-left"><p className="text-[11px] uppercase tracking-wider text-mute">Requirement</p><p className="font-semibold text-sm mt-1">{b.req}</p>
    {!b.have&&b.prog&&<><div className="h-1.5 rounded-full bg-bg2 mt-3 overflow-hidden"><div className="h-full rounded-full" style={{width:(b.inv?Math.min(100,b.prog[1]/b.prog[0]*100):b.prog[0]/b.prog[1]*100)+'%',background:b.color}}/></div><p className="text-xs text-mute mt-1.5">{b.inv?`You are rank ${b.prog[0]} · need ${b.prog[1]}`:`${b.prog[0]} / ${b.prog[1]}`}</p></>}</div></div></Sheet>}
 </div>}
