import React from 'react'
import night from './stadium-night.jpg'
import {LiveMatches} from './LiveMatches'
export function MatchCentre(){return <div><div className="scope-dark relative overflow-hidden rounded-3xl border border-white/10 mb-6"><img src={night} alt="A floodlit football pitch at night" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-75"/><div className="absolute inset-0 bg-gradient-to-r from-[#080B0A] via-[#080B0A]/70 to-transparent"/><div className="relative p-6 sm:p-10 sm:py-14"><h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Explore Matches</h1><p className="text-white/70 mt-3 max-w-md">Real fixtures, scores and lineups from the data provider.</p></div></div><LiveMatches/></div>}
