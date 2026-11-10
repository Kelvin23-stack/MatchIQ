import React from 'react'
import {T} from './data'
import {flag,ini} from './compData'
import {countryName} from './countries'
import {Av,Crest} from './ui'
import {AvatarArt} from './Avatar'
import {LeagueBadge} from './MatchCard'

export function ProfilePreview({d}){const club=d.club||'ARS';return <div className="rounded-3xl border border-line overflow-hidden bg-card">
 <div className="h-20" style={{background:`linear-gradient(135deg,${T[club][1]}66,rgb(var(--card)))`}}/>
 <div className="px-5 pb-5 -mt-10"><div className="w-fit rounded-full p-1 bg-card">{d.avatar?<AvatarArt a={d.avatar} s={72}/>:<Av t={ini(d.name||'?')} s={72}/>}</div>
  <p className="text-lg font-extrabold mt-2 break-words">{d.name||'Your name'}</p><p className="text-xs text-mute">@{d.username||'username'}{d.cc&&<> · {flag(d.cc)} {countryName(d.cc)}</>}</p>
  <p className="text-sm text-mute mt-3 break-words min-h-[1.25rem]">{d.bio||'Your bio will appear here.'}</p>
  <div className="flex items-center gap-2 mt-4 text-sm"><Crest k={club} s={26}/><span className="font-semibold">{T[club][0]}</span></div>
  {d.leagues&&d.leagues.length>0&&<div className="flex flex-wrap gap-1.5 mt-3">{d.leagues.map(l=><span key={l} className="inline-flex items-center gap-1.5 text-[11px] text-mute border border-line rounded-full pl-1 pr-2.5 py-0.5"><LeagueBadge lg={l} s={18}/>{l}</span>)}</div>}</div></div>}
