import React,{useState,useEffect,useContext} from 'react'
import {T,TEAM_REG,isBrand} from './data'
import {initials} from './intelHelpers'
import {I} from './Icon'
import {AvatarArt} from './Avatar'
import {ME} from './compData'

function LiveCrest({k,s}){const r=TEAM_REG[k]||{},[bad,setBad]=useState(false);
 return r.logo&&!bad?<img src={r.logo} alt={`${r.name||''} logo`} loading="lazy" onError={()=>setBad(true)} className="object-contain shrink-0" style={{width:s,height:s}}/>
 :<div className="rounded-full grid place-items-center font-extrabold shrink-0 border border-line bg-bg2 text-mute" style={{width:s,height:s,fontSize:s*.3}}>{initials(r.name||k)}</div>}
export const Crest=({k,s=44})=>isBrand(k)?<div className="rounded-full grid place-items-center font-extrabold shrink-0 border border-white/10" style={{width:s,height:s,fontSize:s*.3,background:`radial-gradient(circle at 30% 25%,${T[k][1]}55,#0c110e)`,color:T[k][1]}}>{k}</div>:<LiveCrest k={k} s={s}/>;

const AVC=['#5AA9FF','#FF8A3D','#B388FF','#34D399','#FF6FB5','#22D3EE','#F5C451'];
export const Av=({t,s=36,me})=>{if(me&&ME.avatar)return <AvatarArt a={ME.avatar} s={s}/>;const c=AVC[[...t].reduce((a,x)=>a+x.charCodeAt(0),0)%AVC.length];return <div className="rounded-full grid place-items-center font-bold shrink-0" style={{width:s,height:s,fontSize:s*.34,color:me?'#080B0A':c,background:me?'#fff':c+'22',border:'1px solid '+(me?'#fff':c+'55')}}>{t}</div>}

export const LogoMark=({s=32})=><span className="grid place-items-center shrink-0 text-ink" style={{width:s,height:s,borderRadius:s*.3,background:'linear-gradient(145deg,#C8FF4D,#7ED300)',boxShadow:'0 6px 18px -8px rgba(163,255,18,.7), inset 0 1px 0 rgba(255,255,255,.5)'}}><I n="bolt" s={s*.56}/></span>;
export const Logo=({size=32})=><div className="flex items-center gap-2 font-extrabold text-xl tracking-tight"><LogoMark s={size}/><span>Match<span style={{color:'rgb(var(--brand))'}}>IQ</span></span></div>;
export const ClubBox=({k,s=28})=>{const c=T[k]?T[k][1]:'#7A857E';return <span className="inline-grid place-items-center shrink-0 font-extrabold text-[#fff]" style={{width:s,height:s*1.12,borderRadius:s*.22,fontSize:s*.3,background:`linear-gradient(160deg,${c},${c}88)`,boxShadow:`inset 0 0 0 1px rgba(255,255,255,.25)`}}>{k}</span>};

export const Btn=({v='p',className='',...p})=><button {...p} className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold text-sm px-5 py-3 transition active:scale-95 ${v==='p'?'bg-lime text-ink hover:brightness-110 hover:shadow-[0_8px_30px_-8px_rgba(163,255,18,.6)]':'border border-line text-white hover:border-white/25 hover:text-white'} ${className}`}/>;

export function Count({to,suffix=''}){const[v,setV]=useState(0);useEffect(()=>{let r,st;const f=t=>{st=st||t;const p=Math.min((t-st)/1100,1);setV(Math.round(to*(1-Math.pow(1-p,3))));if(p<1)r=requestAnimationFrame(f)};r=requestAnimationFrame(f);return()=>cancelAnimationFrame(r)},[to]);return <>{v.toLocaleString()}{suffix}</>}

