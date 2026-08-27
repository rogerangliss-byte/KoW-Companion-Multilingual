/* KoW Companion v4.6.0 — Language QA19 ROBUST English-bleed + coverage audit. */
(function(){
'use strict';
const LANGS=[{code:'en',label:'English'},{code:'fr',label:'Français'},{code:'de',label:'Deutsch'},{code:'it',label:'Italiano'}];
const ROOTS=['dashboard','progress','officer','inventory','stars','development','xp','planner','database','releases','settings','help','skillCostInfoModal','quickProgressModal'];
const EN=new Set(('the and or to from with without for of in on at by is are was were be been being this that these those your you can cannot could should would will current next previous latest saved save load reset restore export import download upload select selected choose enter required remaining held available shortfall still more less total value level levels target targets training skill skills strand strands officer officers badge badges star stars inventory planner planning plan plans database release releases forecast growth month scheduled schedule resource resources development progress readiness ready partially fully funded upgrade upgrades action actions recommendation recommendations backup guide settings help home dashboard compare comparison status showing highest search season rarity role unlock max maxed original universal legendary epic elite chest chests selection book books calculate calculated calculation cost costs used spend spent change changed changing requirement requirements future session scenario scenarios priority priorities open close delete copy create add remove edit live test version application app browser locally data press button field fields row rows popup modal information portrait requires').split(/\s+/));
const TECH=new Set('xp orv srv csv max firestorm kow s2 s3 s4 s5 s6 s7 s8'.split(/\s+/));
function lang(){try{return window.KOW_PRESENTATION_I18N?.getLanguage?.()||'en'}catch(_){return'en'}}
function setLang(c){try{window.KOW_PRESENTATION_I18N?.apply?.(c)}catch(_){}}
function strings(root){const out=[];if(!root)return out;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;if(!p||['SCRIPT','STYLE','NOSCRIPT','TEMPLATE'].includes(p.tagName))return NodeFilter.FILTER_REJECT;return (n.nodeValue||'').trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});let n;while((n=w.nextNode())){const t=(n.nodeValue||'').replace(/\s+/g,' ').trim();if(t)out.push({kind:'text',text:t})}root.querySelectorAll('[placeholder],[title],[aria-label],[alt]').forEach(el=>{for(const a of ['placeholder','title','aria-label','alt']){const t=(el.getAttribute(a)||'').replace(/\s+/g,' ').trim();if(t)out.push({kind:a,text:t})}});root.querySelectorAll('select option').forEach(o=>{const t=(o.textContent||'').replace(/\s+/g,' ').trim();if(t)out.push({kind:'option',text:t})});return out}
function score(t){const words=(String(t).toLowerCase().match(/[a-z][a-z'-]*/g)||[]);if(words.length<2)return 0;let hit=0,tech=0;for(const w of words){if(TECH.has(w)){tech++;continue}if(EN.has(w))hit++}return hit/Math.max(1,words.length-tech)}
function looksEnglish(t,l){
 if(l==='en')return false;
 t=String(t||'').replace(/\s+/g,' ').trim();
 if(t.length<3||/^[\d\s.,:%()+\-★→/]+$/.test(t)||TECH.has(t.toLowerCase()))return false;
 const obvious=/\b(Backup failed|Backup restored successfully|Enter a plan name|Plan saved|Saved plan deleted|Fix validation issues first|Officer database saved|CSV validation failed|CSV imported|Appearance and backgrounds restored to defaults|Progress could not be saved|Reset Central Inventory|Restore default officer database|Set .+ to fully MAXED|This will set|Shared resources will not be changed|All Seasons|All Roles|No Officers match these filters|Select Officer|Add Officers to build an upgrade plan|Select saved plan|Readiness: Select an Officer|Still required|Planning estimate using|Forecast only|Current month|No selected Officer has been started yet|Highest actual progress|Projected S8 Resource Requirement|No eligible Officers are available|Planning session|No planning scenarios saved yet|Choose another Officer to compare|Refreshing application files|Backup created|No saved upgrade plan selected|Priority: Development|Priority: Stars|Priority: XP|Built-in default portrait|Built-in default landscape|Checking GitHub Pages|Could not determine the published version|Update available|You are up to date|Unable to check right now|Restore failed|No saved Officer profiles yet|Select at least 2 saved Officers to compare|Show all)\b/i;
 if(obvious.test(t))return true;
 const wc=(t.match(/[A-Za-z]+/g)||[]).length;
 return wc>=3&&score(t)>=0.36;
}
function coverage(l){if(l==='en')return{dictionary_size:Object.keys(window.KOW_I18N_EN||{}).length,missing_keys:[]};const en=window.KOW_I18N_EN||{};const d=l==='fr'?(window.KOW_I18N_FR||{}):l==='de'?(window.KOW_I18N_DE||{}):(window.KOW_I18N_IT||{});return{dictionary_size:Object.keys(d).length,missing_keys:Object.keys(en).filter(k=>!(k in d))}}
function scanRoot(l,id){const r=document.getElementById(id),res={root:id,present:!!r,strings_scanned:0,english_bleed:[],broken_text:[]};if(!r)return res;const ss=strings(r);res.strings_scanned=ss.length;for(const s of ss){if(looksEnglish(s.text,l))res.english_bleed.push({kind:s.kind,text:s.text});if(/\bundefined\b|\bnull\b|\[object Object\]/i.test(s.text))res.broken_text.push({kind:s.kind,text:s.text})}return res}
function popups(){const html=document.documentElement.innerHTML,out=[],rx=/(?:alert|confirm|prompt)\s*\(\s*([`'"])([\\s\\S]{3,260}?)\1\s*\)/g;let m;while((m=rx.exec(html))){const t=m[2].replace(/\$\{[^}]+\}/g,'{value}').replace(/\s+/g,' ').trim();if(t)out.push(t)}return[...new Set(out)]}
function integrity(){const req=['officerSelect','quickProgressBtn','maxOfficerProfile','saveOfficerProfile','saveInventory','resetInventory','quickProgressModal','quickProgressMax','quickProgressSave','quickProgressCancel','quickStarLevel','quickOfficerLevel','quickUnlocked','quickTraining','settings','help','appLanguage'];const missing=req.filter(id=>!document.getElementById(id));const sel=document.getElementById('appLanguage');if(sel){const vals=[...sel.options].map(o=>o.value);if(!['en','fr','de','it'].every(v=>vals.includes(v)))missing.push('appLanguage-options-en-fr-de-it')}return{required_controls:req.length,missing_controls:missing}}

function dynamicAudit(code){
 const html=document.documentElement.innerHTML,out=[],issues=[];
 const pats=[
  ['alert',/\balert\s*\(\s*([`'"])([\s\S]{2,320}?)\1\s*\)/g],
  ['confirm',/\bconfirm\s*\(\s*([`'"])([\s\S]{2,320}?)\1\s*\)/g],
  ['prompt',/\bprompt\s*\(\s*([`'"])([\s\S]{2,320}?)\1\s*\)/g],
  ['innerHTML',/\.innerHTML\s*=\s*([`'"])([\s\S]{2,500}?)\1/g],
  ['textContent',/\.textContent\s*=\s*([`'"])([\s\S]{2,320}?)\1/g],
  ['insertAdjacentHTML',/insertAdjacentHTML\s*\(\s*[^,]+,\s*([`'"])([\s\S]{2,500}?)\1/g]
 ];
 for(const [type,rx] of pats){let m;while((m=rx.exec(html))){
   const text=(m[2]||'').replace(/\$\{[^}]+\}/g,'{value}').replace(/<[^>]+>/g,' ').replace(/\\n/g,' ').replace(/\s+/g,' ').trim();
   if(!text||text.length<3)continue;out.push({type,text});
   if(code!=='en'&&looksEnglish(text,code)){
   const artifact=/\b(function|const|let|var|document\.|querySelector|createElement|return;|=>)\b/.test(text);
   const translated=window.KOW_PRESENTATION_I18N?.translateString?.(text,code)??text;
   if(!artifact&&translated===text)issues.push({type,text,reason:'no-translation-coverage'});
 }
 }}
 return{dynamic_literals_scanned:out.length,english_dynamic_literals:[...new Map(issues.map(x=>[x.type+'|'+x.text,x])).values()],sample_inventory:out.slice(0,100)};
}
function dictQuality(code){
 const en=window.KOW_I18N_EN||{},d=code==='en'?en:code==='fr'?(window.KOW_I18N_FR||{}):code==='de'?(window.KOW_I18N_DE||{}):(window.KOW_I18N_IT||{});
 const empty=[],same=[],bad=[];
 for(const [k,v] of Object.entries(d)){const x=String(v??'').trim(),e=String(en[k]??'').trim();
  if(!x)empty.push(k);
  if(code!=='en'&&e&&x===e&&/[A-Za-z]{3}/.test(e))same.push({key:k,text:x});
  if(/\bundefined\b|\bnull\b|\[object Object\]/i.test(x))bad.push({key:k,text:x});
 }
 return{entries:Object.keys(d).length,empty_values:empty,identical_to_english:same,suspicious_values:bad};
}
function helpAudit(code){
 const root=document.getElementById('help');
 if(!root)return{present:false,characters:0,strings_scanned:0,english_bleed:code==='en'?false:true,source:'rendered-help-dom'};
 const helpStrings=strings(root);
 const text=helpStrings.map(x=>x.text).join(' ').replace(/\s+/g,' ').trim();
 const bleed=code==='en'?false:helpStrings.some(x=>looksEnglish(x.text,code));
 return{
  present:true,
  characters:text.length,
  strings_scanned:helpStrings.length,
  english_bleed:bleed,
  source:'rendered-help-dom'
 };
}

function renderedSnapshot(){
 const out={};
 for(const id of ROOTS){
   const r=document.getElementById(id);
   if(!r)continue;
   const target=(id==='settings')?r.cloneNode(true):r;
   if(id==='settings')target.querySelector('#languageQaPanel')?.remove();
   out[id]=strings(target).map(x=>({kind:x.kind,text:x.text}));
 }
 return out;
}

function unchangedFromEnglish(code,baseline){
 if(code==='en')return[];
 const now=renderedSnapshot(),out=[];
 for(const id of ROOTS){
   const a=baseline[id]||[],b=now[id]||[];
   const n=Math.min(a.length,b.length);
   for(let i=0;i<n;i++){
     const x=String(a[i].text||'').trim(),y=String(b[i].text||'').trim();
     if(!x||x!==y)continue;
     if(!/[A-Za-z]{2}/.test(x))continue;
     if(['GODS OF WAR 371','English','Français','Deutsch','Italiano','XP','ORV','SRV','CSV','MAX','MAXED','KoW Companion'].includes(x)||/^v4\.6\.0 LIVE$/.test(x)||/^S\d+\s+[A-Z][A-Za-zÀ-ÖØ-öø-ÿ' .-]+(?:\s+\(100%\))?\s*·?$/.test(x))continue;
     const officerNames=[...document.querySelectorAll('#officerSelect option')].map(o=>String(o.textContent||'').trim());
     if(officerNames.includes(x)||/^officer-portraits\//i.test(x))continue;
     const words=(x.match(/[A-Za-z]+/g)||[]);
     if(words.length>=2)out.push(`${id}: ${x}`);
   }
 }
 return [...new Set(out)];
}
function build(){
 const original=lang(),results={};
 setLang('en');
 const baseline=renderedSnapshot();
 for(const L of LANGS){
   setLang(L.code);
   const roots=ROOTS.map(id=>scanRoot(L.code,id));
   const cov=coverage(L.code);
   const bleed=roots.flatMap(r=>r.english_bleed.map(x=>`${r.root}: ${x.text}`));
   const broken=roots.flatMap(r=>r.broken_text.map(x=>`${r.root}: ${x.text}`));
   const missing=roots.filter(r=>!r.present).map(r=>r.root);
   const popup=L.code==='en'?[]:popups().filter(t=>looksEnglish(t,L.code));
   const dyn=dynamicAudit(L.code);
   const dq=dictQuality(L.code);
   const ha=helpAudit(L.code);
   const unchanged=unchangedFromEnglish(L.code,baseline);
   results[L.label]={
     status:(bleed.length||unchanged.length||broken.length||missing.length||cov.missing_keys.length||popup.length||
             dyn.english_dynamic_literals.length||dq.empty_values.length||dq.identical_to_english.length||
             dq.suspicious_values.length||!ha.present||ha.english_bleed)?'FAIL':'PASS',
     translation_coverage:cov,
     dynamic_source_audit:dyn,
     dictionary_quality:dq,
     help_source_audit:ha,
     rendered_english_bleed:bleed,
     unchanged_from_english:unchanged,
     broken_or_invalid_text:broken,
     missing_roots:missing,
     popup_english_literals:popup,
     roots_scanned:roots.filter(r=>r.present).length,
     per_root:roots
   };
 }
 setLang(original);
 return{
   generated_at:new Date().toISOString(),
   app_version:'4.6.0 STABLE English Truth',
   qa_version:'Language QA20 ROBUST BLEED',
   scope_note:'Rendered DOM + English-baseline differential + corrected English detector + dynamic-source/dictionary/Help audits. App workflows are not executed.',
   read_only_guarantee:{invokes_application_functions:false,executes_dynamic_workflows:false,inspects_dynamic_text_sources:true,changes_form_values:false,clicks_buttons:false,dispatches_events:false,mutation_observer:'presentation-text-only'},
   expected_roots:ROOTS,
   ui_integrity:integrity(),
   results
 };
}
function download(rep){const b=new Blob([JSON.stringify(rep,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`KoW-Language-QA20-v4.6.0-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function render(rep){
 let p=document.getElementById('languageQaPanel');
 if(!p)return;
 const status=document.getElementById('languageQaStatus');
 const results=document.getElementById('languageQaResults');
 const dl=document.getElementById('downloadLanguageQaReport');
 if(status)status.textContent='QA19 complete.';
 if(results){
   results.innerHTML=LANGS.map(L=>{
     const r=rep.results[L.label];
     return `<div class="qa-row"><strong>${L.label}</strong><span style="float:right">${r.status}</span><br><small>`+
       `Roots ${r.roots_scanned}/${ROOTS.length} · English bleed ${r.rendered_english_bleed.length} · `+
       `Missing translations ${r.translation_coverage.missing_keys.length} · Popup literals ${r.popup_english_literals.length} · `+
       `Dynamic bleed ${r.dynamic_source_audit.english_dynamic_literals.length} · `+
       `Rendered unchanged ${r.unchanged_from_english.length} · `+
       `Dictionary same-as-English ${r.dictionary_quality.identical_to_english.length}</small></div>`;
   }).join('')+
   `<div class="notice" style="margin-top:10px">UI integrity: ${rep.ui_integrity.missing_controls.length===0?'PASS':'FAIL'} · Missing controls: ${rep.ui_integrity.missing_controls.length}</div>`;
 }
 if(dl){
   dl.disabled=false;
   dl.onclick=()=>download(window.KOW_LAST_LANGUAGE_QA19);
 }
}

function showQaError(err){
 const status=document.getElementById('languageQaStatus');
 const results=document.getElementById('languageQaResults');
 if(status)status.textContent='QA19 FAILED TO RUN — see details below.';
 if(results)results.innerHTML=`<div class="notice"><b>QA runner error:</b> ${String(err&&err.message||err)}</div>`;
 console.error('KoW Language QA19 runner error',err);
}

function run(){
 const status=document.getElementById('languageQaStatus');
 const results=document.getElementById('languageQaResults');
 const btn=document.getElementById('runLanguageQa');
 const dl=document.getElementById('downloadLanguageQaReport');

 if(status)status.textContent='Running QA19 across EN / FR / DE / IT…';
 if(results)results.innerHTML='<div class="notice">Scanning rendered UI, dictionaries, dynamic text sources and Help…</div>';
 if(btn)btn.disabled=true;
 if(dl)dl.disabled=true;

 // Yield one frame so the user sees "Running..." before the synchronous read-only audit starts.
 setTimeout(()=>{
   try{
     const rep=build();
     window.KOW_LAST_LANGUAGE_QA19=rep;
     render(rep);
   }catch(err){
     showQaError(err);
   }finally{
     const b=document.getElementById('runLanguageQa');
     if(b)b.disabled=false;
   }
 },25);
}

function wire(){
 const backup=document.getElementById('backupStatus');
 if(!backup)return;

 // Always rebuild the QA panel from this exact QA9C script so an older cached panel cannot survive.
 const old=document.getElementById('languageQaPanel');
 if(old)old.remove();

 const p=document.createElement('div');
 p.id='languageQaPanel';
 p.style.marginTop='16px';
 p.innerHTML=
   '<h3>🧪 Language QA19 / Read-Only Dynamic-Language Proof</h3>'+
   '<p class="notice">Strict read-only audit. FR/DE/IT now FAIL when rendered user-facing text remains unchanged from English, when obvious English is detected, or when dynamic/dictionary/Help bleed remains.</p>'+
   '<div class="two">'+
     '<button id="runLanguageQa" class="app-action-primary" type="button">Run Language QA20</button>'+
     '<button id="downloadLanguageQaReport" class="app-action-secondary" type="button" disabled>↓ Download QA20 Report</button>'+
   '</div>'+
   '<div id="languageQaStatus" class="notice" style="margin-top:10px">QA19 ready.</div>'+
   '<div id="languageQaResults" style="margin-top:10px"></div>';

 backup.insertAdjacentElement('afterend',p);

 const runBtn=document.getElementById('runLanguageQa');
 if(runBtn)runBtn.onclick=run;
}

if(document.readyState==='complete')setTimeout(wire,0);
else window.addEventListener('load',()=>setTimeout(wire,0),{once:true});

window.KOW_LANGUAGE_QA19={
 run,
 report:()=>window.KOW_LAST_LANGUAGE_QA19||null,
 version:'QA19'
};
})();