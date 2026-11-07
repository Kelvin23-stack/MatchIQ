import React,{useState,useEffect,useContext} from 'react'
import {Ctx} from './context'
import {useSocial} from './SocialContext'
import {T} from './data'
import {ME,ini,flag} from './compData'
import {shareOut,deriveRes} from './socialData'
import {I} from './Icon'
import {Sheet} from './Sheet'
import {Av,Crest,Btn,LogoMark} from './ui'

export const resLabel=(m,r)=>r==='H'?T[m.h][0]+' win':r==='A'?T[m.a][0]+' win':'Draw';
export const shareText=(m,p,conf)=>`My MatchIQ prediction: ${T[m.h][0]} vs ${T[m.a][0]} — ${resLabel(m,p.result)}${p.score?` (${p.score[0]}–${p.score[1]})`:''}. Confidence ${conf}%. Predict Smart. Play Bold.`;

export function PredictionShareCard({user=ME,m,pred,conf,compact}){
 const lab=conf>=85?'High':conf>=65?'Medium':'Low',col=conf>=85?'#34D399':conf>=65?'#F5C451':'#FF8A3D';
 return <div className="relative overflow-hidden rounded-2xl border border-line p-4" style={{background:`linear-gradient(135deg,${T[m.h][1]}26,rgb(var(--card)) 48%,${T[m.a][1]}26)`}}>
  <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-sm font-extrabold"><LogoMark s={20}/>Match<span style={{color:'rgb(var(--brand))'}}>IQ</span></span><span className="flex items-center gap-1.5 text-xs font-semibold"><Av t={ini(user.name)} s={22} me={user.me}/>{user.name}</span></div>
  <p className="text-[11px] text-mute mt-3">{m.lg} · {m.t}</p>
  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mt-3 text-center"><div className="flex flex-col items-center gap-1.5"><Crest k={m.h} s={compact?36:46}/><span className="text-xs font-semibold leading-tight">{T[m.h][0]}</span></div>{pred.score?<span className="text-2xl sm:text-3xl font-extrabold tabular-nums">{pred.score[0]}<span className="text-mute mx-1">–</span>{pred.score[1]}</span>:<span className="text-mute text-xs font-bold">VS</span>}<div className="flex flex-col items-center gap-1.5"><Crest k={m.a} s={compact?36:46}/><span className="text-xs font-semibold leading-tight">{T[m.a][0]}</span></div></div>
  <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-black/30 border border-white/10 px-3 py-2"><div><p className="text-[10px] uppercase tracking-wider text-mute">Predicted</p><p className="text-sm font-bold">{resLabel(m,pred.result)}</p></div><div className="text-right"><p className="text-[10px] uppercase tracking-wider text-mute">Confidence</p><p className="text-sm font-bold" style={{color:col}}>{lab} · {conf}%</p></div></div>
  <div className="h-1.5 rounded-full bg-black/40 mt-2 overflow-hidden"><div className="h-full rounded-full" style={{width:conf+'%',background:col}}/></div>
  {!compact&&<p className="text-[10px] text-mute text-center mt-3 tracking-wide">Predict Smart. Play Bold.</p>}
 </div>}

export function ShareModal(){
 const {shareReq,closeShare,post,setCommTab,openTab}=useSocial();const {toast}=useContext(Ctx);
 const [conf,setConf]=useState(75),[cap,setCap]=useState('');
 useEffect(()=>{setConf(75);setCap('')},[shareReq]);
 if(!shareReq)return null;const {m,p}=shareReq,result=p.result||(p.score?deriveRes(p.score):null);
 const pred={result,score:p.score||null},text=result?shareText(m,pred,conf):'';
 const copy=async()=>{try{await navigator.clipboard.writeText(text);toast('Prediction text copied')}catch(e){toast('Copy is not available in this browser')}};
 const share=async()=>{const r=await shareOut(text,'My MatchIQ prediction');if(r==='shared')toast('Prediction shared');else if(r==='copied')toast('Sharing is not supported here, so the text was copied');else if(r==='fail')toast('Could not share. Try Copy text instead.')};
 const toFeed=()=>{post({text:cap.trim()||'Locked in my prediction. Who disagrees?',type:'prediction',matchId:m.id,pred:{...pred,conf}});closeShare();openTab('Feed')};
 return <Sheet title="Share prediction" onClose={closeShare}>{result?<>
  <PredictionShareCard m={m} pred={pred} conf={conf}/>
  <p className="text-xs font-bold uppercase tracking-wider text-mute mt-5 mb-2">Confidence</p>
  <div className="grid grid-cols-3 gap-2">{[['Low',55],['Medium',75],['High',92]].map(([l,v])=><button key={l} onClick={()=>setConf(v)} className={`rounded-xl border py-2.5 text-sm font-bold transition ${conf===v?'border-lime bg-lime text-ink':'border-line bg-card hover:border-white/30'}`}>{l}</button>)}</div>
  <input value={cap} maxLength={140} onChange={e=>setCap(e.target.value)} placeholder="Add a caption for the feed (optional)" className="w-full mt-4 rounded-xl bg-card border border-line px-4 py-3 text-sm outline-none focus:border-white/40"/>
  <div className="grid grid-cols-2 gap-3 mt-4"><Btn v="s" onClick={copy}><I n="copy" s={15}/>Copy text</Btn><Btn v="s" onClick={share}><I n="share" s={15}/>Share</Btn></div>
  <Btn className="w-full mt-3" onClick={toFeed}><I n="send" s={15}/>Post to community feed</Btn></>
 :<p className="text-sm text-mute text-center py-8">Pick a match result or a score first, then you can share your prediction.</p>}</Sheet>}
