import {defineConfig,loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import handler from './api/football.js'

// Local development only: serve /api/football through Vite so `npm run dev` works without the Vercel CLI.
// The key is read from .env (HIGHLIGHTLY_API_KEY, no VITE_ prefix) into the SERVER process only.
// It is never added to import.meta.env, `define`, or any client bundle.
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'');
 for(const k of ['HIGHLIGHTLY_API_KEY','HIGHLIGHTLY_LEAGUES','HIGHLIGHTLY_SEASON'])if(env[k]&&!process.env[k])process.env[k]=env[k];
 return{plugins:[react(),{name:'matchiq-football-dev-api',configureServer(s){s.middlewares.use('/api/football',(req,res)=>handler(req,res))}}]}
})
