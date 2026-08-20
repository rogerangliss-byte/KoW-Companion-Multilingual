/* KoW Companion v4.5.0 — read-only language QA.
   Never mutates app translations or language state. It audits canonical English
   strings captured by clean-i18n.js against the loaded language dictionaries. */
(function(){
'use strict';
const UI={
 en:{title:'Language QA / Translation Test',desc:'Read-only audit of the clean v4.5.0 translation dictionaries. This tool does not change app text or language state.',run:'Run Full Language QA',refresh:'Refresh Captured Text',keys:'English UI strings captured',pass:'PASS',warn:'WARNING',missing:'Missing translations',same:'Still English',none:'None',note:'Open or use different tabs first if you want dynamically created text included in the scan.'},
 fr:{title:'QA linguistique / Test de traduction',desc:'Audit en lecture seule des dictionnaires de traduction v4.5.0. Cet outil ne modifie ni le texte de l’application ni la langue sélectionnée.',run:'Lancer le QA complet',refresh:'Actualiser le texte capturé',keys:'Chaînes anglaises capturées',pass:'RÉUSSI',warn:'AVERTISSEMENT',missing:'Traductions manquantes',same:'Toujours en anglais',none:'Aucun',note:'Ouvrez ou utilisez les différents onglets pour inclure le texte créé dynamiquement.'},
 de:{title:'Sprach-QA / Übersetzungstest',desc:'Schreibgeschützte Prüfung der sauberen v4.5.0-Übersetzungswörterbücher. Dieses Werkzeug ändert weder App-Text noch Spracheinstellung.',run:'Vollständige Sprach-QA starten',refresh:'Erfassten Text aktualisieren',keys:'Erfasste englische UI-Texte',pass:'BESTANDEN',warn:'WARNUNG',missing:'Fehlende Übersetzungen',same:'Noch Englisch',none:'Keine',note:'Öffnen oder verwenden Sie verschiedene Registerkarten, um dynamisch erzeugten Text einzubeziehen.'},
 it:{title:'QA lingua / Test traduzione',desc:'Controllo in sola lettura dei dizionari di traduzione v4.5.0. Questo strumento non modifica il testo dell’app né la lingua selezionata.',run:'Esegui QA completo lingua',refresh:'Aggiorna testo acquisito',keys:'Stringhe inglesi UI acquisite',pass:'SUPERATO',warn:'AVVISO',missing:'Traduzioni mancanti',same:'Ancora in inglese',none:'Nessuno',note:'Apri o usa le diverse schede per includere nel controllo il testo creato dinamicamente.'}
};
const LANG_LABEL={en:'English',fr:'Français',de:'Deutsch',it:'Italiano'};
const TECHNICAL=new Set(['ORV','SRV','XP','MAX','TEST','CSV','JSON','KoW','GitHub Pages']);
function lang(){return window.KOW_CLEAN_I18N?.current?.()||'en';}
function ui(){return UI[lang()]||UI.en;}
function ignorable(k){
 const t=String(k||'').trim();
 if(!t)return true;
 if(TECHNICAL.has(t))return true;
 if(/^[\d\s.,:%+\-–—/()★⭐]+$/.test(t))return true;
 if(/^v?\d+(?:\.\d+)+/i.test(t))return true;
 if(/^(S[2-9]|Level \d+|Star \d+|Training \d+)$/i.test(t))return true;
 return false;
}
function auditOne(code,keys,dict){
 if(code==='en')return {missing:[],same:[]};
 const missing=[],same=[];
 keys.forEach(k=>{
  if(ignorable(k))return;
  if(!Object.prototype.hasOwnProperty.call(dict,k))missing.push(k);
  else if(String(dict[k]).trim()===String(k).trim())same.push(k);
 });
 return {missing,same};
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderResults(){
 const api=window.KOW_CLEAN_I18N;if(!api)return;
 const u=ui(),keys=api.getCanonicalKeys(),dicts=api.getDictionaries();
 const out=document.getElementById('cleanLanguageQaResults');if(!out)return;
 let html=`<div style="margin:10px 0;color:var(--muted)"><b style="color:var(--gold2)">${esc(u.keys)}:</b> ${keys.length}</div>`;
 ['en','fr','de','it'].forEach(code=>{
  const r=auditOne(code,keys,dicts[code]||{}),ok=!r.missing.length&&!r.same.length;
  html+=`<div style="margin:10px 0;padding:10px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:rgba(0,0,0,.25)"><div style="display:flex;justify-content:space-between;gap:12px"><b>${LANG_LABEL[code]}</b><strong style="color:${ok?'#9ee493':'#f2cf6b'}">${ok?esc(u.pass):esc(u.warn)}</strong></div>`;
  if(code!=='en'){
   html+=`<div style="margin-top:6px;font-size:.85rem"><span>${esc(u.missing)}: <b>${r.missing.length}</b></span> · <span>${esc(u.same)}: <b>${r.same.length}</b></span></div>`;
   const items=[...r.missing.map(x=>'MISSING: '+x),...r.same.map(x=>'ENGLISH: '+x)].slice(0,80);
   html+=items.length?`<details style="margin-top:7px"><summary style="cursor:pointer">${items.length} issue${items.length===1?'':'s'}</summary><div style="margin-top:6px;max-height:260px;overflow:auto;font-size:.78rem;line-height:1.45">${items.map(x=>`<div>${esc(x)}</div>`).join('')}</div></details>`:`<div style="margin-top:6px;color:#9ee493">${esc(u.none)}</div>`;
  }
  html+='</div>';
 });
 html+=`<div class="notice">${esc(u.note)}</div>`;
 out.innerHTML=html;
}
function inject(){
 if(document.getElementById('cleanLanguageQaCard'))return;
 const settings=document.getElementById('settings');if(!settings)return;
 const u=ui(),card=document.createElement('div');card.id='cleanLanguageQaCard';card.className='card wide';card.style.marginTop='12px';
 card.innerHTML=`<h2>🧪 ${esc(u.title)}</h2><p class="notice">${esc(u.desc)}</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px"><button id="runCleanLanguageQa" class="app-action-primary">${esc(u.run)}</button><button id="refreshCleanLanguageQa" class="app-action-secondary">${esc(u.refresh)}</button></div><div id="cleanLanguageQaResults"></div>`;
 settings.appendChild(card);
 document.getElementById('runCleanLanguageQa').addEventListener('click',renderResults);
 document.getElementById('refreshCleanLanguageQa').addEventListener('click',()=>{window.KOW_CLEAN_I18N?.translateNode?.(document.body);renderResults();});
}
function start(){inject();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
