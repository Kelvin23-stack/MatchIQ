import React,{useState,useContext} from 'react'
import {Ctx} from './context'
import {useApi} from './footballApi'
import {normStandings} from './liveData'
import {useMatchDays,useLeagueList,dayStr,iso} from './liveMatch'
import {useDataSettings,setLeague} from './dataMode'
import {I} from './Icon'
import {Btn} from './ui'
import {TeamLogo,LiveStatus,Async,tzName} from './LiveBits'
import {Empty} from './PlayerBits'
import {marketLines} from './data'
import {teamName as TN,teamLogo as TL} from './intelHelpers'

const VIEWS=['Live','Yesterday','Today','Upcoming','Finished','Table'];
const EMPTY={Live:'No matches are live right now.',Yesterday:'No matches were played yesterday.',Today:'No matches scheduled for today.',Upcoming:'No upcoming matches found.',Finished:'No finished matches in the last 7 days.'};

// One match row, used by Match Centre, Dashboard and Landing. `m` comes from liveMatch.toMatch().
export function MatchRow({m}){
 const {nav,store,openPick}=useContext(Ctx);const st=m.status,show=st.kind!=='upcoming'&&st.kind!=='off',p=store[m.id],lines=p?marketLines(p,m):[];
 const go=()=>nav(`lmatch/${m.id}/overview`);
 return <div role="link" tabIndex={0} onClick={go} onKeyDown={e=>e.key==='Enter'&&go()} aria-label="Open match details" className="cursor-pointer w-full text-left rounded-2xl border border-line bg-card p-4 transition hover:border-white/30 hover:-translate-y-0.5">
  <div className="flex items-center justify-between gap-2 text-[11px] text-mute"><span className="truncate flex items-center gap-1.5">{m.lgLogo&&<img src={m.lgLogo} alt="" referrerPolicy="no-referrer" className="w-4 h-4 object-contain"/>}{m.lg}{m.round?` · ${m.round.replace('Regular Season - ','Matchday ')}`:''}</span><LiveStatus st={st}/></div>
  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-3"><div className="flex items-center gap-2.5 min-w-0"><TeamLogo t={{name:TN(m.h),logo:TL(m.h)}} s={36}/><span className="text-sm font-bold truncate">{TN(m.h)}</span></div>
   <div className="text-center min-w-[64px]">{show?<span className="text-xl font-extrabold tabular-nums">{m.hasScore?m.sc[0]:'–'}<span className="text-mute mx-1">–</span>{m.hasScore?m.sc[1]:'–'}</span>:<span className="text-xs font-bold text-mute">{m.ts?new Date(m.ts*1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'TBC'}</span>}</div>
   <div className="flex items-center gap-2.5 min-w-0 justify-end"><span className="text-sm font-bold truncate text-right">{TN(m.a)}</span><TeamLogo t={{name:TN(m.a),logo:TL(m.a)}} s={36}/></div></div>
  {m.st==='upcoming'&&<div className="mt-3 flex items-center justify-between gap-2">{p?<span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400"><I n="check" s={13}/>{lines.length} market{lines.length>1?'s':''} predicted</span>:<span className="text-[11px] text-mute">Predictions close at kickoff</span>}
   <Btn onClick={e=>{e.stopPropagation();openPick(m)}} className="!py-1.5 !px-3.5 text-xs">{p?'Edit prediction':'Predict'}</Btn></div>}
  {m.st!=='upcoming'&&p&&<p className="mt-3 text-[11px] text-mute flex items-center gap-1.5"><I n="lock" s={12}/>Your {lines.length} pick{lines.length>1?'s':''} · closed</p>}</div>}

function Table(){const lp=useDataSettings().league;const r=useApi('standings',lp?{league:lp}:{},{ttl:3600000});return <Async s={r}><StandingsView groups={r.data&&normStandings(r.data)}/></Async>}
export function StandingsView({groups}){
 const Head=()=><div className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem_3rem_3rem] gap-2 px-4 py-2.5 text-[10px] uppercase tracking-wider text-mute border-b border-line"><span>#</span><span>Club</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GF</span><span>GA</span><span>GD</span><span>Pts</span></div>;
 return <>{groups&&groups.some(g=>g.rows.length)?<div className="space-y-5">{groups.filter(g=>g.rows.length).map((g,gi)=><div key={gi}>{groups.length>1&&g.name&&<p className="text-xs font-bold uppercase tracking-wider text-mute mb-2">{g.name}</p>}<div className="rounded-2xl border border-line bg-card overflow-x-auto"><div className="min-w-[520px]"><Head/>
  <div className="divide-y divide-line">{g.rows.map(t=><div key={t.teamId} className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem_3rem_3rem] gap-2 px-4 py-2.5 items-center text-sm"><span className="text-mute tabular-nums">{t.rank}</span><span className="flex items-center gap-2 min-w-0"><TeamLogo t={t} s={22}/><span className="truncate font-semibold">{t.name}</span></span><span className="tabular-nums">{t.played??'–'}</span><span className="tabular-nums">{t.win??'–'}</span><span className="tabular-nums">{t.draw??'–'}</span><span className="tabular-nums">{t.lose??'–'}</span><span className="tabular-nums">{t.gf??'–'}</span><span className="tabular-nums">{t.ga??'–'}</span><span className="tabular-nums">{t.diff??'–'}</span><span className="font-extrabold tabular-nums">{t.points??'–'}</span></div>)}</div></div></div></div>)}</div>
  :<Empty title="No standings returned" body="The provider has no table for this competition and season. You can change the season in Settings."/>}</>}

export function CompetitionChips(){
 const {league}=useDataSettings();const L=useLeagueList();
 if(L.loading||!L.list.length)return null;
 const cur=league||String(L.list[0].id);
 return <div role="tablist" aria-label="Competition" className="flex gap-2 overflow-x-auto no-scrollbar mb-4">{L.list.map(l=>{const on=String(l.id)===cur;return <button key={l.id} role="tab" aria-selected={on} onClick={()=>setLeague(l.id)} className={`whitespace-nowrap inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition ${on?'bg-lime text-ink border-lime':'border-line text-mute hover:text-white'}`}>{l.logo&&<img src={l.logo} alt="" referrerPolicy="no-referrer" className="w-4 h-4 object-contain"/>}{l.name}</button>})}</div>}

const FILTER={Live:m=>m.st==='live',Upcoming:m=>m.st==='upcoming',Finished:m=>m.st==='ft'};
export function LiveMatches(){
 const [view,setView]=useState('Today'),[date,setDate]=useState(''),[more,setMore]=useState(3);const {league}=useDataSettings();
 const cfg=useApi('config',{},{ttl:600000});
 const shift=n=>{const d=date?new Date(date+'T12:00:00'):new Date();d.setDate(d.getDate()+n);setDate(iso(d))};
 const table=view==='Table'&&!date,liveView=view==='Live'&&!date,range=!date&&(view==='Upcoming'||view==='Finished');
 // Highlightly's /matches takes one date, so ranges are built day by day (each day is cached and shared with the other tabs).
 const dates=date?[date]:view==='Yesterday'?[dayStr(-1)]:view==='Today'||liveView?[dayStr(0)]:view==='Upcoming'?Array.from({length:more},(_,i)=>dayStr(i+1)):view==='Finished'?Array.from({length:more},(_,i)=>dayStr(-i)):[];
 const r=useMatchDays(dates,{enabled:!table,live:liveView,ttl:view==='Upcoming'&&!date?3600000:300000,poll:liveView?60000:undefined});
 let list=r.list;if(!date&&FILTER[view])list=list.filter(FILTER[view]);if(view==='Finished'&&!date)list=[...list].reverse();
 const groups=[];list.forEach(m=>{const k=m.ts?new Date(m.ts*1000).toLocaleDateString([], {weekday:'long',day:'numeric',month:'long'}):'Date to be confirmed';const g=groups.find(x=>x.k===k);g?g.items.push(m):groups.push({k,items:[m]})});
 const noLeagues=cfg.data&&cfg.data.configured!==false&&cfg.data.leagues&&!cfg.data.leagues.length;
 return <div>
  {cfg.data&&cfg.data.configured===false&&<div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm mb-4">The server has no API key yet, so football data cannot load. See SETUP.md.</div>}
  {noLeagues&&<div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm mb-4">{cfg.data.leaguesRejected&&cfg.data.leaguesRejected.length?`HIGHLIGHTLY_LEAGUES contains values that are not numeric ids: ${cfg.data.leaguesRejected.join(', ')}. Use the numeric league ids, separated by commas.`:'No competitions are enabled yet. Set HIGHLIGHTLY_LEAGUES on the server and restart it (see SETUP.md).'}</div>}
  <CompetitionChips/>
  <div className="flex flex-wrap items-center gap-3 mb-5"><div role="tablist" aria-label="Match view" className="flex gap-1 overflow-x-auto no-scrollbar">{VIEWS.map(v=><button key={v} role="tab" aria-selected={view===v&&!date} onClick={()=>{setView(v);setDate('');setMore(3)}} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold border transition ${view===v&&!date?'bg-lime text-ink border-lime':'border-line text-mute hover:text-white'}`}>{v}</button>)}</div>
   {!table&&<div className="ml-auto flex items-center gap-2 text-xs text-mute"><button onClick={()=>shift(-1)} aria-label="Previous day" className="w-8 h-8 rounded-lg border border-line grid place-items-center hover:text-white"><I n="back" s={14}/></button><input type="date" aria-label="Pick a date" value={date} onChange={e=>setDate(e.target.value)} className="rounded-lg bg-card border border-line px-2.5 py-1.5 text-sm text-white outline-none"/><button onClick={()=>shift(1)} aria-label="Next day" className="w-8 h-8 rounded-lg border border-line grid place-items-center hover:text-white"><I n="right" s={14}/></button>{date&&<button onClick={()=>setDate('')} className="text-sky font-semibold">Clear</button>}</div>}</div>
  <p className="text-[11px] text-mute mb-3">Kickoff times are shown in your local timezone{tzName()?` (${tzName()})`:''}.{liveView?' Live scores refresh about once a minute.':''}</p>
  {table?<Table/>:<Async s={r}>{r.paging&&r.paging.truncated&&<p className="text-[11px] text-amber-400 mb-3">The provider returned only part of the list for at least one day. Use the date picker to narrow it down.</p>}
   {groups.length?<div className="space-y-6">{groups.map(g=><div key={g.k}><p className="text-xs font-bold uppercase tracking-wider text-mute mb-2">{g.k}</p><div className="grid md:grid-cols-2 gap-3">{g.items.map(m=><MatchRow key={m.id} m={m}/>)}</div></div>)}</div>:<Empty title={date?'No matches on this date':EMPTY[view]} body="Only matches returned by the data provider are shown."/>}
   {range&&more<14&&<div className="text-center mt-6"><Btn v="s" onClick={()=>setMore(more+3)}>Show 3 more days</Btn></div>}</Async>}</div>}
