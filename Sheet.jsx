import React,{useEffect} from 'react'
import {createPortal} from 'react-dom'
import {motion} from 'framer-motion'
import {I} from './Icon'
// Rendered in a portal so it is never trapped inside an animated (transformed) page container.
export const Sheet=({onClose,title,children,wide,z=50})=>{
 useEffect(()=>{const o=document.body.style.overflow;document.body.style.overflow='hidden';const k=e=>e.key==='Escape'&&onClose();addEventListener('keydown',k);return()=>{document.body.style.overflow=o;removeEventListener('keydown',k)}},[]);
 return createPortal(<div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 grid place-items-end sm:place-items-center bg-black/70 backdrop-blur-sm" style={{zIndex:z}} onClick={onClose}>
  <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:.25}} onClick={e=>e.stopPropagation()} className={`w-full ${wide?'sm:max-w-2xl':'sm:max-w-md'} max-h-[92vh] overflow-y-auto bg-bg2 text-white border border-line rounded-t-3xl sm:rounded-3xl p-5 sm:p-6`} style={{paddingBottom:'max(1.25rem,env(safe-area-inset-bottom))'}}>
   <div className="flex items-start justify-between mb-4"><h3 className="text-lg font-extrabold">{title}</h3><button onClick={onClose} aria-label="Close" className="text-mute hover:text-white"><I n="x"/></button></div>{children}
  </motion.div></div>,document.body)}
