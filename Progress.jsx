import React,{useState} from 'react'
import {ME,levelInfo,SCORING,XP_RULES,TX,WEEKS,RECENT,MILESTONES} from './compData'
import {I} from './Icon'
import {BadgeIcon} from './Badges'

export function XpCard(){const L=levelInfo(ME.xp);return <div className="rounded-2xl bg-card border border-line p-5">
 <div className="flex items-center gap-4"><div className="w-20 h-20 rounded-full grid place-items-center shrink-0" style={{background:`conic-gradient(#5AA9FF ${L.pct}%,rgb(var(--line)) 0)`}}><div className="w-[68px] h-[68px] rounded-full bg-card grid place-items-center text-center"><div><p className="text-[10px] text-mute leading-none">LEVEL</p><p className="text-2xl font-extrabold leading-tight">{L.level}</p></div></div></div>
  <div><p className="font-bold text-lg">{L.title}</p><p className="text-xs text-mute">{L.need} XP to level {L.level+1}</p></div></div>
 <div className="h-2 rounded-full bg-bg2 mt-4 overflow-hidden"><div className="h-full rounded-full bg-sky" style={{width:L.pct+'%'}}/></div>
 <div className="flex justify-between text-[11px] text-mute mt-1.5"><span>{L.cur.toLocaleString()} XP</span><span>{L.nxt.toLocaleString()} XP</span></div>
 <div className="grid grid-cols-2 gap-3 mt-4"><div className="rounded-xl bg-bg2 border border-line p-3"><p className="text-[11px] text-mute flex items-center gap-1.5"><I n="trophy" s={12} c="text-gold"/>Points</p><p className="text-xl font-extrabold mt-1">{ME.points.toLocaleString()}</p></div><div className="rounded-xl bg-bg2 border border-line p-3"><p className="text-[11px] text-mute flex items-center gap-1.5"><I n="bolt" s={12} c="text-sky"/>XP</p><p className="text-xl font-extrabold mt-1">{ME.xp.toLocaleString()}</p></div></div>
 <p className="text-[11px] text-mute mt-3">Points decide your rank. XP decides your level.</p></div>}

export function PointsXp(){const[all,setAll]=useState(false);return <div className="grid lg:grid-cols-5 gap-4">
 <div className="lg:col-span-2 space-y-4">
  <div className="rounded-2xl bg-card border border-line p-5"><p className="font-bold flex items-center gap-2"><span className="text-gold"><I n="trophy" s={16}/></span>Competitive points</p><p className="text-xs text-mute mt-1">Used for every leaderboard.</p>
   <div className="mt-3 divide-y divide-line">{SCORING.map(r=><div key={r[0]} className="py-2.5 flex justify-between gap-3"><div><p className="text-sm font-semibold">{r[0]}</p><p className="text-[11px] text-mute">{r[2]}</p></div><span className="text-sm font-extrabold whitespace-nowrap text-gold">{r[1]}</span></div>)}</div></div>
  <div className="rounded-2xl bg-card border border-line p-5"><p className="font-bold flex items-center gap-2"><span className="text-sky"><I n="bolt" s={16}/></span>Experience (XP)</p><p className="text-xs text-mute mt-1">Used for levels and progression.</p>
   <div className="mt-3 divide-y divide-line">{XP_RULES.map(r=><div key={r[0]} className="py-2.5 flex justify-between text-sm"><span className="font-semibold">{r[0]}</span><span className="font-extrabold text-sky">{r[1]}</span></div>)}</div></div></div>
 <div className="lg:col-span-3 rounded-2xl bg-card border border-line p-5"><div className="flex justify-between items-center mb-3"><p className="font-bold">Recent point transactions</p><span className="text-[11px] text-mute">Sample data</span></div>
  <div className="divide-y divide-line">{(all?TX:TX.slice(0,5)).map((t,i)=><div key={i} className="flex items-center gap-3 py-3"><div className={`w-9 h-9 rounded-full grid place-items-center shrink-0 ${t[2]?'bg-emerald-400/10 text-emerald-400':t[3]===50?'bg-sky/10 text-sky':'bg-red-500/10 text-red-400'}`}><I n={t[2]?'check':t[3]===50?'bolt':'x'} s={15}/></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{t[0]}</p><p className="text-[11px] text-mute">{t[1]} · {t[4]}</p></div><div className="text-right"><p className="text-sm font-extrabold">{t[2]?'+'+t[2]:'0'} <span className="text-mute font-medium text-[11px]">pts</span></p><p className="text-[11px] text-sky font-semibold">+{t[3]} XP</p></div></div>)}</div>
  <button onClick={()=>setAll(!all)} className="mt-3 w-full text-center text-sm font-semibold text-sky hover:underline">{all?'Show less':'View full history'}</button></div></div>}

export function Streaks(){
 const next=MILESTONES.find(m=>m[0]>ME.streak)||MILESTONES[3],max=Math.max(...WEEKS.map(w=>w[1])),hit=RECENT.filter(Boolean).length;
 return <div className="space-y-4"><div className="grid lg:grid-cols-3 gap-4">
  <div className="relative overflow-hidden rounded-2xl border border-flame/25 bg-gradient-to-br from-flame/15 via-card to-card p-6">
   <span className="flick text-flame"><I n="flame" s={46}/></span><p className="text-7xl font-extrabold leading-none mt-3">{ME.streak}</p><p className="text-sm text-mute mt-1">correct in a row</p>
   <div className="flex gap-6 mt-5 text-sm"><div><p className="text-mute text-[11px]">Longest</p><p className="font-extrabold text-lg">{ME.longest}</p></div><div><p className="text-mute text-[11px]">Next badge</p><p className="font-extrabold text-lg">{next[1]}</p></div></div>
   <div className="h-2 rounded-full bg-bg2 mt-4 overflow-hidden"><div className="h-full rounded-full bg-flame" style={{width:Math.min(100,ME.streak/next[0]*100)+'%'}}/></div><p className="text-[11px] text-mute mt-1.5">{ME.streak} / {next[0]} to unlock</p></div>
  <div className="lg:col-span-2 rounded-2xl bg-card border border-line p-5">
   <p className="font-bold">Weekly streak history</p><p className="text-xs text-mute">Longest run each week</p>
   <div className="flex items-end gap-2 sm:gap-4 h-32 mt-4">{WEEKS.map(w=><div key={w[0]} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5"><span className="text-[11px] font-bold">{w[1]}</span><div className="grow w-full rounded-t-lg" style={{height:w[1]/max*85+'%',transformOrigin:'bottom',background:w[1]===max?'#FF8A3D':'rgba(255,138,61,.35)'}}/><span className="text-[10px] text-mute">{w[0]}</span></div>)}</div>
   <div className="mt-5 flex items-center justify-between"><p className="font-bold text-sm">Recent performance</p><p className="text-xs text-mute">{hit} of {RECENT.length} correct</p></div>
   <div className="flex gap-1.5 mt-2">{RECENT.map((r,i)=><div key={i} className={`flex-1 h-8 rounded-lg grid place-items-center ${r?'bg-emerald-400/15 text-emerald-400':'bg-red-500/10 text-red-400'}`}><I n={r?'check':'x'} s={13}/></div>)}</div></div></div>
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{MILESTONES.map((m,i)=>{const on=ME.longest>=m[0];return <div key={m[0]} style={{animationDelay:i*120+'ms'}} className={`pop rounded-2xl border border-line p-4 flex items-center gap-3 ${on?'bg-card':'bg-card/50'}`}><BadgeIcon icon={m[2]} color={m[3]} on={on} s={48}/><div className="min-w-0"><p className={`text-sm font-bold leading-tight ${on?'':'text-mute'}`}>{m[1]}</p><p className="text-[11px] text-mute">{m[0]} in a row{on?' · unlocked':''}</p></div></div>})}</div></div>}
