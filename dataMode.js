import {useState,useEffect} from 'react'
// Which data source the UI uses. "demo" keeps the built-in sample dataset, "live" calls /api/football.
// These are non-secret preferences, safe to keep in the browser.
const KM='matchiq.dataMode',KS='matchiq.season',EV='matchiq-datasettings';
const envMode=()=>{try{return import.meta.env.VITE_DATA_MODE==='live'?'live':'demo'}catch(e){return 'demo'}};
export const getMode=()=>{try{const v=localStorage.getItem(KM);return v==='live'||v==='demo'?v:envMode()}catch(e){return envMode()}};
export const getSeason=()=>{try{const v=localStorage.getItem(KS);return /^\d{4}$/.test(v||'')?v:''}catch(e){return ''}};
const emit=()=>window.dispatchEvent(new Event(EV));
export const setMode=m=>{try{localStorage.setItem(KM,m)}catch(e){}emit()};
export const setSeason=s=>{try{s&&/^\d{4}$/.test(s)?localStorage.setItem(KS,s):localStorage.removeItem(KS)}catch(e){}emit()};
export function useDataSettings(){
 const [s,setS]=useState({mode:getMode(),season:getSeason()});
 useEffect(()=>{const f=()=>setS({mode:getMode(),season:getSeason()});addEventListener(EV,f);addEventListener('storage',f);return()=>{removeEventListener(EV,f);removeEventListener('storage',f)}},[]);
 return s}
export const useDataMode=()=>useDataSettings().mode;
