import React from 'react'
import {Sheet} from './Sheet'
import {Btn} from './ui'
export const Confirm=({title,body,label='Confirm',onConfirm,onClose})=><Sheet title={title} onClose={onClose}><p className="text-sm text-mute">{body}</p><div className="grid grid-cols-2 gap-3 mt-6"><Btn v="s" onClick={onClose}>Cancel</Btn><button onClick={()=>{onConfirm();onClose()}} className="rounded-xl font-bold text-sm px-5 py-3 bg-red-500 text-[#fff] hover:bg-red-400 transition active:scale-95">{label}</button></div></Sheet>
