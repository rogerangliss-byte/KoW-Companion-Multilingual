/* v4.6.0 robust presentation-only localisation. English Stable remains functional truth. */
(function(){'use strict';
const KEY='kow-language-v460-strict',LANGS=['en','fr','de','it'];let active=(localStorage.getItem(KEY)||'en').slice(0,2).toLowerCase();if(!LANGS.includes(active))active='en';
const D=()=>({en:window.KOW_I18N_EN||{},fr:window.KOW_I18N_FR||{},de:window.KOW_I18N_DE||{},it:window.KOW_I18N_IT||{}});
const base=new WeakMap(),last=new WeakMap();let busy=false,obs=null;
const R={
fr:[[/^Need ([\d,. ]+) more Officer Star value$/,'Il manque $1 de valeur d’Étoiles d’Officier'],[/^Need ([\d,. ]+) more Officer Badges$/,'Il manque $1 Badges d’Officier'],[/^([\d,. ]+) Officer Badges still required$/,'$1 Badges d’Officier encore requis'],[/^([\d,. ]+) Officer Star value still required$/,'$1 de valeur d’Étoiles d’Officier encore requise'],[/^([\d,. ]+) XP still required$/,'$1 XP encore requis'],[/^(.+?) Badges Held$/,'$1 — Badges détenus'],[/^(.+) progress saved\.$/,'Progression de $1 enregistrée.'],[/^(.+) is now saved as MAXED\.$/,'$1 est maintenant enregistré comme MAX.']],
de:[[/^Need ([\d,. ]+) more Officer Star value$/,'Es fehlen $1 Offiziers-Sternwert'],[/^Need ([\d,. ]+) more Officer Badges$/,'Es fehlen $1 Offiziersabzeichen'],[/^([\d,. ]+) Officer Badges still required$/,'Noch $1 Offiziersabzeichen erforderlich'],[/^([\d,. ]+) Officer Star value still required$/,'Noch $1 Offiziers-Sternwert erforderlich'],[/^([\d,. ]+) XP still required$/,'Noch $1 XP erforderlich'],[/^(.+?) Badges Held$/,'$1 — Vorhandene Abzeichen'],[/^(.+) progress saved\.$/,'Fortschritt für $1 gespeichert.'],[/^(.+) is now saved as MAXED\.$/,'$1 ist jetzt als MAX gespeichert.']],
it:[[/^Need ([\d,. ]+) more Officer Star value$/,'Servono ancora $1 di valore Stelle Ufficiale'],[/^Need ([\d,. ]+) more Officer Badges$/,'Servono ancora $1 Badge Ufficiale'],[/^([\d,. ]+) Officer Badges still required$/,'Servono ancora $1 Badge Ufficiale'],[/^([\d,. ]+) Officer Star value still required$/,'Serve ancora $1 di valore Stelle Ufficiale'],[/^([\d,. ]+) XP still required$/,'Servono ancora $1 XP'],[/^(.+?) Badges Held$/,'$1 — Badge posseduti'],[/^(.+) progress saved\.$/,'Progressi di $1 salvati.'],[/^(.+) is now saved as MAXED\.$/,'$1 è ora salvato come MAX.']]};

/* QA12 exact variable-pattern closure from returned QA11 report */
const Q12={
fr:[
[/^Last updated (.+)$/,'Dernière mise à jour $1'],[/^Saved (.+)$/,'Enregistré $1'],
[/^([\d,]+) universal \+ ([\d,]+) chests$/,'$1 universels + $2 coffres'],
[/^📘 Level 70 XP$/,'📘 XP niveau 70'],[/^S(\d+) · Tank Destroyer$/,'S$1 · Chasseur de chars'],
[/^S(\d+) Tank Destroyers$/,'S$1 Chasseurs de chars'],[/^Badges: SHORT ([\d,]+)$/,'Badges : MANQUE $1'],
[/^XP: SHORT ([\d,]+)$/,'XP : MANQUE $1'],[/^Save ([\d,]+) badge equivalents$/,'Économiser $1 équivalents de badges'],
[/^S6 Red Queen — 1,600 Badges \+ 1 more$/,'S6 Red Queen — 1 600 Badges + 1 autre'],
[/^Comparing (.+) with (.+) \.$/,'Comparaison de $1 avec $2.'],[/^Highest actual progress: (.+) at (.+)%\.$/,'Progression réelle la plus élevée : $1 à $2 %.'],
[/^(.+) can be maxed with the resources currently entered in the app\.$/,'$1 peut être MAX avec les ressources actuellement saisies dans l’application.'],
[/^You are up to date — v(.+)\.$/,'Vous êtes à jour — v$1.'],[/^Strand (.+)$/,'Branche $1']
],
de:[
[/^Last updated (.+)$/,'Zuletzt aktualisiert $1'],[/^Saved (.+)$/,'Gespeichert $1'],
[/^([\d,]+) universal \+ ([\d,]+) chests$/,'$1 universell + $2 Truhen'],[/^📘 Level 70 XP$/,'📘 Stufe 70 XP'],
[/^S(\d+) · Tank Destroyer$/,'S$1 · Jagdpanzer'],[/^S(\d+) Tank Destroyers$/,'S$1 Jagdpanzer'],
[/^Badges: SHORT ([\d,]+)$/,'Abzeichen: FEHLEN $1'],[/^XP: SHORT ([\d,]+)$/,'XP: FEHLEN $1'],
[/^Save ([\d,]+) badge equivalents$/,'$1 Abzeichenäquivalente sparen'],[/^Comparing (.+) with (.+) \.$/,'Vergleich von $1 mit $2.'],
[/^Highest actual progress: (.+) at (.+)%\.$/,'Höchster tatsächlicher Fortschritt: $1 bei $2 %.'],
[/^(.+) can be maxed with the resources currently entered in the app\.$/,'$1 kann mit den aktuell eingegebenen Ressourcen auf MAX gebracht werden.'],
[/^You are up to date — v(.+)\.$/,'Du bist auf dem neuesten Stand — v$1.'],[/^Strand (.+)$/,'Strang $1']
],
it:[
[/^Last updated (.+)$/,'Ultimo aggiornamento $1'],[/^Saved (.+)$/,'Salvato $1'],
[/^([\d,]+) universal \+ ([\d,]+) chests$/,'$1 universali + $2 casse'],[/^📘 Level 70 XP$/,'📘 XP livello 70'],
[/^S(\d+) · Tank Destroyer$/,'S$1 · Cacciacarri'],[/^S(\d+) Tank Destroyers$/,'S$1 Cacciacarri'],
[/^Badges: SHORT ([\d,]+)$/,'Badge: MANCANO $1'],[/^XP: SHORT ([\d,]+)$/,'XP: MANCANO $1'],
[/^Save ([\d,]+) badge equivalents$/,'Risparmia $1 equivalenti Badge'],[/^S6 Red Queen — 1,600 Badge \+ 1 more$/,'S6 Red Queen — 1.600 Badge + 1 altro'],
[/^Comparing (.+) with (.+) \.$/,'Confronto di $1 con $2.'],[/^Highest actual progress: (.+) at (.+)%\.$/,'Progressi effettivi più alti: $1 al $2%.'],
[/^(.+) can be maxed with the resources currently entered in the app\.$/,'$1 può essere portato a MAX con le risorse attualmente inserite nell’app.'],
[/^You are up to date — v(.+)\.$/,'Sei aggiornato — v$1.'],[/^Strand (.+)$/,'Ramo $1'],
[/^Priorità: Sviluppo — ([\d,]+) more Ufficiale Badges are richiesto\.$/,'Priorità: Sviluppo — servono altri $1 Badge Ufficiale.']
]};



/* QA18 canonical source rules.
   IMPORTANT: these run BEFORE locale dictionary exact lookup so legacy dictionary
   entries cannot override the corrected complete-sentence translation. */
const Q18={
fr:[
[/^S6 Red Queen — 1,600 badges \+ 1 more$/i,'S6 Red Queen — 1 600 insignes + 1 autre'],
[/^\.?\s*Every Officer is listed even when the player currently holds 0 badges\. Each value is stored separately for that Officer and is used throughout the app\.$/i,'. Chaque Officier est répertorié même lorsque le joueur ne possède actuellement aucun insigne. Chaque valeur est enregistrée séparément pour cet Officier et utilisée dans toute l’application.'],
[/^Application language$/,'Langue de l’application']
],
de:[
[/^\.?\s*The saved inventory is then used throughout the app\. Items are displayed in the game list order defined by the Inventory master list\.$/i,'. Das gespeicherte Inventar wird anschließend in der gesamten Anwendung verwendet. Die Elemente werden in der durch die Inventar-Masterliste festgelegten Spielreihenfolge angezeigt.'],
[/^\.?\s*Every Officer is listed even when the player currently holds 0 badges\. Each value is stored separately for that Officer and is used throughout the app\.$/i,'. Jeder Offizier wird angezeigt, auch wenn der Spieler derzeit keine Abzeichen besitzt. Jeder Wert wird für diesen Offizier separat gespeichert und in der gesamten Anwendung verwendet.'],
[/^Application language$/,'Anwendungssprache']
],
it:[
[/^S6 Red Queen — 1,600 badges \+ 1 more$/i,'S6 Red Queen — 1.600 distintivi + 1 altro'],
[/^Elite Officer Badge$/i,'Distintivo Ufficiale Élite'],
[/^Universal Elite Badges Held$/i,'Distintivi Élite universali posseduti'],
[/^\.?\s*Every Officer is listed even when the player currently holds 0 badges\. Each value is stored separately for that Officer and is used throughout the app\.$/i,'. Ogni Ufficiale è elencato anche quando il giocatore non possiede attualmente alcun distintivo. Ogni valore viene memorizzato separatamente per quell’Ufficiale ed è utilizzato in tutta l’applicazione.'],
[/^ORV \/ Badge Forecast$/i,'Previsione ORV / distintivi'],
[/^Previsione ORV \/ Badge$/i,'Previsione ORV / distintivi'],
[/^⬇ Export App Backup$/i,'⬇ Esporta backup dell’applicazione'],
[/^⬆ Restore App Backup$/i,'⬆ Ripristina backup dell’applicazione'],
[/^Application language$/,'Lingua dell’applicazione']
]};

/* QA17 source-pipeline closure: translate complete rendered messages before dictionary substring fallback. */
const Q17={
fr:[
[/^S6 Red Queen — 1,600 Badges \+ 1 more$/,'S6 Red Queen — 1 600 insignes + 1 autre'],
[/^Every Officer is listed even when the player currently holds 0 badges\. Each value is stored separately for that Officer and is used throughout the app\.$/,'Chaque officier est affiché même lorsque le joueur ne possède actuellement aucun insigne. Chaque valeur est enregistrée séparément pour cet officier et utilisée dans toute l’application.'],
[/^Strand 1: Lv1 · Strand 2: Lv1 · Strand 3: Lv1 · Strand 4: Lv1 · Next cost: ([\d,.]+) badges · ([\d,.]+)\/([\d,.]+) used · ([\d,.]+) remaining\.$/,'Branche 1 : Nv1 · Branche 2 : Nv1 · Branche 3 : Nv1 · Branche 4 : Nv1 · Prochain coût : $1 insignes · $2/$3 utilisés · $4 restants.'],
[/^Use the Planner to compare your current saved Officers and Inventory against projected future Officer sessions, including expected resources for one or two future Officers\.$/,'Utilisez le Planificateur pour comparer vos officiers enregistrés et votre inventaire aux futures sessions d’officiers prévues, y compris les ressources attendues pour un ou deux futurs officiers.'],
[/^Application language$/,'Langue de l’application'],
[/^↓ Download QA16 Report$/,'↓ Télécharger le rapport QA17'],
[/^Running QA16 across EN \/ FR \/ DE \/ IT…$/,'Exécution de QA17 pour EN / FR / DE / IT…'],
[/^Scanning rendered UI, dictionaries, dynamic text sources and Help…$/,'Analyse de l’interface affichée, des dictionnaires, des sources de texte dynamiques et de l’aide…'],
[/^Strict read-only audit\..*$/,'Audit strict en lecture seule. FR/DE/IT échouent si du texte utilisateur reste en anglais ou si une fuite de traduction subsiste.']
],
de:[
[/^Every Officer is listed even when the player currently holds 0 badges\. Each value is stored separately for that Officer and is used throughout the app\.$/,'Jeder Offizier wird angezeigt, auch wenn der Spieler derzeit 0 Abzeichen besitzt. Jeder Wert wird für diesen Offizier separat gespeichert und in der gesamten Anwendung verwendet.'],
[/^The saved inventory is then used throughout the app\. Items are displayed in the game list order defined by the Inventory master list\.$/,'Das gespeicherte Inventar wird anschließend in der gesamten Anwendung verwendet. Die Elemente werden in der durch die Inventar-Masterliste festgelegten Spielreihenfolge angezeigt.'],
[/^Strand 1: Lv1 · Strand 2: Lv1 · Strand 3: Lv1 · Strand 4: Lv1 · Next cost: ([\d,.]+) badges · ([\d,.]+)\/([\d,.]+) used · ([\d,.]+) remaining\.$/,'Strang 1: St1 · Strang 2: St1 · Strang 3: St1 · Strang 4: St1 · Nächste Kosten: $1 Abzeichen · $2/$3 verwendet · $4 verbleibend.'],
[/^Use the Planner to compare your current saved Officers and Inventory against projected future Officer sessions, including expected resources for one or two future Officers\.$/,'Verwende den Planer, um deine gespeicherten Offiziere und dein Inventar mit den prognostizierten zukünftigen Offiziers-Sitzungen zu vergleichen, einschließlich der erwarteten Ressourcen für einen oder zwei zukünftige Offiziere.'],
[/^Application language$/,'Anwendungssprache'],
[/^↓ Download QA16 Report$/,'↓ QA17-Bericht herunterladen'],
[/^Running QA16 across EN \/ FR \/ DE \/ IT…$/,'QA17 wird für EN / FR / DE / IT ausgeführt…'],
[/^Scanning rendered UI, dictionaries, dynamic text sources and Help…$/,'Gerenderte Oberfläche, Wörterbücher, dynamische Textquellen und Hilfe werden geprüft…'],
[/^Strict read-only audit\..*$/,'Strenge schreibgeschützte Prüfung. FR/DE/IT schlagen fehl, wenn sichtbarer Benutzertext auf Englisch bleibt oder Übersetzungsreste vorhanden sind.']
],
it:[
[/^S6 Red Queen — 1,600 Badge \+ 1 more$/,'S6 Red Queen — 1.600 distintivi + 1 altro'],
[/^Priority: Development — ([\d,.]+) more Officer Badges are required\.$/,'Priorità: Sviluppo — servono altri $1 distintivi Ufficiale.'],
[/^Elite Officer Badge$/,'Distintivo Ufficiale Elite'],
[/^Universal Elite Badges Held$/,'Distintivi Elite universali posseduti'],
[/^Every Officer is listed even when the player currently holds 0 badges\. Each value is stored separately for that Officer and is used throughout the app\.$/,'Ogni Ufficiale è elencato anche quando il giocatore non possiede attualmente alcun distintivo. Ogni valore viene memorizzato separatamente per quell’Ufficiale ed è utilizzato in tutta l’applicazione.'],
[/^Strand 1: Lv1 · Strand 2: Lv1 · Strand 3: Lv1 · Strand 4: Lv1 · Next cost: ([\d,.]+) badges · ([\d,.]+)\/([\d,.]+) used · ([\d,.]+) remaining\.$/,'Ramo 1: Lv1 · Ramo 2: Lv1 · Ramo 3: Lv1 · Ramo 4: Lv1 · Costo successivo: $1 distintivi · $2/$3 usati · $4 rimanenti.'],
[/^ORV \/ Badge Forecast$/,'Previsione ORV / distintivi'],
[/^Use the Planner to compare your current saved Officers and Inventory against projected future Officer sessions, including expected resources for one or two future Officers\.$/,'Usa il Pianificatore per confrontare gli Ufficiali salvati e l’Inventario con le sessioni future previste, incluse le risorse attese per uno o due futuri Ufficiali.'],
[/^⬇ Export App Backup$/,'⬇ Esporta backup dell’applicazione'],
[/^⬆ Restore App Backup$/,'⬆ Ripristina backup dell’applicazione'],
[/^Application language$/,'Lingua dell’applicazione'],
[/^↓ Download QA16 Report$/,'↓ Scarica il rapporto QA17'],
[/^Running QA16 across EN \/ FR \/ DE \/ IT…$/,'Esecuzione di QA17 per EN / FR / DE / IT…'],
[/^Scanning rendered UI, dictionaries, dynamic text sources and Help…$/,'Analisi dell’interfaccia visualizzata, dei dizionari, delle fonti di testo dinamiche e della Guida…'],
[/^Strict read-only audit\..*$/,'Controllo rigoroso in sola lettura. FR/DE/IT falliscono se il testo visibile resta in inglese o se persistono residui di traduzione.']
]};

function tr(s,lang=active){if(lang==='en'||!s)return s;const d=D()[lang]||{};let o=s;for(const [rx,rp] of Q18[lang]||[]){if(rx.test(o)){o=o.replace(rx,rp);break}}if(o!==s)return o;if(Object.prototype.hasOwnProperty.call(d,s))return d[s];for(const [rx,rp] of Q17[lang]||[]){if(rx.test(o)){o=o.replace(rx,rp);break}}if(o!==s)return o;for(const [rx,rp] of Q12[lang]||[]){if(rx.test(o)){o=o.replace(rx,rp);break}}if(o!==s)return o;for(const [rx,rp] of R[lang]||[]){if(rx.test(o)){o=o.replace(rx,rp);break}}if(o!==s)return o;for(const k of Object.keys(d).filter(k=>k.length>=5&&o.includes(k)).sort((a,b)=>b.length-a.length)){o=o.split(k).join(d[k])}return o}
function tn(n){const p=n.parentElement;if(!p||/^(SCRIPT|STYLE|TEXTAREA)$/i.test(p.tagName)||p.closest('#appLanguage')||p.closest('#help'))return;const c=n.nodeValue;if(!base.has(n))base.set(n,c);else if(active!=='en'&&last.has(n)&&c!==last.get(n))base.set(n,c);const b=base.get(n),lead=(b.match(/^\s*/)||[''])[0],trail=(b.match(/\s*$/)||[''])[0],core=b.trim(),o=active==='en'?b:lead+tr(core)+trail;last.set(n,o);if(c!==o)n.nodeValue=o}
function root(r=document.body){if(!r)return;busy=true;try{const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))tn(n);r.querySelectorAll?.('[placeholder],[title],[aria-label],[alt]').forEach(e=>{if(e.closest('#appLanguage')||e.closest('#help'))return;for(const a of ['placeholder','title','aria-label','alt'])if(e.hasAttribute(a)){const k='data-kow-'+a.replace('aria-','aria');if(!e.hasAttribute(k))e.setAttribute(k,e.getAttribute(a));e.setAttribute(a,active==='en'?e.getAttribute(k):tr(e.getAttribute(k)))}})}finally{busy=false}}
function apply(l){active=LANGS.includes(l)?l:'en';localStorage.setItem(KEY,active);document.documentElement.lang=active;const s=document.getElementById('appLanguage');if(s){s.value=active;const aria={en:'Application language',fr:'Langue de l’application',de:'Anwendungssprache',it:'Lingua dell’applicazione'};s.setAttribute('aria-label',aria[active]||aria.en);}const h=document.querySelector('#help');if(h){if(!h.dataset.englishHtml)h.dataset.englishHtml=h.innerHTML;if(active==='en')h.innerHTML=h.dataset.englishHtml;else{const x=window.KOW_HELP_HTML_V450?.[active];if(x)h.innerHTML=x}}root(document.body)}
function ui(){const s=document.getElementById('appLanguage');if(s&&!s.dataset.kowLanguageWired){s.dataset.kowLanguageWired='1';s.addEventListener('change',e=>apply(e.target.value))}}
function watch(){if(obs)return;obs=new MutationObserver(ms=>{if(busy||active==='en')return;for(const m of ms){if(m.type==='characterData')tn(m.target);else for(const n of m.addedNodes){if(n.nodeType===3)tn(n);else if(n.nodeType===1)root(n)}}});obs.observe(document.body,{subtree:true,childList:true,characterData:true})}
const A=window.alert.bind(window),C=window.confirm.bind(window),P=window.prompt.bind(window);window.alert=m=>A(tr(String(m)));window.confirm=m=>C(tr(String(m)));window.prompt=(m,d)=>P(tr(String(m)),d);
window.KOW_PRESENTATION_I18N={apply,translateRoot:root,getLanguage:()=>active,translateString:(s,l)=>tr(s,l||active),canTranslate:(s,l)=>tr(s,l||active)!==s};
function init(){ui();apply(active);watch()}if(document.readyState==='complete')setTimeout(init,0);else window.addEventListener('load',()=>setTimeout(init,0),{once:true});
})();