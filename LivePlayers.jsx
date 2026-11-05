import React,{useState,useEffect,useContext} from 'react'
import {Ctx} from './context'
import {api,useApi} from './footballApi'
import {normPlayers,normPlayer,normFixtures,normFixturePlayers,pickStats,ratingText,per90} from './liveData'
import {I} from './Icon'
import {Btn} from './ui'
import {TeamLogo,PhotoAvatar,Async,Skeleton,ErrorBox,DataBanner,errText} from './LiveBits'
import {Crumbs,Empty,StatTile} from './PlayerBits'

const POS=['All','Goalkeeper','Defender','Midfielder','Attacker'];
const sel='rounded-xl bg-card border border-line px-3 py-2.5 text-sm font-semibold outline-none focus:border-white/40 min-w-0';
const useDebounced=(v,ms=600)=>{const [d,setD]=useState(v);useEffect(()=>{const t=setTimeout(()=>setD(v),ms);return()=>clearTimeout(t)},[v]);return d};
const useLeagues=()=>{const c=useApi('config',{},{ttl:600000});return (c.data&&c.data.leagues)||['39']};
const fmt=v=>v==null?'–':Number(v).toLocaleString();
const Rating=({v})=>v==null?<span className="text-[10px] text-mute border border-line rounded-lg px-2 py-1 text-center leading-tight">Rating<br/>unavailable</span>:<span className="inline-flex flex-col items-center rounded-xl px-2.5 py-1 border border-sky/40 bg-sky/10 text-sky shrink-0"><b className="text-lg leading-none tabular-nums">{Number(v).toFixed(2)}</b><span className="text-[8px] uppercase tracking-wider mt-0.5">provider</span></span>;

function Card({p,leagues}){const {nav}=useContext(Ctx);const s=pickStats(p,leagues)||{};
 return <article className="rounded-2xl border border-line bg-card p-5 transition hover:border-white/30 hover:-translate-y-1">
  <div className="flex items-start justify-between gap-3"><PhotoAvatar src={p.photo} name={p.name} s={60}/><Rating v={s.rating}/></div>
  <h3 className="mt-4 font-extrabold text-lg leading-tight">{p.name}</h3>
  <p className="text-xs text-mute mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">{s.teamName&&<span className="flex items-center gap-1.5"><TeamLogo t={{name:s.teamName,logo:s.teamLogo}} s={16}/>{s.teamName}</span>}{s.position&&<><span>·</span><span>{s.position}</span></>}</p>
  <p className="text-xs text-mute mt-1">{[p.nationality,s.number!=null?`#${s.number}`:null,p.age!=null?`Age ${p.age}`:null].filter(Boolean).join(' · ')}</p>
  <p className="text-[10px] text-mute mt-2">{s.leagueName||'Competition n/a'}{s.season?` · ${s.season}`:''}</p>
  <div className="grid grid-cols-4 gap-2 mt-3 text-center">{[['Apps',s.apps],['Goals',s.goals],['Assists',s.assists],['Mins',s.minutes]].map(([l,v])=><div key={l} className="rounded-lg bg-bg2 border border-line py-2"><p className="text-sm font-extrabold tabular-nums">{fmt(v)}</p><p className="text-[9px] uppercase tracking-wider text-mute">{l}</p></div>)}</div>
  <button onClick={()=>nav('lplayer/'+p.id)} aria-label={`View profile: ${p.name}`} className="mt-4 w-full rounded-xl bg-lime text-ink font-bold text-sm py-2.5 transition hover:brightness-110 active:scale-95">View Profile</button></article>}

function Discover(){
 const leagues=useLeagues(),teams=useApi('teams',{},{ttl:86400000});
 const [club,setClub]=useState(''),[q,setQ]=useState(''),[page,setPage]=useState(1),[pos,setPos]=useState('All'),[sort,setSort]=useState('rating'),[src,setSrc]=useState('topscorers');
 const qd=useDebounced(q.trim()),searching=qd.length>=4;
 const act=searching||club?'players':src;const params=searching?{search:qd}:club?{team:club,page}:{};
 const r=useApi(act,params,{ttl:3600000});
 let list=normPlayers(r.data).filter(p=>pos==='All'||((pickStats(p,leagues)||{}).position)===pos);
 const val=p=>{const s=pickStats(p,leagues)||{};return sort==='rating'?s.rating:sort==='goals'?s.goals:sort==='assists'?s.assists:s.apps};
 list=[...list].sort((a,b)=>(val(b)??-1)-(val(a)??-1));
 const tl=(teams.data||[]).map(x=>({id:x.team.id,name:x.team.name})).sort((a,b)=>a.name.localeCompare(b.name));
 return <div>
  <div className="rounded-2xl border border-line bg-card p-3 sm:p-4 mb-5 grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-3">
   <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-mute"><I n="search" s={16}/></span><input value={q} onChange={e=>{setQ(e.target.value);setPage(1)}} placeholder="Search players (4+ letters)" aria-label="Search players" className={`${sel} w-full pl-10`}/></div>
   <select value={club} onChange={e=>{setClub(e.target.value);setPage(1)}} aria-label="Club" className={sel}><option value="">Top players</option>{tl.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
   <select value={pos} onChange={e=>setPos(e.target.value)} aria-label="Position" className={sel}>{POS.map(p=><option key={p} value={p}>{p==='All'?'All positions':p}</option>)}</select>
   <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort by" className={sel}><option value="rating">Highest rating</option><option value="goals">Most goals</option><option value="assists">Most assists</option><option value="apps">Most appearances</option></select>
   <select value={src} onChange={e=>setSrc(e.target.value)} disabled={searching||!!club} aria-label="Top list" className={`${sel} disabled:opacity-40`}><option value="topscorers">Top scorers</option><option value="topassists">Top assists</option></select></div>
  <p className="text-[11px] text-mute mb-4">{searching?`Search results for “${qd}”`:club?'Squad statistics from the provider (20 per page)':'The provider’s top 20 list for the selected season'}. Ratings are the provider’s ratings, shown as returned. Each new search or club uses API requests, so results are cached.</p>
  {q.trim().length>0&&q.trim().length<4&&<p className="text-xs text-amber-400 mb-3">Type at least 4 letters to search (provider requirement).</p>}
  <Async s={r}>{list.length?<><div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{list.map(p=><Card key={p.id} p={p} leagues={leagues}/>)}</div>
   {r.paging&&r.paging.total>1&&<div className="flex items-center justify-center gap-3 mt-6"><Btn v="s" onClick={()=>setPage(Math.max(1,page-1))} className={page<=1?'opacity-40 pointer-events-none':''}>Previous</Btn><span className="text-sm text-mute">Page {r.paging.current} of {r.paging.total}</span><Btn v="s" onClick={()=>setPage(page+1)} className={page>=r.paging.total?'opacity-40 pointer-events-none':''}>Next</Btn></div>}</>
   :<Empty title="No players to show" body={searching?'The provider found nobody for that search in this season.':'The provider returned no players for this selection.'}/>}</Async></div>}

const bar=(x,y,sc)=>[x==null?0:x/sc*100,y==null?0:y/sc*100];
const METRICS=[['rating','Provider rating','rating'],['apps','Appearances','count'],['minutes','Minutes played','count'],['goals','Goals','rate'],['assists','Assists','rate'],['sot','Shots on target','rate'],['keyPasses','Key passes','rate'],['passAcc','Pass accuracy (as provided)','pct'],['saves','Saves','rate']];
function PickBox({label,id,onPick}){
 const [q,setQ]=useState('');const qd=useDebounced(q.trim());const r=useApi('players',{search:qd},{enabled:qd.length>=4&&!id,ttl:3600000});const list=normPlayers(r.data).slice(0,6);
 if(id)return <button onClick={()=>onPick('')} className="text-xs text-sky font-semibold hover:underline">Change {label}</button>;
 return <div><input value={q} onChange={e=>setQ(e.target.value)} placeholder={`Search ${label} (4+ letters)`} aria-label={`Search ${label}`} className={`${sel} w-full`}/>
  {qd.length>=4&&<div className="mt-2 rounded-xl border border-line bg-card divide-y divide-line">{r.loading&&!r.data?<p className="p-3 text-xs text-mute">Searching…</p>:r.error&&!r.data?<p className="p-3 text-xs text-red-400">{errText(r.error)}</p>:list.length?list.map(p=>{const s=pickStats(p,[])||{};return <button key={p.id} onClick={()=>onPick(String(p.id))} className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-white/5"><PhotoAvatar src={p.photo} name={p.name} s={32}/><span className="text-sm font-semibold flex-1 truncate">{p.name}</span><span className="text-[11px] text-mute">{s.teamName}</span></button>}):<p className="p-3 text-xs text-mute">No players found.</p>}</div>}</div>}

function Compare({a,b}){
 const {nav}=useContext(Ctx);const leagues=useLeagues(),[mode,setMode]=useState('tot');
 const ida=a&&a!=='-'?a:'',idb=b&&b!=='-'?b:'';
 const ra=useApi('players',{id:ida},{enabled:!!ida,ttl:3600000}),rb=useApi('players',{id:idb},{enabled:!!idb,ttl:3600000});
 const pa=normPlayer(ra.data&&ra.data[0]),pb=normPlayer(rb.data&&rb.data[0]),sa=pickStats(pa,leagues),sb=pickStats(pb,leagues);
 const go=(x,y)=>nav(`players/compare/${x||'-'}/${y||'-'}`);
 const same=sa&&sb&&sa.position===sb.position,gk=[sa,sb].filter(s=>s&&s.position==='Goalkeeper').length;
 const keys=gk===2?['rating','apps','minutes','saves']:gk===1?['rating','apps','minutes']:['rating','apps','minutes','goals','assists','sot','keyPasses','passAcc'];
 const Head=({p,s})=>p&&s?<div className="text-center"><div className="flex justify-center"><PhotoAvatar src={p.photo} name={p.name} s={72}/></div><p className="font-extrabold mt-3">{p.name}</p><p className="text-xs text-mute flex items-center justify-center gap-1.5 mt-1"><TeamLogo t={{name:s.teamName,logo:s.teamLogo}} s={16}/>{s.teamName} · {s.position||'position n/a'}</p><p className="text-[10px] text-mute mt-1">{s.leagueName} {s.season}</p><div className="mt-3 flex justify-center"><Rating v={s.rating}/></div><button onClick={()=>nav('lplayer/'+p.id)} className="mt-3 text-xs font-bold text-sky hover:underline">View profile</button></div>:null;
 return <div>
  <div className="grid sm:grid-cols-2 gap-4"><div><PickBox label="player A" id={ida} onPick={v=>go(v,idb)}/></div><div><PickBox label="player B" id={idb} onPick={v=>go(ida,v)}/></div></div>
  {(!ida||!idb)?<div className="mt-6"><Empty title="Choose two players" body="Search for a player on each side. Statistics come from the provider for the selected season."/></div>
  :(ra.loading&&!ra.data)||(rb.loading&&!rb.data)?<div className="mt-6"><Skeleton n={2} h="h-40"/></div>
  :(ra.error&&!ra.data)||(rb.error&&!rb.data)?<div className="mt-6"><ErrorBox e={ra.error||rb.error} retry={()=>{ra.reload();rb.reload()}}/></div>
  :!sa||!sb?<div className="mt-6"><Empty title="No statistics returned" body="The provider has no season statistics for one of these players."/></div>
  :<div className="mt-6">
   {!same&&<div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm">These players have different positions, so only broadly comparable metrics are shown. Interpret with care.</div>}
   {(sa.leagueId!==sb.leagueId||sa.season!==sb.season)&&<div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm">The statistics come from different competitions or seasons ({sa.leagueName} {sa.season} vs {sb.leagueName} {sb.season}).</div>}
   <div className="rounded-3xl border border-line bg-card p-5 sm:p-7"><div className="grid grid-cols-2 gap-4"><Head p={pa} s={sa}/><Head p={pb} s={sb}/></div>
    <div className="flex items-center justify-between gap-3 mt-7 mb-4"><p className="text-xs text-mute">Provider data · missing values are not charted</p><div role="group" aria-label="Value mode" className="inline-flex rounded-full border border-line bg-bg2 p-1">{[['tot','Totals'],['p90','Per 90']].map(([k,l])=><button key={k} aria-pressed={mode===k} onClick={()=>setMode(k)} className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${mode===k?'bg-lime text-ink':'text-mute'}`}>{l}</button>)}</div></div>
    <div className="space-y-5">{keys.map(k=>{const [,label,kind]=METRICS.find(m=>m[0]===k);const g=(s)=>kind==='rate'&&mode==='p90'?per90(s[k],s.minutes):s[k],x=g(sa),y=g(sb),sc=kind==='rating'?10:kind==='pct'?100:Math.max(x||0,y||0,.0001),[bx,by]=bar(x,y,sc),f=v=>v==null?'–':kind==='rating'?Number(v).toFixed(2):kind==='rate'&&mode==='p90'?v.toFixed(2):Number(v).toLocaleString();
     return <div key={k}><p className="text-center text-xs text-mute mb-1.5">{label}{kind==='rate'&&mode==='p90'?' · per 90':''}</p><div className="grid grid-cols-[3.5rem_1fr_1fr_3.5rem] items-center gap-2"><span className={`text-right text-sm tabular-nums ${(x??-1)>=(y??-1)?'font-extrabold':'text-mute'}`}>{f(x)}</span><div className="h-2.5 rounded-l-full bg-bg2 flex justify-end overflow-hidden"><div className="h-full rounded-l-full" style={{width:bx+'%',background:'#34D399'}}/></div><div className="h-2.5 rounded-r-full bg-bg2 overflow-hidden"><div className="h-full rounded-r-full" style={{width:by+'%',background:'#5AA9FF'}}/></div><span className={`text-sm tabular-nums ${(y??-1)>=(x??-1)?'font-extrabold':'text-mute'}`}>{f(y)}</span></div></div>})}</div>
    <p className="text-[11px] text-mute mt-6">One shared scale per metric. Provider ratings are out of 10. Per-90 values are calculated from the provider's totals and minutes.</p></div></div>}</div>}

export function LivePlayersPage({sub,a,b}){
 const {nav}=useContext(Ctx);const cmp=sub==='compare';
 return <div>
  <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-card to-bg2 p-6 sm:p-9 mb-6"><h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Player Intelligence</h1><p className="text-mute mt-3 max-w-xl">Explore player performance, form and match impact.</p><p className="text-xs text-mute mt-3">Live data from API-Football</p></div>
  <div role="tablist" className="flex gap-1 border-b border-line mb-6">{[['Discover',''],['Compare players','/compare']].map(([l,s])=><button key={l} role="tab" aria-selected={(s==='/compare')===cmp} onClick={()=>nav('players'+s)} className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition ${(s==='/compare')===cmp?'border-lime text-white':'border-transparent text-mute hover:text-white'}`}>{l}</button>)}</div>
  {cmp?<Compare a={a} b={b}/>:<Discover/>}</div>}

// Recent matches: 1 fixtures request + 1 fixturePlayers request per match (shared cache), only on demand.
function Recent({p,s}){
 const {nav}=useContext(Ctx);const [st,setSt]=useState({state:'idle',rows:[],err:null});
 const run=async()=>{setSt({state:'loading',rows:[],err:null});const rows=[];
  try{const f=await api('fixtures',{team:s.teamId,last:5},{ttl:1800000});const list=normFixtures(f.data).filter(x=>x.status.kind==='finished');
   for(const x of list){const r=await api('fixturePlayers',{fixture:x.id,final:1},{ttl:21600000});const me=normFixturePlayers(r.data).find(q=>q.id===p.id);rows.push({fx:x,me});setSt({state:'loading',rows:[...rows],err:null})}
   setSt({state:'done',rows,err:null})}catch(e){setSt({state:'error',rows,err:e})}};
 const chart=st.rows.slice().reverse();
 return <section className="mt-8"><h2 className="font-extrabold text-lg mb-3">Recent match performances</h2>
  {st.state==='idle'&&<div className="rounded-2xl border border-dashed border-line p-6 text-center"><p className="text-sm text-mute">Loads the last 5 finished matches of {s.teamName} (about 6 API requests, cached afterwards). Match statistics are separate from the season totals above.</p><Btn className="mt-4" onClick={run}>Load recent matches</Btn></div>}
  {st.state==='loading'&&st.rows.length===0&&<Skeleton n={2} h="h-16"/>}
  {st.state==='error'&&<ErrorBox e={st.err} retry={run}/>}
  {st.rows.length>0&&<><div className="rounded-2xl border border-line bg-card overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="text-[10px] uppercase tracking-wider text-mute border-b border-line"><th className="text-left px-4 py-2.5">Match</th>{['Min','Rating','G','A','YC','RC'].map(h=><th key={h} className="px-2 py-2.5 text-center">{h}</th>)}</tr></thead>
   <tbody className="divide-y divide-line">{st.rows.map(({fx,me})=><tr key={fx.id} onClick={()=>nav(`lmatch/${fx.id}/lineups`)} className="hover:bg-white/[0.04] cursor-pointer"><td className="px-4 py-2.5"><span className="block font-semibold">{fx.home.name} {fx.goals.home??'–'}–{fx.goals.away??'–'} {fx.away.name}</span><span className="text-[10px] text-mute">{new Date(fx.timestamp*1000).toLocaleDateString([], {day:'numeric',month:'short',year:'numeric'})}</span></td>{me?[me.min,me.rating!=null?me.rating.toFixed(1):null,me.g,me.a,me.y,me.r].map((v,i)=><td key={i} className="px-2 py-2.5 text-center tabular-nums">{v==null?'–':v}</td>):<td colSpan={6} className="px-2 py-2.5 text-center text-xs text-mute">Did not play / no data</td>}</tr>)}</tbody></table></div>
   <div className="grid sm:grid-cols-2 gap-4 mt-4"><div className="rounded-2xl border border-line bg-card p-5"><p className="font-bold mb-3">Match ratings</p><div className="flex items-end gap-3 h-28">{chart.map(({fx,me})=><div key={fx.id} className="flex-1 flex flex-col items-center justify-end h-full gap-1" title={`${fx.home.name} v ${fx.away.name}`}><span className="text-[10px] font-bold">{me&&me.rating!=null?me.rating.toFixed(1):'–'}</span><div className="w-full rounded-t" style={{height:me&&me.rating!=null?Math.max(4,(me.rating-4)/6*80)+'%':'2px',background:me&&me.rating!=null?'#5AA9FF':'rgb(var(--line))'}}/><span className="text-[9px] text-mute">{(fx.home.id===s.teamId?fx.away:fx.home).name.slice(0,3).toUpperCase()}</span></div>)}</div><p className="text-[11px] text-mute mt-2">Provider ratings; missing ratings are not plotted.</p></div>
    <div className="rounded-2xl border border-line bg-card p-5"><p className="font-bold mb-3">Goals and assists</p><div className="flex items-end gap-3 h-28">{chart.map(({fx,me})=>{const g=me&&me.g||0,a=me&&me.a||0,m=Math.max(1,...chart.map(c=>Math.max(c.me&&c.me.g||0,c.me&&c.me.a||0)));return <div key={fx.id} className="flex-1 flex flex-col items-center justify-end h-full gap-1"><div className="flex items-end gap-0.5 w-full justify-center flex-1">{[[g,'#34D399'],[a,'#5AA9FF']].map(([v,c],i)=><div key={i} className="w-1/2 max-w-[14px] rounded-t" style={{height:v?v/m*80+'%':'2px',background:v?c:'rgb(var(--line))'}}/>)}</div><span className="text-[9px] text-mute">{(fx.home.id===s.teamId?fx.away:fx.home).name.slice(0,3).toUpperCase()}</span></div>})}</div><p className="text-[11px] text-mute mt-2"><span style={{color:'#34D399'}}>■</span> Goals <span style={{color:'#5AA9FF'}} className="ml-2">■</span> Assists</p></div></div></>}</section>}

export function LivePlayerProfile({id}){
 const {nav}=useContext(Ctx);const leagues=useLeagues();const valid=/^\d+$/.test(String(id||''));
 const r=useApi('players',{id},{enabled:valid,ttl:3600000});const [i,setI]=useState(-1);
 if(!valid)return <div><Crumbs items={[{l:'Player Intelligence',go:'players'},{l:'Not found'}]}/><Empty icon="alert" title="Invalid player" body="That player id is not valid."><Btn onClick={()=>nav('players')}>Back</Btn></Empty></div>;
 const p=normPlayer(r.data&&r.data[0]);
 return <div><Crumbs items={[{l:'Player Intelligence',go:'players'},{l:p?((p.stats[0]||{}).teamName||'Club'):'Player',go:'players'},{l:p?p.name:'Profile'}]}/>
  <Async s={r}>{!p||!p.stats.length?<Empty icon="alert" title="No statistics for this player" body="The provider returned no season statistics for this player and season. Try another season in Settings → Data source."><Btn v="s" onClick={()=>nav('players')}>Back to Player Intelligence</Btn></Empty>:(()=>{
   const s=i>=0?p.stats[i]:pickStats(p,leagues),gk=s.position==='Goalkeeper';
   const tiles=[['Appearances',s.apps],['Starts',s.starts],['Minutes played',s.minutes],...(gk?[['Saves',s.saves],['Goals conceded',s.conceded]]:[['Goals',s.goals],['Assists',s.assists],['Shots',s.shots],['Shots on target',s.sot],['Key passes',s.keyPasses],['Pass accuracy (as provided)',s.passAcc],['Tackles',s.tackles],['Successful dribbles',s.dribbles],['Duels won',s.duelsWon]]),['Yellow cards',s.yellow],['Red cards',s.red]].filter(([,v])=>v!=null);
   return <>
   <div className="rounded-3xl border border-line bg-gradient-to-br from-card to-bg2 p-6 sm:p-9"><div className="flex flex-col sm:flex-row sm:items-center gap-6"><PhotoAvatar src={p.photo} name={p.name} s={110}/>
    <div className="flex-1 min-w-0"><h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{p.name}</h1>
     <p className="text-sm text-mute mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5"><span className="flex items-center gap-1.5"><TeamLogo t={{name:s.teamName,logo:s.teamLogo}} s={20}/>{s.teamName}</span>{s.position&&<span>{s.position}</span>}{p.nationality&&<span>{p.nationality}</span>}{s.number!=null&&<span>#{s.number}</span>}{p.age!=null&&<span>Age {p.age}</span>}{p.injured&&<span className="text-amber-400">Flagged injured</span>}</p>
     <p className="text-xs text-mute mt-3">Statistics: <b className="text-white">{s.leagueName||'competition n/a'}</b>{s.season?` · season ${s.season}`:''}</p>
     {p.stats.length>1&&<label className="text-xs text-mute flex items-center gap-2 mt-3">Competition<select value={i} onChange={e=>setI(Number(e.target.value))} className="rounded-lg bg-card border border-line px-2.5 py-1.5 text-sm text-white outline-none"><option value={-1}>Default</option>{p.stats.map((x,k)=><option key={k} value={k}>{x.teamName} · {x.leagueName} {x.season}</option>)}</select></label>}</div>
    <div className="flex sm:flex-col items-center gap-2"><Rating v={s.rating}/><p className="text-[10px] text-mute">{s.rating!=null?'Provider rating':''}</p></div></div>
    <div className="flex flex-wrap gap-3 mt-6"><Btn v="s" onClick={()=>nav(`players/compare/${p.id}/-`)}>Compare player</Btn><Btn v="s" onClick={()=>nav('players')}>All players</Btn></div></div>
   <h2 className="font-extrabold text-lg mt-8 mb-3">Season statistics <span className="text-xs text-mute font-medium">· {s.leagueName} {s.season}</span></h2>
   <DataBanner s={r}/>
   {tiles.length?<div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{tiles.map(([l,v])=><StatTile key={l} l={l} v={fmt(v)} sub={['Goals','Assists','Shots','Shots on target','Key passes','Tackles','Saves'].includes(l)&&per90(v,s.minutes)!=null?`${per90(v,s.minutes).toFixed(2)} per 90`:undefined}/>)}</div>:<Empty title="No season statistics" body="The provider returned no figures for this player."/>}
   <p className="text-[11px] text-mute mt-3">Only values the provider returns are shown. Clean sheets are not part of the provider's player statistics. Per-90 values are calculated from provider totals.</p>
   {s.teamId&&<Recent p={p} s={s}/>}</>})()}</Async></div>}
