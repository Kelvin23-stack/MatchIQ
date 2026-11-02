import React,{useState,useEffect,useMemo} from 'react'
import {board,flag,ini} from './compData'
import {I} from './Icon'
import {Av,Btn} from './ui'

const RK={1:'#F5C451',2:'#C7CDD4',3:'#CD7F32'};
export const Move=({v})=>v>0?<span className="flex items-center justify-end gap-0.5 text-xs font-bold text-emerald-400"><I n="up" s={13}/>{v}</span>:v<0?<span className="flex items-center justify-end gap-0.5 text-xs font-bold text-red-400"><I n="down" s={13}/>{-v}</span>:<span className="flex justify-end text-mute"><I n="minus" s={13}/></span>;
const YOU=<span className="text-[9px] font-extrabold bg-lime text-ink rounded px-1.5 py-0.5 ml-1.5">YOU</span>;

function Podium({top,onUser}){return <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end mb-6 pt-4">{[top[1],top[0],top[2]].map(u=>{const c=RK[u.rank],first=u.rank===1;
 return <button key={u.name} onClick={()=>onUser(u)} aria-label={`Open ${u.name}'s profile`} style={{borderColor:c+'66',background:`linear-gradient(180deg,${c}${first?'40':'26'},rgba(10,15,12,.9) 80%)`,boxShadow:first?`0 20px 50px -26px ${c}`:'none'}} className={`relative rounded-2xl border text-center px-2 sm:px-4 transition hover:-translate-y-1 ${first?'pt-10 pb-6 sm:pb-8':'pt-6 pb-5'}`}>
  {first&&<span className="absolute -top-3.5 left-1/2 -translate-x-1/2 flick" style={{color:c}}><I n="crown" s={28}/></span>}
  <div className="mx-auto w-fit rounded-full p-0.5" style={{boxShadow:`0 0 0 2px ${c}`}}><Av t={ini(u.name)} s={first?60:48} me={u.me}/></div>
  <p className="mt-3 text-xs sm:text-sm font-bold truncate">{u.name}{u.me&&YOU}</p>
  <p className="text-[11px] text-mute mt-0.5">{flag(u.cc)} · {first?'Gold':u.rank===2?'Silver':'Bronze'}</p>
  <p className="mt-2 text-xl sm:text-3xl font-extrabold tabular-nums" style={{color:c}}>{u.points.toLocaleString()}</p>
  <p className="text-[10px] uppercase tracking-wider text-mute">points</p>
  <div className="hidden sm:flex justify-center gap-3 mt-3 text-[11px] text-mute"><span>{u.acc}% acc</span><span className="flex items-center gap-1 text-flame"><I n="flame" s={11}/>{u.streak}</span></div>
 </button>})}</div>}

export const Row=({u,onUser})=>{const c=RK[u.rank];return <button onClick={()=>onUser(u)} aria-label={`Open ${u.name}'s profile, rank ${u.rank}`} style={c?{background:`linear-gradient(90deg,${c}26,rgba(255,255,255,.03) 65%)`,borderColor:c+'44'}:{}} className={`w-full text-left grid grid-cols-[2.25rem_1fr_auto] sm:grid-cols-[3rem_1fr_5.5rem_5.5rem_5.5rem_3.5rem] items-center gap-3 px-3 sm:px-4 py-3 rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.09] hover:-translate-y-px ${u.me?'!bg-white/[0.12] ring-2 ring-lime/70':''}`}>
 <span className="flex items-center justify-center gap-0.5 font-extrabold tabular-nums" style={{color:c||'rgb(var(--mute))'}}>{u.rank===1&&<I n="crown" s={13}/>}{u.rank}</span>
 <span className="flex items-center gap-3 min-w-0"><Av t={ini(u.name)} me={u.me}/><span className="min-w-0"><span className="flex items-center text-sm font-semibold"><span className="truncate">{u.name}</span><span className="ml-1.5">{flag(u.cc)}</span>{u.me&&YOU}</span><span className="sm:hidden text-[11px] text-mute flex items-center gap-2">{u.acc}% <span className="flex items-center gap-0.5 text-flame"><I n="flame" s={10}/>{u.streak}</span></span></span></span>
 <span className="hidden sm:block text-right font-bold tabular-nums">{u.points.toLocaleString()}</span>
 <span className="hidden sm:block text-right text-sm text-mute tabular-nums">{u.acc}%</span>
 <span className="hidden sm:flex items-center justify-end gap-1 text-sm text-flame font-semibold"><I n="flame" s={13}/>{u.streak}</span>
 <span className="hidden sm:block"><Move v={u.move}/></span>
 <span className="sm:hidden text-right"><span className="block font-bold text-sm tabular-nums">{u.points.toLocaleString()}</span><Move v={u.move}/></span>
</button>}

export function Leaderboard({kind,onUser}){
 const [q,setQ]=useState(''),[n,setN]=useState(10);
 const all=useMemo(()=>board(kind),[kind]),s=q.trim().toLowerCase();
 useEffect(()=>setN(10),[kind,q]);
 const list=s?all.filter(u=>u.name.toLowerCase().includes(s)):all.slice(3),shown=list.slice(0,n),me=all.find(u=>u.me),ahead=all[me.rank-2];
 return <div className="scope-dark rounded-3xl border border-white/10 p-3 sm:p-5" style={{background:'radial-gradient(120% 70% at 50% 0%,#14361f 0%,#0b1510 55%,#090d0b 100%)'}}>
  <div className="relative mb-5"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"><I n="search" s={16}/></span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search players…" aria-label="Search players" className="w-full rounded-xl bg-white/[0.06] border border-white/10 pl-10 pr-4 py-3 text-sm outline-none focus:border-white/40 placeholder:text-mute"/></div>
  {!s&&all.length>=3&&<Podium top={all.slice(0,3)} onUser={onUser}/>}
  {!s&&<button onClick={()=>onUser(me)} className="w-full text-left mb-4 flex items-center justify-between gap-3 rounded-2xl border border-lime/40 bg-lime/10 px-4 py-3 hover:bg-lime/15 transition"><div className="min-w-0"><p className="text-[11px] uppercase tracking-wider text-mute">Your position · tap for details</p><p className="font-extrabold text-xl">#{me.rank} <span className="text-sm text-mute font-medium">· {me.points.toLocaleString()} pts</span></p></div><p className="text-xs text-mute text-right">{ahead?`${(ahead.points-me.points).toLocaleString()} pts behind #${ahead.rank}`:'You lead the table'}</p></button>}
  <div className="hidden sm:grid grid-cols-[3rem_1fr_5.5rem_5.5rem_5.5rem_3.5rem] gap-3 px-4 pb-2 text-[11px] uppercase tracking-wider text-mute"><span className="text-center">Rank</span><span>Player</span><span className="text-right">Points</span><span className="text-right">Accuracy</span><span className="text-right">Streak</span><span className="text-right">Move</span></div>
  <div className="space-y-2">{shown.length?shown.map(u=><Row key={u.name} u={u} onUser={onUser}/>):<p className="p-8 text-center text-mute text-sm">No players match “{q}”.</p>}</div>
  {list.length>n&&<div className="text-center mt-5"><Btn v="s" onClick={()=>setN(n+10)}>Load more · {list.length-n} left</Btn></div>}
 </div>}
