import React,{useState,useContext} from 'react'
import {Ctx} from './context'
import {FIXTURES,T} from './data'
import {marketLines} from './data'
import {ME,flag} from './compData'
import {fanPreds} from './socialData'
import {I} from './Icon'
import {Btn,Crest} from './ui'
import {LeagueBadge,StatusPill} from './MatchCard'
import {CommBar} from './MatchDetail'
import {MATCH_DATA} from './matchData'
import {teamName,tone,getPlayer} from './intelHelpers'
import {Crumbs,Empty,DemoTag,TeamBadge,PlayerAvatar,useBrief} from './PlayerBits'
import {LineupView,LineupPending} from './Pitch'

const TABS=[['overview','Overview'],['predictions','Predictions'],['lineups','Lineups'],['stats','Player Stats'],['h2h','Head-to-Head']];
const resLabel=(m,r)=>r==='H'?teamName(m.h)+' win':r==='A'?teamName(m.a)+' win':'Draw';

function Header({m}){return <div className="relative overflow-hidden rounded-3xl border border-line p-5 sm:p-8" style={{background:`linear-gradient(135deg,${T[m.h][1]}30,rgb(var(--card)) 50%,${T[m.a][1]}30)`}}>
 <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-mute"><span className="flex items-center gap-2"><LeagueBadge lg={m.lg}/>{m.lg}</span><StatusPill m={m}/></div>
 <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-6 text-center"><div className="flex flex-col items-center gap-3"><Crest k={m.h} s={72}/><span className="font-extrabold text-sm sm:text-lg">{T[m.h][0]}</span></div>
  {m.st==='upcoming'?<div><p className="text-mute font-bold">VS</p><p className="text-xs text-mute mt-1">{m.t}</p></div>:<div><p className="text-4xl sm:text-5xl font-extrabold tabular-nums">{m.sc[0]}<span className="text-mute mx-1.5">–</span>{m.sc[1]}</p><p className="text-xs text-mute mt-1">{m.st==='live'?`Live demo · ${m.min}'`:'Full time (demo)'}</p></div>}
  <div className="flex flex-col items-center gap-3"><Crest k={m.a} s={72}/><span className="font-extrabold text-sm sm:text-lg">{T[m.a][0]}</span></div></div>
 <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-6 text-xs text-mute"><span className="flex items-center gap-1.5"><I n="clock" s={13}/>{m.t}</span><span className="flex items-center gap-1.5"><I n="pin" s={13}/>{m.venue}</span><DemoTag>Sample match information</DemoTag></div></div>}

const EvIcon=({t})=>t==='goal'?<I n="ball" s={13}/>:t==='yellow'?<span className="w-2.5 h-3.5 rounded-sm bg-yellow-400"/>:<I n="arrow" s={12}/>;
function Timeline({m,ev}){return <div className="rounded-2xl border border-line bg-card p-5"><p className="font-bold mb-4">Match events <span className="text-xs text-mute font-medium">· demo</span></p><div className="space-y-4 border-l border-line ml-3">{[...ev].reverse().map((e,i)=><div key={i} className="relative pl-6"><span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-bg2 border border-line grid place-items-center"><EvIcon t={e[1]}/></span><p className="text-xs text-mute">{e[0]}' · {teamName(e[2]==='h'?m.h:m.a)}</p><p className="text-sm font-semibold">{e[3]}</p></div>)}</div></div>}

function Overview({m,d}){const {openPick,nav}=useContext(Ctx);return <div className="grid lg:grid-cols-2 gap-4">
 <div className="space-y-4"><div className="rounded-2xl border border-line bg-card p-5"><p className="font-bold mb-3">Match facts</p>{[['Competition',m.lg],['Kickoff',m.t],['Venue',m.venue],['Status',m.st==='upcoming'?'Upcoming':m.st==='live'?`Live (demo) · ${m.min}'`:'Finished (demo)']].map(([a,b])=><div key={a} className="flex justify-between gap-4 py-2 border-b border-line last:border-0 text-sm"><span className="text-mute">{a}</span><span className="font-semibold text-right">{b}</span></div>)}</div>
  <div className="rounded-2xl border border-line bg-card p-5"><p className="font-bold mb-3">Community predictions <span className="text-xs text-mute font-medium">· demo</span></p><CommBar m={m}/>{m.st==='upcoming'&&<Btn className="w-full mt-4" onClick={()=>openPick(m)}>Predict this match</Btn>}</div></div>
 {d&&d.events?<Timeline m={m} ev={d.events}/>:<div className="rounded-2xl border border-dashed border-line p-8 text-center text-mute text-sm"><I n="clock" s={24} c="mx-auto mb-2"/>{m.st==='upcoming'?'Match events will appear once the game begins.':'No event timeline in the demo dataset for this match.'}</div>}</div>}

function Predictions({m}){const {openPick,store}=useContext(Ctx);const p=store[m.id],lines=p?marketLines(p,m):[];return <div className="grid lg:grid-cols-2 gap-4">
 <div className="space-y-4"><div className="rounded-2xl border border-line bg-card p-5"><p className="font-bold mb-3">Your prediction</p>{lines.length?<div className="divide-y divide-line">{lines.map(([a,b])=><div key={a} className="flex justify-between py-2 text-sm"><span className="text-mute">{a}</span><span className="font-bold">{b}</span></div>)}</div>:<p className="text-sm text-mute">You have not predicted this match yet.</p>}
  {m.st==='upcoming'?<Btn className="w-full mt-4" onClick={()=>openPick(m)}>{lines.length?'Edit prediction':'Make a prediction'}</Btn>:<p className="text-xs text-mute mt-4 flex items-center gap-1.5"><I n="lock" s={13}/>Predictions closed at kickoff.</p>}</div>
  <div className="rounded-2xl border border-line bg-card p-5"><p className="font-bold mb-3">Community split <span className="text-xs text-mute font-medium">· demo</span></p><CommBar m={m}/><div className="mt-5 space-y-3">{[['Over 2.5 goals',m.comm.o25],['Both teams to score',m.comm.btts]].map(([l,v])=><div key={l}><div className="flex justify-between text-xs mb-1"><span className="text-mute">{l}</span><b>{v}%</b></div><div className="h-1.5 rounded-full bg-bg2"><div className="h-full rounded-full bg-sky" style={{width:v+'%'}}/></div></div>)}</div></div></div>
 <div className="rounded-2xl border border-line bg-card p-5"><p className="font-bold mb-3">Fan predictions <span className="text-xs text-mute font-medium">· sample users</span></p><div className="divide-y divide-line">{fanPreds(m).map(f=><div key={f.u.name} className="flex items-center gap-3 py-3"><span className="text-lg">{flag(f.u.cc)}</span><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{f.u.name}</p><p className="text-xs text-mute">{resLabel(m,f.result)} · {f.conf}% sure</p></div><span className="font-extrabold tabular-nums">{f.score[0]}–{f.score[1]}</span></div>)}</div></div></div>}

const STAT_ROWS=[['poss','Possession','%'],['shots','Shots',''],['sot','Shots on target',''],['corners','Corners',''],['fouls','Fouls',''],['pass','Pass accuracy','%']];
function TeamStats({m,d}){return <div className="rounded-2xl border border-line bg-card p-5 mt-8"><div className="flex items-center justify-between mb-4"><p className="font-extrabold">Team statistics</p>{d&&d.stats&&<DemoTag>Demo statistics</DemoTag>}</div>
 {m.st==='upcoming'?<p className="text-sm text-mute text-center py-6">Match statistics will be available when the game begins.</p>:d&&d.stats?<div className="space-y-4"><div className="flex justify-between text-xs font-bold"><span className="flex items-center gap-2"><TeamBadge code={m.h} s={18}/>{teamName(m.h)}</span><span className="flex items-center gap-2">{teamName(m.a)}<TeamBadge code={m.a} s={18}/></span></div>{STAT_ROWS.map(([k,l,u])=>{const [x,y]=d.stats[k],t=x+y||1;return <div key={k}><div className="flex justify-between text-sm tabular-nums"><b>{x}{u}</b><span className="text-xs text-mute">{l}</span><b>{y}{u}</b></div><div className="flex h-2 gap-1 mt-1.5"><div className="rounded-l-full overflow-hidden bg-bg2 flex justify-end" style={{width:x/t*100+'%'}}><div className="h-full w-full" style={{background:'#34D399'}}/></div><div className="rounded-r-full overflow-hidden bg-bg2" style={{width:y/t*100+'%'}}><div className="h-full w-full" style={{background:'#5AA9FF'}}/></div></div></div>})}</div>:<p className="text-sm text-mute text-center py-6">Team statistics are not included in the demo dataset for this match.</p>}</div>}

function Stats({m,d}){
 const {nav}=useContext(Ctx);const [sort,setSort]=useState('rating'),[side,setSide]=useState('all');
 if(!d||!d.ps)return <Empty icon="clock" title={m.st==='upcoming'?'Player statistics will appear once the match is underway.':'No player statistics in the demo dataset'} body={m.st==='upcoming'?'Nothing is shown before kickoff.':'Open the finished or live sample matches to see this tab in action.'}/>;
 const rows=['H','A'].flatMap(s=>[...d[s].xi,...d[s].bench].filter(p=>d.ps[p.name]).map(p=>({p,s,v:d.ps[p.name]}))).filter(r=>side==='all'||r.s===side);
 const idx={rating:1,goals:2,assists:3,min:0};rows.sort((a,b)=>b.v[idx[sort]]-a.v[idx[sort]]||b.v[1]-a.v[1]);
 const sel='rounded-xl bg-card border border-line px-3 py-2 text-sm font-semibold outline-none';
 return <div><div className="flex flex-wrap items-center gap-3 mb-4"><div role="group" aria-label="Team filter" className="inline-flex rounded-full border border-line bg-card p-1">{[['all','Both'],['H',teamName(m.h)],['A',teamName(m.a)]].map(([k,l])=><button key={k} aria-pressed={side===k} onClick={()=>setSide(k)} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${side===k?'bg-lime text-ink':'text-mute'}`}>{l}</button>)}</div>
  <label className="text-xs text-mute flex items-center gap-2 ml-auto">Sort by<select value={sort} onChange={e=>setSort(e.target.value)} className={sel}><option value="rating">Rating</option><option value="goals">Goals</option><option value="assists">Assists</option><option value="min">Minutes played</option></select></label><DemoTag>Match stats, demo</DemoTag></div>
  <div className="rounded-2xl border border-line bg-card overflow-x-auto"><div className="min-w-[640px]"><div className="grid grid-cols-[1fr_3.5rem_3.5rem_2.5rem_2.5rem_3rem_3rem_3rem_3.5rem] gap-2 px-4 py-2.5 text-[10px] uppercase tracking-wider text-mute border-b border-line"><span>Player</span><span>Min</span><span>Rating</span><span>G</span><span>A</span><span>Shots</span><span>SoT</span><span>Tkl</span><span>Cards</span></div>
  <div className="divide-y divide-line">{rows.map(({p,s,v})=><button key={p.name} disabled={!p.id} onClick={()=>p.id&&nav('player/'+p.id)} className="w-full text-left grid grid-cols-[1fr_3.5rem_3.5rem_2.5rem_2.5rem_3rem_3rem_3rem_3.5rem] gap-2 px-4 py-2.5 items-center text-sm hover:bg-white/[0.04] disabled:hover:bg-transparent transition"><span className="flex items-center gap-2.5 min-w-0"><PlayerAvatar p={{name:p.name,team:s==='H'?m.h:m.a,num:p.num}} s={30} num={false}/><span className="min-w-0"><span className="block font-semibold truncate">{p.name}</span><span className="text-[10px] text-mute">{s==='H'?m.h:m.a} · #{p.num}</span></span></span><span className="tabular-nums">{v[0]}'</span><span className="font-extrabold tabular-nums" style={{color:tone(v[1])}}>{v[1].toFixed(1)}</span><span className="tabular-nums">{v[2]}</span><span className="tabular-nums">{v[3]}</span><span className="tabular-nums">{v[4]}</span><span className="tabular-nums">{v[5]}</span><span className="tabular-nums">{v[6]}</span><span className="flex gap-1">{v[7]>0&&<span className="w-2.5 h-3.5 rounded-sm bg-yellow-400"/>}{v[8]>0&&<span className="w-2.5 h-3.5 rounded-sm bg-red-500"/>}{!v[7]&&!v[8]&&<span className="text-mute">–</span>}</span></button>)}</div></div></div></div>}

function H2H({m,d}){
 if(!d||!d.h2h)return <Empty title="Head-to-head not available" body="This demo match has no head-to-head history."/>;
 let w=0,dr=0,l=0;d.h2h.forEach(([,h,a,hg,ag])=>{const mine=h===m.h?hg:ag,theirs=h===m.h?ag:hg;if(mine>theirs)w++;else if(mine<theirs)l++;else dr++});
 return <div><div className="rounded-2xl border border-line bg-card p-5"><div className="flex items-center justify-between mb-3"><p className="font-bold">Last {d.h2h.length} meetings</p><DemoTag>Demo results</DemoTag></div>
  <div className="grid grid-cols-3 text-center gap-2 mb-3">{[[teamName(m.h)+' wins',w,'#34D399'],['Draws',dr,'#F5C451'],[teamName(m.a)+' wins',l,'#5AA9FF']].map(([a,b,c])=><div key={a}><p className="text-3xl font-extrabold" style={{color:c}}>{b}</p><p className="text-[11px] text-mute">{a}</p></div>)}</div>
  <div className="flex h-2 gap-1 rounded-full overflow-hidden">{[[w,'#34D399'],[dr,'#F5C451'],[l,'#5AA9FF']].map(([n,c],i)=>n>0&&<div key={i} style={{width:n/d.h2h.length*100+'%',background:c}}/>)}</div></div>
  <div className="rounded-2xl border border-line bg-card divide-y divide-line mt-4">{d.h2h.map(([dt,h,a,hg,ag])=><div key={dt} className="grid grid-cols-[5.5rem_1fr_auto_1fr] items-center gap-3 px-4 py-3 text-sm"><span className="text-xs text-mute">{new Date(dt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span><span className="text-right font-semibold truncate">{teamName(h)}</span><span className="font-extrabold tabular-nums">{hg}–{ag}</span><span className="font-semibold truncate">{teamName(a)}</span></div>)}</div></div>}

export function MatchPage({id,tab='overview'}){
 const {nav}=useContext(Ctx);const m=FIXTURES.find(f=>f.id===Number(id));const loading=useBrief(id,300);
 if(!m)return <div><Crumbs items={[{l:'Matches',go:'matches'},{l:'Not found'}]}/><Empty icon="alert" title="Match not found" body="This match does not exist in the demo dataset."><Btn onClick={()=>nav('matches')}>Back to Matches</Btn></Empty></div>;
 const d=MATCH_DATA[m.id],t=TABS.find(x=>x[0]===tab)?tab:'overview';
 return <div>
  <Crumbs items={[{l:'Matches',go:'matches'},{l:m.lg,go:'matches'},{l:'Match Details',go:`match/${m.id}/overview`},{l:TABS.find(x=>x[0]===t)[1]}]}/>
  <Header m={m}/>
  <div role="tablist" aria-label="Match sections" className="flex gap-1 overflow-x-auto no-scrollbar border-b border-line mt-6 mb-6">{TABS.map(([k,l])=><button key={k} role="tab" aria-selected={t===k} onClick={()=>nav(`match/${m.id}/${k}`)} className={`whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition ${t===k?'border-lime text-white':'border-transparent text-mute hover:text-white'}`}>{l}</button>)}</div>
  {loading?<div className="h-64 rounded-2xl bg-card border border-line animate-pulse"/>:<div key={t} className="slide">
   {t==='overview'&&<Overview m={m} d={d}/>}{t==='predictions'&&<Predictions m={m}/>}
   {t==='lineups'&&<>{d&&d.H?<LineupView key={m.id} m={m} d={d}/>:<LineupPending m={m} demo={m.st!=='upcoming'}/>}<TeamStats m={m} d={d}/></>}
   {t==='stats'&&<Stats m={m} d={d}/>}{t==='h2h'&&<H2H m={m} d={d}/>}</div>}
 </div>}
