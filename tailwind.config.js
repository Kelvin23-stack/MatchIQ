const v=n=>`rgb(var(--${n}) / <alpha-value>)`
export default {
  content:['./index.html','./*.{js,jsx}'],
  theme:{extend:{colors:{bg:v('bg'),bg2:v('bg2'),card:v('card'),line:v('line'),mute:v('mute'),white:v('fg'),ink:'rgb(8 11 10 / <alpha-value>)',lime:'#A3FF12',flame:v('flame'),gold:v('gold'),sky:v('sky')},fontFamily:{sans:['"Plus Jakarta Sans"','system-ui','sans-serif']}}},
  plugins:[]
}
