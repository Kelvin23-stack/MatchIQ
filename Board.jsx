import React,{useState,useEffect,useContext} from 'react'
import {USERS} from './data'
import {Av} from './ui'
import {ME,ini} from './compData'

export const Board=({n=5})=><div className="rounded-2xl bg-card border border-line divide-y divide-line">{USERS.slice(0,n).map((u,i)=><div key={u[0]} className={`flex items-center gap-3 px-4 py-3.5 ${u[0]==='Alex Morgan'?'bg-white/5':''}`}><span className={`w-6 text-center font-extrabold ${['text-gold','text-[#C7CDD4]','text-[#CD7F32]'][i]||'text-mute'}`}>{i+1}</span><Av t={u[0]==='Alex Morgan'?ini(ME.full):u[1]} me={u[0]==='Alex Morgan'}/><span className="flex-1 font-semibold text-sm truncate">{u[0]==='Alex Morgan'?ME.name:u[0]}</span><span className="font-bold text-sm">{u[2].toLocaleString()}<span className="text-mute font-normal"> pts</span></span></div>)}</div>;


