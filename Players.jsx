import React,{useState,useContext,useMemo} from 'react'
import {Ctx} from './context'
import {flag} from './compData'
import {I} from './Icon'
import {Btn} from './ui'
import {PLAYERS,SEASON,seasonOf,per90,teamName,TEAM_CODES,POS,getPlayer} from './intelHelpers'
import {PlayerCard,PlayerAvatar,TeamBadge,Empty,DemoTag,useBrief,StatTile,RatingPill} from './PlayerBits'

const SORTS=[['rating','Highest rating'],['g','Most goals'],['a','Most assists'],['apps','Most appearances']];
const sel='rounded-xl bg-card border border-line px-3 py-2.5 text-sm font-semibold outline-none focus:border-white/40 min-w-0';

function Discover(){
 const [q,setQ]=useState(''),[lg,setLg]=useState('All'),[club,setClub]=useState('All'),[pos,setPos]=useState('All'),[sort,setSort]=useState('rating');
 const loading=useBrief('init',450);
 const all=useMemo(()=>PLAYERS.map(p=>({p,s:seasonOf(p)})),[]);
 const list=all.filter(({p})=>(!q.trim()||p.name.toLowerCase().includes(q.trim().toLowerCase()))&&(club==='All'||p.team===club)&&(pos==='All'||p.pos===pos)).sort((a,b)=>b.s[sort]-a.s[sort]||b.s.rating-a.s.rating);
 const top=all.reduce((m,x)=>x.s.g>m.s.g?x:m),best=all.reduce((m,x)=>x.s.rating>m.s.rating?x:m),avg=all.reduce((t,x)=>t+x.s.rating,0)/all.length;
 const reset=()=>{setQ('');setLg('All');setClub('All');setPos('All');setSort('rating')};
 return <div>
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
   <StatTile l="Players in dataset" v={all.length} sub="Premier League demo squads"/><StatTile l="Average rating (demo)" v={avg.toFixed(2)} sub={`Season ${SEASON}`}/>
   <StatTile l="Top scorer" v={top.p.name.split(' ').slice(-1)[0]} sub={`${top.s.g} goals · ${teamName(top.p.team)}`}/><StatTile l="Top-rated (demo)" v={best.p.name.split(' ').slice(-1)[0]} sub={`${best.s.rating.toFixed(1)} · ${teamName(best.p.team)}`}/></div>
  <div className="rounded-2xl border border-line bg-card p-3 sm:p-4 mb-6 grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-3">
   <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-mute"><I n="search" s={16}/></span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search players by name" aria-label="Search players" className={`${sel} w-full pl-10`}/></div>
   <select value={lg} onChange={e=>setLg(e.target.value)} aria-label="League" className={sel}><option value="All">All leagues</option><option value="PL">Premier League</option></select>
   <select value={club} onChange={e=>setClub(e.target.value)} aria-label="Club" className={sel}><option value="All">All clubs</option>{TEAM_CODES.map(c=><option key={c} value={c}>{teamName(c)}</option>)}</select>
   <select value={pos} onChange={e=>setPos(e.target.value)} aria-label="Position" className={sel}><option value="All">All positions</option>{Object.entries(POS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
   <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort by" className={sel}>{SORTS.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></div>
  <div className="flex items-center justify-between mb-4"><p className="text-sm text-mute">{list.length} player{list.length===1?'':'s'}</p><DemoTag>Demo ratings and statistics</DemoTag></div>
  {loading?<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{[0,1,2,3,4,5].map(i=><div key={i} className="h-72 rounded-2xl bg-card border border-line animate-pulse"/>)}</div>
  :list.length?<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{list.map(({p})=><PlayerCard key={p.id} p={p}/>)}</div>:<Empty title="No players match your filters" body="Try a different club, position or search term."><Btn v="s" onClick={reset}>Clear filters</Btn></Empty>}</div>}

const ALLM=[['rating','Season rating (demo)','rating'],['apps','Appearances','count'],['min','Minutes played','count'],['g','Goals','rate'],['a','Assists','rate'],['kp','Key passes','rate'],['sot','Shots on target','rate'],['pass','Pass accuracy (%)','pct'],['cs','Clean sheets','rate'],['saves','Saves','rate']];
function Compare({a,b}){
 const {nav}=useContext(Ctx);const [mode,setMode]=useState('tot');
 const pa=getPlayer(a)||getPlayer('p_estevao'),pb=getPlayer(b)||getPlayer('p_saka'),sa=seasonOf(pa),sb=seasonOf(pb);
 const go=(x,y)=>nav(`players/compare/${x}/${y}`);
 const gk=[pa,pb].filter(p=>p.pos==='GK').length,keys=gk===2?['rating','apps','min','cs','saves','pass']:gk===1?['rating','apps','min','pass']:['rating','apps','min','g','a','kp','sot','pass'];
 const val=(p,s,k,kind)=>kind==='rate'&&mode==='p90'?per90(p,s[k]):s[k];
 const scale=(k,kind,x,y)=>kind==='rating'?10:kind==='pct'?100:Math.max(x,y,.0001);
 const Sel=({v,on})=><select value={v} onChange={e=>on(e.target.value)} aria-label="Select player" className={`${sel} w-full`}>{['ARS','CHE','LIV','MCI','MUN','TOT'].map(t=><optgroup key={t} label={teamName(t)}>{PLAYERS.filter(p=>p.team===t).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</optgroup>)}</select>;
 const Head=({p,s})=><div className="text-center"><div className="flex justify-center"><PlayerAvatar p={p} s={72}/></div><p className="font-extrabold mt-3">{p.name}</p><p className="text-xs text-mute flex items-center justify-center gap-1.5 mt-1"><TeamBadge code={p.team} s={16}/>{teamName(p.team)} · {POS[p.pos]}</p><div className="mt-3 flex justify-center"><RatingPill v={s.rating}/></div><button onClick={()=>nav('player/'+p.id)} className="mt-3 text-xs font-bold text-sky hover:underline">View profile</button></div>;
 return <div>
  <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-center"><Sel v={pa.id} on={v=>go(v,pb.id)}/><button onClick={()=>go(pb.id,pa.id)} aria-label="Swap players" className="mx-auto rounded-full border border-line bg-card w-10 h-10 grid place-items-center hover:border-white/40 transition"><I n="right" s={16}/></button><Sel v={pb.id} on={v=>go(pa.id,v)}/></div>
  <div className="flex flex-wrap gap-2 mt-4">{[['p_estevao','p_saka','Estêvão vs Saka'],['p_palmer','p_foden','Palmer vs Foden'],['p_haaland','p_salah','Haaland vs Salah'],['p_rice','p_rodri','Rice vs Rodri']].map(([x,y,l])=><button key={l} onClick={()=>go(x,y)} className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-mute hover:text-white hover:border-white/30 transition">{l}</button>)}</div>
  {pa.pos!==pb.pos&&<div className="mt-5 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm flex gap-2"><span className="text-gold shrink-0"><I n="info" s={16}/></span>These players play different positions, so only broadly comparable metrics are shown. Interpret the numbers with care.</div>}
  <div className="mt-6 rounded-3xl border border-line bg-card p-5 sm:p-7"><div className="grid grid-cols-2 gap-4"><Head p={pa} s={sa}/><Head p={pb} s={sb}/></div>
   <div className="flex flex-wrap items-center justify-between gap-3 mt-7 mb-4"><p className="text-xs text-mute">Season {SEASON} · demo data</p><div role="group" aria-label="Value mode" className="inline-flex rounded-full border border-line bg-bg2 p-1">{[['tot','Totals'],['p90','Per 90']].map(([k,l])=><button key={k} aria-pressed={mode===k} onClick={()=>setMode(k)} className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${mode===k?'bg-lime text-ink':'text-mute'}`}>{l}</button>)}</div></div>
   <div className="space-y-5">{keys.map(k=>{const [,label,kind]=ALLM.find(m=>m[0]===k),x=val(pa,sa,k,kind),y=val(pb,sb,k,kind),sc=scale(k,kind,x,y),fmt=v=>kind==='rating'?v.toFixed(1):kind==='pct'?v+'%':mode==='p90'&&kind==='rate'?v.toFixed(2):Number(v).toLocaleString();
    return <div key={k}><p className="text-center text-xs text-mute mb-1.5">{label}{kind==='rate'&&mode==='p90'?' · per 90':''}</p>
    <div className="grid grid-cols-[3.5rem_1fr_1fr_3.5rem] items-center gap-2"><span className={`text-right text-sm tabular-nums ${x>=y?'font-extrabold':'text-mute'}`}>{fmt(x)}</span>
     <div className="h-2.5 rounded-l-full bg-bg2 flex justify-end overflow-hidden"><div className="h-full rounded-l-full transition-all duration-500" style={{width:x/sc*100+'%',background:'#34D399'}}/></div>
     <div className="h-2.5 rounded-r-full bg-bg2 overflow-hidden"><div className="h-full rounded-r-full transition-all duration-500" style={{width:y/sc*100+'%',background:'#5AA9FF'}}/></div>
     <span className={`text-sm tabular-nums ${y>=x?'font-extrabold':'text-mute'}`}>{fmt(y)}</span></div></div>})}</div>
   <p className="text-[11px] text-mute mt-6">Bars use one shared scale per metric: rating out of 10, pass accuracy out of 100, other metrics relative to the larger of the two values.</p></div></div>}

export function PlayersPage({sub,a,b}){
 const {nav}=useContext(Ctx);const cmp=sub==='compare';
 return <div>
  <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-card to-bg2 p-6 sm:p-9 mb-6"><div className="glow absolute inset-0 pointer-events-none"/><h1 className="relative text-3xl sm:text-5xl font-extrabold tracking-tight">Player Intelligence</h1><p className="relative text-mute mt-3 max-w-xl">Explore player performance, form and match impact.</p></div>
  <div role="tablist" className="flex gap-1 border-b border-line mb-6">{[['Discover',''],['Compare players','/compare']].map(([l,s])=><button key={l} role="tab" aria-selected={(s==='/compare')===cmp} onClick={()=>nav('players'+s)} className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition ${(s==='/compare')===cmp?'border-lime text-white':'border-transparent text-mute hover:text-white'}`}>{l}</button>)}</div>
  {cmp?<Compare a={a} b={b}/>:<Discover/>}</div>}
