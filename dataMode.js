import {useState,useEffect} from 'react'
// Non-secret UI preferences (season override, selected competition). There is no demo mode: all football data is live.
const KS='matchiq.season',KL='matchiq.league',EV='matchiq-datasettings';
export const getSeason=()=>{try{const v=localStorage.getItem(KS);return /^\d{4}$/.test(v||'')?v:''}catch(e){return ''}};
export const getLeague=()=>{try{const v=localStorage.getItem(KL);return /^\d{1,15}$/.test(v||'')?v:''}catch(e){return ''}};
const emit=()=>window.dispatchEvent(new Event(EV));
export const setSeason=s=>{try{s&&/^\d{4}$/.test(s)?localStorage.setItem(KS,s):localStorage.removeItem(KS)}catch(e){}emit()};
export const setLeague=l=>{try{l&&/^\d{1,15}$/.test(String(l))?localStorage.setItem(KL,String(l)):localStorage.removeItem(KL)}catch(e){}emit()};
export function useDataSettings(){
 const [s,setS]=useState({season:getSeason(),league:getLeague()});
 useEffect(()=>{const f=()=>setS({season:getSeason(),league:getLeague()});addEventListener(EV,f);addEventListener('storage',f);return()=>{removeEventListener(EV,f);removeEventListener('storage',f)}},[]);
 return s}
