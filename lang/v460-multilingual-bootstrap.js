/* KoW Companion v4.6.0 Multilingual Test — non-invasive bootstrap.
   English Live HOTFIX-2 remains the functional application.
   This script waits until window.load before adding TEST/language/QA UI and loading localisation. */
(function(){
'use strict';
function addTestBanner(){
  if(document.getElementById('multilingualTestBanner'))return;
  const style=document.createElement('style');
  style.id='multilingual-clean-test-style';
  style.textContent='#multilingualTestBanner{position:sticky;top:0;z-index:9999;background:#a50000;color:#fff;text-align:center;font-weight:800;padding:8px 12px;letter-spacing:.04em;border-bottom:2px solid #ff6b6b}';
  document.head.appendChild(style);
  const b=document.createElement('div');
  b.id='multilingualTestBanner';
  b.textContent='MULTILINGUAL TEST — NOT LIVE';
  document.body.insertBefore(b,document.body.firstChild);
}
function addLanguageSelector(){
  if(document.getElementById('appLanguage'))return;
  const settings=document.querySelector('#settings article.card');
  const heading=settings?.querySelector('h2');
  if(!settings||!heading)return;
  const wrap=document.createElement('div');
  wrap.id='languageSelectorCard';
  wrap.style.marginBottom='14px';
  wrap.innerHTML='<label for="appLanguage">Language / Langue / Sprache / Lingua</label><select id="appLanguage" aria-label="Application language"><option value="en">English</option><option value="fr">Français</option><option value="de">Deutsch</option><option value="it">Italiano</option></select>';
  heading.insertAdjacentElement('afterend',wrap);
}
function addQaPanel(){
  if(document.getElementById('languageQaPanel'))return;
  const backup=document.getElementById('backupStatus');
  if(!backup)return;
  const panel=document.createElement('div');
  panel.id='languageQaPanel';
  panel.style.marginTop='16px';
  panel.innerHTML='<h3>🧪 Language QA6 / Whole-App Render Test</h3><p class="notice">QA6 scans every application view one at a time, including dynamic content, modals, translated attributes, dropdown options and popup text. Missing views or timeouts fail the audit.</p><div class="two"><button id="runLanguageQa" class="app-action-primary" type="button">Run Whole-App QA6</button><button id="downloadLanguageQaReport" class="app-action-secondary" type="button" disabled>↓ Download QA6 Report</button></div><div id="languageQaStatus" class="notice" style="margin-top:10px">Ready to run Whole-App QA6.</div><div id="languageQaResults" style="margin-top:10px"></div>';
  backup.insertAdjacentElement('afterend',panel);
}
function load(src){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;
    document.body.appendChild(s);
  });
}
async function start(){
  addTestBanner();
  addLanguageSelector();
  addQaPanel();
  const files=[
   './lang/v460-en.js?v=460ni1','./lang/v460-fr.js?v=460ni1','./lang/v460-de.js?v=460ni1','./lang/v460-it.js?v=460ni1',
   './lang/v460-full-help.js?v=460ni1','./lang/v460-i18n.js?v=460ni1','./lang/v460-popup-i18n.js?v=460ni1',
   './lang/v460-release-calendar-i18n.js?v=460ni1','./lang/v460-language-qa.js?v=460ni1'
  ];
  for(const f of files) await load(f);
}
if(document.readyState==='complete')setTimeout(start,0);
else window.addEventListener('load',()=>setTimeout(start,0),{once:true});
})();
