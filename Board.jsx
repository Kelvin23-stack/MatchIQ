import React,{useMemo} from 'react'
import {Av} from './ui'
import {ME,ini,board} from './compData'
export const Board=({n=5})=>{const L=useMemo(()=>board('global').slice(0,n),[n]);return <div className="rounded-2xl bg-card border border-line divide-y divide-line">{L.map((u,i)=><div key={u.name} className={`flex items-center gap-3 px-4 py-3.5 ${u.me?'bg-white/5':''}`}><span className={`w-6 text-center font-extrabold ${['text-gold','text-[#C7CDD4]','text-[#CD7F32]'][i]||'text-mute'}`}>{i+1}</span><Av t={ini(u.me?ME.full:u.name)} me={u.me}/><span className="flex-1 font-semibold text-sm truncate">{u.name}</span><span className="font-bold text-sm">{u.points.toLocaleString()}<span className="text-mute font-normal"> pts</span></span></div>)}</div>};
