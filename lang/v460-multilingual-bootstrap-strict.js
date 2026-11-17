/* Strict multilingual bootstrap: presentation layer only, after English app load. */
(function(){
'use strict';
const EXPECTED='v470-i18n-core-23',CORE_CACHE='v470-i18n-core-23-fix2',QA_CACHE='qa21-v19-visible-text-italian-badge-fix-20261117';
const state=window.KOW_MULTILINGUAL_BOOTSTRAP={status:'loading',expected_runtime:EXPECTED,loaded:[],error:null};
function load(src){return new Promise((ok,bad)=>{const s=document.createElement('script');s.src=src;s.onload=()=>{state.loaded.push(src);ok()};s.onerror=()=>bad(new Error('Failed to load '+src));document.body.appendChild(s);});}
async function start(){
 try{
  for(const src of [
   './lang/v460-en.js?v='+EXPECTED,'./lang/v460-fr.js?v='+EXPECTED,'./lang/v460-de.js?v='+EXPECTED,'./lang/v460-it.js?v='+EXPECTED,
   './lang/v460-full-help.js?v='+EXPECTED,'./lang/v470-i18n-core.js?v='+CORE_CACHE,'./lang/v460-language-qa-strict.js?v='+QA_CACHE
  ]) await load(src);
  const api=window.KOW_I18N;
  if(!api||api.version!==EXPECTED||typeof api.setLanguage!=='function')throw new Error('Expected '+EXPECTED+' but found '+(api&&api.version||'no runtime API'));
  state.status='ready';
  state.runtime_version=api.version;
 }catch(err){
  state.status='failed';state.error=String(err&&err.message||err);
  console.error('KoW multilingual bootstrap failed',err);
  const status=document.getElementById('languageQaStatus');
  if(status)status.textContent='Multilingual setup failed: '+state.error;
 }
}
if(document.readyState==='complete')setTimeout(start,0);
else window.addEventListener('load',()=>setTimeout(start,0),{once:true});
})();