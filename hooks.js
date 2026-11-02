import {useState,useEffect} from 'react'
export const useStored=(k,init)=>{const[v,s]=useState(()=>{try{const r=JSON.parse(localStorage.getItem(k));return r??init}catch(e){return init}});useEffect(()=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},[v]);return[v,s]}
