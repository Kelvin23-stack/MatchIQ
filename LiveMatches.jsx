import React,{useState,useContext} from 'react'
import {Ctx} from './context'
import {useApi} from './footballApi'
import {normStandings} from './liveData'
import {useMatchDays,useLeagueList,dayStr,iso,useRefreshed,rehydrate} from './liveMatch'
import {useDataSettings,setLeague} from './dataMode'
import {useStored} from './hooks'
import {I} from './Icon'
import {Btn} from './ui'
import {TeamLogo,Async,tzName} from './LiveBits'
import {Empty} from './PlayerBits'
import {marketLines} from './data'
import {teamName as TN,teamLogo as TL} from './intelHelpers'

const VIEWS=['Live','Favourites','Yesterday','Today','Upcoming','Finished','Table'];
const EMPTY={Live:'No matches are live right now.',Yesterday:'No matches were played yesterday.',Today:'No matches scheduled for today.',Upcoming:'No upcoming matches found.',Finished:'No finished matches in the last 7 days.'};
const hhmm=ts=>ts?new Date(ts*1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',hour12:false}):'TBC';
const SHORT={'Postponed':'PST','Cancelled':'CAN','Suspended':'SUS','Interrupted':'INT','Abandoned':'ABD','Awarded':'AWD','To be announced':'TBC','Half time':'HT','Break time':'BRK'};

// Left column of a row: kickoff time, live minute, HT, FT, or a short status (PST, CAN...).
function Clock({m}){
 if(m.st==='upcoming')return <span className="text-sm font-bold tabular-nums">{m.status.short==='TBD'?'TBC':hhmm(m.ts)}</span>;
 if(m.kind==='live')return <span className="flex flex-col items-center gap-1 text-red-400 text-sm font-extrabold tabular-nums"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"/>{m.min!=null?m.min+"'":'LIVE'}</span>;
 if(m.kind==='break')return <span className="text-sm font-extrabold text-amber-400">{SHORT[m.status.long]||'HT'}</span>;
 if(m.st==='ft')return <span className="text-xs font-bold text-mute">{m.status.long==='Finished after penalties'?'PEN':m.status.long==='Finished after extra time'?'AET':'FT'}</span>;
 return <span className="text-[11px] font-bold text-amber-400">{SHORT[m.status.long]||'–'}</span>}

// Star button: adds/removes a favourite match (saved in this browser). Never opens the match.
export function FavStar({m,className=''}){
 const {favs,toggleFav}=useContext(Ctx);const on=!!favs[m.id],label=on?'Remove from favourites':'Add to favourites';
 return <button type="button" aria-pressed={on} aria-label={label} title={label} onClick={e=>{e.stopPropagation();toggleFav(m)}} className={`shrink-0 w-10 h-10 rounded-full grid place-items-center transition active:scale-90 ${on?'text-gold':'text-mute hover:text-white'} ${className}`}><I n="star" s={22} fill={on}/></button>}

// One match: time | divider | two stacked teams | score (live/finished) | predict | star. `m` comes from liveMatch.toMatch() or a stored snapshot.
export function MatchRow({m}){
 const {nav,store,openPick}=useContext(Ctx);const p=store[m.id],n=p?marketLines(p,m).length:0,show=(m.st==='live'||m.st==='ft')&&m.hasScore,go=()=>nav(`lmatch/${m.id}/overview`);
 const win=m.st==='ft'&&m.hasScore?(m.sc[0]>m.sc[1]?0:m.sc[0]<m.sc[1]?1:-1):-1;
 const team=(code,i)=><div className="flex items-center gap-2.5 min-w-0"><TeamLogo t={{name:TN(code),logo:TL(code)}} s={24}/><span className={`text-[15px] truncate ${win===i?'font-extrabold':win>=0?'font-semibold text-mute':'font-semibold'}`}>{TN(code)}</span></div>;
 return <div role="link" tabIndex={0} onClick={go} onKeyDown={e=>e.key==='Enter'&&go()} aria-label={`${TN(m.h)} vs ${TN(m.a)}`} className="flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-card border border-line pl-3 pr-1.5 sm:pl-4 sm:pr-2 py-2.5 cursor-pointer transition hover:border-white/25">
  <div className="w-11 sm:w-12 shrink-0 text-center"><Clock m={m}/></div><span className="w-px self-stretch bg-line" aria-hidden="true"/>
  <div className="flex-1 min-w-0 space-y-2">{team(m.h,0)}{team(m.a,1)}</div>
  {show&&<div className="shrink-0 text-right text-[15px] font-extrabold tabular-nums space-y-2 pr-1" aria-label={`Score ${m.sc[0]} to ${m.sc[1]}`}><div className={win===1?'text-mute':''}>{m.sc[0]}</div><div className={win===0?'text-mute':''}>{m.sc[1]}</div></div>}
  {m.st==='upcoming'&&<button type="button" onClick={e=>{e.stopPropagation();openPick(m)}} aria-label={n?'Edit prediction':'Predict this match'} title={n?'Edit prediction':'Predict this match'} className={`shrink-0 h-9 min-w-[2.25rem] rounded-full inline-flex items-center justify-center gap-1.5 px-2.5 text-xs font-bold transition active:scale-95 ${n?'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30':'bg-lime text-ink hover:brightness-110'}`}><I n={n?'check':'target'} s={16}/><span className="hidden sm:inline">{n?'Edit':'Predict'}</span></button>}
  <FavStar m={m}/></div>}

// A competition section (logo ring, name, country) with a chevron that collapses its matches smoothly.
function Group({g,open,onToggle,children}){
 const id='grp-'+String(g.id).replace(/\W/g,'_');
 return <section className="mb-4"><button type="button" onClick={onToggle} aria-expanded={open} aria-controls={id} className="w-full flex items-center gap-3 px-1 py-2.5 text-left rounded-2xl">
   <span className="w-10 h-10 rounded-full p-[2px] shrink-0" style={{background:'conic-gradient(from 200deg,#B388FF,#5AA9FF,#34D399,#B388FF)'}}><span className="w-full h-full rounded-full bg-bg2 grid place-items-center overflow-hidden">{g.logo?<img src={g.logo} alt="" referrerPolicy="no-referrer" loading="lazy" className="w-6 h-6 object-contain"/>:<I n="trophy" s={16}/>}</span></span>
   <span className="flex-1 min-w-0"><span className="block font-extrabold text-base truncate">{g.name}</span><span className="block text-xs text-mute truncate">{[g.country,`${g.items.length} match${g.items.length===1?'':'es'}`].filter(Boolean).join(' · ')}</span></span>
   <span className="w-10 h-10 grid place-items-center text-mute shrink-0"><I n={open?'up':'down'} s={22}/></span></button>
  <div id={id} style={{display:'grid',gridTemplateRows:open?'1fr':'0fr',visibility:open?'visible':'hidden',transition:`grid-template-rows .3s ease, visibility 0s linear ${open?'0s':'.3s'}`}}><div className="overflow-hidden"><div className="space-y-2 pb-1">{children}</div></div></div></section>}

function Table(){const lp=useDataSettings().league;const r=useApi('standings',lp?{league:lp}:{},{ttl:3600000});return <Async s={r}><StandingsView groups={r.data&&normStandings(r.data)}/></Async>}
export function StandingsView({groups}){
 const Head=()=><div className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem_3rem_3rem] gap-2 px-4 py-2.5 text-[10px] uppercase tracking-wider text-mute border-b border-line"><span>#</span><span>Club</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GF</span><span>GA</span><span>GD</span><span>Pts</span></div>;
 return <>{groups&&groups.some(g=>g.rows.length)?<div className="space-y-5">{groups.filter(g=>g.rows.length).map((g,gi)=><div key={gi}>{groups.length>1&&g.name&&<p className="text-xs font-bold uppercase tracking-wider text-mute mb-2">{g.name}</p>}<div className="rounded-2xl border border-line bg-card overflow-x-auto"><div className="min-w-[520px]"><Head/>
  <div className="divide-y divide-line">{g.rows.map(t=><div key={t.teamId} className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem_3rem_3rem] gap-2 px-4 py-2.5 items-center text-sm"><span className="text-mute tabular-nums">{t.rank}</span><span className="flex items-center gap-2 min-w-0"><TeamLogo t={t} s={22}/><span className="truncate font-semibold">{t.name}</span></span><span className="tabular-nums">{t.played??'–'}</span><span className="tabular-nums">{t.win??'–'}</span><span className="tabular-nums">{t.draw??'–'}</span><span className="tabular-nums">{t.lose??'–'}</span><span className="tabular-nums">{t.gf??'–'}</span><span className="tabular-nums">{t.ga??'–'}</span><span className="tabular-nums">{t.diff??'–'}</span><span className="font-extrabold tabular-nums">{t.points??'–'}</span></div>)}</div></div></div></div>)}</div>
  :<Empty title="No standings returned" body="The provider has no table for this competition and season. You can change the season in Settings."/>}</>}

export function CompetitionChips({all,onAll}){
 const {league}=useDataSettings();const L=useLeagueList();
 if(L.loading||!L.list.length)return null;
 const cur=all?'all':(league||String(L.list[0].id)),chip=on=>`whitespace-nowrap inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition ${on?'bg-lime text-ink border-lime':'border-line text-mute hover:text-white'}`;
 return <div role="tablist" aria-label="Competition" className="flex gap-2 overflow-x-auto no-scrollbar mb-4">{onAll&&L.list.length>1&&<button role="tab" aria-selected={cur==='all'} onClick={()=>onAll(true)} className={chip(cur==='all')}>All</button>}{L.list.map(l=>{const on=String(l.id)===cur;return <button key={l.id} role="tab" aria-selected={on} onClick={()=>{setLeague(l.id);onAll&&onAll(false)}} className={chip(on)}>{l.logo&&<img src={l.logo} alt="" referrerPolicy="no-referrer" className="w-4 h-4 object-contain"/>}{l.name}</button>})}</div>}

const FILTER={Live:m=>m.st==='live',Upcoming:m=>m.st==='upcoming',Finished:m=>m.st==='ft'};
// day -> competition -> matches. Competitions keep the order of HIGHLIGHTLY_LEAGUES.
function build(list,order){const days=[];
 list.forEach(m=>{const dk=m.ts?iso(new Date(m.ts*1000)):'tbc';let d=days.find(x=>x.key===dk);if(!d){d={key:dk,label:m.ts?new Date(m.ts*1000).toLocaleDateString([], {weekday:'long',day:'numeric',month:'long'}):'Date to be confirmed',groups:[]};days.push(d)}
  const gid=String(m.lgId??m.lg);let g=d.groups.find(x=>x.id===gid);if(!g){g={id:gid,name:m.lg||'Competition',logo:m.lgLogo,country:m.country,items:[]};d.groups.push(g)}g.items.push(m)});
 days.forEach(d=>d.groups.sort((a,b)=>order(a.id)-order(b.id)));return days}

export function LiveMatches(){
 const {favs}=useContext(Ctx);
 const [view,setView]=useState('Today'),[date,setDate]=useState(''),[more,setMore]=useState(3),[all,setAll]=useState(false),[collapsed,setCollapsed]=useStored('matchiq.collapsedGroups',[]);const {league}=useDataSettings();
 const cfg=useApi('config',{},{ttl:600000});const ids=(cfg.data&&cfg.data.leagues)||[];
 const shift=n=>{const d=date?new Date(date+'T12:00:00'):new Date();d.setDate(d.getDate()+n);setDate(iso(d))};
 const table=view==='Table'&&!date,fav=view==='Favourites'&&!date,liveView=view==='Live'&&!date,range=!date&&(view==='Upcoming'||view==='Finished'),allMode=all&&!table&&!fav&&ids.length>1;
 // Highlightly's /matches takes one date and one competition, so ranges and "All" are built from separate requests (each cached and shared).
 const dates=date?[date]:view==='Yesterday'?[dayStr(-1)]:view==='Today'||liveView?[dayStr(0)]:view==='Upcoming'?Array.from({length:more},(_,i)=>dayStr(i+1)):view==='Finished'?Array.from({length:more},(_,i)=>dayStr(-i)):[];
 const r=useMatchDays(dates,{enabled:!table&&!fav,leagues:allMode?ids:undefined,live:liveView,ttl:view==='Upcoming'&&!date?3600000:300000,poll:liveView?(allMode?120000:60000):undefined});
 const favs0=Object.values(favs).map(m=>rehydrate({...m})).sort((a,b)=>(a.ts||0)-(b.ts||0)),favList=useRefreshed(favs0);
 let list=fav?favList:r.list;if(!date&&FILTER[view])list=list.filter(FILTER[view]);if(view==='Finished'&&!date)list=[...list].reverse();
 const order=id=>{const i=ids.indexOf(String(id));return i<0?99:i},days=build(list,order);
 const toggle=k=>setCollapsed(c=>c.includes(k)?c.filter(x=>x!==k):[...c,k]);
 const body=<>{days.map(d=><div key={d.key}>{days.length>1&&<p className="text-xs font-bold uppercase tracking-wider text-mute mb-1 mt-6 first:mt-0">{d.label}</p>}{d.groups.map(g=><Group key={d.key+g.id} g={g} open={!collapsed.includes(g.id)} onToggle={()=>toggle(g.id)}>{g.items.map(m=><MatchRow key={m.id} m={m}/>)}</Group>)}</div>)}</>;
 const noLeagues=cfg.data&&cfg.data.configured!==false&&cfg.data.leagues&&!cfg.data.leagues.length;
 return <div>
  {cfg.data&&cfg.data.configured===false&&<div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm mb-4">The server has no API key yet, so football data cannot load. See SETUP.md.</div>}
  {noLeagues&&<div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm mb-4">{cfg.data.leaguesRejected&&cfg.data.leaguesRejected.length?`HIGHLIGHTLY_LEAGUES contains values that are not numeric ids: ${cfg.data.leaguesRejected.join(', ')}. Use the numeric league ids, separated by commas.`:'No competitions are enabled yet. Set HIGHLIGHTLY_LEAGUES on the server and restart it (see SETUP.md).'}</div>}
  {!fav&&<CompetitionChips all={allMode} onAll={table?undefined:setAll}/>}
  <div className="flex flex-wrap items-center gap-3 mb-5"><div role="tablist" aria-label="Match view" className="flex gap-1 overflow-x-auto no-scrollbar">{VIEWS.map(v=><button key={v} role="tab" aria-selected={view===v&&!date} onClick={()=>{setView(v);setDate('');setMore(3)}} className={`whitespace-nowrap inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold border transition ${view===v&&!date?'bg-lime text-ink border-lime':'border-line text-mute hover:text-white'}`}>{v==='Favourites'&&<I n="star" s={14} fill={view==='Favourites'&&!date}/>}{v}{v==='Favourites'&&Object.keys(favs).length>0&&<span className="text-[10px] font-extrabold opacity-80">{Object.keys(favs).length}</span>}</button>)}</div>
   {!table&&!fav&&<div className="ml-auto flex items-center gap-2 text-xs text-mute"><button onClick={()=>shift(-1)} aria-label="Previous day" className="w-8 h-8 rounded-lg border border-line grid place-items-center hover:text-white"><I n="back" s={14}/></button><input type="date" aria-label="Pick a date" value={date} onChange={e=>setDate(e.target.value)} className="rounded-lg bg-card border border-line px-2.5 py-1.5 text-sm text-white outline-none"/><button onClick={()=>shift(1)} aria-label="Next day" className="w-8 h-8 rounded-lg border border-line grid place-items-center hover:text-white"><I n="right" s={14}/></button>{date&&<button onClick={()=>setDate('')} className="text-sky font-semibold">Clear</button>}</div>}</div>
  {!fav&&!table&&<p className="text-[11px] text-mute mb-3">Kickoff times are shown in your local timezone{tzName()?` (${tzName()})`:''}.{liveView?` Live scores refresh about every ${allMode?2:1} minute${allMode?'s':''}.`:''}{allMode?` Showing all ${ids.length} competitions uses ${ids.length} API requests per day shown. Pick one competition to save requests.`:''}</p>}
  {table?<Table/>:fav?(days.length?body:<Empty icon="star" title="No favourites yet" body="Tap the star on any match to follow it here. Favourites are saved in this browser."/>):<Async s={r}>{r.paging&&r.paging.truncated&&<p className="text-[11px] text-amber-400 mb-3">The provider returned only part of the list for at least one day. Use the date picker to narrow it down.</p>}
   {days.length?body:<Empty title={date?'No matches on this date':EMPTY[view]} body="Only matches returned by the data provider are shown."/>}
   {range&&more<14&&<div className="text-center mt-6"><Btn v="s" onClick={()=>setMore(more+3)}>Show 3 more days</Btn></div>}</Async>}</div>}
