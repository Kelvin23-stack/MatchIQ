import React,{useState} from 'react'
import {tone,teamName} from './intelHelpers'

export function RatingChart({rows}){
 const [h,setH]=useState(null);const W=320,H=160,L=26,R=10,Tp=16,B=30,n=rows.length,x=i=>L+(n===1?0:i*(W-L-R)/(n-1)),y=v=>Tp+(10-v)/5*(H-Tp-B);
 const avg=rows.reduce((s,r)=>s+r[6],0)/n,pts=rows.map((r,i)=>[x(i),y(r[6])]);
 return <div><svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Match ratings across recent matches">
  {[6,7,8,9].map(v=><g key={v}><line x1={L} x2={W-R} y1={y(v)} y2={y(v)} stroke="rgb(var(--line))" strokeWidth=".6"/><text x={L-5} y={y(v)+3} fontSize="8" textAnchor="end" fill="rgb(var(--mute))">{v}</text></g>)}
  <line x1={L} x2={W-R} y1={y(avg)} y2={y(avg)} stroke="#F5C451" strokeWidth=".8" strokeDasharray="3 3" opacity=".7"/>
  <polyline points={pts.map(p=>p.join(',')).join(' ')} fill="none" stroke="#5AA9FF" strokeWidth="2" strokeLinejoin="round"/>
  {rows.map((r,i)=><g key={i}><circle cx={pts[i][0]} cy={pts[i][1]} r={h===i?5:3.5} fill={tone(r[6])} stroke="rgb(var(--card))" strokeWidth="1.5" tabIndex={0} onMouseEnter={()=>setH(i)} onMouseLeave={()=>setH(null)} onFocus={()=>setH(i)} onBlur={()=>setH(null)} style={{cursor:'pointer',outline:'none'}}/><text x={pts[i][0]} y={pts[i][1]-8} fontSize="8" textAnchor="middle" fontWeight="700" fill="rgb(var(--fg))">{r[6].toFixed(1)}</text><text x={pts[i][0]} y={H-12} fontSize="7.5" textAnchor="middle" fill="rgb(var(--mute))">{r[1]}</text><text x={pts[i][0]} y={H-3} fontSize="6.5" textAnchor="middle" fill="rgb(var(--mute))">{r[2]==='H'?'H':'A'}</text></g>)}</svg>
  <p className="text-xs text-mute min-h-[1rem]">{h!==null?`${teamName(rows[h][1])} (${rows[h][2]==='H'?'home':'away'}) · rating ${rows[h][6].toFixed(1)} · ${rows[h][5]} min`:`Dashed line: average of these matches (${avg.toFixed(2)})`}</p></div>}

export function GAChart({rows}){
 const max=Math.max(1,...rows.map(r=>Math.max(r[7],r[8]))),tot=rows.reduce((s,r)=>s+r[7]+r[8],0);
 return <div><div className="flex items-end gap-2 h-32">{rows.map((r,i)=><div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1" title={`${teamName(r[1])}: ${r[7]} goals, ${r[8]} assists`}><div className="flex items-end gap-0.5 w-full justify-center flex-1">{[[r[7],'#34D399'],[r[8],'#5AA9FF']].map(([v,c],k)=><div key={k} className="flex flex-col items-center justify-end h-full w-1/2 max-w-[14px]"><span className="text-[9px] font-bold tabular-nums">{v||''}</span><div className="w-full rounded-t grow" style={{height:v/max*80+'%',minHeight:v?3:1,background:v?c:'rgb(var(--line))',transformOrigin:'bottom'}}/></div>)}</div><span className="text-[9px] text-mute">{r[1]}</span></div>)}</div>
  <div className="flex gap-4 text-[11px] text-mute mt-2"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{background:'#34D399'}}/>Goals</span><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{background:'#5AA9FF'}}/>Assists</span>{tot===0&&<span>No goals or assists in these matches</span>}</div></div>}

export function TrendChart({data}){
 return <div><div className="flex items-end gap-2 h-36">{data.map(d=><div key={d.m} className="flex-1 flex flex-col items-center justify-end h-full gap-1" title={`${d.m}: ${d.n} apps, avg rating ${d.rating}, ${d.g} goals, ${d.a} assists`}><span className="text-[10px] font-bold tabular-nums" style={{color:tone(d.rating)}}>{d.rating.toFixed(1)}</span><div className="w-full rounded-t grow" style={{height:(d.rating-5)/5*75+'%',minHeight:6,background:tone(d.rating)+'cc',transformOrigin:'bottom'}}/><span className="text-[10px] text-mute">{d.m}</span><span className="text-[9px] text-mute tabular-nums">{d.g}G {d.a}A</span></div>)}</div></div>}
