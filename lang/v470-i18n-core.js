/* Officer Command Centre v4.7.0 — central multilingual runtime. No MutationObserver. */
(function(){
'use strict';
const VERSION='v470-i18n-core-23',LANGS=['en','fr','de','it'],STORE='kow-language-v470';
const LEGACY=['kow-language-v460-strict','kow-language-v460','kow_language','appLanguage','kowLanguage','kowLang','language'];
const dicts=()=>({en:window.KOW_I18N_EN||{},fr:window.KOW_I18N_FR||{},de:window.KOW_I18N_DE||{},it:window.KOW_I18N_IT||{}});
const get=k=>{try{return localStorage.getItem(k)}catch(_){return null}},put=(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}};
const norm=v=>{const x=String(v||'en').slice(0,2).toLowerCase();return LANGS.includes(x)?x:'en'};
let active=norm(get(STORE)||LEGACY.map(get).find(Boolean)||'en'),applying=false,scheduled=false,helpEnglishHTML='';
const textBase=new WeakMap(),textLast=new WeakMap(),attrBase=new WeakMap(),attrLast=new WeakMap(),wrapped=new WeakSet();
function hashKey(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return'msg.'+(h>>>0).toString(36)}
function escRx(s){return s.replace(/[.*+?^$()|[\]\\]/g,'\\$&')}
let byId=Object.create(null),bySource=Object.create(null),glossary={fr:{},de:{},it:{}},glossaryKeys={fr:[],de:[],it:[]};
function buildCatalogue(){const d=dicts();byId=Object.create(null);bySource=Object.create(null);for(const source of Object.keys(d.en).sort()){const id=hashKey(source),entry={id,en:source,fr:d.fr[source]||'',de:d.de[source]||'',it:d.it[source]||''};byId[id]=entry;bySource[source]=entry}for(const lang of ['fr','de','it']){glossary[lang]={};for(const [source,value] of Object.entries(d[lang])){if(!source||!value||source===value||source.length<4||!/[A-Za-zÀ-ÿ]/.test(source))continue;glossary[lang][source]=value}glossaryKeys[lang]=Object.keys(glossary[lang]).sort((a,b)=>b.length-a.length)}}
const templates=[
{source:'Showing {count} of {total} Officers · Highest progress in this filtered view: {name} ({pct}%).',fr:'Affichage de {count} sur {total} officiers · Progression la plus élevée dans cette vue filtrée : {name} ({pct} %).',de:'{count} von {total} Offizieren angezeigt · Höchster Fortschritt in dieser gefilterten Ansicht: {name} ({pct} %).',it:'Visualizzati {count} di {total} Ufficiali · Progressi più alti in questa vista filtrata: {name} ({pct}%).'},
{source:'Level {level} / 10 · Free starting level',fr:'Niveau {level} / 10 · Niveau initial gratuit',de:'Stufe {level} / 10 · Kostenlose Anfangsstufe',it:'Livello {level} / 10 · Livello iniziale gratuito'},
{source:'{used} / 36 paid upgrades · {pct}%',fr:'{used} / 36 améliorations payantes · {pct} %',de:'{used} / 36 kostenpflichtige Verbesserungen · {pct} %',it:'{used} / 36 potenziamenti a pagamento · {pct}%'},
{source:'Level {level} / 70',fr:'Niveau {level} / 70',de:'Stufe {level} / 70',it:'Livello {level} / 70'},
{source:'Officer unlocked · Training {training} / 180 · Skill Badges {used} / {total} used',fr:'Officier débloqué · Entraînement {training} / 180 · Insignes de compétence {used} / {total} utilisés',de:'Offizier freigeschaltet · Training {training} / 180 · Fähigkeitsabzeichen {used} / {total} verwendet',it:'Ufficiale sbloccato · Addestramento {training} / 180 · Badge abilità {used} / {total} utilizzati'},
{source:'Officer not yet unlocked · Training {training} / 180 · Skill Badges {used} / {total} used',fr:'Officier non débloqué · Entraînement {training} / 180 · Insignes de compétence {used} / {total} utilisés',de:'Offizier noch nicht freigeschaltet · Training {training} / 180 · Fähigkeitsabzeichen {used} / {total} verwendet',it:'Ufficiale non ancora sbloccato · Addestramento {training} / 180 · Badge abilità {used} / {total} utilizzati'},
{source:'Priority: XP — {value} more XP is required.',fr:'Priorité : XP — {value} XP supplémentaires sont nécessaires.',de:'Priorität: XP — weitere {value} XP werden benötigt.',it:'Priorità: XP — sono necessari altri {value} XP.'},
{source:'Skill 1: Lv{a} · Skill 2: Lv{b} · Skill 3: Lv{c} · Skill 4: Lv{d} · Next cost: {cost} Officer Badges · {used}/{total} used · {remaining} remaining.',fr:'Compétence 1 : Niv. {a} · Compétence 2 : Niv. {b} · Compétence 3 : Niv. {c} · Compétence 4 : Niv. {d} · Coût suivant : {cost} insignes d’officier · {used}/{total} utilisés · {remaining} restants.',de:'Fertigkeit 1: St. {a} · Fertigkeit 2: St. {b} · Fertigkeit 3: St. {c} · Fertigkeit 4: St. {d} · Nächste Kosten: {cost} Offiziersabzeichen · {used}/{total} verwendet · {remaining} verbleibend.',it:'Abilità 1: Lv{a} · Abilità 2: Lv{b} · Abilità 3: Lv{c} · Abilità 4: Lv{d} · Costo successivo: {cost} Badge Ufficiale · {used}/{total} utilizzati · {remaining} rimanenti.'},
{source:'Legendary: 5 Officer Badges per Training level · 900 Officer Badges for Training to MAX. Skill progression uses 690 Officer Badges, included in the 1,600 total.',fr:'Légendaire : 5 insignes d’officier par niveau d’entraînement · 900 insignes d’officier pour l’entraînement jusqu’au MAX. La progression des compétences utilise 690 badges d’officier, inclus dans le total de 1 600.',de:'Legendär: 5 Offiziersabzeichen pro Trainingsstufe · 900 Offiziersabzeichen für das Training bis MAX. Für die Fertigkeitsentwicklung werden 690 Offiziersabzeichen benötigt, die im Gesamtwert von 1.600 enthalten sind.',it:'Leggendario: 5 Badge Ufficiale per livello di addestramento · 900 Badge Ufficiale per l’Addestramento fino a MAX. La progressione delle abilità utilizza 690 Badge Ufficiale, inclusi nel totale di 1.600.'},
{source:'Need {value} more Officer Badges',fr:'Il manque {value} badges d’officier',de:'Es fehlen {value} Offiziersabzeichen',it:'Servono altri {value} Badge Ufficiale'},
{source:'Fifth Skill: LOCKED — requires all four primary skills at Level 10',fr:'Cinquième compétence : VERROUILLÉE — les quatre compétences principales doivent atteindre le niveau 10',de:'Fünfte Fertigkeit: GESPERRT — alle vier Hauptfertigkeiten müssen Stufe 10 erreichen',it:'Quinta abilità: BLOCCATA — tutte e quattro le abilità principali devono raggiungere il livello 10'},
{source:'{value} Officer Badges total. The fifth skill unlocks when all four primary skills reach Level 10.',fr:'{value} badges d’officier au total. La cinquième compétence se débloque lorsque les quatre compétences principales atteignent le niveau 10.',de:'Insgesamt {value} Offiziersabzeichen. Die fünfte Fertigkeit wird freigeschaltet, sobald alle vier Hauptfertigkeiten Stufe 10 erreicht haben.',it:'{value} Badge Ufficiale in totale. La quinta abilità si sblocca quando tutte e quattro le abilità principali raggiungono il livello 10.'},
{source:'S{season} · Infantry',fr:'S{season} · Infanterie',de:'S{season} · Infanterie',it:'S{season} · Fanteria'},
{source:'{value} progress saved.',fr:'Progression de {value} enregistrée.',de:'Fortschritt für {value} gespeichert.',it:'Progressi di {value} salvati.'},
{source:'Reset saved progress for {value}? Shared resources will not be changed.',fr:'Réinitialiser la progression enregistrée de {value} ? Les ressources partagées ne seront pas modifiées.',de:'Gespeicherten Fortschritt für {value} zurücksetzen? Gemeinsame Ressourcen bleiben unverändert.',it:'Reimpostare i progressi salvati di {value}? Le risorse condivise non verranno modificate.'},
{source:'Four primary skills unlock with the Officer’s Current Star Level: 0★ = Skill 1, 1★ = Skills 1–2, 2★ = Skills 1–3, and 3★+ = all four. Each starts at Level 1. {value} Skill Badge progression: {value} Officer Badges total. {value}',fr:'Les quatre compétences principales se débloquent selon le niveau d’étoiles actuel de l’officier : 0★ = compétence 1, 1★ = compétences 1–2, 2★ = compétences 1–3 et 3★+ = les quatre. Chacune commence au niveau 1. Progression des badges de compétence {value} : {value} badges d’officier au total. {value}',de:'Die vier Hauptfertigkeiten werden abhängig von der aktuellen Sternstufe des Offiziers freigeschaltet: 0★ = Fertigkeit 1, 1★ = Fertigkeiten 1–2, 2★ = Fertigkeiten 1–3 und 3★+ = alle vier. Jede beginnt auf Stufe 1. {value}-Fortschritt bei Fertigkeitsabzeichen: insgesamt {value} Offiziersabzeichen. {value}',it:'Le quattro abilità principali si sbloccano in base al livello Stelle attuale dell’Ufficiale: 0★ = Abilità 1, 1★ = Abilità 1–2, 2★ = Abilità 1–3 e 3★+ = tutte e quattro. Ognuna inizia al Livello 1. Progressione Badge abilità {value}: {value} Badge Ufficiale totali. {value}'},
{source:'{value} Officer · {value}',fr:'Officier {value} · {value}',de:'Offizier {value} · {value}',it:'Ufficiale {value} · {value}'},
{source:'No Officers match these filters',fr:'Aucun officier ne correspond à ces filtres',de:'Keine Offiziere entsprechen diesen Filtern',it:'Nessun Ufficiale corrisponde a questi filtri'},
{source:'Comparing {value} with {value} .',fr:'Comparaison de {value} avec {value}.',de:'Vergleich von {value} mit {value}.',it:'Confronto tra {value} e {value}.'},
{source:'{value} saved Officer{value} ·',fr:'{value} officier{value} enregistré(s) ·',de:'{value} gespeicherte Offiziere ·',it:'{value} Ufficiale{value} salvati ·'},
{source:'No selected Officer has been started yet.',fr:'Aucun des officiers sélectionnés n’a encore été commencé.',de:'Für keinen der ausgewählten Offiziere wurde bisher ein Fortschritt begonnen.',it:'Nessun Ufficiale selezionato ha ancora iniziato.'},
{source:'Highest actual progress: {value} at {value}%.',fr:'Progression réelle la plus élevée : {value} à {value} %.',de:'Höchster tatsächlicher Fortschritt: {value} bei {value} %.',it:'Progressi effettivi più alti: {value} al {value}%.'},
{source:'No eligible Officers are available for the selected filters.',fr:'Aucun officier admissible ne correspond aux filtres sélectionnés.',de:'Für die ausgewählten Filter sind keine geeigneten Offiziere verfügbar.',it:'Nessun Ufficiale idoneo è disponibile per i filtri selezionati.'},
{source:'{value} Target: {value} {value} · {value} projected Officer{value}',fr:'{value} Objectif : {value} {value} · {value} officier{value} prévu',de:'{value} Ziel: {value} {value} · {value} geplante Offizier{value}',it:'{value} Obiettivo: {value} {value} · {value} Ufficiale{value} previsto'},
{source:'{value} can be maxed with the resources currently entered in the app.',fr:'{value} peut être amélioré au maximum avec les ressources actuellement saisies dans l’application.',de:'{value} kann mit den derzeit in der App eingetragenen Ressourcen vollständig maximiert werden.',it:'{value} può essere portato al massimo con le risorse attualmente inserite nell’app.'},
{source:'Complete all four primary Skills to Level 10 before starting Training.',fr:'Terminez les quatre compétences principales au niveau 10 avant de commencer l’entraînement.',de:'Schließe zuerst alle vier Hauptfertigkeiten auf Stufe 10 ab, bevor du mit dem Training beginnst.',it:'Completa tutte e quattro le abilità principali al Livello 10 prima di iniziare l’addestramento.'},
{source:'Created by FireStorm',fr:'Créé par FireStorm',de:'Erstellt von FireStorm',it:'Creato da FireStorm'},
{source:'{value} officers shown · Database validation passed.',fr:'{value} officiers affichés · Validation de la base de données réussie.',de:'{value} Offiziere angezeigt · Datenbankprüfung bestanden.',it:'{value} Ufficiali visualizzati · Convalida del database superata.'},
{source:'Could not determine the published version. You can still use Refresh Latest Version.',fr:'Impossible de déterminer la version publiée. Vous pouvez toujours utiliser « Actualiser vers la dernière version ».',de:'Die veröffentlichte Version konnte nicht ermittelt werden. Du kannst weiterhin „Auf neueste Version aktualisieren“ verwenden.',it:'Impossibile determinare la versione pubblicata. Puoi comunque usare «Aggiorna all’ultima versione».'},
{source:'Update available: v{value}. Tap Refresh Latest Version to install it.',fr:'Mise à jour disponible : v{value}. Appuyez sur « Actualiser vers la dernière version » pour l’installer.',de:'Update verfügbar: v{value}. Wähle „Auf neueste Version aktualisieren“, um sie zu installieren.',it:'Aggiornamento disponibile: v{value}. Tocca «Aggiorna all’ultima versione» per installarlo.'},
{source:'You are up to date — v{value}.',fr:'Votre application est à jour — v{value}.',de:'Du verwendest die aktuelle Version — v{value}.',it:'L’app è aggiornata — v{value}.'},
{source:'Unable to check right now. Check your internet connection, or use Refresh Latest Version.',fr:'Vérification impossible pour le moment. Vérifiez votre connexion Internet ou utilisez « Actualiser vers la dernière version ».',de:'Die Prüfung ist derzeit nicht möglich. Überprüfe deine Internetverbindung oder verwende „Auf neueste Version aktualisieren“.',it:'Impossibile verificare in questo momento. Controlla la connessione Internet o usa «Aggiorna all’ultima versione».'},
{source:'{value} is now saved as MAXED.',fr:'{value} est maintenant enregistré comme MAXÉ.',de:'{value} wurde jetzt als MAXI gespeichert.',it:'{value} è ora salvato come MAX.'},
{source:'Progress could not be saved. Please refresh and try again.',fr:'La progression n’a pas pu être enregistrée. Actualisez la page et réessayez.',de:'Der Fortschritt konnte nicht gespeichert werden. Bitte aktualisiere die Seite und versuche es erneut.',it:'Impossibile salvare i progressi. Aggiorna la pagina e riprova.'},
{source:'All Seasons',fr:'Toutes les saisons',de:'Alle Saisons',it:'Tutte le stagioni'},
{source:'All Roles',fr:'Tous les rôles',de:'Alle Rollen',it:'Tutti i ruoli'},
{source:'All seasons',fr:'Toutes les saisons',de:'Alle Saisons',it:'Tutte le stagioni'},
{source:'Select Officer',fr:'Sélectionner un officier',de:'Offizier auswählen',it:'Seleziona Ufficiale'},
{source:'Add Officers to build an upgrade plan.',fr:'Ajoutez des officiers pour créer un plan d’amélioration.',de:'Füge Offiziere hinzu, um einen Verbesserungsplan zu erstellen.',it:'Aggiungi Ufficiali per creare un piano di potenziamento.'},
{source:'— Select saved plan —',fr:'— Sélectionner un plan enregistré —',de:'— Gespeicherten Plan auswählen —',it:'— Seleziona piano salvato —'},
{source:'Readiness: Select an Officer.',fr:'Préparation : sélectionnez un officier.',de:'Bereitschaft: Offizier auswählen.',it:'Preparazione: seleziona un Ufficiale.'},
{source:'Created by FireStorm',fr:'Créé par FireStorm',de:'Erstellt von FireStorm',it:'Creato da FireStorm'},
{source:'Forecast future Officer costs from the established Officer-release sequence.',fr:'Prévision des coûts des futurs officiers selon le calendrier établi des sorties.',de:'Prognose zukünftiger Offizierskosten anhand der festgelegten Veröffentlichungsreihenfolge.',it:'Previsione dei costi dei futuri Ufficiali in base alla sequenza di rilascio stabilita.'},
{source:'KoW releases follow this recurring annual cycle, displayed in calendar order from January → December. The current month is highlighted automatically.',fr:'Les sorties KoW suivent ce cycle annuel récurrent, affiché dans l’ordre du calendrier de janvier à décembre. Le mois en cours est automatiquement mis en évidence.',de:'KoW-Veröffentlichungen folgen diesem jährlich wiederkehrenden Zyklus in Kalenderreihenfolge von Januar bis Dezember. Der aktuelle Monat wird automatisch hervorgehoben.',it:'Le uscite KoW seguono questo ciclo annuale ricorrente, visualizzato in ordine da gennaio a dicembre. Il mese corrente viene evidenziato automaticamente.'},
{source:'🧠 Officer Readiness Intelligence',fr:'🧠 Analyse de préparation des officiers',de:'🧠 Offiziers-Bereitschaftsanalyse',it:'🧠 Analisi della preparazione degli Ufficiali'},
{source:'🎯 Future Officer Targets & Saved Scenarios',fr:'🎯 Objectifs futurs des officiers et scénarios enregistrés',de:'🎯 Zukünftige Offiziersziele und gespeicherte Szenarien',it:'🎯 Obiettivi futuri degli Ufficiali e scenari salvati'},
{source:'📈 Planning Readiness Dashboard',fr:'📈 Tableau de bord de préparation du plan',de:'📈 Planungs-Bereitschaftsübersicht',it:'📈 Dashboard di preparazione della pianificazione'},
{source:'Create a reusable future-Officer target without changing Inventory. Saved scenarios are stored on this device.',fr:'Créez un objectif réutilisable pour un futur officier sans modifier l’inventaire. Les scénarios enregistrés sont stockés sur cet appareil.',de:'Erstelle ein wiederverwendbares Ziel für zukünftige Offiziere, ohne das Inventar zu ändern. Gespeicherte Szenarien bleiben auf diesem Gerät.',it:'Crea un obiettivo riutilizzabile per un futuro Ufficiale senza modificare l’Inventario. Gli scenari salvati sono memorizzati su questo dispositivo.'},
{source:'Turns saved future-Officer scenarios into a release-readiness view and highlights the next resource to prioritise.',fr:'Transforme les scénarios enregistrés de futurs officiers en vue de préparation aux sorties et met en évidence la prochaine ressource à prioriser.',de:'Wandelt gespeicherte Szenarien zukünftiger Offiziere in eine Veröffentlichungsübersicht um und hebt die nächste zu priorisierende Ressource hervor.',it:'Trasforma gli scenari salvati dei futuri Ufficiali in una vista di preparazione alle uscite ed evidenzia la prossima risorsa da prioritizzare.'},
{source:'Enter resources once and press Save Inventory. The saved inventory is then used throughout the app. Items are displayed in the game list order defined by the Inventory master list.',fr:'Saisissez les ressources une seule fois, puis appuyez sur Enregistrer l’inventaire. L’inventaire enregistré est ensuite utilisé dans toute l’application. Les éléments suivent l’ordre de la liste de référence du jeu.',de:'Gib die Ressourcen einmal ein und wähle „Inventar speichern“. Das gespeicherte Inventar wird anschließend in der gesamten App verwendet. Die Einträge folgen der Reihenfolge der Inventar-Stammliste im Spiel.',it:'Inserisci le risorse una sola volta e premi Salva Inventario. L’inventario salvato verrà utilizzato in tutta l’app. Gli elementi seguono l’ordine dell’elenco principale del gioco.'},
{source:'Enter badge quantities for any Elite, Epic or Legendary Officer, then press Save Inventory. Every Officer is listed even when the player currently holds 0 badges. Each value is stored separately for that Officer and is used throughout the app.',fr:'Saisissez les quantités d’insignes pour chaque officier Élite, Épique ou Légendaire, puis appuyez sur Enregistrer l’inventaire. Tous les officiers sont listés, même si le joueur ne possède actuellement aucun insigne. Chaque quantité est enregistrée séparément pour l’officier concerné et utilisée dans toute l’application.',de:'Gib die Abzeichenmengen für Elite-, Epische oder Legendäre Offiziere ein und wähle „Inventar speichern“. Jeder Offizier wird aufgeführt, auch wenn der Spieler derzeit 0 Abzeichen besitzt. Jeder Wert wird separat für den jeweiligen Offizier gespeichert und in der gesamten App verwendet.',it:'Inserisci le quantità di badge per ogni Ufficiale Elite, Epico o Leggendario, quindi premi Salva Inventario. Ogni Ufficiale è elencato anche se il giocatore possiede 0 badge. Ogni valore viene memorizzato separatamente per quell’Ufficiale e utilizzato in tutta l’app.'},
{source:'Forecast only — actual release costs should replace the estimate when published.',fr:'Prévision uniquement — les coûts réels de sortie remplaceront cette estimation lors de leur publication.',de:'Nur eine Prognose — sobald die tatsächlichen Veröffentlichungskosten bekannt sind, ersetzen sie diese Schätzung.',it:'Solo previsione — i costi effettivi verranno sostituiti a questa stima quando saranno pubblicati.'},
{source:'Readiness is calculated from the selected Officer’s saved progress plus the resources currently available from Inventory.',fr:'La préparation est calculée à partir de la progression enregistrée de l’officier sélectionné et des ressources actuellement disponibles dans l’inventaire.',de:'Die Bereitschaft wird anhand des gespeicherten Fortschritts des ausgewählten Offiziers und der derzeit im Inventar verfügbaren Ressourcen berechnet.',it:'La preparazione viene calcolata in base ai progressi salvati dell’Ufficiale selezionato e alle risorse attualmente disponibili nell’Inventario.'},
{source:'No planning scenarios saved yet.',fr:'Aucun scénario de planification n’a encore été enregistré.',de:'Bisher wurden keine Planungsszenarien gespeichert.',it:'Non è ancora stato salvato alcuno scenario di pianificazione.'},
{source:'Save a Planning Scenario above to see readiness percentages and a suggested next action.',fr:'Enregistrez un scénario de planification ci-dessus pour afficher les pourcentages de préparation et la prochaine action suggérée.',de:'Speichere oben ein Planungsszenario, um Bereitschaftsprozente und einen empfohlenen nächsten Schritt zu sehen.',it:'Salva uno scenario di pianificazione qui sopra per visualizzare le percentuali di preparazione e la prossima azione suggerita.'},
{source:'🎯 Upgrade Targets & Recommendations',fr:'🎯 Objectifs et recommandations d’amélioration',de:'🎯 Verbesserungsziele und Empfehlungen',it:'🎯 Obiettivi e raccomandazioni di potenziamento'},
{source:'Choose a target for the currently selected Officer. This v4.7.0 release compares the saved current position with your target and gives a clear next-step recommendation. It does not spend or alter Inventory.',fr:'Choisissez un objectif pour l’officier sélectionné. Cette version v4.7.0 compare la progression actuelle enregistrée à votre objectif et recommande clairement la prochaine étape. Elle ne dépense ni ne modifie l’inventaire.',de:'Wähle ein Ziel für den aktuell ausgewählten Offizier. Diese Version v4.7.0 vergleicht den gespeicherten aktuellen Stand mit deinem Ziel und empfiehlt den nächsten Schritt. Das Inventar wird dabei weder ausgegeben noch verändert.',it:'Scegli un obiettivo per l’Ufficiale selezionato. Questa versione v4.7.0 confronta la posizione attuale salvata con l’obiettivo e indica chiaramente il prossimo passo. Non spende né modifica l’Inventario.'}
,{source:'Badge / Star / XP readiness: {value}%',fr:'Préparation badges / étoiles / XP : {value}%',de:'Bereitschaft Abzeichen / Sterne / XP: {value}%',it:'Preparazione Badge / Stelle / XP: {value}%'}
,{source:'Badge / Star / XP readiness {value}%',fr:'Préparation badges / étoiles / XP {value}%',de:'Bereitschaft Abzeichen / Sterne / XP {value}%',it:'Preparazione Badge / Stelle / XP {value}%'}
,{source:'Overall readiness (average): {value}%',fr:'Préparation globale (moyenne) : {value}%',de:'Gesamtbereitschaft (Durchschnitt): {value}%',it:'Preparazione complessiva (media): {value}%'}
,{source:'Limiting resource: Badges — {value}%',fr:'Ressource limitante : Insignes — {value}%',de:'Limitierende Ressource: Abzeichen — {value}%',it:'Risorsa limitante: Badge — {value}%'}
,{source:'Limiting resource: Officer Badges — {value}%',fr:'Ressource limitante : insignes d’officier — {value}%',de:'Limitierende Ressource: Offiziersabzeichen — {value}%',it:'Risorsa limitante: Badge Ufficiale — {value}%'}
,{source:'Limiting resource: Stars — {value}%',fr:'Ressource limitante : étoiles — {value}%',de:'Limitierende Ressource: Sterne — {value}%',it:'Risorsa limitante: Stelle — {value}%'}
,{source:'Limiting resource: XP — {value}%',fr:'Ressource limitante : XP — {value}%',de:'Limitierende Ressource: XP — {value}%',it:'Risorsa limitante: XP — {value}%'}

,{source:'{value} ({per} per Legendary Officer). Skill Badge costs are included in the 1,600 Officer Badge total and eligible ORV can contribute; track skill progress in Development.',fr:'{value} ({per} par Officier légendaire). Les coûts des compétences sont inclus dans le total de 1 600 badges d’officier et les ORV admissibles peuvent y contribuer ; suivez la progression dans Développement.',de:'{value} ({per} pro legendärem Offizier). Fertigkeitskosten sind im Gesamtbedarf von 1.600 Offiziersabzeichen enthalten und zulässige ORV können dazu beitragen; verfolge den Fortschritt unter Entwicklung.',it:'{value} ({per} per Ufficiale Leggendario). I costi delle abilità sono inclusi nel totale di 1.600 Badge Ufficiale e gli ORV idonei possono contribuire; monitora i progressi in Sviluppo.'}
,{source:'Badge breakdown: {universal} Universal Badges + {chests} ordinary Badge Chests + {equiv} badge equivalents from {orv} ORV at {rate} ORV per badge. ORV remainder: {remainder}. Selection Chests held: {selection} and excluded from shared badge totals.',fr:'Détail des insignes : {universal} insignes universels + {chests} coffres d’insignes ordinaires + {equiv} équivalents d’insignes issus de {orv} ORV à {rate} ORV par insigne. Solde ORV : {remainder}. Coffres de sélection détenus : {selection}, exclus du total partagé.',de:'Abzeichenaufschlüsselung: {universal} universelle Abzeichen + {chests} normale Abzeichenkisten + {equiv} Abzeichenäquivalente aus {orv} ORV bei {rate} ORV pro Abzeichen. ORV-Rest: {remainder}. Gehaltene Auswahltruhen: {selection}; sie zählen nicht zum gemeinsamen Abzeichenbestand.',it:'Dettaglio Badge: {universal} Badge universali + {chests} Casse Badge ordinarie + {equiv} equivalenti Badge da {orv} ORV a {rate} ORV per Badge. ORV residui: {remainder}. Casse selezione possedute: {selection}, escluse dal totale condiviso.'}
,{source:'ORV still needed for the remaining {badges} Officer Badges: {orv} ORV ({rate} per badge). Held ORV has already been included in the badge-equivalent total above.',fr:'ORV encore nécessaires pour les {badges} insignes d’officier restants : {orv} ORV ({rate} par insigne). Les ORV détenus sont déjà inclus dans le total d’équivalents ci-dessus.',de:'Noch benötigte ORV für die verbleibenden {badges} Offiziersabzeichen: {orv} ORV ({rate} pro Abzeichen). Gehaltene ORV sind bereits in der obigen Abzeichenäquivalent-Summe enthalten.',it:'ORV ancora necessari per i {badges} Badge Ufficiale rimanenti: {orv} ORV ({rate} per Badge). Gli ORV posseduti sono già inclusi nel totale equivalente indicato sopra.'}
,{source:'SRV: {srv} FORECAST for {stars} Exclusive Stars · Held {held} ·',fr:'SRV : {srv} PRÉVISION pour {stars} étoiles exclusives · Détenus {held} ·',de:'SRV: {srv} PROGNOSE für {stars} exklusive Sterne · Vorhanden {held} ·',it:'SRV: {srv} PREVISIONE per {stars} Stelle esclusive · Posseduti {held} ·'}
,{source:'Shared Officer Badges held: {shared} · ORV badge equivalents: {equiv} · ORV remainder: {remainder} · Selection Chests held: {selection} · Stars held: {stars} · XP held: {xp}',fr:'Insignes d’officier partagés détenus : {shared} · Équivalents d’insignes ORV : {equiv} · Solde ORV : {remainder} · Coffres de sélection détenus : {selection} · Étoiles détenues : {stars} · XP détenu : {xp}',de:'Gemeinsame Offiziersabzeichen vorhanden: {shared} · ORV-Abzeichenäquivalente: {equiv} · ORV-Rest: {remainder} · Auswahltruhen vorhanden: {selection} · Sterne vorhanden: {stars} · XP vorhanden: {xp}',it:'Badge Ufficiale condivisi posseduti: {shared} · equivalenti Badge da ORV: {equiv} · ORV residui: {remainder} · Casse selezione possedute: {selection} · Stelle possedute: {stars} · XP posseduti: {xp}'}
,{source:'Skill Badge requirement: {value} ({per} per Legendary Officer; included in the total Officer Badge requirement and eligible for ORV)',fr:'Besoin en badges de compétence : {value} ({per} par Officier légendaire ; inclus dans le total des badges d’officier et éligibles aux ORV)',de:'Bedarf an Fertigkeitsabzeichen: {value} ({per} pro legendärem Offizier; im Gesamtbedarf an Offiziersabzeichen enthalten und für ORV anrechenbar)',it:'Badge abilità richiesti: {value} ({per} per Ufficiale Leggendario; inclusi nel totale dei Badge Ufficiale e idonei agli ORV)'}
,{source:'Additional ORV for badge shortfall: {value} FORECAST · SRV: {srv} FORECAST',fr:'ORV supplémentaires pour le déficit d’insignes : {value} PRÉVISION · SRV : {srv} PRÉVISION',de:'Zusätzliche ORV für fehlende Abzeichen: {value} PROGNOSE · SRV: {srv} PROGNOSE',it:'ORV aggiuntivi per il deficit di Badge: {value} PREVISIONE · SRV: {srv} PREVISIONE'}
,{source:'Short by {value} Officer Badges',fr:'Il manque {value} insignes d’officier',de:'Es fehlen {value} Offiziersabzeichen',it:'Mancano {value} Badge Ufficiale'}

,{source:'{value}Test planning estimate using {value}% growth per future Officer release from {value}. For {value} Officer Badges (including 690 Officer Badges for Skills within the 1,600 total) and {value} Star value ({value} Exclusive Stars), plan for approximately {value} ORV and {value} SRV. Forecast only — replace with confirmed costs when released.',fr:'{value}Estimation de planification Test avec une hausse de {value}% par future sortie d’Officier à partir de {value}. Pour {value} insignes d’officier (dont 690 badges d’officier pour les compétences, inclus dans le total de 1 600) et une valeur de {value} étoiles ({value} étoiles exclusives), prévoyez environ {value} ORV et {value} SRV. Prévision uniquement — remplacez-la par les coûts confirmés à la sortie.',de:'{value}Test-Planungsschätzung mit {value}% Steigerung pro zukünftiger Offiziersveröffentlichung ausgehend von {value}. Für {value} Offiziersabzeichen (einschließlich 690 Offiziersabzeichen für Fertigkeiten innerhalb der 1.600 Gesamtmenge) und einen Sternwert von {value} ({value} exklusive Sterne) sind ungefähr {value} ORV und {value} SRV einzuplanen. Nur eine Prognose — nach Veröffentlichung durch bestätigte Kosten ersetzen.',it:'{value}Stima di pianificazione Test con un aumento del {value}% per ogni futura uscita di Ufficiali a partire da {value}. Per {value} Badge Ufficiale (inclusi 690 Badge Ufficiale per le abilità nel totale di 1.600) e un valore Stelle di {value} ({value} Stelle esclusive), pianifica circa {value} ORV e {value} SRV. Solo previsione — sostituisci con i costi confermati al rilascio.'}
];
function compileTemplate(source){
 const parts=source.split(/(\{[a-z]+\})/g);
 let count=0;
 const pattern=parts.map(part=>{
  if(/^\{[a-z]+\}$/.test(part)){count++;return'([\\s\\S]*?)'}
  return escRx(part);
 }).join('');
 return{count,rx:new RegExp('^'+pattern+'$')};
}
const addedTemplates=[
{source:'{value} Officer Badges still required',fr:'{value} insignes d’officier encore nécessaires',de:'Noch {value} Offiziersabzeichen erforderlich',it:'Sono ancora necessari {value} Badge Ufficiale'},
{source:'Priority: Development — {value} more Officer Badges are required.',fr:'Priorité : Développement — {value} insignes d’officier supplémentaires sont nécessaires.',de:'Priorität: Entwicklung — weitere {value} Offiziersabzeichen werden benötigt.',it:'Priorità: Sviluppo — servono altri {value} Badge Ufficiale.'},
{source:'Priority: Stars — {value} more Officer Star value is required.',fr:'Priorité : étoiles — une valeur supplémentaire de {value} étoiles d’officier est nécessaire.',de:'Priorität: Sterne — ein zusätzlicher Offiziers-Sternwert von {value} wird benötigt.',it:'Priorità: Stelle — sono necessari altri {value} punti valore Stelle Ufficiale.'},
{source:'Priority: XP — {value} more XP is required.',fr:'Priorité : XP — {value} XP supplémentaires sont nécessaires.',de:'Priorität: XP — weitere {value} XP werden benötigt.',it:'Priorità: XP — sono necessari altri {value} XP.'},
{source:'Skill 1: Lv{a} · Skill 2: Lv{b} · Skill 3: Lv{c} · Skill 4: Lv{d} · Primary skills complete · {used}/{total} Officer Badges used · 0 remaining.',fr:'Compétence 1 : Niv. {a} · Compétence 2 : Niv. {b} · Compétence 3 : Niv. {c} · Compétence 4 : Niv. {d} · Compétences principales terminées · {used}/{total} insignes d’officier utilisés · 0 restant.',de:'Fertigkeit 1: St. {a} · Fertigkeit 2: St. {b} · Fertigkeit 3: St. {c} · Fertigkeit 4: St. {d} · Hauptfertigkeiten abgeschlossen · {used}/{total} Offiziersabzeichen verwendet · 0 übrig.',it:'Abilità 1: Lv{a} · Abilità 2: Lv{b} · Abilità 3: Lv{c} · Abilità 4: Lv{d} · Abilità principali completate · {used}/{total} Badge Ufficiale utilizzati · 0 rimanenti.'}
];
const compiled=templates.concat(addedTemplates).map(t=>Object.assign({},t,compileTemplate(t.source)));
function templateTranslate(source,lang){
 const original=String(source);source=original.replace(/\s+/g,' ').trim();
 for(const t of compiled){
  const m=t.rx.exec(source);
  if(!m||!t[lang])continue;
  let i=0;
  return t[lang].replace(/\{[a-z]+\}/g,()=>m[++i]===undefined?'':m[i]);
 }
 return original;
}
function interpolate(value,params){return String(value).replace(/\{([A-Za-z0-9_]+)\}/g,(m,k)=>Object.prototype.hasOwnProperty.call(params||{},k)?String(params[k]):m)}
function t(key,params,lang){const l=norm(lang||active),entry=byId[key]||bySource[key];return entry?interpolate(entry[l]||entry.en,params||{}):interpolate(String(key),params||{})}
function glossaryTranslate(source,lang){
 let out=String(source);const d=glossary[lang]||{},word=c=>!!c&&/[A-Za-zÀ-ÿ0-9]/.test(c);
 for(const phrase of glossaryKeys[lang]||[]){
  const replacement=d[phrase];if(!replacement)continue;
  let at=out.indexOf(phrase);
  while(at!==-1){
   const before=at?out[at-1]:'',after=out[at+phrase.length]||'';
   if(!word(before)&&!word(after)){
    out=out.slice(0,at)+replacement+out.slice(at+phrase.length);
    at=out.indexOf(phrase,at+replacement.length);
   }else at=out.indexOf(phrase,at+1);
  }
 }
 return out;
}
function targetedTranslate(raw,lang){
 const exact={
 'Upgrade priority (lowest first)':['Priorité d’amélioration (plus faible en premier)','Upgrade-Priorität (niedrigste zuerst)','Priorità di potenziamento (prima la più bassa)'],
 'Upgrade priority — lowest first':['Priorité d’amélioration — la plus faible en premier','Upgrade-Priorität — niedrigste zuerst','Priorità di potenziamento — prima la più bassa'],
 'Sort Compare Officer list':['Trier la liste de comparaison des officiers','Vergleichsliste der Offiziere sortieren','Ordina l’elenco di confronto degli Ufficiali'],
 'No individual Officer Badges entered.':['Aucun insigne d’officier individuel saisi.','Keine individuellen Offiziersabzeichen eingegeben.','Nessun Badge Ufficiale individuale inserito.'],
 'Recommended order':['Ordre recommandé','Empfohlene Reihenfolge','Ordine consigliato'],
 'Season (newest first)':['Saison (de la plus récente à la plus ancienne)','Saison (neueste zuerst)','Stagione (dalla più recente)'],
 'Season — newest first':['Saison — de la plus récente à la plus ancienne','Saison — neueste zuerst','Stagione — dalla più recente'],
 'Progress (highest first)':['Progression (de la plus élevée à la plus faible)','Fortschritt (höchster zuerst)','Progressi (dal più alto)'],
 'Progress — highest first':['Progression — de la plus élevée à la plus faible','Fortschritt — höchster zuerst','Progressi — dal più alto'],
 'Compare filters':['Filtres de comparaison','Vergleichsfilter','Filtri di confronto'],
 'Sort Officers:':['Trier les officiers :','Offiziere sortieren:','Ordina Ufficiali:'],
 'Role':['Rôle','Rolle','Ruolo'],
 'Rarity':['Rareté','Seltenheit','Rarità'],
 'Fifth Skill: UNLOCKED':['Cinquième compétence : DÉBLOQUÉE','Fünfte Fertigkeit: FREIGESCHALTET','Quinta abilità: SBLOCCATA'],
 'MAX Training':['Entraînement MAX','MAX-Training','Addestramento MAX'],
 'S6 · Tank':['S6 · Chars','S6 · Panzer','S6 · Carri armati'],
 'Infantry, Gatherer':['Infanterie, Collecteur','Infanterie, Sammler','Fanteria, Raccoglitore'],
 'Tank, Gatherer':['Chars, Collecteur','Panzer, Sammler','Carri armati, Raccoglitore'],
 'Officer Badges available:':['Insignes d’officier disponibles :','Verfügbare Offiziersabzeichen:','Badge Ufficiale disponibili:'],
 'Shared Officer Badges held:':['Insignes d’officier partagés détenus :','Gemeinsame Offiziersabzeichen vorhanden:','Badge Ufficiale condivisi posseduti:'],
 '· ORV badge equivalents:':['· Équivalents d’insignes ORV :','· ORV-Abzeichenäquivalente:','· Equivalenti Badge da ORV:'],
 '· Selection Chests held:':['· Coffres de sélection détenus :','· Auswahltruhen vorhanden:','· Casse selezione possedute:'],
 '· ORV remainder:':['· Solde ORV :','· ORV-Rest:','· ORV residui:'],
 '· Stars held:':['· Étoiles détenues :','· Sterne vorhanden:','· Stelle possedute:'],
 'Projected Officers':['Officiers prévus','Geplante Offiziere','Ufficiali previsti'],
 'Target year':['Année cible','Zieljahr','Anno obiettivo'],
 '📊 Calculate Target':['📊 Calculer l’objectif','📊 Ziel berechnen','📊 Calcola obiettivo'],
 'Scenario saved:':['Scénario enregistré :','Szenario gespeichert:','Scenario salvato:'],
 'Priority target':['Objectif prioritaire','Prioritätsziel','Obiettivo prioritario'],
 'Optimised: convert Badge Chests to ORV':['Optimisé : convertir les coffres d’insignes en ORV','Optimiert: Abzeichenkisten in ORV umwandeln','Ottimizzato: converti le casse Badge in ORV'],
 'Delete Saved Plan':['Supprimer le plan enregistré','Gespeicherten Plan löschen','Elimina il piano salvato'],
 'e.g. Next Season':['p. ex. prochaine saison','z. B. nächste Saison','es. prossima stagione'],
 '🧠 Open Advanced Planner':['🧠 Ouvrir le planificateur avancé','🧠 Erweiterten Planer öffnen','🧠 Apri Pianificatore avanzato'],
 '📘 Level 70 XP':['📘 XP niveau 70','📘 XP für Stufe 70','📘 XP livello 70'],
 '🏆 MAX Officer':['🏆 Officier MAX','🏆 MAX-Offizier','🏆 Ufficiale MAX'],
 'Fully funded':['Entièrement financé','Vollständig finanziert','Completamente finanziato'],
 'S6 · Infantry':['S6 · Infanterie','S6 · Infanterie','S6 · Fanteria'],
 'Officer Stars':['Étoiles d’officier','Offizierssterne','Stelle Ufficiale'],
 'Application language':['Langue de l’application','App-Sprache','Lingua dell’app'],
 '❓ Help & Instructions':['❓ Aide et instructions','❓ Hilfe und Anleitungen','❓ Aiuto e istruzioni'],
 '🧠 Advanced Multi-Officer Planning':['🧠 Planification avancée de plusieurs officiers','🧠 Erweiterte Mehr-Offiziersplanung','🧠 Pianificazione avanzata multi-Ufficiale'],
 'October — S9 Rally / Garrison':['Octobre — S9 Ralliement / Garnison','Oktober — S9 Rallye / Garnison','Ottobre — S9 Raduno / Guarnigione'],
 'November — New Ships':['Novembre — Nouveaux navires','November — Neue Schiffe','Novembre — Nuove navi'],
 'Next: December — Guns: Rally / Garrison · Jets: Bomber':['Suivant : décembre — Canons : Ralliement / Garnison · Jets : Bombardier','Als Nächstes: Dezember — Geschütze: Rallye / Garnison · Jets: Bomber','Prossimo: dicembre — Cannoni: Raduno / Guarnigione · Jet: Bombardiere'],
 'December — Guns: Rally / Garrison · Jets: Bomber':['Décembre — Canons : Ralliement / Garnison · Jets : Bombardier','Dezember — Geschütze: Rallye / Garnison · Jets: Bomber','Dicembre — Cannoni: Raduno / Guarnigione · Jet: Bombardiere'],
 'November • CURRENT':['Novembre • ACTUEL','November • AKTUELL','Novembre • ATTUALE'],
 'December • NEXT':['Décembre • SUIVANT','Dezember • ALS NÄCHSTES','Dicembre • PROSSIMO'],
 'Confirmed S8 Rally / Garrison cost':['Coût confirmé S8 Ralliement / Garnison','Bestätigte S8-Kosten Rallye / Garnison','Costo confermato S8 Raduno / Guarnigione'],
 '{value}: {value} Next: {value} — {value}':['{value} : {value} Suivant : {value} — {value}','{value}: {value} Nächster Schritt: {value} — {value}','{value}: {value} Prossimo: {value} — {value}'],
 'Highest actual progress:':['Progression réelle la plus élevée :','Höchster tatsächlicher Fortschritt:','Progressi effettivi più alti:'],
 'Convert to ORV (':['Convertir en ORV (','In ORV umwandeln (','Converti in ORV ('],
 '🟢 READY TO MAX — {value}':['🟢 PRÊT À MAX — {value}','🟢 BEREIT FÜR MAX — {value}','🟢 PRONTO PER MAX — {value}'],
 '{value}: {value} Officer Badges per Training level · {value} Officer Badges for Training to MAX. Skill progression uses {value} Officer Badges, included in the total badge requirement.':['{value} : {value} insignes d’officier par niveau d’entraînement · {value} insignes pour entraîner jusqu’au MAX. La progression des compétences utilise {value} insignes, inclus dans le besoin total.','{value}: {value} Offiziersabzeichen pro Trainingsstufe · {value} Offiziersabzeichen für Training bis MAX. Für Fertigkeiten werden {value} Abzeichen benötigt, die im Gesamtbedarf enthalten sind.','{value}: {value} Badge Ufficiale per livello di addestramento · {value} Badge per l’addestramento fino a MAX. La progressione delle abilità usa {value} Badge, inclusi nel totale richiesto.'],
 'Priority: Development — {value} more Officer Badges are required.':['Priorité : Développement — {value} insignes d’officier supplémentaires sont nécessaires.','Priorität: Entwicklung — weitere {value} Offiziersabzeichen werden benötigt.','Priorità: Sviluppo — servono altri {value} Badge Ufficiale.'],
 'Update available: v{value}. Tap Refresh Latest Version to install it.':['Mise à jour disponible : v{value}. Appuyez sur « Actualiser vers la dernière version » pour l’installer.','Update verfügbar: v{value}. Wähle „Auf neueste Version aktualisieren“, um sie zu installieren.','Aggiornamento disponibile: v{value}. Tocca «Aggiorna all’ultima versione» per installarlo.'],
 'You are up to date — v{value}.':['Votre application est à jour — v{value}.','Du verwendest die aktuelle Version — v{value}.','L’app è aggiornata — v{value}.'],
 'Legendary Skill Badge progression:':['Progression des badges de compétence légendaires :','Fortschritt bei legendären Fertigkeitsabzeichen:','Progressione Badge abilità Leggendaria:'],
 'Badge Elite Universal Held':['Insignes universels Élite détenus','Vorhandene universelle Elite-Abzeichen','Badge Elite universali posseduti'],
 'Four primary skills unlock with the Officer’s Current Star Level: 0★ = Skill 1, 1★ = Skills 1–2, 2★ = Skills 1–3, and 3★+ = all four. Each starts at Level 1.':['Les quatre compétences principales se débloquent selon le niveau d’étoiles actuel de l’officier : 0★ = compétence 1, 1★ = compétences 1–2, 2★ = compétences 1–3 et 3★+ = les quatre. Chacune commence au niveau 1.','Die vier Hauptfertigkeiten werden abhängig von der aktuellen Sternstufe des Offiziers freigeschaltet: 0★ = Fertigkeit 1, 1★ = Fertigkeiten 1–2, 2★ = Fertigkeiten 1–3 und 3★+ = alle vier. Jede beginnt auf Stufe 1.','Le quattro abilità principali si sbloccano in base al livello Stelle attuale dell’Ufficiale: 0★ = Abilità 1, 1★ = Abilità 1–2, 2★ = Abilità 1–3 e 3★+ = tutte e quattro. Ognuna inizia al Livello 1.'],
 '690 Officer Badges total. The fifth skill unlocks when all four primary skills reach Level 10.':['690 insignes d’officier au total. La cinquième compétence se débloque lorsque les quatre compétences principales atteignent le niveau 10.','Insgesamt 690 Offiziersabzeichen. Die fünfte Fertigkeit wird freigeschaltet, sobald alle vier Hauptfertigkeiten Stufe 10 erreicht haben.','690 Badge Ufficiale in totale. La quinta abilità si sblocca quando tutte e quattro le abilità principali raggiungono il livello 10.'],
 'Legendary: 5 Officer Badges per Training level · 900 Officer Badges for Training to MAX. Skill progression uses 690 Officer Badges, included in the total badge requirement.':['Légendaire : 5 insignes d’officier par niveau d’entraînement · 900 insignes pour entraîner jusqu’au MAX. La progression des compétences utilise 690 insignes, inclus dans le besoin total.','Legendär: 5 Offiziersabzeichen pro Trainingsstufe · 900 Offiziersabzeichen für Training bis MAX. Für Fertigkeiten werden 690 Abzeichen benötigt, die im Gesamtbedarf enthalten sind.','Leggendario: 5 Badge Ufficiale per livello di addestramento · 900 Badge per l’addestramento fino a MAX. La progressione delle abilità usa 690 Badge, inclusi nel totale richiesto.'],
 'uses Legendary Star I / II / III. Preparation Vouchers (SRV) are available only for eligible Legendary seasonal Officers from S2 onward. Original Legendary Officers cannot use SRV.':['utilise les étoiles légendaires I / II / III. Les bons de préparation (SRV) sont réservés aux officiers saisonniers légendaires admissibles à partir de S2. Les officiers légendaires d’origine ne peuvent pas utiliser les SRV.','verwendet Legendär-Stern I / II / III. Vorbereitungs-Gutscheine (SRV) sind nur für berechtigte saisonale legendäre Offiziere ab S2 verfügbar. Ursprüngliche legendäre Offiziere können keine SRV verwenden.','utilizza Stelle Leggendarie I / II / III. I Voucher di preparazione (SRV) sono disponibili solo per gli Ufficiali Leggendari stagionali idonei da S2 in poi. Gli Ufficiali Leggendari originali non possono usare SRV.'],
 '. The saved inventory is then used throughout the app. Items are displayed in the game list order defined by the Inventory master list.':['. L’inventaire enregistré est ensuite utilisé dans toute l’application. Les éléments suivent l’ordre de la liste de référence du jeu.','. Das gespeicherte Inventar wird anschließend in der gesamten App verwendet. Die Einträge folgen der Reihenfolge der Inventar-Stammliste im Spiel.','. L’inventario salvato viene quindi utilizzato in tutta l’app. Gli elementi seguono l’ordine dell’elenco principale del gioco.'],
 '. Every Officer is listed even when the player currently holds 0 Badges. Each value is stored separately for that Officer and is used throughout the app.':['. Tous les officiers sont listés, même si le joueur ne possède actuellement aucun insigne. Chaque quantité est enregistrée séparément pour l’officier concerné et utilisée dans toute l’application.','. Jeder Offizier wird aufgeführt, auch wenn der Spieler derzeit 0 Abzeichen besitzt. Jeder Wert wird separat für den jeweiligen Offizier gespeichert und in der gesamten App verwendet.','. Ogni Ufficiale è elencato anche se il giocatore possiede 0 Badge. Ogni valore viene memorizzato separatamente per quell’Ufficiale e utilizzato in tutta l’app.']
 };
 const idx=lang==='fr'?0:lang==='de'?1:2;
 if(exact[raw])return exact[raw][idx];
 // Translate fragments as well as whole sentences. The live UI often splits dynamic
 // explanations across several text nodes (for example, <strong>resource values</strong>).
 const rules=[
 [/^\([\d,]+ ORV \/ [\d,]+ SRV\)\. For ([\d,]+) Officer Badges \(including the ([\d,]+) Officer Badges for Skills within the ([\d,]+) total\) and ([\d,]+) Star value \(([\d,]+) Exclusive Stars\), plan for approximately$/,[
  '($1 ORV / $2 SRV). Pour $1 insignes d’officier (dont $2 pour les compétences dans le total de $3) et une valeur de $4 étoiles ($5 étoiles exclusives), prévoyez environ',
  '($1 ORV / $2 SRV). Für $1 Offiziersabzeichen (davon $2 für Fertigkeiten innerhalb der Gesamtzahl von $3) und einen Sternwert von $4 ($5 Exklusivsterne) werden ungefähr benötigt',
  '($1 ORV / $2 SRV). Per $1 distintivi ufficiali (di cui $2 per le abilità nel totale di $3) e un valore Stelle di $4 ($5 Stelle esclusive), pianifica circa'
 ]],
 [/^Need ([\d,. ]+) more Officer Badges$/,['Il manque encore $1 insignes d’officier','Es fehlen noch $1 Offiziersabzeichen','Servono ancora $1 Badge Ufficiale']],
 [/^Need ([\d,. ]+) more Officer Star value$/,['Il manque encore $1 de valeur d’étoiles d’officier','Es fehlen noch $1 Offiziers-Sternwert','Mancano ancora $1 punti valore Stelle Ufficiale']],
 [/^([\d,. ]+) XP still required$/,['Il manque encore $1 XP','Es fehlen noch $1 XP','Mancano ancora $1 XP']],
 [/^🟠 PARTIALLY READY — (.+)$/,['🟠 PARTIELLEMENT PRÊT — $1','🟠 TEILWEISE BEREIT — $1','🟠 PARZIALMENTE PRONTO — $1']],
 [/^S6 Veronica — ([\d, ]+) Badges \+ 1 more$/,['S6 Veronica — $1 insignes + 1 autre','S6 Veronica — $1 Abzeichen + 1 weiteres','S6 Veronica — $1 Badge + 1 altro']],
 [/^Officer Badges: SHORT ([\d,]+)$/,['Insignes d’officier : MANQUE $1','Offiziersabzeichen: FEHLEN $1','Badge Ufficiale: MANCANO $1']],
 [/^Stars: SHORT ([\d,]+)$/,['Étoiles : MANQUE $1','Sterne: FEHLEN $1','Stelle: MANCANO $1']],
 [/^XP: SHORT ([\d,]+)$/,['XP : MANQUE $1','XP: FEHLEN $1','XP: MANCANO $1']],
 [/^Overall readiness \(average\): ([\d,.]+)%$/,['Préparation globale (moyenne) : $1%','Gesamtbereitschaft (Durchschnitt): $1%','Preparazione complessiva (media): $1%']],
 [/^Officer Badges — ([\d,.]+)%$/,['Insignes d’officier — $1%','Offiziersabzeichen — $1%','Badge Ufficiale — $1%']],
 [/^Limiting resource: (Officer Badges|Badges|Stars|XP) — ([\d,.]+)%$/,['Ressource limitante : $1 — $2%','Limitierende Ressource: $1 — $2%','Risorsa limitante: $1 — $2%']],
 [/^Last updated (.+)$/,['Dernière mise à jour : $1','Zuletzt aktualisiert: $1','Ultimo aggiornamento: $1']],
 [/^([\d,]+) universal \+ ([\d,]+) chests$/,['$1 universels + $2 coffres','$1 universelle + $2 Truhen','$1 universali + $2 casse']],
 [/^([\d,]+) Officer badge entries saved\.$/,['$1 entrées de badges d’officier enregistrées.','$1 Offiziersabzeichen-Einträge gespeichert.','$1 voci Badge Ufficiale salvate.']],
 [/^Set Skill (\d+) to Level (\d+)$/,['Définir la compétence $1 au niveau $2','Fertigkeit $1 auf Stufe $2 setzen','Imposta abilità $1 al livello $2']],
 [/^Test planning estimate using ([\d.]+)% growth per future Officer release from$/,['Estimation de planification Test avec une hausse de $1% par future sortie d’officier à partir de','Test-Planungsschätzung mit $1% Steigerung pro zukünftiger Offiziersveröffentlichung ausgehend von','Stima di pianificazione Test con un aumento del $1% per ogni futura uscita di Ufficiali a partire da']],
 [/^Forecast only — replace with confirmed costs when released\.$/,['Prévision uniquement — remplacez cette estimation par les coûts confirmés lors de leur publication.','Nur eine Prognose — nach Veröffentlichung durch bestätigte Kosten ersetzen.','Solo previsione — sostituisci con i costi confermati al rilascio.']],
 [/^Forecast baseline follows the latest confirmed release in the Officer database\. The selected growth rate is compounded for each future Officer release; all future values remain estimates until actual costs are published\.$/,['La base de prévision suit la dernière sortie confirmée dans la base de données des officiers. Le taux de croissance choisi est composé à chaque future sortie ; toutes les valeurs restent estimatives jusqu’à la publication des coûts réels.','Die Prognosebasis folgt der letzten bestätigten Veröffentlichung in der Offiziersdatenbank. Die gewählte Wachstumsrate wird für jede zukünftige Veröffentlichung aufgezinst; alle Werte bleiben Schätzungen, bis die tatsächlichen Kosten veröffentlicht werden.','La base della previsione segue l’ultima uscita confermata nel database degli Ufficiali. Il tasso di crescita selezionato viene composto per ogni futura uscita; tutti i valori restano stime fino alla pubblicazione dei costi effettivi.']],
 [/^(\d+) officers shown · Database validation passed\.$/,['$1 officiers affichés · Validation de la base de données réussie.','$1 Offiziere angezeigt · Datenbankprüfung bestanden.','$1 Ufficiali visualizzati · Convalida del database superata.']],
 [/^ORV still needed for the remaining ([\d,]+) Officer Badges:$/,['ORV encore nécessaires pour les $1 insignes d’officier restants :','Noch benötigte ORV für die verbleibenden $1 Offiziersabzeichen:','ORV ancora necessari per i $1 Badge Ufficiale rimanenti:']],
 [/^\(([\d,]+) per badge\)\. Held ORV has already been included in the badge-equivalent total above\.$/,['($1 par insigne). Les ORV détenus sont déjà inclus dans le total équivalent indiqué ci-dessus.','($1 pro Abzeichen). Vorhandene ORV sind bereits in der obigen Abzeichenäquivalent-Summe enthalten.','($1 per Badge). Gli ORV posseduti sono già inclusi nel totale equivalente indicato sopra.']],
 [/^Preview only\. Inventory has not been changed\. Skill Badge costs are included in the Officer Badge total and ORV calculation\. Future ORV\/SRV figures remain FORECAST until published\.$/,['Aperçu uniquement. L’inventaire n’a pas été modifié. Les coûts des badges de compétence sont inclus dans le total des insignes d’officier et dans le calcul ORV. Les valeurs ORV/SRV futures restent des PRÉVISIONS jusqu’à leur publication.','Nur Vorschau. Das Inventar wurde nicht geändert. Die Kosten der Fertigkeitsabzeichen sind im Gesamtbedarf an Offiziersabzeichen und in der ORV-Berechnung enthalten. Zukünftige ORV-/SRV-Werte bleiben bis zur Veröffentlichung PROGNOSEN.','Solo anteprima. L’Inventario non è stato modificato. I costi dei Badge abilità sono inclusi nel totale dei Badge Ufficiale e nel calcolo ORV. I valori futuri ORV/SRV restano PREVISIONI fino alla pubblicazione.']],
 [/^([\d,]+) of ([\d,]+) required badge equivalents covered: ([\d,]+) Individual Officer Badges held \+ ([\d,]+) shared Badges allocated\. ([\d,]+) badge equivalents remain unfunded\. Remaining shared resources: ([\d,]+) ORV · ([\d,]+) Universal Badges · ([\d,]+) Selection Chests\.$/,['$1 équivalents d’insignes sur $2 couverts : $3 insignes individuels détenus + $4 insignes partagés affectés. $5 équivalents restent à financer. Ressources partagées restantes : $6 ORV · $7 insignes universels · $8 coffres de sélection.','$1 von $2 benötigten Abzeichenäquivalenten gedeckt: $3 individuelle Offiziersabzeichen vorhanden + $4 gemeinsame Abzeichen zugewiesen. $5 Abzeichenäquivalente sind noch ungedeckt. Verbleibende gemeinsame Ressourcen: $6 ORV · $7 universelle Abzeichen · $8 Auswahltruhen.','Coperti $1 equivalenti Badge su $2: $3 Badge Ufficiale individuali posseduti + $4 Badge condivisi assegnati. Restano da finanziare $5 equivalenti Badge. Risorse condivise rimanenti: $6 ORV · $7 Badge universali · $8 casse selezione.']],
 [/^Use the Planner to compare your current saved Officers and Inventory against projected future Officer sessions, including expected resources for one or two future Officers\.$/,['Utilisez le Planificateur pour comparer vos officiers enregistrés et votre inventaire actuels aux futures sessions d’officiers prévues, y compris les ressources attendues pour un ou deux futurs officiers.','Verwende den Planer, um deine gespeicherten Offiziere und dein aktuelles Inventar mit geplanten zukünftigen Offizierssitzungen zu vergleichen, einschließlich der erwarteten Ressourcen für einen oder zwei zukünftige Offiziere.','Usa il Pianificatore per confrontare gli Ufficiali salvati e l’Inventario attuali con le future sessioni previste, incluse le risorse attese per uno o due Ufficiali futuri.']],
 [/^Advanced Future Officer Planning:$/,['Planification avancée des futurs officiers :','Erweiterte Planung zukünftiger Offiziere:','Pianificazione avanzata dei futuri Ufficiali:']],
 [/^Forecast only — actual release costs should replace the estimate when published\.$/,['Prévision uniquement — les coûts réels de sortie remplaceront cette estimation lors de leur publication.','Nur eine Prognose — sobald die tatsächlichen Veröffentlichungskosten bekannt sind, ersetzen sie diese Schätzung.','Solo previsione — i costi effettivi sostituiranno questa stima quando saranno pubblicati.']]
 ];
 for(const [rx,values] of rules){const m=rx.exec(raw);if(m)return raw.replace(rx,values[idx]);}
 const fragments={
  'Officer Badges':['insignes d’officier','Offiziersabzeichen','Badge Ufficiale'],
  'Officer Badge':['insigne d’officier','Offiziersabzeichen','Badge Ufficiale'],
  'MAX Training':['Entraînement MAX','MAX-Training','Addestramento MAX'],
  'Universal Epic Badges Held':['Insignes universels Épiques détenus','Vorhandene universelle epische Abzeichen','Distintivi universali epici posseduti'],
  'Universal Elite Badges Held':['Insignes universels Élite détenus','Vorhandene universelle Elite-Abzeichen','Distintivi universali Elite posseduti'],
  '1 Universal Legendary Badge':['1 insigne légendaire universel','1 universelles legendäres Abzeichen','1 distintivo leggendario universale'],
  'Universal Legendary Badges (1 each)':['Insignes légendaires universels (1 chacun)','Universelle legendäre Abzeichen (je 1)','Distintivi leggendari universali (1 ciascuno)'],
  'Legendary Officer Badge':['Insigne d’officier légendaire','Legendäres Offiziersabzeichen','Badge Ufficiale Leggendario'],
  'Epic Officer Badge':['Insigne d’officier épique','Episches Offiziersabzeichen','Badge Ufficiale Epico'],
  'Elite Officer Badge':['Insigne d’officier Élite','Elite-Offiziersabzeichen','Badge Ufficiale Elite'],
  'Saved Planning Scenarios':['Scénarios de planification enregistrés','Gespeicherte Planungsszenarien','Scenari di pianificazione salvati'],
  '⬇ Export App Backup':['⬇ Exporter la sauvegarde de l’application','⬇ App-Backup exportieren','⬇ Esporta il backup dell’app'],
  '⬆ Restore App Backup':['⬆ Restaurer la sauvegarde de l’application','⬆ App-Backup wiederherstellen','⬆ Ripristina il backup dell’app'],

  'Delete Saved Plan':['Supprimer le plan enregistré','Gespeicherten Plan löschen','Elimina il piano salvato'],
  'Delete ':['Supprimer ','Löschen ','Elimina '],
  'Universal Badges':['insignes universels','universelle Abzeichen','distintivi universali'],
  'Selection Chests':['coffres de sélection','Auswahltruhen','casse selezione'],
  'Exclusive Stars':['étoiles exclusives','Exklusivsterne','Stelle esclusive'],
  'projected Officers':['officiers prévus','geplante Offiziere','Ufficiali previsti'],
  'projected Officer':['officier prévu','geplanter Offizier','Ufficiale previsto'],
  'Convert to ORV (720 each)':['Convertir en ORV (720 chacun)','In ORV umwandeln (je 720)','Converti in ORV (720 ciascuno)'],
  'Application language':['Langue de l’application','App-Sprache','Lingua dell’app'],
  'MAX Skills: 690 Officer Badges':['Compétences MAX : 690 insignes d’officier','MAX-Fertigkeiten: 690 Offiziersabzeichen','Abilità MAX: 690 Badge Ufficiale'],
  'MAX-Fertigkeiten: 690 Officer Badges':['Compétences MAX : 690 insignes d’officier','MAX-Fertigkeiten: 690 Offiziersabzeichen','Abilità MAX: 690 Badge Ufficiale'],
  'Competenze MAX: 690 Officer Badges':['Compétences MAX : 690 insignes d’officier','MAX-Fertigkeiten: 690 Offiziersabzeichen','Competenze MAX: 690 Badge Ufficiale'],
  'Abilità MAX: 690 Officer Badges':['Compétences MAX : 690 insignes d’officier','MAX-Fertigkeiten: 690 Offiziersabzeichen','Abilità MAX: 690 Badge Ufficiale'],
  'Forecast only — replace with confirmed costs when released.':['Prévision uniquement — remplacez-la par les coûts confirmés lors de leur publication.','Nur eine Prognose — nach Veröffentlichung durch bestätigte Kosten ersetzen.','Solo previsione — sostituisci con i costi confermati al rilascio.'],
  'MAX-Fertigkeiten: 690 Officer Badges':['Compétences MAX : 690 insignes d’officier','MAX-Fertigkeiten: 690 Offiziersabzeichen','Abilità MAX: 690 distintivi ufficiali'],
  'Abilità MAX: 690 Officer Badges':['Competenze MAX: 690 insignes d’officier','MAX-Fertigkeiten: 690 Offiziersabzeichen','Abilità MAX: 690 distintivi ufficiali'],
  'Compétences MAX: 690 Officer Badges':['Compétences MAX : 690 insignes d’officier','MAX-Fertigkeiten: 690 Offiziersabzeichen','Competenze MAX: 690 distintivi ufficiali'],
  'S6 Veronica — 1,600 Badges + 1 more':['S6 Veronica — 1 600 insignes + 1 supplémentaire','S6 Veronica — 1.600 Abzeichen + 1 weiteres','S6 Veronica — 1.600 distintivi + 1 altro'],
  'Every Officer is listed even when the player currently holds 0 Badges. Each value is stored separately for that Officer and is used throughout the app.':['Chaque officier est répertorié, même si le joueur ne possède aucun insigne. Chaque valeur est enregistrée séparément pour cet officier et utilisée dans toute l’application.','Jeder Offizier wird aufgeführt, auch wenn der Spieler 0 Abzeichen besitzt. Jeder Wert wird separat für diesen Offizier gespeichert und in der gesamten App verwendet.','Ogni Ufficiale è elencato anche se il giocatore non possiede Badge. Ogni valore è memorizzato separatamente per quell’Ufficiale e viene utilizzato in tutta l’app.'],
  'Every Officer is listed even when the player currently holds 0 Abzeichen. Each value is stored separately for that Officer and is verwendet throughout the app.':['Chaque officier est répertorié, même si le joueur ne possède aucun insigne. Chaque valeur est enregistrée séparément pour cet officier et utilisée dans toute l’application.','Jeder Offizier wird aufgeführt, auch wenn der Spieler 0 Abzeichen besitzt. Jeder Wert wird separat für diesen Offizier gespeichert und in der gesamten App verwendet.','Ogni Ufficiale è elencato anche se il giocatore non possiede Badge. Ogni valore è memorizzato separatamente per quell’Ufficiale e viene utilizzato in tutta l’app.'],
  'Every Officer is listed even when the player currently holds 0 Badge. Each value is stored separately for that Officer and is utilizzati throughout the app.':['Chaque officier est répertorié, même si le joueur ne possède aucun insigne. Chaque valeur est enregistrée séparément pour cet officier et utilisée dans toute l’application.','Jeder Offizier wird aufgeführt, auch wenn der Spieler 0 Abzeichen besitzt. Jeder Wert wird separat für diesen Offizier gespeichert und in der gesamten App verwendet.','Ogni Ufficiale è elencato anche se il giocatore non possiede Badge. Ogni valore è memorizzato separatamente per quell’Ufficiale e viene utilizzato in tutta l’app.'],
  'Individual Officer Badges held':['insignes individuels détenus','vorhandene individuelle Offiziersabzeichen','distintivi ufficiali individuali posseduti'],
  'shared Badges allocated':['insignes partagés affectés','zugewiesene gemeinsame Abzeichen','distintivi condivisi assegnati'],
  'required badge equivalents covered':['équivalents d’insignes requis couverts','benötigte Abzeichenäquivalente abgedeckt','equivalenti distintivi richiesti coperti'],
  'badge equivalents remain unfunded':['équivalents d’insignes restent à financer','Abzeichenäquivalente sind noch ungedeckt','equivalenti distintivi restano da finanziare'],
  'Remaining shared resources:':['Ressources partagées restantes :','Verbleibende gemeinsame Ressourcen:','Risorse condivise rimanenti:'],
  'uses Leggendario Star I / II / III. Buoni preparazione stella (SRV) are available only for eligible Leggendario seasonal Officers from S2 onward. Original Leggendario Officers cannot use SRV.':['utilise les étoiles légendaires I / II / III. Les bons de préparation (SRV) sont réservés aux officiers saisonniers légendaires admissibles à partir de S2. Les officiers légendaires d’origine ne peuvent pas utiliser les SRV.','verwendet Legendär-Stern I / II / III. Vorbereitungs-Gutscheine (SRV) sind nur für berechtigte saisonale legendäre Offiziere ab S2 verfügbar. Ursprüngliche legendäre Offiziere können keine SRV verwenden.','utilizza Stelle Leggendarie I / II / III. I Voucher di preparazione (SRV) sono disponibili solo per gli Ufficiali Leggendari stagionali idonei da S2 in poi. Gli Ufficiali Leggendari originali non possono usare SRV.'],
  'Badge Elite Universal Held':['Insignes universels Élite détenus','Vorhandene universelle Elite-Abzeichen','Distintivi Elite universali posseduti'],
  '⬇ Esporta backup app':['⬇ Esporta backup dell’app','⬇ App-Backup exportieren','⬇ Esporta backup dell’app'],
  '⬆ Ripristina backup app':['⬆ Ripristina backup dell’app','⬆ App-Backup wiederherstellen','⬆ Ripristina backup dell’app'],
  ' + 1 more':[' + 1 supplémentaire',' + 1 weiteres',' + 1 altro'],
  'MAX Skills':['Compétences MAX','MAX-Fertigkeiten','Abilità MAX'],
  'Planning Scenarios':['Scénarios de planification','Planungsszenarien','Scenari di pianificazione'],
  'Saved Planning Scenarios':['Scénarios de planification enregistrés','Gespeicherte Planungsszenarien','Scenari di pianificazione salvati'],
  'Every Officer is listed even when the player currently holds 0 Badges.':['Chaque officier est répertorié, même si le joueur ne possède aucun insigne.','Jeder Offizier wird aufgeführt, auch wenn der Spieler keine Abzeichen besitzt.','Ogni Ufficiale è elencato anche se il giocatore non possiede distintivi.'],
  'Each value is stored separately for that Officer and is used throughout the app.':['Chaque valeur est enregistrée séparément pour cet officier et utilisée dans toute l’application.','Jeder Wert wird separat für diesen Offizier gespeichert und in der gesamten App verwendet.','Ogni valore viene memorizzato separatamente per quell’Ufficiale e utilizzato in tutta l’app.'],
  'Universal Elite Badges Held':['Insignes universels Élite détenus','Vorhandene universelle Elite-Abzeichen','Distintivi universali élite posseduti'],
  'uses Legendary Star I / II / III.':['utilise les étoiles légendaires I / II / III.','verwendet Legendär-Stern I / II / III.','utilizza le Stelle Leggendarie I / II / III.'],
  'Star Readiness Vouchers (SRV) are available only for eligible Legendary seasonal Officers from S2 onward.':['Les bons de préparation (SRV) sont réservés aux officiers saisonniers légendaires admissibles à partir de S2.','Vorbereitungs-Gutscheine (SRV) sind nur für berechtigte saisonale legendäre Offiziere ab S2 verfügbar.','I Voucher di preparazione (SRV) sono disponibili solo per gli Ufficiali Leggendari stagionali idonei da S2 in poi.'],
  'Original Legendary Officers cannot use SRV.':['Les officiers légendaires d’origine ne peuvent pas utiliser les SRV.','Ursprüngliche legendäre Offiziere können keine SRV verwenden.','Gli Ufficiali Leggendari originali non possono usare SRV.'],
  '⬇ Export app backup':['⬇ Exporter la sauvegarde de l’application','⬇ App-Backup exportieren','⬇ Esporta il backup dell’app'],
  '⬆ Restore app backup':['⬆ Restaurer la sauvegarde de l’application','⬆ App-Backup wiederherstellen','⬆ Ripristina il backup dell’app']
 };
 let fragmentResult=raw;
 for(const [source,values] of Object.entries(fragments)){
  if(fragmentResult.includes(source))fragmentResult=fragmentResult.split(source).join(values[idx]);
 }
 if(fragmentResult!==raw)return fragmentResult;

 // Explicit dynamic fallbacks for the dashboard/development strings covered by QA21.
 // These handle the complete rendered sentence as well as the normal template path.
 const badgeStill=/^(\d[\d,]*) Officer Badges still required$/.exec(raw);
 if(badgeStill){const n=badgeStill[1];return lang==='fr'?n+' insignes d’officier encore nécessaires':lang==='de'?'Noch '+n+' Offiziersabzeichen erforderlich':'Sono ancora necessari '+n+' Badge Ufficiale';}
 const maxTraining=/^(?:MAX Training|Training MAX):? (\d[\d,]*) Officer Badges$/.exec(raw);
 if(maxTraining){const n=maxTraining[1];return lang==='fr'?'Entraînement MAX : '+n+' insignes d’officier':lang==='de'?'MAX-Training: '+n+' Offiziersabzeichen':'Addestramento MAX: '+n+' Badge Ufficiale';}
 const skills=/^Skill 1: Lv(\d+) · Skill 2: Lv(\d+) · Skill 3: Lv(\d+) · Skill 4: Lv(\d+) · Primary skills complete · ([\d,]+)\/([\d,]+) Officer Badges used · ([\d,]+) remaining\.$/.exec(raw);
 if(skills){const [a,b,c,d,used,total,left]=skills.slice(1);return lang==='fr'?'Compétence 1 : Niv. '+a+' · Compétence 2 : Niv. '+b+' · Compétence 3 : Niv. '+c+' · Compétence 4 : Niv. '+d+' · Compétences principales terminées · '+used+'/'+total+' insignes d’officier utilisés · '+left+' restants.':lang==='de'?'Fertigkeit 1: St. '+a+' · Fertigkeit 2: St. '+b+' · Fertigkeit 3: St. '+c+' · Fertigkeit 4: St. '+d+' · Hauptfertigkeiten abgeschlossen · '+used+'/'+total+' Offiziersabzeichen verwendet · '+left+' übrig.':'Abilità 1: Lv'+a+' · Abilità 2: Lv'+b+' · Abilità 3: Lv'+c+' · Abilità 4: Lv'+d+' · Abilità principali completate · '+used+'/'+total+' Badge Ufficiale utilizzati · '+left+' rimanenti.';}
 const residual=[
 [/^\\. You can still use any tab at any time\\.$/,['. Vous pouvez toujours utiliser n’importe quel onglet.','. Du kannst jederzeit jeden Tab verwenden.','. Puoi comunque utilizzare qualsiasi scheda in qualsiasi momento.']],
 [/^— what your current saved Inventory can achieve now\\.$/,['— ce que votre inventaire enregistré actuel permet de faire.','— was dein aktuell gespeichertes Inventar jetzt ermöglicht.','— cosa può ottenere ora il tuo Inventario salvato.']],
 [/^Upgrade priority \\(lowest first\\)$/,['Priorité d’amélioration (la plus faible en premier)','Upgrade-Priorität (niedrigste zuerst)','Priorità di potenziamento (prima la più bassa)']],
 [/^Upgrade priority — lowest first$/,['Priorité d’amélioration — la plus faible en premier','Upgrade-Priorität — niedrigste zuerst','Priorità di potenziamento — prima la più bassa']],
 [/^Star Readiness Voucher \\(SRV\\)$/,['Bon de préparation aux étoiles (SRV)','Sternbereitschaftsgutschein (SRV)','Voucher preparazione stelle (SRV)']],
 [/^Skill cost information$/,['Informations sur le coût des compétences','Informationen zu Fertigkeitskosten','Informazioni sui costi delle abilità']],
 [/^Set Skill (\\d+) to Level (\\d+)$/,['Définir la compétence $1 au niveau $2','Fertigkeit $1 auf Stufe $2 setzen','Imposta l’abilità $1 al livello $2']],
 [/^Elite Star (I|II|III)$/,['Étoile Élite $1','Elite-Stern $1','Stella Élite $1']],
 [/^· ORV badge equivalents:$/,['· Équivalents d’insignes ORV :','· ORV-Abzeichenäquivalente:','· Equivalenti distintivi ORV:']],
 [/^Limiting resource: Badges — ([\\d,.]+)%$/,['Ressource limitante : insignes — $1 %','Begrenzende Ressource: Abzeichen — $1 %','Risorsa limitante: distintivi — $1%']],
 [/^Preview-only recommendations\\. This tool never spends or changes Inventory\\.$/,['Recommandations uniquement prévisionnelles. Cet outil ne dépense ni ne modifie l’inventaire.','Nur Vorschau-Empfehlungen. Dieses Tool gibt kein Inventar aus und ändert es nicht.','Raccomandazioni solo in anteprima. Questo strumento non spende né modifica l’Inventario.']],
 [/^Created by FireStorm$/,['Créé par FireStorm','Erstellt von FireStorm','Creato da FireStorm']],
 [/^Complete all four primary Skills to Level 10 before starting Training\\.$/,['Terminez les quatre compétences principales au niveau 10 avant de commencer l’entraînement.','Schließe alle vier Hauptfertigkeiten auf Stufe 10 ab, bevor du mit dem Training beginnst.','Completa tutte e quattro le abilità principali al livello 10 prima di iniziare l’addestramento.']],
 [/^Enter a plan name\\.$/,['Saisissez un nom de plan.','Gib einen Plannamen ein.','Inserisci un nome per il piano.']],
 [/^Plan saved\\.$/,['Plan enregistré.','Plan gespeichert.','Piano salvato.']],
 [/^Saved plan deleted\\.$/,['Plan enregistré supprimé.','Gespeicherter Plan gelöscht.','Piano salvato eliminato.']],
 [/^Fix validation issues first\\.$/,['Corrigez d’abord les erreurs de validation.','Behebe zuerst die Validierungsfehler.','Correggi prima gli errori di convalida.']],
 [/^Officer database saved\\.$/,['Base de données des officiers enregistrée.','Offiziersdatenbank gespeichert.','Database Ufficiali salvato.']],
 [/^CSV validation failed\\.$/,['Échec de la validation CSV.','CSV-Validierung fehlgeschlagen.','Convalida CSV non riuscita.']],
 [/^CSV imported\\.$/,['CSV importé.','CSV importiert.','CSV importato.']],
 [/^Appearance and backgrounds restored to defaults\\.$/,['Apparence et arrière-plans réinitialisés.','Darstellung und Hintergründe auf Standard zurückgesetzt.','Aspetto e sfondi ripristinati ai valori predefiniti.']],
 [/^Progress could not be saved\\. Please refresh and try again\\.$/,['Impossible d’enregistrer la progression. Actualisez et réessayez.','Fortschritt konnte nicht gespeichert werden. Bitte aktualisiere die Seite und versuche es erneut.','Impossibile salvare i progressi. Aggiorna e riprova.']],
 [/^\\{value\\} progress saved\\.$/,['Progression de {value} enregistrée.','Fortschritt für {value} gespeichert.','Progressi di {value} salvati.']],
 [/^\\{value\\} is now saved as MAXED\\.$/,['{value} est maintenant enregistré au niveau MAX.','{value} ist jetzt als MAX gespeichert.','{value} è ora salvato come MAX.']],
 [/^Reset Central Inventory\\?$/,['Réinitialiser l’inventaire central ?','Zentralinventar zurücksetzen?','Reimpostare l’Inventario centrale?']],
 [/^Restore default officer database\\?$/,['Restaurer la base de données des officiers par défaut ?','Standard-Offiziersdatenbank wiederherstellen?','Ripristinare il database Ufficiali predefinito?']]
 ];
 for(const [rx,values] of residual){const m=rx.exec(raw);if(m)return values[idx].replace(/\\$(\\d+)/g,(_,n)=>m[Number(n)]||'');}
 return raw;
}

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



/* QA21 multilingual closure: v4.7 skill labels, progression guidance, planner and release copy. */
const Q21={
fr:[[/^S6 Veronica\s*[—–-]\s*([\d,\s\u00a0]+)\s+Badges?\s*\+\s*1\s+more$/i,"S6 Veronica — $1 insignes + 1 autre"],[/^Choose a target for the currently selected Officer\. This v4\.7\.0 release compares the saved current position with your target and gives a clear next-step recommendation\. It does not spend or alter Inventory\.$/,"Choisissez un objectif pour l’officier actuellement sélectionné. Cette version compare sa progression actuelle enregistrée à votre objectif et recommande clairement la prochaine étape. Elle ne dépense ni ne modifie l’inventaire."],[/^Four primary skills unlock with the Officer’s Current Star Level: 0★ = Skill 1, 1★ = Skills 1–2, 2★ = Skills 1–3, and 3★\+ = all four\. Each starts at Level 1\.$/,"Les quatre compétences principales se débloquent selon le niveau d’étoiles actuel de l’officier : 0★ = compétence 1, 1★ = compétences 1–2, 2★ = compétences 1–3 et 3★+ = les quatre. Chacune commence au niveau 1."],[/^Epic: 25 Officer Badges per Training level · 4,500 Training Badges to MAX\. Skill progression uses 440 separate fragments\.$/,"Épique : 25 insignes d’officier par niveau d’entraînement · 4 500 insignes d’entraînement pour atteindre le MAX. La progression des compétences utilise 440 fragments distincts."],[/^Convert to ORV \(([\d,]+) each\)$/,'Convertir en ORV ($1 chacun)'],[/^Original · General$/,"Original · Général"],[/^🟠 PARTIALLY READY — (.+)$/,"🟠 PARTIELLEMENT PRÊT — $1"],[/^S6 Veronica — ([\d, ]+) Badges \+ 1 more$/,"S6 Veronica — $1 insignes + 1 autre"],
[/^Choose a target for the currently selected Officier\. This v4\.7\.0 release compares the saved current position with your target and gives a clear next-step recommendation\. It does not spend or alter Inventory\.$/,'Choisissez un objectif pour l’officier actuellement sélectionné. Cette version compare sa progression actuelle enregistrée à votre objectif et recommande clairement la prochaine étape. Elle ne dépense ni ne modifie l’inventaire.'],
[/^Skill (\d+): Lv(\d+) · Skill (\d+): Lv(\d+) · Skill (\d+): Lv(\d+) · Skill (\d+): Lv(\d+) · Primary skills complete · ([\d,]+)\/([\d,]+) fragments used · ([\d,]+) (?:remaining|restants)\.$/,'Compétence $1 : Nv$2 · Compétence $3 : Nv$4 · Compétence $5 : Nv$6 · Compétence $7 : Nv$8 · Compétences principales terminées · $9/$10 fragments utilisés · $11 restants.'],
[/^Four primary skills unlock with the Officier’s Niveau d'Étoiles actuel: 0★ = Skill 1, 1★ = Skills 1–2, 2★ = Skills 1–3, and 3★\+ = all four\. Each starts at Level 1\.$/,'Les quatre compétences principales se débloquent selon le niveau d’étoiles actuel de l’officier : 0★ = compétence 1, 1★ = compétences 1–2, 2★ = compétences 1–3 et 3★+ = les quatre. Chacune commence au niveau 1.'],
[/^Four primary skills unlock with the Officier’s Current Star Level: 0★ = Skill 1, 1★ = Skills 1–2, 2★ = Skills 1–3, and 3★\+ = all four\. Each starts at Level 1\.$/,'Les quatre compétences principales se débloquent selon le niveau d’étoiles actuel de l’officier : 0★ = compétence 1, 1★ = compétences 1–2, 2★ = compétences 1–3 et 3★+ = les quatre. Chacune commence au niveau 1.'],
[/^440 fragments total\. The fifth skill unlocks when all four primary skills reach Level 10\.$/,'440 fragments au total. La cinquième compétence se débloque lorsque les quatre compétences principales atteignent le niveau 10.'],
[/^Epic: 25 Insignes d’officier per Training level · 4,500 Training Badges to MAX\. Skill progression uses 440 separate fragments\.$/,'Épique : 25 insignes d’officier par niveau d’entraînement · 4 500 insignes d’entraînement pour atteindre le MAX. La progression des compétences utilise 440 fragments distincts.'],
[/^Epic fragment progression:$/,'Progression des fragments Épiques :'],
[/^Fifth Skill: UNLOCKED$/,'Cinquième compétence : DÉBLOQUÉE'],
[/^Set Skill (\d+) to Level (\d+)$/,'Définir la compétence $1 au niveau $2'],
[/^KoW releases follow this recurring annual cycle, displayed in calendar order from Janvier → Décembre\. The current month is highlighted automatically\.$/,'Les sorties KoW suivent ce cycle annuel récurrent, présenté dans l’ordre du calendrier de janvier à décembre. Le mois en cours est automatiquement mis en évidence.'],
[/^KoW releases follow this recurring annual cycle, displayed in calendar order from January → December\. The current month is highlighted automatically\.$/,'Les sorties KoW suivent ce cycle annuel récurrent, présenté dans l’ordre du calendrier de janvier à décembre. Le mois en cours est automatiquement mis en évidence.'],
[/^Created by FireStorm$/,'Créé par FireStorm'],
[/^Complete all four primary Skills to Level 10 before starting Training\.$/,'Terminez les quatre compétences principales au niveau 10 avant de commencer l’entraînement.'],
[/^Convert to ORV \($/,'Convertir en ORV ('],
[/^Confirmed S8 Rally \/ Garrison cost$/,'Coût confirmé S8 Rally / Garrison'],
[/^October — S9 Rally \/ Garrison$/,'Octobre — S9 Rally / Garrison'],
[/^November • CURRENT$/,'Novembre • EN COURS'],
[/^December • NEXT$/,'Décembre • SUIVANT']
],
de:[[/^Janvier — S8 Infanterie$/,'Januar — S8 Infanterie'],[/^S6 Veronica — ([\d, ]+) Badges \+ 1 more$/,'S6 Veronica — $1 Abzeichen + 1 weiteres'],[/^Choose a target for the currently selected Officer\. This v4\.7\.0 release compares the saved current position with your target and gives a clear next-step recommendation\. It does not spend or alter Inventory\.$/,"Wähle ein Ziel für den aktuell ausgewählten Offizier. Diese Version vergleicht den gespeicherten aktuellen Fortschritt mit deinem Ziel und empfiehlt klar den nächsten Schritt. Das Inventar wird dabei weder ausgegeben noch verändert."],[/^Four primary skills unlock with the Officer’s Current Star Level: 0★ = Skill 1, 1★ = Skills 1–2, 2★ = Skills 1–3, and 3★\+ = all four\. Each starts at Level 1\.$/,"Die vier Hauptfertigkeiten werden abhängig von der aktuellen Sternstufe des Offiziers freigeschaltet: 0★ = Fertigkeit 1, 1★ = Fertigkeiten 1–2, 2★ = Fertigkeiten 1–3 und 3★+ = alle vier. Jede beginnt auf Stufe 1."],[/^Epic: 25 Officer Badges per Training level · 4,500 Training Badges to MAX\. Skill progression uses 440 separate fragments\.$/,"Episch: 25 Offiziersabzeichen pro Trainingsstufe · 4.500 Trainingsabzeichen bis MAX. Für die Fertigkeitsentwicklung werden 440 separate Fragmente benötigt."],[/^Convert to ORV \(([\d,]+) each\)$/,'In ORV umwandeln ($1 je Truhe)'],[/^Original · General$/,"Ursprünglich · Allgemein"],[/^🟠 PARTIALLY READY — (.+)$/,"🟠 TEILWEISE BEREIT — $1"],[/^S6 Veronica — ([\d, ]+) Badges \+ 1 more$/,"S6 Veronica — $1 Abzeichen + 1 weiteres"],
[/^Choose a target for the currently selected Offizier\. This v4\.7\.0 release compares the saved current position with your target and gives a clear next-step recommendation\. It does not spend or alter Inventory\.$/,'Wähle ein Ziel für den aktuell ausgewählten Offizier. Diese Version vergleicht den gespeicherten aktuellen Fortschritt mit deinem Ziel und empfiehlt klar den nächsten Schritt. Das Inventar wird dabei weder ausgegeben noch verändert.'],
[/^Skill (\d+): Lv(\d+) · Skill (\d+): Lv(\d+) · Skill (\d+): Lv(\d+) · Skill (\d+): Lv(\d+) · Primary skills complete · ([\d,]+)\/([\d,]+) fragments used · ([\d,]+) (?:remaining|verbleibend)\.$/,'Fertigkeit $1: Stufe $2 · Fertigkeit $3: Stufe $4 · Fertigkeit $5: Stufe $6 · Fertigkeit $7: Stufe $8 · Hauptfertigkeiten abgeschlossen · $9/$10 Fragmente verwendet · $11 verbleibend.'],
[/^Four primary skills unlock with the Offizier’s Aktuelle Sternstufe: 0★ = Skill 1, 1★ = Skills 1–2, 2★ = Skills 1–3, and 3★\+ = all four\. Each starts at Level 1\.$/,'Die vier Hauptfertigkeiten werden abhängig von der aktuellen Sternstufe des Offiziers freigeschaltet: 0★ = Fertigkeit 1, 1★ = Fertigkeiten 1–2, 2★ = Fertigkeiten 1–3 und 3★+ = alle vier. Jede beginnt auf Stufe 1.'],
[/^Four primary skills unlock with the Offizier’s Current Star Level: 0★ = Skill 1, 1★ = Skills 1–2, 2★ = Skills 1–3, and 3★\+ = all four\. Each starts at Level 1\.$/,'Die vier Hauptfertigkeiten werden abhängig von der aktuellen Sternstufe des Offiziers freigeschaltet: 0★ = Fertigkeit 1, 1★ = Fertigkeiten 1–2, 2★ = Fertigkeiten 1–3 und 3★+ = alle vier. Jede beginnt auf Stufe 1.'],
[/^440 fragments total\. The fifth skill unlocks when all four primary skills reach Level 10\.$/,'Insgesamt 440 Fragmente. Die fünfte Fertigkeit wird freigeschaltet, sobald alle vier Hauptfertigkeiten Stufe 10 erreicht haben.'],
[/^Epic: 25 Offiziersabzeichen per Training level · 4,500 Training Badges to MAX\. Skill progression uses 440 separate fragments\.$/,'Episch: 25 Offiziersabzeichen pro Trainingsstufe · 4.500 Trainingsabzeichen bis MAX. Für die Fertigkeitsentwicklung werden 440 separate Fragmente benötigt.'],
[/^Epic fragment progression:$/,'Epische Fragmententwicklung:'],
[/^Fifth Skill: UNLOCKED$/,'Fünfte Fertigkeit: FREIGESCHALTET'],
[/^Set Skill (\d+) to Level (\d+)$/,'Fertigkeit $1 auf Stufe $2 setzen'],
[/^KoW releases follow this recurring annual cycle, displayed in calendar order from January → December\. The current month is highlighted automatically\.$/,'KoW-Veröffentlichungen folgen diesem jährlich wiederkehrenden Zyklus und werden in Kalenderreihenfolge von Januar bis Dezember angezeigt. Der aktuelle Monat wird automatisch hervorgehoben.'],
[/^Created by FireStorm$/,'Erstellt von FireStorm'],
[/^Complete all four primary Skills to Level 10 before starting Training\.$/,'Schließe alle vier Hauptfertigkeiten auf Stufe 10 ab, bevor du mit dem Training beginnst.'],
[/^Convert to ORV \($/,'In ORV umwandeln ('],
[/^Confirmed S8 Rally \/ Garrison cost$/,'Bestätigte Kosten für S8 Rally / Garrison'],
[/^October — S9 Rally \/ Garrison$/,'Oktober — S9 Rally / Garrison'],
[/^November • CURRENT$/,'November • AKTUELL'],
[/^December • NEXT$/,'Dezember • ALS NÄCHSTES']
],
it:[[/^Janvier — S8 Infanterie$/,'Gennaio — S8 Fanteria'],[/^S6 Veronica\s*[—–-]\s*([\d,\s\u00a0]+)\s+Badges?\s*\+\s*1\s+more$/i,'S6 Veronica — $1 Badge + 1 altro'],[/^Choose a target for the currently selected Officer\. This v4\.7\.0 release compares the saved current position with your target and gives a clear next-step recommendation\. It does not spend or alter Inventory\.$/,"Scegli un obiettivo per l’Ufficiale attualmente selezionato. Questa versione confronta la posizione attuale salvata con il tuo obiettivo e indica chiaramente il passo successivo. Non spende né modifica l’Inventario."],[/^Four primary skills unlock with the Officer’s Current Star Level: 0★ = Skill 1, 1★ = Skills 1–2, 2★ = Skills 1–3, and 3★\+ = all four\. Each starts at Level 1\.$/,"Le quattro abilità principali si sbloccano in base al livello stelle attuale dell’Ufficiale: 0★ = abilità 1, 1★ = abilità 1–2, 2★ = abilità 1–3 e 3★+ = tutte e quattro. Ognuna parte dal livello 1."],[/^Epic: 25 Officer Badges per Training level · 4,500 Training Badges to MAX\. Skill progression uses 440 separate fragments\.$/,"Epico: 25 Badge Ufficiale per ogni livello di addestramento · 4.500 Badge di addestramento per raggiungere MAX. La progressione delle abilità utilizza 440 frammenti separati."],[/^Fully funded$/,'Completamente finanziato'],[/^Convert to ORV \(([\d,]+) each\)$/,'Converti in ORV ($1 ciascuno)'],[/^Original · General$/,"Originale · Generale"],[/^🟠 PARTIALLY READY — (.+)$/,"🟠 PARZIALMENTE PRONTO — $1"],[/^S6 Veronica — ([\d, ]+) Badge \+ 1 more$/,"S6 Veronica — $1 Badge + 1 altro"],
[/^Choose a target for the currently selected Ufficiale\. This v4\.7\.0 release compares the saved current position with your target and gives a clear next-step recommendation\. It does not spend or alter Inventory\.$/,'Scegli un obiettivo per l’Ufficiale attualmente selezionato. Questa versione confronta la posizione attuale salvata con il tuo obiettivo e indica chiaramente il passo successivo. Non spende né modifica l’Inventario.'],
[/^Skill (\d+): Lv(\d+) · Skill (\d+): Lv(\d+) · Skill (\d+): Lv(\d+) · Skill (\d+): Lv(\d+) · Primary skills complete · ([\d,]+)\/([\d,]+) fragments used · ([\d,]+) (?:remaining|rimanenti)\.$/,'Abilità $1: Lv$2 · Abilità $3: Lv$4 · Abilità $5: Lv$6 · Abilità $7: Lv$8 · Abilità principali completate · $9/$10 frammenti usati · $11 rimanenti.'],
[/^Four primary skills unlock with the Ufficiale’s Livello Stelle attuale: 0★ = Skill 1, 1★ = Skills 1–2, 2★ = Skills 1–3, and 3★\+ = all four\. Each starts at Level 1\.$/,'Le quattro abilità principali si sbloccano in base al livello stelle attuale dell’Ufficiale: 0★ = abilità 1, 1★ = abilità 1–2, 2★ = abilità 1–3 e 3★+ = tutte e quattro. Ognuna parte dal livello 1.'],
[/^Four primary skills unlock with the Ufficiale’s Current Star Level: 0★ = Skill 1, 1★ = Skills 1–2, 2★ = Skills 1–3, and 3★\+ = all four\. Each starts at Level 1\.$/,'Le quattro abilità principali si sbloccano in base al livello stelle attuale dell’Ufficiale: 0★ = abilità 1, 1★ = abilità 1–2, 2★ = abilità 1–3 e 3★+ = tutte e quattro. Ognuna parte dal livello 1.'],
[/^440 fragments total\. The fifth skill unlocks when all four primary skills reach Level 10\.$/,'440 frammenti in totale. La quinta abilità si sblocca quando tutte e quattro le abilità principali raggiungono il livello 10.'],
[/^Epic: 25 Ufficiale Badges per Training level · 4,500 Training Badges to MAX\. Skill progression uses 440 separate fragments\.$/,'Epico: 25 Badge Ufficiale per ogni livello di addestramento · 4.500 Badge di addestramento per raggiungere MAX. La progressione delle abilità utilizza 440 frammenti separati.'],
[/^Epic fragment progression:$/,'Progressione dei frammenti Epici:'],
[/^Fifth Skill: UNLOCKED$/,'Quinta abilità: SBLOCCATA'],
[/^Set Skill (\d+) to Level (\d+)$/,'Imposta l’abilità $1 al livello $2'],
[/^KoW releases follow this recurring annual cycle, displayed in calendar order from Janvier → Décembre\. The current month is highlighted automatically\.$/,'Le uscite KoW seguono questo ciclo annuale ricorrente, visualizzato in ordine di calendario da gennaio a dicembre. Il mese corrente viene evidenziato automaticamente.'],
[/^KoW releases follow this recurring annual cycle, displayed in calendar order from January → December\. The current month is highlighted automatically\.$/,'Le uscite KoW seguono questo ciclo annuale ricorrente, visualizzato in ordine di calendario da gennaio a dicembre. Il mese corrente viene evidenziato automaticamente.'],
[/^Created by FireStorm$/,'Creato da FireStorm'],
[/^Complete all four primary Skills to Level 10 before starting Training\.$/,'Completa tutte e quattro le abilità principali al livello 10 prima di iniziare l’addestramento.'],
[/^Convert to ORV \($/,'Converti in ORV ('],
[/^Confirmed S8 Rally \/ Garrison cost$/,'Costo confermato S8 Rally / Garrison'],
[/^October — S9 Rally \/ Garrison$/,'Ottobre — S9 Rally / Garrison'],
[/^November • CURRENT$/,'Novembre • CORRENTE'],
[/^December • NEXT$/,'Dicembre • SUCCESSIVO']
]
};

/* QA20 dynamic-render closure: translate saved-scenario labels, strand summaries, and voucher eligibility messages. */
const QA20_DYNAMIC={
fr:[
[/^Scenario saved:$/,'Scénario enregistré :'],[/^Inventory snapshot used:$/,'Instantané d’inventaire utilisé :'],[/^Badges held:$/,'Badges détenus :'],[/^Stars held:$/,'Étoiles détenues :'],[/^XP held:$/,'XP détenu :'],
[/^Strand 1: Lv(\d+) · Strand 2: Lv(\d+) · Strand 3: Lv(\d+) · Strand 4: Lv(\d+) · Next cost: ([\d,.]+) badges · ([\d,.]+)\/([\d,.]+) used · ([\d,.]+) remaining\.$/,'Branche 1 : Nv$1 · Branche 2 : Nv$2 · Branche 3 : Nv$3 · Branche 4 : Nv$4 · Prochain coût : $5 insignes · $6/$7 utilisés · $8 restants.'],
[/^Officer Readiness Vouchers are not available for Original Officers$/,'Les Bons de préparation d’Officier ne sont pas disponibles pour les Officiers d’origine'],[/^Star Readiness Vouchers are not available for Original Officers$/,'Les Bons de préparation d’Étoile ne sont pas disponibles pour les Officiers d’origine']
],
de:[
[/^Scenario saved:$/,'Szenario gespeichert:'],[/^Inventory snapshot used:$/,'Verwendeter Inventar-Schnappschuss:'],[/^Badges held:$/,'Vorhandene Abzeichen:'],[/^Stars held:$/,'Vorhandene Sterne:'],[/^XP held:$/,'Vorhandene XP:'],
[/^Strand 1: Lv(\d+) · Strand 2: Lv(\d+) · Strand 3: Lv(\d+) · Strand 4: Lv(\d+) · Next cost: ([\d,.]+) badges · ([\d,.]+)\/([\d,.]+) used · ([\d,.]+) remaining\.$/,'Strang 1: St$1 · Strang 2: St$2 · Strang 3: St$3 · Strang 4: St$4 · Nächste Kosten: $5 Abzeichen · $6/$7 verwendet · $8 verbleibend.'],
[/^Officer Readiness Vouchers are not available for Original Officers$/,'Offiziers-Bereitschaftsgutscheine sind für Original-Offiziere nicht verfügbar'],[/^Star Readiness Vouchers are not available for Original Officers$/,'Sternbereitschaftsgutscheine sind für Original-Offiziere nicht verfügbar']
],
it:[
[/^Scenario saved:$/,'Scenario salvato:'],[/^Inventory snapshot used:$/,'Istantanea inventario utilizzata:'],[/^Badges held:$/,'Badge posseduti:'],[/^Stars held:$/,'Stelle possedute:'],[/^XP held:$/,'XP posseduti:'],
[/^Strand 1: Lv(\d+) · Strand 2: Lv(\d+) · Strand 3: Lv(\d+) · Strand 4: Lv(\d+) · Next cost: ([\d,.]+) badges · ([\d,.]+)\/([\d,.]+) used · ([\d,.]+) remaining\.$/,'Ramo 1: Lv$1 · Ramo 2: Lv$2 · Ramo 3: Lv$3 · Ramo 4: Lv$4 · Costo successivo: $5 distintivi · $6/$7 usati · $8 rimanenti.'],
[/^Officer Readiness Vouchers are not available for Original Officers$/,'I Buoni di preparazione Ufficiale non sono disponibili per gli Ufficiali Originali'],[/^Star Readiness Vouchers are not available for Original Officers$/,'I Buoni di preparazione Stella non sono disponibili per gli Ufficiali Originali']
]};


/* QA22: close the exact v4.7.0 Gold-skill rendered strings reported by QA21. */
const Q22={
fr:[
[/^Need ([\d,. ]+) more Skill fragments$/,'Il manque $1 fragments de compétence'],
[/^Fifth Skill: LOCKED — requires all four primary skills at Level 10$/,'Cinquième compétence : VERROUILLÉE — les quatre compétences principales doivent atteindre le niveau 10'],
[/^([\d,. ]+) fragments total\. The fifth skill unlocks when all four primary skills reach Level 10\.$/,'$1 fragments au total. La cinquième compétence se débloque lorsque les quatre compétences principales atteignent le niveau 10.'],
[/^S(\d+) · Infantry$/,'S$1 · Infanterie'],
[/^Légendaire: 5 Insignes d’officier per Training level · 900 Training Badges to MAX\. Skill progression uses 690 separate fragments\.$/,'Légendaire : 5 insignes d’officier par niveau d’entraînement · 900 insignes d’entraînement pour atteindre le MAX. La progression des compétences utilise 690 fragments distincts.']
],
de:[
[/^Need ([\d,. ]+) more Skill fragments$/,'Es fehlen $1 Fertigkeitsfragmente'],
[/^Fifth Skill: LOCKED — requires all four primary skills at Level 10$/,'Fünfte Fertigkeit: GESPERRT — alle vier Hauptfertigkeiten müssen Stufe 10 erreichen'],
[/^([\d,. ]+) fragments total\. The fifth skill unlocks when all four primary skills reach Level 10\.$/,'Insgesamt $1 Fragmente. Die fünfte Fertigkeit wird freigeschaltet, sobald alle vier Hauptfertigkeiten Stufe 10 erreicht haben.'],
[/^S(\d+) · Infantry$/,'S$1 · Infanterie'],
[/^Legendär: 5 Offiziersabzeichen per Training level · 900 Training Badges to MAX\. Skill progression uses 690 separate fragments\.$/,'Legendär: 5 Offiziersabzeichen pro Trainingsstufe · 900 Trainingsabzeichen bis MAX. Für die Fertigkeitsentwicklung werden 690 separate Fragmente benötigt.']
],
it:[
[/^Need ([\d,. ]+) more Skill fragments$/,'Servono altri $1 frammenti abilità'],
[/^Priorità: XP — ([\d,. ]+) more XP is richiesto\.$/,'Priorità: XP — sono necessari altri $1 XP.'],
[/^Fifth Skill: LOCKED — requires all four primary skills at Level 10$/,'Quinta abilità: BLOCCATA — tutte e quattro le abilità principali devono raggiungere il livello 10'],
[/^([\d,. ]+) fragments total\. The fifth skill unlocks when all four primary skills reach Level 10\.$/,'$1 frammenti in totale. La quinta abilità si sblocca quando tutte e quattro le abilità principali raggiungono il livello 10.'],
[/^Skill 1: Lv(\d+) · Skill 2: Lv(\d+) · Skill 3: Lv(\d+) · Skill 4: Lv(\d+) · Costo successivo: ([\d,.]+) fragments · ([\d,.]+)\/([\d,.]+) used · ([\d,.]+) rimanenti\.$/,'Abilità 1: Lv$1 · Abilità 2: Lv$2 · Abilità 3: Lv$3 · Abilità 4: Lv$4 · Costo successivo: $5 frammenti · $6/$7 utilizzati · $8 rimanenti.'],
[/^Leggendario: 5 Ufficiale Badges per Training level · 900 Training Badges to MAX\. Skill progression uses 690 separate fragments\.$/,'Leggendario: 5 Badge Ufficiale per livello di addestramento · 900 Badge di addestramento per raggiungere MAX. La progressione delle abilità utilizza 690 frammenti separati.'],
[/^S(\d+) · Infantry$/,'S$1 · Fanteria']
]};


function legacyPatternTranslate(raw,lang){
 const groups=[Q22,Q21,QA20_DYNAMIC,Q18,Q17,Q12,R];
 for(const group of groups){for(const [rx,replacement] of (group[lang]||[])){const match=rx.exec(raw);if(match)return raw.replace(rx,replacement);}}
 return null;
}
function translateString(source,lang){const raw=String(source==null?'':source),l=norm(lang||active);if(l==='en'||!raw)return raw;if(l==='it'){const badgeFix={'Legendary Officer Badge':'Badge Ufficiale Leggendario','Epic Officer Badge':'Badge Ufficiale Epico','Elite Officer Badge':'Badge Ufficiale Elite','Legendary Badge Officer':'Badge Ufficiale Leggendario','Epic Badge Officer':'Badge Ufficiale Epico','Elite Badge Officer':'Badge Ufficiale Elite'};if(badgeFix[raw])return badgeFix[raw];}const e=bySource[raw];if(e&&e[l])return e[l];const v=templateTranslate(raw,l);if(v!==raw)return v;const targeted=targetedTranslate(raw,l);if(targeted!==raw)return targeted;const legacy=legacyPatternTranslate(raw,l);if(legacy!==null&&legacy!==raw)return legacy;return glossaryTranslate(raw,l)}
function excluded(node){const p=node&&node.parentElement;if(!p||/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE)$/i.test(p.tagName))return true;return!!p.closest('[data-kow-i18n-ignore],#languageQaPanel,#languageQaResults,#appLanguage')}
function translateTextNode(node){if(!node||node.nodeType!==3||excluded(node))return;const current=node.nodeValue||'';if(!textBase.has(node)||(textLast.has(node)&&current!==textLast.get(node)))textBase.set(node,current);const source=textBase.get(node),lead=(source.match(/^\s*/)||[''])[0],trail=(source.match(/\s*$/)||[''])[0],next=active==='en'?source.trim():translateString(source.trim(),active),value=lead+next+trail;textLast.set(node,value);if(current!==value)node.nodeValue=value}
function translateAttributes(root){const els=[];if(root.nodeType===1)els.push(root);if(root.querySelectorAll)els.push(...root.querySelectorAll('[placeholder],[title],[aria-label],[alt]'));for(const el of els){if(el.closest('[data-kow-i18n-ignore],#languageQaPanel,#languageQaResults,#appLanguage'))continue;let base=attrBase.get(el),last=attrLast.get(el);if(!base){base={};attrBase.set(el,base)}if(!last){last={};attrLast.set(el,last)}for(const a of ['placeholder','title','aria-label','alt'])if(el.hasAttribute(a)){const now=el.getAttribute(a);if(!(a in base)||(a in last&&now!==last[a]))base[a]=now;const next=active==='en'?base[a]:translateString(base[a],active);last[a]=next;if(now!==next)el.setAttribute(a,next)}}}
function translateTree(root){if(!root||applying)return;applying=true;try{if(root.nodeType===3)translateTextNode(root);else{if(root.nodeType===1)translateAttributes(root);const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))translateTextNode(n);if(root.nodeType===9||root===document.body)translateAttributes(root)}}finally{applying=false}}
function translateHelp(){const article=document.querySelector('#help > article.card');if(!article)return;if(!helpEnglishHTML)helpEnglishHTML=article.innerHTML;if(active==='en'){if(article.dataset.kowLocalizedHelp){article.innerHTML=helpEnglishHTML;delete article.dataset.kowLocalizedHelp}return}const html=window.KOW_HELP_HTML_V450&&window.KOW_HELP_HTML_V450[active];if(html&&article.dataset.kowLocalizedHelp!==active){article.innerHTML='<h2>'+translateString('❓ Help & Instructions',active)+'</h2>'+html;article.dataset.kowLocalizedHelp=active}}
function scheduleApply(){if(scheduled)return;scheduled=true;const run=()=>{scheduled=false;if(active!=='en'){translateHelp();translateTree(document.body)}};if(typeof requestAnimationFrame==='function')requestAnimationFrame(run);else setTimeout(run,0)}
function apply(lang){if(lang)active=norm(lang);put(STORE,active);document.documentElement.lang=active;const s=document.getElementById('appLanguage');if(s&&s.value!==active)s.value=active;translateHelp();translateTree(document.body);const sourceLanguageLabel='Application language',translatedLanguageLabel=active==='en'?sourceLanguageLabel:translateString(sourceLanguageLabel,active);const languageLabel=document.querySelector('label[for="appLanguage"] b');if(languageLabel&&languageLabel.textContent!==translatedLanguageLabel)languageLabel.textContent=translatedLanguageLabel;const languageSelect=document.getElementById('appLanguage');if(languageSelect&&languageSelect.getAttribute('aria-label')!==translatedLanguageLabel)languageSelect.setAttribute('aria-label',translatedLanguageLabel);scheduleApply()}
const RENDERERS=['renderSkillStrands','renderOfficerFilters','renderOfficerOptions','renderPlanner','renderDb','renderMultiPlanner','renderReleases','renderSavedOfficerProgress','renderProgressCompareChoices','runProgressComparison','updateSmartDashboard','updateFutureOfficerForecast','updateSkillCostSummaries','updateSkillRarityNotice','updateOfficerExperience','updateStarRarityUI','kowGoView'];
function wrapRenderers(){for(const name of RENDERERS){const fn=window[name];if(typeof fn!=='function'||wrapped.has(fn))continue;const wrapper=function(){const result=fn.apply(this,arguments);const refresh=()=>{if(active!=='en'){translateHelp();translateTree(document.body)}scheduleApply()};if(result&&typeof result.then==='function')result.then(refresh,refresh);else refresh();return result};wrapped.add(fn);wrapped.add(wrapper);try{window[name]=wrapper}catch(_){}}}
function wrapDialogs(){['alert','confirm','prompt'].forEach(name=>{const native=window[name];if(typeof native!=='function'||native.__kowI18nWrapped)return;const wrappedDialog=function(message,defaultValue){const translated=translateString(String(message==null?'':message),active);return name==='prompt'?native.call(window,translated,defaultValue):native.call(window,translated)};wrappedDialog.__kowI18nWrapped=true;window[name]=wrappedDialog})}
function setLanguage(lang){active=norm(lang);apply(active)}
function start(){buildCatalogue();wrapDialogs();const help=document.querySelector('#help > article.card');if(help&&!helpEnglishHTML)helpEnglishHTML=help.innerHTML;const selector=document.getElementById('appLanguage');if(selector){selector.value=active;selector.addEventListener('change',e=>setLanguage(e.target.value))}document.addEventListener('click',scheduleApply,true);document.addEventListener('change',scheduleApply,true);document.addEventListener('input',scheduleApply,true);document.addEventListener('submit',scheduleApply,true);wrapRenderers();apply(active);window.addEventListener('load',()=>{wrapRenderers();apply(active)},{once:true})}
const api={version:VERSION,t,keyFor:hashKey,current:()=>active,getLanguage:()=>active,setLanguage,apply,translateString,translateNode:translateTree,translateRoot:translateTree,translateTree,forceApply:()=>apply(active),catalogueStats:()=>({sourceMessages:Object.keys(bySource).length,translated:Object.fromEntries(['fr','de','it'].map(l=>[l,Object.values(byId).filter(x=>!!x[l]).length])),dynamicTemplates:compiled.length,observerFree:true})};
window.KOW_I18N=api;window.KOW_PRESENTATION_I18N={apply,translateRoot:translateTree,getLanguage:()=>active,translateString};window.KOW_CLEAN_I18N={apply:()=>apply(active),current:()=>active,setLanguage,translateNode:translateTree,translateStructured:translateString,forceApply:()=>apply(active),getCanonicalKeys:()=>Object.keys(dicts().en).sort(),getDictionaries:dicts};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();