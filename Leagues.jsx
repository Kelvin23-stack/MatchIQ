import React,{useState,useContext} from 'react'
import {Ctx} from './context'
import {FEAT,MY_SEED,leagueTable,genCode,ME,ini} from './compData'
import {useStored} from './hooks'
import {I} from './Icon'
import {Sheet} from './Sheet'
import {Av,Btn} from './ui'
import {Row} from './Leaderboard'

function LeagueCard({l,mine,onOpen,onJoin}){const t=leagueTable(l).slice(0,3);
 return <div className="rounded-2xl bg-card border border-line p-5 transition hover:border-white/25 hover:-translate-y-1">
  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-bold truncate">{l.name}</p><p className="text-xs text-mute mt-0.5">by {(l.creator==='Alex Morgan'||l.creator===ME.name)?'You':l.creator}</p></div><span className="text-[11px] font-semibold text-mute border border-line rounded-full px-2.5 py-1 whitespace-nowrap">{l.dur}</span></div>
  <p className="flex items-center gap-1.5 text-xs text-mute mt-3"><I n="users" s={13}/>{l.members.toLocaleString()} members</p>
  <div className="mt-4 rounded-xl bg-bg2 border border-line divide-y divide-line">{t.map(u=><div key={u.name} className="flex items-center gap-2.5 px-3 py-2 text-sm"><span className="w-4 text-xs font-bold" style={{color:['#F5C451','#C7CDD4','#CD7F32'][u.rank-1]}}>{u.rank}</span><Av t={ini(u.name)} s={24} me={u.me}/><span className="flex-1 truncate text-xs font-semibold">{u.name}</span><span className="text-xs font-bold tabular-nums">{u.points}</span></div>)}</div>
  {mine?<Btn v="s" onClick={()=>onOpen(l)} className="w-full mt-4">View standings</Btn>:<Btn onClick={()=>onJoin(l)} className="w-full mt-4">Join league</Btn>}</div>}

export function Leagues({onUser}){
 const {toast}=useContext(Ctx);
 const [mine,setMine]=useStored('matchiq.leagues',MY_SEED),[m,setM]=useState(null),[name,setName]=useState(''),[dur,setDur]=useState('4 Weeks'),[code,setCode]=useState(''),[err,setErr]=useState(''),[made,setMade]=useState(null),[open,setOpen]=useState(null);
 const close=()=>{setM(null);setName('');setCode('');setErr('');setMade(null)};
 const join=l=>{if(mine.some(x=>x.code===l.code))return false;setMine(s=>[{...l,id:'j'+Date.now(),members:l.members+1,mePts:0},...s]);toast('You joined '+l.name);return true};
 const create=()=>{const l={id:'c'+Date.now(),name:name.trim(),creator:ME.name,members:1,dur,code:genCode(),top:[],mePts:0};setMine(s=>[l,...s]);setMade(l);toast('League created: '+l.name)};
 const submitJoin=()=>{const c=code.trim().toUpperCase(),l=FEAT.find(x=>x.code===c);if(!l){setErr('That code was not found. Check it and try again.');return}if(!join(l)){setErr('You are already in this league.');return}close()};
 const copy=c=>{try{navigator.clipboard.writeText(c)}catch(e){}toast('Invitation code copied')};
 const feat=FEAT.filter(f=>!mine.some(x=>x.code===f.code));
 return <div>
  <div className="flex flex-col sm:flex-row gap-3 mb-6"><Btn onClick={()=>setM('create')}><I n="plus" s={16}/>Create League</Btn><Btn v="s" onClick={()=>setM('join')}><I n="key" s={16}/>Join League</Btn></div>
  <h3 className="font-bold mb-3">My Leagues <span className="text-mute text-sm font-medium">({mine.length})</span></h3>
  {mine.length?<div className="grid sm:grid-cols-2 gap-4">{mine.map(l=><LeagueCard key={l.id} l={l} mine onOpen={setOpen}/>)}</div>:<div className="rounded-2xl border border-dashed border-line p-8 text-center text-mute text-sm">You haven’t joined a league yet.</div>}
  <h3 className="font-bold mt-8 mb-3">Featured Leagues</h3>
  {feat.length?<div className="grid sm:grid-cols-2 gap-4">{feat.map(l=><LeagueCard key={l.id} l={l} onJoin={join}/>)}</div>:<p className="text-sm text-mute">You’ve joined every featured league.</p>}
  {m==='create'&&<Sheet title={made?'League created':'Create a league'} onClose={close}>{made?<div className="text-center py-2">
    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-400 text-ink grid place-items-center pop"><I n="check" s={30}/></div>
    <p className="font-extrabold text-xl mt-4">{made.name}</p><p className="text-sm text-mute mt-1">Share this code with friends so they can join.</p>
    <div className="mt-4 rounded-2xl bg-card border border-line px-4 py-4 flex items-center justify-between gap-3"><span className="text-2xl font-extrabold tracking-widest">{made.code}</span><button onClick={()=>copy(made.code)} className="text-sky"><I n="copy"/></button></div>
    <Btn className="w-full mt-5" onClick={close}>Done</Btn></div>
   :<><label className="text-xs font-bold uppercase tracking-wider text-mute">League name</label>
    <input value={name} maxLength={28} onChange={e=>setName(e.target.value)} placeholder="e.g. Sunday Sweepstake" className="w-full mt-2 rounded-xl bg-card border border-line px-4 py-3 text-sm outline-none focus:border-white/40"/>
    <p className="text-xs font-bold uppercase tracking-wider text-mute mt-5 mb-2">Duration</p>
    <div className="grid grid-cols-3 gap-2">{['1 Week','4 Weeks','Full Season'].map(d=><button key={d} onClick={()=>setDur(d)} className={`rounded-xl border py-2.5 text-xs sm:text-sm font-bold transition ${dur===d?'border-lime bg-lime text-ink':'border-line bg-card hover:border-white/30'}`}>{d}</button>)}</div>
    <Btn onClick={create} className={`w-full mt-6 ${name.trim().length<3?'opacity-40 pointer-events-none':''}`}>Create league</Btn></>}</Sheet>}
  {m==='join'&&<Sheet title="Join a league" onClose={close}><p className="text-sm text-mute">Enter the invitation code you received.</p>
   <input value={code} onChange={e=>{setCode(e.target.value);setErr('')}} placeholder="e.g. PLE-2026" className="w-full mt-3 rounded-xl bg-card border border-line px-4 py-3 text-sm uppercase tracking-widest outline-none focus:border-white/40"/>
   {err&&<p className="text-xs text-red-400 mt-2">{err}</p>}<p className="text-[11px] text-mute mt-2">Demo codes: PLE-2026 · CHC-8841 · SLL-5120 · MWM-3377</p>
   <Btn onClick={submitJoin} className={`w-full mt-5 ${code.trim().length<4?'opacity-40 pointer-events-none':''}`}>Join league</Btn></Sheet>}
  {open&&<Sheet title={open.name} wide onClose={()=>setOpen(null)}><div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mute mb-4"><span>{open.members} members</span><span>{open.dur}</span><button onClick={()=>copy(open.code)} className="flex items-center gap-1 text-sky font-semibold"><I n="copy" s={12}/>{open.code}</button></div>
   <div className="scope-dark rounded-2xl p-2 space-y-2" style={{background:'#0b1510'}}>{leagueTable(open).map(u=><Row key={u.name} u={{...u,move:0}} onUser={onUser}/>)}</div></Sheet>}
 </div>}
