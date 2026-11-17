/* v4.6.0 TEST — localized recurring release calendar */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const lang=()=>window.KOW_CLEAN_I18N?.current?.()||$('appLanguage')?.value||'en';
const D={
en:{months:['January','February','March','April','May','June','July','August','September','October','November','December'],current:'Current month',next:'Next scheduled release',cur:'CURRENT',nxt:'NEXT',none:'No scheduled release',r:['New Dogs','Guns: Field · Jets: Fighter','Officers: Rally / Garrison','New Ships','Guns: Rally / Garrison · Jets: Bomber','Officers: Infantry','—','Guns: Field · Jets: Fighter','Officers: Tanks','New Ships','Guns: Rally / Garrison · Jets: Bomber','Officers: Tank Destroyers']},
fr:{months:['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],current:'Mois actuel',next:'Prochaine sortie prévue',cur:'ACTUEL',nxt:'SUIVANT',none:'Aucune sortie prévue',r:['Nouveaux chiens','Armes : Champ · Avions : Chasseur','Officiers : Ralliement / Garnison','Nouveaux navires','Armes : Ralliement / Garnison · Avions : Bombardier','Officiers : Infanterie','—','Armes : Champ · Avions : Chasseur','Officiers : Chars','Nouveaux navires','Armes : Ralliement / Garnison · Avions : Bombardier','Officiers : Chasseurs de chars']},
de:{months:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],current:'Aktueller Monat',next:'Nächste geplante Veröffentlichung',cur:'AKTUELL',nxt:'NÄCHSTE',none:'Keine geplante Veröffentlichung',r:['Neue Hunde','Waffen: Feld · Flugzeuge: Jäger','Offiziere: Rallye / Garnison','Neue Schiffe','Waffen: Rallye / Garnison · Flugzeuge: Bomber','Offiziere: Infanterie','—','Waffen: Feld · Flugzeuge: Jäger','Offiziere: Panzer','Neue Schiffe','Waffen: Rallye / Garnison · Flugzeuge: Bomber','Offiziere: Panzerjäger']},
it:{months:['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],current:'Mese corrente',next:'Prossima uscita prevista',cur:'CORRENTE',nxt:'PROSSIMA',none:'Nessuna uscita prevista',r:['Nuovi cani','Armi: Campo · Aerei: Caccia','Ufficiali: Rally / Guarnigione','Nuove navi','Armi: Rally / Guarnigione · Aerei: Bombardiere','Ufficiali: Fanteria','—','Armi: Campo · Aerei: Caccia','Ufficiali: Carri','Nuove navi','Armi: Rally / Guarnigione · Aerei: Bombardiere','Ufficiali: Cacciacarri']}
};
function render(){
 const nextBox=$('nextRelease'),cal=$('releaseCalendar');if(!nextBox||!cal)return;
 const t=D[lang()]||D.en,now=new Date(),mi=now.getMonth(),months=t.months;
 const recurring=t.r.map((r,i)=>({i,r})).filter(x=>x.r!=='—');
 let next=recurring.find(x=>x.i>mi);if(!next)next=recurring[0];
 const currentText=t.r[mi]!=='—'?`${months[mi]} — ${t.r[mi]}`:`${months[mi]} — ${t.none}`;
 nextBox.innerHTML=`<b>${t.current}:</b> ${currentText}<br><b>${t.next}:</b> ${months[next.i]} — ${next.r}`;
 let h='<div style="display:grid;gap:8px">';
 t.r.forEach((r,i)=>{const active=i===mi,up=i===next.i;h+=`<div style="display:grid;grid-template-columns:minmax(95px,170px) 1fr;gap:12px;padding:13px;border:1px solid ${active?'#d6aa2b':up?'rgba(213,167,47,.55)':'rgba(255,255,255,.15)'};border-radius:10px;background:${active?'rgba(214,170,43,.14)':up?'rgba(213,167,47,.07)':'rgba(0,0,0,.18)'}"><b>${months[i]}${active?' • '+t.cur:up?' • '+t.nxt:''}</b><span>${r}</span></div>`});
 h+='</div>';cal.innerHTML=h;
}
window.kowRenderLocalizedReleaseCalendar=render;
function install(){render();const s=$('appLanguage');if(s&&!s.dataset.kowCalendarLoc){s.dataset.kowCalendarLoc='1';s.addEventListener('change',()=>setTimeout(render,50))}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,250));else setTimeout(install,50);
window.addEventListener('load',()=>setTimeout(render,700));
})();
