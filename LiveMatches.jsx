import React,{useState,useContext} from 'react'
import {Ctx} from './context'
import {useApi} from './footballApi'
import {normFixtures,normStandings} from './liveData'
import {I} from './Icon'
import {TeamLogo,LiveStatus,Async,fmtTime,tzName} from './LiveBits'
import {Empty} from './PlayerBits'

const VIEWS=['Live','Today','Upcoming','Finished','Table'];
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const day=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const EMPTY={Live:'No matches are live right now.',Today:'No matches scheduled for today.',Upcoming:'No upcoming matches found.',Finished:'No finished matches in the last 7 days.'};

function Row({f}){const {nav}=useContext(Ctx);const st=f.status,show=st.kind!=='upcoming'&&st.kind!=='off';
 return <button onClick={()=>nav(`lmatch/${f.id}/overview`)} aria-label={`${f.home.name} vs ${f.away.name}`} className="w-full text-left rounded-2xl border border-line bg-card p-4 transition hover:border-white/30 hover:-translate-y-0.5">
  <div className="flex items-center justify-between gap-2 text-[11px] text-mute"><span className="truncate flex items-center gap-1.5">{f.leagueLogo&&<img src={f.leagueLogo} alt="" className="w-4 h-4 object-contain"/>}{f.leagueName}{f.round?` · ${f.round.replace('Regular Season - ','Matchday ')}`:''}</span><LiveStatus st={st}/></div>
  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-3"><div className="flex items-center gap-2.5 min-w-0"><TeamLogo t={f.home} s={36}/><span className="text-sm font-bold truncate">{f.home.name}</span></div>
   <div className="text-center min-w-[64px]">{show?<span className="text-xl font-extrabold tabular-nums">{f.goals.home??'–'}<span className="text-mute mx-1">–</span>{f.goals.away??'–'}</span>:<span className="text-xs font-bold text-mute">{new Date(f.timestamp*1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>}</div>
   <div className="flex items-center gap-2.5 min-w-0 justify-end"><span className="text-sm font-bold truncate text-right">{f.away.name}</span><TeamLogo t={f.away} s={36}/></div></div></button>}

function Table(){const r=useApi('standings',{},{ttl:900000});const g=r.data&&normStandings(r.data);
 return <Async s={r}>{g&&g[0]?<div className="rounded-2xl border border-line bg-card overflow-x-auto"><div className="min-w-[520px]">
  <div className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3rem_3rem_5rem] gap-2 px-4 py-2.5 text-[10px] uppercase tracking-wider text-mute border-b border-line"><span>#</span><span>Club</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span>Pts</span><span>Form</span></div>
  <div className="divide-y divide-line">{g[0].map(t=><div key={t.teamId} className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3rem_3rem_5rem] gap-2 px-4 py-2.5 items-center text-sm"><span className="text-mute tabular-nums">{t.rank}</span><span className="flex items-center gap-2 min-w-0"><TeamLogo t={t} s={22}/><span className="truncate font-semibold">{t.name}</span></span><span className="tabular-nums">{t.played??'–'}</span><span className="tabular-nums">{t.win??'–'}</span><span className="tabular-nums">{t.draw??'–'}</span><span className="tabular-nums">{t.lose??'–'}</span><span className="tabular-nums">{t.diff??'–'}</span><span className="font-extrabold tabular-nums">{t.points??'–'}</span><span className="flex gap-0.5">{(t.form||'').split('').slice(-5).map((c,i)=><span key={i} className={`w-3.5 h-3.5 rounded-sm text-[8px] font-bold grid place-items-center text-[#fff] ${c==='W'?'bg-emerald-500':c==='D'?'bg-amber-500':'bg-red-500'}`}>{c}</span>)}</span></div>)}</div></div></div>
  :<Empty title="No standings returned" body="The provider has no table for this competition and season."/>}</Async>}

export function LiveMatches(){
 const [view,setView]=useState('Today'),[date,setDate]=useState('');
 const cfg=useApi('config',{},{ttl:600000});
 const P=date?{date}:view==='Live'?{live:1}:view==='Today'?{date:day(0)}:view==='Upcoming'?{from:day(1),to:day(14),status:'NS-TBD'}:{from:day(-7),to:day(0),status:'FT-AET-PEN'};
 const table=view==='Table'&&!date;
 const r=useApi('fixtures',P,{enabled:!table,ttl:view==='Live'&&!date?45000:date||view==='Today'?120000:600000,poll:view==='Live'&&!date?60000:undefined});
 let list=normFixtures(r.data);if(view==='Finished'&&!date)list=[...list].reverse();
 const groups=[];list.forEach(f=>{const k=new Date(f.timestamp*1000).toLocaleDateString([], {weekday:'long',day:'numeric',month:'long'});const g=groups.find(x=>x.k===k);g?g.items.push(f):groups.push({k,items:[f]})});
 return <div>
  {cfg.data&&cfg.data.configured===false&&<div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm mb-4">The server has no API key yet, so live requests will fail. See SETUP.md, or switch to Demo data in Settings.</div>}
  <div className="flex flex-wrap items-center gap-3 mb-5"><div role="tablist" aria-label="Match view" className="flex gap-1 overflow-x-auto no-scrollbar">{VIEWS.map(v=><button key={v} role="tab" aria-selected={view===v&&!date} onClick={()=>{setView(v);setDate('')}} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold border transition ${view===v&&!date?'bg-lime text-ink border-lime':'border-line text-mute hover:text-white'}`}>{v}</button>)}</div>
   <label className="ml-auto text-xs text-mute flex items-center gap-2">Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} className="rounded-lg bg-card border border-line px-2.5 py-1.5 text-sm text-white outline-none"/></label>{date&&<button onClick={()=>setDate('')} className="text-xs text-sky font-semibold">Clear</button>}</div>
  <p className="text-[11px] text-mute mb-3">Kickoff times are shown in your local timezone{tzName()?` (${tzName()})`:''}.</p>
  {table?<Table/>:<Async s={r}>{groups.length?<div className="space-y-6">{groups.map(g=><div key={g.k}><p className="text-xs font-bold uppercase tracking-wider text-mute mb-2">{g.k}</p><div className="grid md:grid-cols-2 gap-3">{g.items.map(f=><Row key={f.id} f={f}/>)}</div></div>)}</div>:<Empty title={date?'No matches on this date':EMPTY[view]} body="Only matches returned by the data provider are shown."/>}</Async>}</div>}
