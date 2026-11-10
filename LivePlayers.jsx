import React,{useState,useEffect,useContext} from 'react'
import {Ctx} from './context'
import {useApi} from './footballApi'
import {normPlayerList,normPlayerProfile,normPlayerStats} from './liveData'
import {I} from './Icon'
import {Btn} from './ui'
import {PhotoAvatar,Async,Skeleton,ErrorBox,DataBanner} from './LiveBits'
import {Crumbs,Empty,StatTile} from './PlayerBits'
import {LogoLoader} from './Loader'

// Highlightly exposes players by NAME SEARCH, profile and statistics only (no squads, no top-scorer lists, no per-match ratings).
const useDebounced=(v,ms=600)=>{const [d,setD]=useState(v);useEffect(()=>{const t=setTimeout(()=>setD(v),ms);return()=>clearTimeout(t)},[v]);return d};
const fmt=v=>v==null?'–':Number(v).toLocaleString();
const sel='rounded-xl bg-card border border-line px-3 py-2.5 text-sm font-semibold outline-none focus:border-white/40 min-w-0';
const MIN=3;

function usePlayerSearch(q){const qd=useDebounced(q.trim());const on=qd.length>=MIN;const r=useApi('players',{name:qd},{enabled:on,ttl:1800000});return{r,on,qd,list:on&&r.data?normPlayerList(r.data):[]}}

function Card({p}){const {nav}=useContext(Ctx);
 return <article className="rounded-2xl border border-line bg-card p-5 transition hover:border-white/30 hover:-translate-y-1">
  <div className="flex items-center gap-4"><PhotoAvatar src={p.photo} name={p.name} s={60}/><div className="min-w-0"><h3 className="font-extrabold text-lg leading-tight truncate">{p.name}</h3>{p.fullName&&p.fullName!==p.name&&<p className="text-xs text-mute truncate">{p.fullName}</p>}</div></div>
  <button onClick={()=>nav('lplayer/'+p.id)} aria-label={`View profile: ${p.name}`} className="mt-4 w-full rounded-xl bg-lime text-ink font-bold text-sm py-2.5 transition hover:brightness-110 active:scale-95">View Profile</button></article>}

function Discover(){
 const [q,setQ]=useState('');const {r,on,list}=usePlayerSearch(q);const total=r.paging&&r.paging.totalCount;
 return <div>
  <div className="relative mb-5 max-w-xl"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"><I n="search" s={16}/></span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search players by name (at least 3 letters)" aria-label="Search players" className={`${sel} w-full pl-10`}/></div>
  {!on?<Empty icon="search" title="Search for a player" body="Type a name to look up real player profiles and statistics from the data provider. The provider does not offer club squad lists or top-scorer tables."/>
  :<Async s={r}>{list.length?<><p className="text-sm text-mute mb-4">{total!=null&&total>list.length?`Showing ${list.length} of ${total} players. Refine your search to narrow it down.`:`${list.length} player${list.length===1?'':'s'}`}</p><div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{list.map(p=><Card key={p.id} p={p}/>)}</div></>:<Empty title="No players found" body="Try a different spelling or a longer name."/>}</Async>}</div>}

// latest season present in perCompetition, aggregated over every competition of that season
const latest=st=>{if(!st||!st.perCompetition.length)return null;const rows=st.perCompetition.filter(r=>r.season);if(!rows.length)return null;
 const key=s=>{const n=parseInt(s,10);return Number.isNaN(n)?-1:n};const top=rows.reduce((m,r)=>key(r.season)>key(m)?r.season:m,rows[0].season),sel_=rows.filter(r=>r.season===top);
 const sum=k=>sel_.every(r=>r[k]==null)?null:sel_.reduce((a,r)=>a+(r[k]||0),0);
 return{season:top,competitions:sel_.length,apps:sum('apps'),minutes:sum('minutes'),goals:sum('goals'),assists:sum('assists'),yellow:sum('yellow'),red:sum('red'),cleanSheets:sum('cleanSheets'),conceded:sum('conceded')}};
const p90=(v,m)=>v==null||!m?null:Math.round(v/m*90*100)/100;

function PickBox({label,id,onPick}){
 const [q,setQ]=useState('');const {r,on,list}=usePlayerSearch(q);const cur=useApi('player',{id},{enabled:!!id,ttl:86400000});const name=cur.data&&cur.data[0]&&cur.data[0].name;
 return <div className="relative"><p className="text-xs font-bold uppercase tracking-wider text-mute mb-1.5">{label}{name?` · ${name}`:''}</p>
  <input value={q} onChange={e=>setQ(e.target.value)} placeholder={id?'Search to change player…':'Search a player…'} aria-label={label} className={`${sel} w-full`}/>
  {on&&<div className="absolute z-20 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-xl border border-line bg-bg2 shadow-xl divide-y divide-line">{r.loading&&!r.data?<p className="p-3 text-xs text-mute flex items-center gap-2"><LogoLoader size={18} label="Searching"/>Searching…</p>:list.length?list.slice(0,10).map(p=><button key={p.id} onClick={()=>{onPick(p.id);setQ('')}} className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-white/5"><PhotoAvatar src={p.photo} name={p.name} s={28}/><span className="truncate font-semibold">{p.name}</span></button>):<p className="p-3 text-xs text-mute">No players found.</p>}</div>}</div>}

function usePlayer(id){const p=useApi('player',{id},{enabled:!!id,ttl:86400000}),s=useApi('playerStats',{id},{enabled:!!id,ttl:86400000});
 return{p,s,prof:p.data&&p.data[0]?normPlayerProfile(p.data[0]):null,stats:s.data&&s.data[0]?normPlayerStats(s.data[0]):null}}
const Head=({prof,L,nav})=><div className="text-center"><div className="flex justify-center"><PhotoAvatar src={prof.photo} name={prof.name} s={72}/></div><p className="font-extrabold mt-3">{prof.name}</p><p className="text-xs text-mute mt-1">{[prof.position,prof.club].filter(Boolean).join(' · ')||'Details not provided'}</p><p className="text-[11px] text-mute mt-1">{L?`Season ${L.season}`:'No statistics provided'}</p><button onClick={()=>nav('lplayer/'+prof.id)} className="mt-3 text-xs font-bold text-sky hover:underline">View profile</button></div>;
const ROWS=[['apps','Appearances','count'],['minutes','Minutes played','count'],['goals','Goals','rate'],['assists','Assists','rate'],['yellow','Yellow cards','count'],['red','Red cards','count']];

function Compare({a,b}){
 const {nav}=useContext(Ctx);const [mode,setMode]=useState('tot');const go=(x,y)=>nav(`players/compare/${x||'-'}/${y||'-'}`);
 const ida=a&&a!=='-'?a:'',idb=b&&b!=='-'?b:'';
 const PA=usePlayer(ida),PB=usePlayer(idb);const la=latest(PA.stats),lb=latest(PB.stats);
 const val=(L,k,kind)=>L?(kind==='rate'&&mode==='p90'?p90(L[k],L.minutes):L[k]):null;
 return <div>
  <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end"><PickBox label="Player A" id={ida} onPick={x=>go(x,idb)}/><button onClick={()=>go(idb,ida)} aria-label="Swap players" className="mx-auto rounded-full border border-line bg-card w-10 h-10 grid place-items-center hover:border-white/40 transition"><I n="right" s={16}/></button><PickBox label="Player B" id={idb} onPick={x=>go(ida,x)}/></div>
  {!ida||!idb?<div className="mt-6"><Empty icon="users" title="Pick two players to compare" body="Search for each player above. Statistics come from the data provider (latest season, all competitions combined)."/></div>
  :(PA.p.loading||PB.p.loading||PA.s.loading||PB.s.loading)&&!(PA.prof&&PB.prof)?<div className="mt-6"><Skeleton n={2} h="h-40"/></div>
  :!PA.prof||!PB.prof?<div className="mt-6"><ErrorBox e={PA.p.error||PB.p.error||{code:'provider',message:'One of the players could not be loaded.'}} retry={()=>{PA.p.reload();PB.p.reload()}}/></div>
  :<div className="mt-6 rounded-3xl border border-line bg-card p-5 sm:p-7"><div className="grid grid-cols-2 gap-4"><Head prof={PA.prof} L={la} nav={nav}/><Head prof={PB.prof} L={lb} nav={nav}/></div>
   <div className="flex flex-wrap items-center justify-between gap-3 mt-7 mb-4"><p className="text-xs text-mute">Latest season, all competitions combined · provider data</p><div role="group" aria-label="Value mode" className="inline-flex rounded-full border border-line bg-bg2 p-1">{[['tot','Totals'],['p90','Per 90']].map(([k,l])=><button key={k} aria-pressed={mode===k} onClick={()=>setMode(k)} className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${mode===k?'bg-lime text-ink':'text-mute'}`}>{l}</button>)}</div></div>
   {!la&&!lb?<p className="text-sm text-mute text-center py-6">The provider returned no statistics for either player.</p>:<div className="space-y-5">{ROWS.map(([k,label,kind])=>{const x=val(la,k,kind),y=val(lb,k,kind),sc=Math.max(x||0,y||0,.0001),f=v=>v==null?'–':mode==='p90'&&kind==='rate'?Number(v).toFixed(2):Number(v).toLocaleString();
    return <div key={k}><p className="text-center text-xs text-mute mb-1.5">{label}{kind==='rate'&&mode==='p90'?' · per 90':''}</p><div className="grid grid-cols-[3.5rem_1fr_1fr_3.5rem] items-center gap-2"><span className={`text-right text-sm tabular-nums ${(x||0)>=(y||0)?'font-extrabold':'text-mute'}`}>{f(x)}</span><div className="h-2.5 rounded-l-full bg-bg2 flex justify-end overflow-hidden"><div className="h-full rounded-l-full transition-all duration-500" style={{width:(x||0)/sc*100+'%',background:'#34D399'}}/></div><div className="h-2.5 rounded-r-full bg-bg2 overflow-hidden"><div className="h-full rounded-r-full transition-all duration-500" style={{width:(y||0)/sc*100+'%',background:'#5AA9FF'}}/></div><span className={`text-sm tabular-nums ${(y||0)>=(x||0)?'font-extrabold':'text-mute'}`}>{f(y)}</span></div></div>})}</div>}
   <p className="text-[11px] text-mute mt-6">Seasons may differ between the two players. Missing values show "–" and are never estimated.</p></div>}</div>}

export function LivePlayersPage({sub,a,b}){
 const {nav}=useContext(Ctx);const cmp=sub==='compare';
 return <div>
  <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-card to-bg2 p-6 sm:p-9 mb-6"><div className="glow absolute inset-0 pointer-events-none"/><h1 className="relative text-3xl sm:text-5xl font-extrabold tracking-tight">Player Intelligence</h1><p className="relative text-mute mt-3 max-w-xl">Explore real player profiles and career statistics.</p></div>
  <div role="tablist" className="flex gap-1 border-b border-line mb-6">{[['Discover',''],['Compare players','/compare']].map(([l,s])=><button key={l} role="tab" aria-selected={(s==='/compare')===cmp} onClick={()=>nav('players'+s)} className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition ${(s==='/compare')===cmp?'border-lime text-white':'border-transparent text-mute hover:text-white'}`}>{l}</button>)}</div>
  {cmp?<Compare a={a} b={b}/>:<Discover/>}</div>}

const Sec=({t,children})=><div className="rounded-2xl border border-line bg-card p-5"><p className="font-bold mb-3">{t}</p>{children}</div>;
export function LivePlayerProfile({id}){
 const {nav}=useContext(Ctx);const valid=/^\d+$/.test(String(id||''));const {p,s,prof,stats}=usePlayer(valid?id:'');
 if(!valid)return <div><Crumbs items={[{l:'Player Intelligence',go:'players'},{l:'Not found'}]}/><Empty icon="alert" title="Invalid player" body="That player id is not valid."><Btn onClick={()=>nav('players')}>Back to Player Intelligence</Btn></Empty></div>;
 if(p.loading&&!p.data)return <Skeleton n={3} h="h-40"/>;
 if(p.error&&!p.data)return <ErrorBox e={p.error} retry={p.reload}/>;
 if(!prof)return <div><Crumbs items={[{l:'Player Intelligence',go:'players'},{l:'Not found'}]}/><Empty icon="alert" title="Player not found" body="The provider returned no player for this id."><Btn onClick={()=>nav('players')}>Back to Player Intelligence</Btn></Empty></div>;
 const L=latest(stats),facts=[['Age',prof.age!=null?prof.age:null],['Date of birth',prof.birthDate],['Nationality',prof.nationality],['Position',[prof.position,prof.secondaryPosition].filter(Boolean).join(' / ')||null],['Current club',prof.club],['Joined',prof.joinedAt],['Contract expires',prof.contractExpiry],['Height',prof.height],['Preferred foot',prof.foot]];
 const comp=stats?[...stats.perCompetition].sort((x,y)=>(parseInt(y.season,10)||0)-(parseInt(x.season,10)||0)):[];
 return <div>
  <Crumbs items={[{l:'Player Intelligence',go:'players'},{l:prof.club||'Players',go:'players'},{l:prof.name}]}/>
  <DataBanner s={p} label="Live data · player profile"/>
  <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-card to-bg2 p-6 sm:p-9"><div className="flex flex-col sm:flex-row sm:items-center gap-6"><PhotoAvatar src={prof.photo} name={prof.name} s={110}/>
   <div className="flex-1 min-w-0"><h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{prof.name}</h1>{prof.fullName&&prof.fullName!==prof.name&&<p className="text-sm text-mute mt-1">{prof.fullName}</p>}
    <p className="text-sm text-mute mt-2">{[prof.position,prof.club,prof.nationality,prof.age!=null?`Age ${prof.age}`:null].filter(Boolean).join(' · ')||'Profile details were not provided.'}</p></div></div>
   <div className="flex flex-wrap gap-3 mt-6"><Btn v="s" onClick={()=>nav('players/compare/'+prof.id+'/-')}>Compare player</Btn><Btn v="s" onClick={()=>nav('players')}>Search players</Btn></div></div>
  <h2 className="font-extrabold text-lg mt-8 mb-3">{L?`Season ${L.season} · all competitions`:'Season statistics'}</h2>
  {s.loading&&!s.data?<Skeleton n={1} h="h-24"/>:L?<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[['Appearances',L.apps],['Minutes',L.minutes],['Goals',L.goals,p90(L.goals,L.minutes)],['Assists',L.assists,p90(L.assists,L.minutes)],['Yellow cards',L.yellow],['Red cards',L.red],['Clean sheets',L.cleanSheets],['Goals conceded',L.conceded]].filter(r=>r[1]!=null).map(([l,v,pp])=><StatTile key={l} l={l} v={fmt(v)} sub={pp!=null?`${pp.toFixed(2)} per 90`:undefined}/>)}</div>:<Empty icon="clock" title="No statistics available" body={s.error?'The statistics request failed. Try again later.':'The provider has no statistics for this player.'}/>}
  <h2 className="font-extrabold text-lg mt-8 mb-3">Profile</h2>
  <div className="rounded-2xl border border-line bg-card divide-y divide-line">{facts.map(([l,v])=><div key={l} className="flex justify-between gap-4 px-4 py-3 text-sm"><span className="text-mute">{l}</span><span className={`font-semibold text-right ${v?'':'text-mute font-normal'}`}>{v??'Not provided'}</span></div>)}<div className="flex justify-between gap-4 px-4 py-3 text-sm"><span className="text-mute">Shirt number</span><span className="text-mute text-right">Shown in match lineups only</span></div></div>
  {comp.length>0&&<><h2 className="font-extrabold text-lg mt-8 mb-3">By competition</h2><div className="rounded-2xl border border-line bg-card overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="text-[10px] uppercase tracking-wider text-mute border-b border-line"><th className="text-left px-4 py-2.5">Competition</th><th className="px-2 text-left">Season</th><th className="px-2">Apps</th><th className="px-2">Mins</th><th className="px-2">G</th><th className="px-2">A</th><th className="px-2">YC</th><th className="px-2">RC</th></tr></thead>
   <tbody className="divide-y divide-line">{comp.map((r,i)=><tr key={i}><td className="px-4 py-2.5"><b className="block font-semibold">{r.league||'–'}</b><span className="text-[10px] text-mute">{r.club}</span></td><td className="px-2 text-mute">{r.season||'–'}</td>{[r.apps,r.minutes,r.goals,r.assists,r.yellow,r.red].map((v,k)=><td key={k} className="px-2 text-center tabular-nums">{fmt(v)}</td>)}</tr>)}</tbody></table></div></>}
  {prof.transfers.length>0&&<><h2 className="font-extrabold text-lg mt-8 mb-3">Recent transfers</h2><Sec t="Most recent first (as returned by the provider)"><div className="divide-y divide-line">{prof.transfers.slice(0,5).map((t,i)=><div key={i} className="py-2.5 flex flex-wrap justify-between gap-2 text-sm"><span><b>{t.from}</b> → <b>{t.to}</b></span><span className="text-mute text-xs">{[t.type,t.season,t.fee].filter(Boolean).join(' · ')}</span></div>)}</div></Sec></>}
  {prof.injuries.length>0&&<><h2 className="font-extrabold text-lg mt-8 mb-3">Injury history</h2><Sec t="Provider records"><div className="divide-y divide-line">{prof.injuries.slice(0,5).map((t,i)=><div key={i} className="py-2.5 flex flex-wrap justify-between gap-2 text-sm"><span className="font-semibold">{t.reason}</span><span className="text-mute text-xs">{[t.season,t.missedGames!=null?`${t.missedGames} games missed`:null].filter(Boolean).join(' · ')}</span></div>)}</div></Sec></>}
 </div>}
