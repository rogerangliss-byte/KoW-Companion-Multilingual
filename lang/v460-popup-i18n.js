/* KoW Companion v4.6.0 — localized alert/confirm runtime. */
(function(){
'use strict';
const nativeAlert=window.alert.bind(window), nativeConfirm=window.confirm.bind(window);
const lang=()=>window.KOW_CLEAN_I18N?.current?.()||'en';
const simple={
fr:{
'Backup restored successfully. Officer profiles, Officer Badges Held and shared resources have been imported. The app will reload now.':"Sauvegarde restaurée avec succès. Les profils d’Officiers, les Badges d’Officiers détenus et les ressources partagées ont été importés. L’application va maintenant se recharger.",
'Enter a plan name.':'Saisissez un nom de plan.','Plan saved.':'Plan enregistré.','Saved plan deleted.':'Plan enregistré supprimé.',
'Fix validation issues first.':'Corrigez d’abord les erreurs de validation.','Officer database saved.':'Base de données des Officiers enregistrée.',
'CSV validation failed.':'Échec de la validation CSV.','CSV imported.':'CSV importé.','Restore default officer database?':'Restaurer la base de données des Officiers par défaut ?',
'This image is too large for browser storage. Try a smaller JPG or PNG.':"Cette image est trop volumineuse pour le stockage du navigateur. Essayez un JPG ou PNG plus petit.",
'Appearance and backgrounds restored to defaults.':"Apparence et arrière-plans restaurés par défaut.",'Reset Central Inventory?':"Réinitialiser l’Inventaire central ?"
},
de:{
'Backup restored successfully. Officer profiles, Officer Badges Held and shared resources have been imported. The app will reload now.':'Backup erfolgreich wiederhergestellt. Offiziersprofile, vorhandene Offiziersabzeichen und gemeinsame Ressourcen wurden importiert. Die App wird jetzt neu geladen.',
'Enter a plan name.':'Geben Sie einen Plannamen ein.','Plan saved.':'Plan gespeichert.','Saved plan deleted.':'Gespeicherter Plan gelöscht.',
'Fix validation issues first.':'Beheben Sie zuerst die Validierungsfehler.','Officer database saved.':'Offiziersdatenbank gespeichert.',
'CSV validation failed.':'CSV-Validierung fehlgeschlagen.','CSV imported.':'CSV importiert.','Restore default officer database?':'Standard-Offiziersdatenbank wiederherstellen?',
'This image is too large for browser storage. Try a smaller JPG or PNG.':'Dieses Bild ist zu groß für den Browser-Speicher. Versuchen Sie ein kleineres JPG oder PNG.',
'Appearance and backgrounds restored to defaults.':'Darstellung und Hintergründe wurden auf Standardwerte zurückgesetzt.','Reset Central Inventory?':'Zentrales Inventar zurücksetzen?'
},
it:{
'Backup restored successfully. Officer profiles, Officer Badges Held and shared resources have been imported. The app will reload now.':'Backup ripristinato correttamente. I profili degli Ufficiali, i Badge Ufficiale posseduti e le risorse condivise sono stati importati. L’app verrà ora ricaricata.',
'Enter a plan name.':'Inserisci un nome per il piano.','Plan saved.':'Piano salvato.','Saved plan deleted.':'Piano salvato eliminato.',
'Fix validation issues first.':'Correggi prima gli errori di convalida.','Officer database saved.':'Banca dati Ufficiali salvata.',
'CSV validation failed.':'Convalida CSV non riuscita.','CSV imported.':'CSV importato.','Restore default officer database?':'Ripristinare la banca dati Ufficiali predefinita?',
'This image is too large for browser storage. Try a smaller JPG or PNG.':'Questa immagine è troppo grande per la memoria del browser. Prova un JPG o PNG più piccolo.',
'Appearance and backgrounds restored to defaults.':'Aspetto e sfondi ripristinati ai valori predefiniti.','Reset Central Inventory?':'Reimpostare l’Inventario centrale?'
}};
function tr(raw){
 const s=String(raw??''), l=lang(); if(l==='en')return s;
 if(simple[l]?.[s])return simple[l][s];
 let m;
 if((m=s.match(/^(.+) progress saved\.$/))){
   return l==='fr'?`Progression de ${m[1]} enregistrée.`:l==='de'?`Fortschritt für ${m[1]} gespeichert.`:`Progressi di ${m[1]} salvati.`;
 }
 if((m=s.match(/^(.+) is now saved as MAXED\.$/))){
   return l==='fr'?`${m[1]} est maintenant enregistré comme MAX.`:l==='de'?`${m[1]} ist jetzt als MAX gespeichert.`:`${m[1]} è ora salvato come MAX.`;
 }
 if((m=s.match(/^Reset saved progress for (.+)\? Shared resources will not be changed\.$/))){
   return l==='fr'?`Réinitialiser la progression enregistrée de ${m[1]} ? Les ressources partagées ne seront pas modifiées.`:
          l==='de'?`Gespeicherten Fortschritt für ${m[1]} zurücksetzen? Gemeinsame Ressourcen werden nicht geändert.`:
          `Reimpostare i progressi salvati di ${m[1]}? Le risorse condivise non verranno modificate.`;
 }
 if((m=s.match(/^Backup failed: (.+)$/)))return l==='fr'?`Échec de la sauvegarde : ${m[1]}`:l==='de'?`Backup fehlgeschlagen: ${m[1]}`:`Backup non riuscito: ${m[1]}`;
 if((m=s.match(/^Restore failed: (.+)$/)))return l==='fr'?`Échec de la restauration : ${m[1]}`:l==='de'?`Wiederherstellung fehlgeschlagen: ${m[1]}`:`Ripristino non riuscito: ${m[1]}`;
 if(s.startsWith('Set ')&&s.includes(' to fully MAXED?')){
   const name=s.slice(4,s.indexOf(' to fully MAXED?'));
   if(l==='fr')return `Définir ${name} comme entièrement MAX ?\n\nCela définira :\n• 5 Étoiles\n• Niveau 70\n• Déverrouillé\n• Les 4 branches de compétence au niveau 5\n• Entraînement niveau 180\n\nLes ORV, SRV, Badges, Étoiles et XP partagés ne seront ni dépensés ni modifiés.`;
   if(l==='de')return `${name} vollständig auf MAX setzen?\n\nDadurch wird gesetzt:\n• 5 Sterne\n• Stufe 70\n• Freigeschaltet\n• Alle 4 Fähigkeitsstränge auf Stufe 5\n• Training Stufe 180\n\nGemeinsame ORV, SRV, Abzeichen, Sterne und XP werden nicht verbraucht oder geändert.`;
   return `Impostare ${name} completamente a MAX?\n\nVerranno impostati:\n• 5 Stelle\n• Livello 70\n• Sbloccato\n• Tutti e 4 i rami abilità al livello 5\n• Addestramento livello 180\n\nORV, SRV, Badge, Stelle e XP condivisi non verranno consumati o modificati.`;
 }
 try{return window.KOW_CLEAN_I18N?.translateStructured?.(s,window.KOW_CLEAN_I18N.getDictionaries?.()[l]||{},l)||s}catch(_){return s}
}
window.kowPopupTranslate=tr;
window.alert=(msg)=>nativeAlert(tr(msg));
window.confirm=(msg)=>nativeConfirm(tr(msg));
})();
