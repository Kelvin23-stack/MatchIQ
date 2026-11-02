import React,{useState,useEffect,useContext} from 'react'
import {Ctx} from './context'
import {T} from './data'
import {I} from './Icon'
import {Btn} from './ui'
import {FORMATIONS} from './matchData'
import {getPlayer,seasonOf,teamName,teamColor,tone} from './intelHelpers'
import {PlayerAvatar,TeamBadge,RatingPill,DemoTag} from './PlayerBits'

export const useMobile=()=>{const q='(max-width:767px)';const [m,setM]=useState(()=>matchMedia(q).matches);useEffect(()=>{const mq=matchMedia(q),f=()=>setM(mq.matches);mq.addEventListener('change',f);return()=>mq.removeEventListener('change',f)},[]);return m};
const lum=h=>{const n=parseInt(h.slice(1),16);return (.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255))/255};

function PitchSvg({portrait}){
 const W=portrait?68:105,H=portrait?105:68,m=(l,w)=>portrait?[w,l]:[l,w];
 const rect=(l0,w0,l1,w1)=>{const [x0,y0]=m(l0,w0),[x1,y1]=m(l1,w1);return{x:Math.min(x0,x1),y:Math.min(y0,y1),width:Math.abs(x1-x0),height:Math.abs(y1-y0)}};
 const ln=(l0,w0,l1,w1)=>{const [x1,y1]=m(l0,w0),[x2,y2]=m(l1,w1);return{x1,y1,x2,y2}};
 const c=(l,w)=>{const [cx,cy]=m(l,w);return{cx,cy}};
 const st={fill:'none',stroke:'rgba(255,255,255,.6)',strokeWidth:.4};
 return <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
  <rect {...rect(.3,.3,104.7,67.7)} {...st}/><line {...ln(52.5,.3,52.5,67.7)} {...st}/>
  <circle {...c(52.5,34)} r="9.15" {...st}/><circle {...c(52.5,34)} r=".6" fill="rgba(255,255,255,.8)"/>
  <rect {...rect(.3,13.84,16.5,54.16)} {...st}/><rect {...rect(88.5,13.84,104.7,54.16)} {...st}/>
  <rect {...rect(.3,24.84,5.5,43.16)} {...st}/><rect {...rect(99.5,24.84,104.7,43.16)} {...st}/>
  <circle {...c(11,34)} r=".5" fill="rgba(255,255,255,.8)"/><circle {...c(94,34)} r=".5" fill="rgba(255,255,255,.8)"/>
  <line {...ln(.3,30.3,.3,37.7)} stroke="#fff" strokeWidth="1.3"/><line {...ln(104.7,30.3,104.7,37.7)} stroke="#fff" strokeWidth="1.3"/></svg>}

// Arrange the XI into the formation's lines (GK first). A non-default formation re-slots outfielders by position group.
export const arrange=(xi,formation,actual)=>{if(formation===actual)return xi;const o={DF:0,MF:1,FW:2};return[xi[0],...xi.slice(1).map((p,i)=>[p,i]).sort((a,b)=>o[a[0].pos]-o[b[0].pos]||a[1]-b[1]).map(x=>x[0])]};
const spots=(xi,formation,side,portrait)=>{const lines=FORMATIONS[formation];let i=0;const out=[];lines.forEach((n,li)=>{const t=li/(lines.length-1);for(let j=0;j<n;j++){const pl=xi[i++],a=(j+1)/(n+1);
 out.push(portrait?{pl,left:8+a*84,top:89-t*75}:side==='H'?{pl,left:4+t*44,top:8+a*84}:{pl,left:96-t*44,top:92-a*84})}});return out};

function Marker({s,color,onClick,on,cap}){
 const gk=s.pl.pos==='GK',bg=gk?'#F5C451':color,fg=lum(bg)>.6?'#080B0A':'#fff';
 return <button onClick={onClick} aria-label={`${s.pl.name}, number ${s.pl.num}`} aria-pressed={on} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 group focus:outline-none" style={{left:s.left+'%',top:s.top+'%'}}>
  <span className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full grid place-items-center text-[11px] sm:text-sm font-extrabold border-2 shadow-lg transition group-hover:scale-110 group-focus-visible:scale-110 ${on?'border-lime scale-110':'border-white/80'}`} style={{background:bg,color:fg}}>{s.pl.num}{cap&&<span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#fff] text-[#080B0A] text-[9px] font-extrabold grid place-items-center border border-black/30">C</span>}</span>
  <span className="max-w-[64px] sm:max-w-[84px] truncate rounded bg-black/55 px-1.5 text-[9px] sm:text-[11px] font-semibold text-[#fff] leading-4">{s.pl.sn}</span></button>}

export function LineupPending({m,demo}){return <div className="rounded-3xl border border-dashed border-line p-10 sm:p-14 text-center"><div className="w-14 h-14 mx-auto rounded-2xl bg-card border border-line grid place-items-center text-mute"><I n="clock" s={26}/></div>
 <p className="font-extrabold text-lg mt-4">{demo?'No lineup in the demo dataset':'Lineups have not been announced yet.'}</p>
 <p className="text-sm text-mute mt-2 max-w-md mx-auto">{demo?'This sample match has no lineup data. Try the finished or live sample matches to see the pitch view.':'Confirmed lineups will appear here when they are available. MatchIQ never shows projected lineups as confirmed.'}</p>{m&&<p className="text-xs text-mute mt-3">Kickoff: {m.t}</p>}</div>}

export function LineupView({m,d}){
 const {nav}=useContext(Ctx);const mobile=useMobile();
 const [team,setTeam]=useState('H'),[fm,setFm]=useState({H:d.H.formation,A:d.A.formation}),[sel,setSel]=useState(null);
 const side=s=>({xi:arrange(d[s].xi,fm[s],d[s].formation),code:s==='H'?m.h:m.a});
 const color=s=>teamColor(s==='H'?m.h:m.a);
 const shown=mobile?[team]:['H','A'];
 const spotsAll=shown.flatMap(s=>spots(side(s).xi,fm[s],s,mobile).map(x=>({...x,s})));
 const stripe=mobile?'180deg':'90deg';
 const detail=sel&&(()=>{const pl=sel.pl,ps=d.ps[pl.name],prof=pl.id&&getPlayer(pl.id),ss=prof&&seasonOf(prof);return{pl,ps,prof,ss}})();
 return <div>
  <div className="flex flex-wrap items-center gap-3 mb-4"><DemoTag>Demo lineups</DemoTag>{mobile&&<div role="tablist" aria-label="Team" className="inline-flex rounded-full border border-line bg-card p-1 ml-auto">{['H','A'].map(s=><button key={s} role="tab" aria-selected={team===s} onClick={()=>{setTeam(s);setSel(null)}} className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${team===s?'bg-lime text-ink':'text-mute'}`}>{teamName(s==='H'?m.h:m.a)}</button>)}</div>}</div>
  <div className="grid md:grid-cols-2 gap-3 mb-4">{shown.map(s=>{const t=d[s],code=s==='H'?m.h:m.a,cap=[...t.xi,...t.bench].find(p=>p.id&&p.id===t.captain);return <div key={s} className="rounded-2xl border border-line bg-card p-4">
   <div className="flex items-center gap-3"><TeamBadge code={code} s={36}/><div className="min-w-0 flex-1"><p className="font-extrabold truncate">{teamName(code)}</p><p className="text-xs text-mute">{t.manager?`Manager: ${t.manager} (demo)`:'Manager: not in demo data'}</p></div>
    <label className="text-xs text-mute flex flex-col items-end gap-1">Formation<select value={fm[s]} onChange={e=>setFm({...fm,[s]:e.target.value})} className="rounded-lg bg-bg2 border border-line px-2 py-1 text-sm font-bold text-white outline-none">{Object.keys(FORMATIONS).map(f=><option key={f} value={f}>{f}{f===t.formation?' (lineup)':''}</option>)}</select></label></div>
   {fm[s]!==t.formation&&<p className="text-[11px] text-sky mt-2">Previewing a different shape. The lineup formation is {t.formation}.</p>}
   <p className="text-xs text-mute mt-3">Captain: <b className="text-white">{(t.xi.find(p=>p.id===t.captain)||{}).name||'n/a'}</b> · Goalkeeper: <b className="text-white">{t.xi[0].name}</b></p>
   <ol className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">{t.xi.map(p=><li key={p.name} className="truncate"><span className="text-mute tabular-nums inline-block w-6">{p.num}</span>{p.name}{p.id===t.captain&&<span className="text-mute"> (C)</span>}</li>)}</ol></div>})}</div>
  <div className={`relative mx-auto overflow-hidden rounded-2xl border border-white/10 ${mobile?'aspect-[68/105] max-w-sm':'aspect-[105/68]'}`} style={{background:`repeating-linear-gradient(${stripe},#17703a 0 7.14%,#135f31 7.14% 14.28%)`}}>
   <PitchSvg portrait={mobile}/>{spotsAll.map(s=><Marker key={s.s+s.pl.name} s={s} color={color(s.s)} on={sel&&sel.pl.name===s.pl.name} cap={s.pl.id&&s.pl.id===d[s.s].captain} onClick={()=>setSel({pl:s.pl,side:s.s})}/>)}</div>
  <p className="text-[11px] text-mute text-center mt-2">Tap or click a player for details.</p>
  {detail&&<div className="pop mt-4 rounded-2xl border border-white/20 bg-card p-5"><div className="flex items-start gap-4"><PlayerAvatar p={{name:detail.pl.name,team:sel.side==='H'?m.h:m.a,num:detail.pl.num}} s={56}/>
   <div className="flex-1 min-w-0"><p className="font-extrabold text-lg">{detail.pl.name}</p><p className="text-xs text-mute">#{detail.pl.num} · {({GK:'Goalkeeper',DF:'Defender',MF:'Midfielder',FW:'Forward'})[detail.pl.pos]} · {teamName(sel.side==='H'?m.h:m.a)}</p></div><button onClick={()=>setSel(null)} aria-label="Close player panel" className="text-mute hover:text-white"><I n="x"/></button></div>
   <div className="grid grid-cols-3 gap-2 mt-4">{[['Match rating',detail.ps?detail.ps[1].toFixed(1)+' (demo)':'n/a'],['Goals / assists',detail.ps?`${detail.ps[2]} / ${detail.ps[3]}`:'n/a'],['Season rating',detail.ss?detail.ss.rating.toFixed(1)+' (demo)':'no profile']].map(([a,b])=><div key={a} className="rounded-xl bg-bg2 border border-line p-3"><p className="text-[10px] text-mute">{a}</p><p className="text-sm font-extrabold mt-0.5">{b}</p></div>)}</div>
   {detail.prof?<Btn className="w-full mt-4" onClick={()=>nav('player/'+detail.prof.id)}>Open full profile<I n="arrow" s={15}/></Btn>:<p className="text-xs text-mute mt-4">No Player Intelligence profile for this player in the demo dataset.</p>}</div>}
  <h3 className="font-extrabold mt-8 mb-3">Substitutes</h3>
  <div className="grid md:grid-cols-2 gap-4">{['H','A'].map(s=><div key={s} className="rounded-2xl border border-line bg-card p-4"><p className="text-xs font-bold uppercase tracking-wider text-mute mb-3 flex items-center gap-2"><TeamBadge code={s==='H'?m.h:m.a} s={20}/>{teamName(s==='H'?m.h:m.a)}</p>
   <div className="divide-y divide-line">{d[s].bench.map(p=>{const ps=d.ps[p.name];return <button key={p.name} onClick={()=>setSel({pl:p,side:s})} className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-white/[0.04] rounded-lg px-1 transition"><PlayerAvatar p={{name:p.name,team:s==='H'?m.h:m.a,num:p.num}} s={36} num={false}/><span className="flex-1 min-w-0"><span className="block text-sm font-semibold truncate">{p.name}</span><span className="text-[11px] text-mute">#{p.num} · {p.pos}</span></span>{ps?<span className="text-sm font-bold" style={{color:tone(ps[1])}}>{ps[1].toFixed(1)}</span>:<span className="text-[11px] text-mute">unused</span>}</button>})}</div></div>)}</div>
 </div>}
