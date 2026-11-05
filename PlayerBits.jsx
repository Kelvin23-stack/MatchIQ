import React,{useContext,useState,useEffect} from 'react'
import {Ctx} from './context'
import {T} from './data'
import {flag} from './compData'
import {I} from './Icon'
import {Crest} from './ui'
import {teamName,teamColor,teamLogo,initials,tone,seasonOf,form,POS} from './intelHelpers'

export const TeamBadge=({code,s=28})=>T[code]?<Crest k={code} s={s}/>:teamLogo(code)?<img src={teamLogo(code)} alt={`${teamName(code)} logo`} loading="lazy" className="object-contain shrink-0" style={{width:s,height:s}}/>:<span className="rounded-full grid place-items-center font-extrabold border border-line bg-bg2 text-mute shrink-0" style={{width:s,height:s,fontSize:s*.3}}>{code}</span>;
function Photo({src,alt,s,children}){const [bad,setBad]=useState(false);return src&&!bad?<img src={src} alt={alt} loading="lazy" onError={()=>setBad(true)} className="rounded-full object-cover" style={{width:s-3,height:s-3}}/>:children}
export const PlayerAvatar=({p,s=56,num=true})=>{const c=teamColor(p.team);return <span className="relative inline-grid place-items-center rounded-full font-extrabold shrink-0" style={{width:s,height:s,fontSize:s*.34,background:`linear-gradient(145deg,${c}66,${c}22)`,border:`1.5px solid ${c}99`}}><Photo src={p.photo} alt={p.name} s={s}>{initials(p.name)}</Photo>{num&&p.num!=null&&<span className="absolute -bottom-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-bg2 border border-line text-[10px] font-bold grid place-items-center">{p.num}</span>}</span>};
export const RatingPill=({v,demo=true,big})=><span className="inline-flex flex-col items-center rounded-xl px-2.5 py-1 border shrink-0" style={{color:tone(v),borderColor:tone(v)+'55',background:tone(v)+'14'}}><b className={`${big?'text-3xl':'text-lg'} leading-none tabular-nums`}>{v.toFixed(1)}</b>{demo&&<span className="text-[8px] uppercase tracking-wider opacity-80 mt-0.5">demo</span>}</span>;
export const FormBars=({p})=><div className="flex items-end gap-1 h-6" title="Ratings in the last 5 matches (demo)" aria-label="Recent form">{form(p).map((r,i)=><span key={i} className="w-2 rounded-sm" style={{height:Math.max(18,(r-5)/5*100)+'%',background:tone(r)}}/>)}</div>;
export const StatTile=({l,v,sub})=><div className="rounded-2xl bg-card border border-line p-4"><p className="text-xs text-mute">{l}</p><p className="text-2xl font-extrabold mt-1.5 tabular-nums">{v}</p>{sub&&<p className="text-[11px] text-mute mt-0.5">{sub}</p>}</div>;
export const Crumbs=({items})=>{const {nav}=useContext(Ctx);return <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-mute mb-5">{items.map((it,i)=><React.Fragment key={i}>{i>0&&<I n="right" s={12}/>}{it.go?<button onClick={()=>nav(it.go)} className="hover:text-white transition">{it.l}</button>:<span className="text-white font-semibold" aria-current="page">{it.l}</span>}</React.Fragment>)}</nav>};
export const useBrief=(dep,ms=350)=>{const [l,setL]=useState(true);useEffect(()=>{setL(true);const t=setTimeout(()=>setL(false),ms);return()=>clearTimeout(t)},[dep]);return l};
export const Empty=({icon='empty',title,body,children})=><div className="rounded-2xl border border-dashed border-line p-10 text-center text-mute"><I n={icon} s={28} c="mx-auto mb-3"/><p className="font-bold text-white">{title}</p>{body&&<p className="text-sm mt-1 max-w-md mx-auto">{body}</p>}<div className="mt-4">{children}</div></div>;
export const DemoTag=({children='Demo data'})=><span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-mute border border-line rounded-full px-2.5 py-1"><I n="info" s={11}/>{children}</span>;

export function PlayerCard({p}){
 const {nav}=useContext(Ctx);const s=seasonOf(p),c=teamColor(p.team);
 return <article className="group relative rounded-2xl border border-line bg-card overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-white/30" style={{'--c':c}}>
  <div className="absolute inset-x-0 top-0 h-24 opacity-70 transition group-hover:opacity-100" style={{background:`radial-gradient(70% 100% at 50% 0%,${c}40,transparent)`}}/>
  <div className="relative p-5">
   <div className="flex items-start justify-between gap-3"><PlayerAvatar p={p} s={60}/><RatingPill v={s.rating}/></div>
   <h3 className="mt-4 font-extrabold text-lg leading-tight">{p.name}</h3>
   <p className="text-xs text-mute mt-1 flex flex-wrap items-center gap-x-2 gap-y-1"><span className="flex items-center gap-1.5"><TeamBadge code={p.team} s={16}/>{teamName(p.team)}</span><span>·</span><span>{POS[p.pos]}</span></p>
   <p className="text-xs text-mute mt-1">{flag(p.nat)} #{p.num}</p>
   <div className="grid grid-cols-4 gap-2 mt-4 text-center">{[['Apps',s.apps],['Goals',s.g],['Assists',s.a],['Mins',s.min.toLocaleString()]].map(([l,v])=><div key={l} className="rounded-lg bg-bg2 border border-line py-2"><p className="text-sm font-extrabold tabular-nums">{v}</p><p className="text-[9px] uppercase tracking-wider text-mute">{l}</p></div>)}</div>
   <div className="flex items-center justify-between mt-4"><div><p className="text-[9px] uppercase tracking-wider text-mute mb-1">Form · last 5</p><FormBars p={p}/></div>
    <button onClick={()=>nav('player/'+p.id)} aria-label={`View profile: ${p.name}`} className="rounded-xl bg-lime text-ink font-bold text-sm px-4 py-2.5 transition hover:brightness-110 active:scale-95">View Profile</button></div></div></article>}
