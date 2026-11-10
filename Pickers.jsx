import React,{useState} from 'react'
import {T,LG} from './data'
import {COUNTRIES} from './countries'
import {flag} from './compData'
import {I} from './Icon'
import {Crest} from './ui'
import {LeagueBadge} from './MatchCard'

export const CLUBS_LIST=['ARS','CHE','LIV','MUN','MCI','TOT','RMA','BAR','BAY','PSG','JUV','MIL'];
export const LEAGUES_LIST=['Premier League','La Liga','Champions League','Serie A','Bundesliga','Ligue 1','Europa League'];
const Search=({v,set,ph})=><div className="relative mb-3"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"><I n="search" s={16}/></span><input value={v} onChange={e=>set(e.target.value)} placeholder={ph} className="w-full rounded-xl bg-card border border-line pl-10 pr-4 py-3 text-sm outline-none focus:border-white/40 placeholder:text-mute"/></div>;
const Tick=()=><span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-lime text-ink grid place-items-center"><I n="check" s={12}/></span>;

export function ClubPicker({value,onChange}){
 const [q,setQ]=useState('');const list=CLUBS_LIST.filter(c=>T[c][0].toLowerCase().includes(q.trim().toLowerCase()));
 return <div><Search v={q} set={setQ} ph="Search clubs…"/>
  {list.length?<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{list.map(c=>{const on=value===c;return <button type="button" key={c} onClick={()=>onChange(c)} className={`relative flex flex-col items-center gap-2 rounded-2xl border p-4 transition active:scale-95 ${on?'border-lime bg-white/5':'border-line bg-card hover:border-white/30'}`}>{on&&<Tick/>}<Crest k={c} s={52}/><span className="text-sm font-semibold text-center leading-tight">{T[c][0]}</span></button>})}</div>:<p className="text-sm text-mute text-center py-8">No clubs match “{q}”.</p>}</div>}

export function LeaguePicker({value,onChange}){
 const tog=l=>onChange(value.includes(l)?value.filter(x=>x!==l):[...value,l]);
 return <div className="grid sm:grid-cols-2 gap-3">{LEAGUES_LIST.map(l=>{const on=value.includes(l);return <button type="button" key={l} onClick={()=>tog(l)} className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition active:scale-[.98] ${on?'border-lime bg-white/5':'border-line bg-card hover:border-white/30'}`}><LeagueBadge lg={l} s={30}/><span className="text-sm font-semibold flex-1">{l}</span>{on&&<span className="w-5 h-5 rounded-full bg-lime text-ink grid place-items-center"><I n="check" s={12}/></span>}</button>})}</div>}

export function CountryPicker({value,onChange}){
 const [q,setQ]=useState('');const list=COUNTRIES.filter(c=>c[1].toLowerCase().includes(q.trim().toLowerCase()));
 return <div><Search v={q} set={setQ} ph="Search countries…"/>
  <div className="max-h-72 overflow-y-auto rounded-2xl border border-line bg-card divide-y divide-line">{list.length?list.map(([cc,n])=><button type="button" key={cc} onClick={()=>onChange(cc)} className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition hover:bg-white/5 ${value===cc?'bg-white/[0.07]':''}`}><span className="text-lg">{flag(cc)}</span><span className="flex-1 font-semibold">{n}</span>{value===cc&&<span className="text-lime"><I n="check" s={16}/></span>}</button>):<p className="p-6 text-sm text-mute text-center">No countries match “{q}”.</p>}</div></div>}
