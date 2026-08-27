/* Strict multilingual bootstrap: presentation layer only, after English app load. */
(function(){
'use strict';
function load(src){return new Promise((ok,bad)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=bad;document.body.appendChild(s);});}
async function start(){
 for(const src of [
 './lang/v460-en.js?v=qa20-italian-final-closure-20260827','./lang/v460-fr.js?v=qa20-italian-final-closure-20260827','./lang/v460-de.js?v=qa20-italian-final-closure-20260827','./lang/v460-it.js?v=qa20-italian-final-closure-20260827',
 './lang/v460-full-help.js?v=qa20-italian-final-closure-20260827','./lang/v460-presentation-only.js?v=qa20-italian-final-closure-20260827'
 ]) await load(src);
}
if(document.readyState==='complete') setTimeout(start,0);
else window.addEventListener('load',()=>setTimeout(start,0),{once:true});
})();