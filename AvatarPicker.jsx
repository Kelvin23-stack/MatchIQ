import React,{useRef,useState} from 'react'
import {I} from './Icon'
import {Av,Btn} from './ui'
import {AvatarArt,PRESETS} from './Avatar'
import {ini} from './compData'

export function AvatarPicker({value,onChange,name}){
 const ref=useRef(),[err,setErr]=useState('');
 const onFile=e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;if(!f.type.startsWith('image/')){setErr('Please choose an image file');return}if(f.size>5e6){setErr('Image must be under 5 MB');return}
  const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas'),S=256;c.width=c.height=S;const m=Math.min(img.width,img.height);c.getContext('2d').drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,S,S);setErr('');onChange({kind:'upload',src:c.toDataURL('image/jpeg',.85)})};img.onerror=()=>setErr('Could not read that image');img.src=r.result};r.readAsDataURL(f)};
 return <div>
  <div className="flex items-center gap-4"><div className="rounded-full p-1 border border-line">{value?<AvatarArt a={value} s={84}/>:<Av t={ini(name||'?')} s={84}/>}</div>
   <div className="space-y-2"><input ref={ref} type="file" accept="image/*" onChange={onFile} className="hidden"/><Btn v="s" type="button" onClick={()=>ref.current.click()} className="!py-2.5"><I n="upload" s={15}/>Upload photo</Btn>{value&&<button type="button" onClick={()=>onChange(null)} className="block text-xs text-mute hover:text-white">Use my initials</button>}<p className="text-[11px] text-mute">Preview only. Stored in this browser.</p></div></div>
  {err&&<p className="text-xs text-red-400 mt-2">{err}</p>}
  <p className="text-xs font-bold uppercase tracking-wider text-mute mt-5 mb-3">Or pick an avatar</p>
  <div className="grid grid-cols-6 gap-2.5">{PRESETS.map(p=>{const on=value&&value.kind==='preset'&&value.id===p.id;return <button type="button" key={p.id} onClick={()=>onChange({kind:'preset',id:p.id})} className={`rounded-full p-0.5 transition active:scale-90 ${on?'ring-2 ring-lime':'ring-1 ring-transparent hover:ring-white/30'}`}><AvatarArt a={{kind:'preset',id:p.id}} s={44}/></button>})}</div></div>}
