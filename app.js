import {createSeedState,escapeHtml as e,getEpisode,getMetrics,formatDuration} from './data.js';
import {icon,btn,badge,dateLabel,isoAdd,selectedDuration} from './ui.js';
import {shell,dashboard,episodesView,studioView} from './views.js';
import {calendarView,progressView,ideasView,remindersView,settingsView} from './extra-views.js';
import {hydrateLocalClips,importClip,clearLocalMedia,safeStateForStorage,renderVideo,downloadBlob,supportedExportType} from './media.js';

const STORAGE_KEY='vlog-studio-state-v1';
let state;
try { const raw=JSON.parse(localStorage.getItem(STORAGE_KEY));state=raw?.schemaVersion===1&&Array.isArray(raw.episodes)&&raw.episodes.length?raw:createSeedState(); } catch { state=createSeedState(); }
let selectedClipId=null,calendarOffset=0,calendarSelected='',episodeQuery='',uploadEpisode='',exportController=null,playing=false,playbackCleanup=null,trimSnapshot=null;
const undoHistory=new Map();
const app=document.querySelector('#app'),modalRoot=document.querySelector('#modal-root');
let modalReturnFocus;

function route(){ const [path,query='']=(location.hash.slice(1)||'today').split('?');const [view,id,part]=path.split('/');return {view,id,step:Math.min(4,Math.max(1,Number(part)||1)),filter:new URLSearchParams(query).get('filter')||'all'}; }
function currentEpisode(){return getEpisode(state,route().id)||state.episodes.find(ep=>ep.day===state.series.currentDay)||state.episodes[0];}
function persist(){try{localStorage.setItem(STORAGE_KEY,safeStateForStorage(state));return true;}catch{toast('El navegador no pudo guardar más cambios. Descarga tus datos para conservarlos.','error');return false;}}
function toast(message,type='success'){const node=document.createElement('div');node.className=`toast ${type}`;node.innerHTML=`${icon(type==='error'?'info':'check')}<span>${e(message)}</span>`;document.querySelector('#toast-root').append(node);setTimeout(()=>node.remove(),5500);}
function stopPlayback(){playbackCleanup?.();playbackCleanup=null;playing=false;}
function navigate(hash){if(exportController){toast('Termina o cancela la exportación antes de cambiar de pantalla.','error');return;}closeModal();stopPlayback();if(location.hash==='#'+hash)render();else location.hash=hash;}
function render(){
 stopPlayback();
 const r=route();let content;
 switch(r.view){
  case 'episodes':content=episodesView(state,r.filter,episodeQuery);break;
  case 'studio':content=studioView(state,r.id,r.step,selectedClipId);break;
  case 'calendar':content=calendarView(state,calendarOffset,calendarSelected);break;
  case 'progress':content=progressView(state);break;
  case 'ideas':content=ideasView(state);break;
  case 'reminders':content=remindersView(state);break;
  case 'settings':content=settingsView(state);break;
  default:content=dashboard(state);
 }
 app.innerHTML=shell(state,r,content);
 const video=document.querySelector('#studio-video');
 if(video){const clip=currentEpisode().clips.find(c=>c.id===selectedClipId)||currentEpisode().clips.find(c=>c.selected)||currentEpisode().clips[0];if(clip?.start)video.addEventListener('loadedmetadata',()=>{video.currentTime=clip.start;},{once:true});}
}
function openModal(title,body,footer='',wide=false){
 modalReturnFocus=document.activeElement;
 modalRoot.innerHTML=`<div class="modal-backdrop"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="modal-header"><h2 id="dialog-title">${title}</h2><button class="icon-btn" data-action="close-modal" aria-label="Cerrar ventana">${icon('x')}</button></div><div class="modal-body">${body}</div>${footer?`<div class="modal-footer">${footer}</div>`:''}</section></div>`;
 document.body.classList.add('modal-open');setTimeout(()=>modalRoot.querySelector('input,textarea,select,button')?.focus(),20);
}
function closeModal(){modalRoot.innerHTML='';document.body.classList.remove('modal-open');modalReturnFocus?.focus?.();}
function snapshot(ep){const list=undoHistory.get(ep.id)||[];list.push(JSON.stringify(ep.clips));if(list.length>10)list.shift();undoHistory.set(ep.id,list);}
function edited(ep){ep.editVersion=(ep.editVersion||0)+1;if(ep.status==='published')ep.hasUnpublishedChanges=true;else ep.status='editing';}
function updateEpisode(ep){persist();render();}
function clipBy(id,clipId){const ep=getEpisode(state,id);return [ep,ep?.clips.find(c=>c.id===clipId)];}
function saveField(node){
 const key=node.dataset.save;if(!key)return;
 const ep=getEpisode(state,node.dataset.id);
 if(key==='reminder-time'){const reminder=state.reminders.find(r=>r.id===node.dataset.id);if(reminder)reminder.time=node.value;}
 else if(ep){
  if(key==='hook'&&ep.hooks[ep.hookIndex])ep.hooks[ep.hookIndex].text=node.value;
  if(key==='notes')ep.notes=node.value;
  if(key==='caption')ep.caption=node.value;
  if(key==='outline'){ep.outline=ep.outline||{beginning:'',middle:'',ending:''};ep.outline[node.dataset.key]=node.value;}
 }
 persist();
}

function about(){openModal('Un estudio para probar tu próxima historia.',`<div class="about-intro"><img src="./icon.svg" alt=""><p>Vlog Studio es un prototipo de Adren Labs. Recorre la experiencia completa con una serie ficticia y prueba tus propios clips.</p></div><div class="about-grid"><section><h3>Lo que puedes hacer aquí</h3><ul><li>Organizar episodios y guardar tus cambios.</li><li>Añadir videos de tu dispositivo.</li><li>Elegir, ordenar y recortar fragmentos.</li><li>Exportar un montaje real en el navegador.</li><li>Registrar publicaciones y ver tu progreso.</li></ul></section><section><h3>Lo que estamos demostrando</h3><ul><li>Los hooks y cortes sugeridos usan plantillas, sin IA conectada.</li><li>Las escenas de India son ilustraciones animadas sin audio.</li><li>Los guiones de muestra no son transcripciones reales.</li><li>Los recordatorios no se envían con la app cerrada.</li><li>No se publica automáticamente en redes.</li></ul></section></div><div class="notice">${icon('lock')}Tus videos y cambios se guardan solo en este navegador. No hay cuentas ni sincronización en la nube.</div>`,btn('Empezar el recorrido','tour','primary','arrow'),true);}

const tourSteps=[
 ['Tu serie tiene un lugar.','En Mi día puedes ver tu avance y el siguiente paso. Los datos que ves son una serie de ejemplo.','today','Ver mi día'],
 ['Empieza con lo que ya grabaste.','Abre Tus clips. Puedes reproducir las escenas de ejemplo o añadir videos de tu dispositivo.','studio/ep-12/1','Explorar mis clips'],
 ['Encuentra tu forma de empezar.','Elige un hook de ejemplo, reescríbelo y organiza una guía breve. El texto no se convierte automáticamente en voz.','studio/ep-12/2','Probar los hooks'],
 ['Los cortes siguen tu criterio.','Mueve los controles de inicio y final, cambia el orden y reproduce el montaje. Puedes deshacer tus ajustes.','studio/ep-12/3','Abrir el montaje'],
 ['Termina, comparte y continúa.','Exporta un video o un plan de edición. Registra la publicación para ver cómo cambia el calendario.','studio/ep-12/4','Preparar mi video']
];
function showTour(index=0){const t=tourSteps[index];openModal(t[0],`<div class="tour-art"><img src="./assets/cover-india.svg" alt="Ilustración del recorrido por India"></div><p class="tour-text">${t[1]}</p><div class="tour-dots">${tourSteps.map((_,i)=>`<button class="${i===index?'active':''}" data-action="tour-step" data-index="${i}" aria-label="Paso ${i+1}"></button>`).join('')}</div>`,`<span class="muted">${index+1} de ${tourSteps.length}</span><div>${index<4?btn('Siguiente','tour-step','ghost','right',`data-index="${index+1}"`):''}${btn(t[3],'nav','primary','arrow',`data-route="${t[2]}"`)}</div>`);}

function publishModal(ep){
 const today=isoAdd(state.series.startDate,state.series.currentDay-1);
 openModal(ep.status==='published'?'Publicación del episodio':'Un episodio más en tu historia.',`<div class="publish-day">DÍA ${ep.day}<strong>${e(ep.title)}</strong></div>${ep.status==='published'?`<div class="notice">${icon('check')}Este registro ${ep.publicationEvidence==='demo'?'es un ejemplo ficticio de la demo':'fue confirmado por ti'}. Puedes actualizarlo.</div>`:''}<form id="publish-form" data-id="${ep.id}"><label class="form-field"><span class="field-label">¿Dónde lo publicaste?</span><select name="platform"><option>Instagram</option><option>YouTube</option><option>TikTok</option><option>Otro canal</option></select></label><label class="form-field"><span class="field-label">Fecha de publicación</span><input type="date" name="date" required value="${e(ep.publishedAt?.slice(0,10)||today)}"></label><label class="form-field"><span class="field-label">Enlace del video <span class="muted">(opcional)</span></span><input type="url" name="url" placeholder="https://…" value="${e(ep.publicationUrl||'')}"></label><p class="field-help">Se guarda como publicación confirmada por ti. Esta demo no comprueba el enlace ni publica en tu cuenta.</p><button class="btn primary" type="submit">${icon('check')}Confirmar publicación</button></form>`);
}

function editEpisodeModal(ep){openModal(`Día ${ep.day} · Tu episodio`,`<form id="episode-form" data-id="${ep.id}"><label class="form-field"><span class="field-label">Título</span><input name="title" required maxlength="120" value="${e(ep.title)}"></label><label class="form-field"><span class="field-label">¿De qué trata?</span><textarea name="story" rows="3">${e(ep.story||'')}</textarea></label><label class="form-field"><span class="field-label">Publicación prevista</span><input name="date" type="date" required value="${e(ep.plannedPublishDate||ep.experienceDate)}"></label><label class="form-field"><span class="field-label">Estado</span><select name="status">${[['planned','Por grabar'],['material','Con material'],['editing','En edición'],['ready','Listo para publicar'],['skipped','Omitido']].map(([value,label])=>`<option value="${value}" ${ep.status===value?'selected':''}>${label}</option>`).join('')}${ep.status==='published'?'<option value="published" selected>Publicado</option>':''}</select></label><p class="field-help">El día de la experiencia se conserva aunque publiques después.</p><button class="btn primary" type="submit">Guardar episodio ${icon('check')}</button></form>`);}

async function handleExport(ep){
 if(exportController){toast('Ya hay una exportación en curso.','error');return;}
 if(!supportedExportType()){toast('Este navegador no permite exportar video. Descarga el plan o usa Chrome.','error');return;}
 exportController=new AbortController();
 const version=ep.editVersion||0,clips=JSON.parse(JSON.stringify(ep.clips));
 const button=document.querySelector('#export-video-button');if(button)button.disabled=true;
 const feedback=document.querySelector('#export-feedback');
 if(feedback)feedback.innerHTML=`<div class="export-progress"><div><strong id="export-label">Preparando tu video…</strong><button class="text-link" data-action="cancel-export">Cancelar</button></div><div class="progress-track"><div id="export-bar" class="progress-fill" style="width:0%"></div></div><p>Mantén esta pestaña abierta. Se genera el montaje en tiempo real.</p></div>`;
 try {
  const result=await renderVideo({clips,title:`Día ${ep.day} · ${ep.title}`,format:state.series.format,overlays:!!ep.overlays,signal:exportController.signal,onProgress:p=>{const bar=document.querySelector('#export-bar'),label=document.querySelector('#export-label');if(bar)bar.style.width=`${Math.round(p*100)}%`;if(label)label.textContent=`Creando tu video · ${Math.round(p*100)}%`;}});
  ep.lastExport={version,createdAt:new Date().toISOString(),duration:result.duration,type:result.extension};
  if((ep.editVersion||0)===version&&ep.status!=='published')ep.status='ready';persist();
  const filename=`vlog-dia-${String(ep.day).padStart(2,'0')}.${result.extension}`;
  downloadBlob(result.blob,filename);
  const url=URL.createObjectURL(result.blob);
  if(feedback)feedback.innerHTML=`<div class="export-complete">${icon('check')}<div><strong>Tu montaje está listo.</strong><p>${formatDuration(result.duration)} · ${result.extension.toUpperCase()} · ${Math.round(result.blob.size/1024)} KB</p><a class="text-link" href="${url}" download="${filename}">Descargar de nuevo ${icon('download')}</a></div></div>`;
  toast('Video exportado. Ahora puedes compartirlo y registrar su publicación.');
 } catch(error){if(feedback)feedback.innerHTML='';toast(error.name==='AbortError'?'Exportación cancelada. Tu montaje sigue guardado.':error.message,error.name==='AbortError'?'success':'error');}
 finally{exportController=null;if(button)button.disabled=false;}
}

async function playMontage(ep){
 const video=document.querySelector('#studio-video'),button=document.querySelector('[data-action="play-montage"]');
 if(!video)return;if(playing){stopPlayback();video.pause();if(button)button.innerHTML=icon('play')+'<span>Reproducir montaje</span>';return;}
 const clips=ep.clips.filter(c=>c.selected&&!c.missing&&c.src);if(!clips.length){toast('Selecciona un fragmento.','error');return;}
 playing=true;let index=0,advancing=false;
 if(button)button.innerHTML=icon('pause')+'<span>Pausar montaje</span>';
 const playNext=()=>{
  if(!playing)return;
  if(index>=clips.length){stopPlayback();video.pause();if(button)button.innerHTML=icon('play')+'<span>Reproducir montaje</span>';return;}
  advancing=false;const clip=clips[index];video.src=clip.src;video.poster=clip.poster||'';
  document.querySelectorAll('.timeline-clip').forEach(node=>node.classList.toggle('active',node.dataset.clip===clip.id));
  video.onloadedmetadata=()=>{video.currentTime=clip.start;video.play().catch(()=>{stopPlayback();toast('Pulsa reproducir en el video para continuar.','error');});};
  video.ontimeupdate=()=>{if(!advancing&&video.currentTime>=clip.end-.08){advancing=true;video.pause();index++;playNext();}};
  video.onended=()=>{if(!advancing){advancing=true;index++;playNext();}};
 };
 playbackCleanup=()=>{playing=false;video.ontimeupdate=null;video.onended=null;video.onloadedmetadata=null;video.pause();};playNext();
}

async function action(name,node){
 const {id,clip:clipId}=node.dataset,ep=getEpisode(state,id)||currentEpisode();
 switch(name){
  case 'nav':navigate(node.dataset.route);break;
  case 'about':about();break;
  case 'tour':showTour();break;
  case 'tour-step':showTour(Number(node.dataset.index));break;
  case 'close-modal':closeModal();break;
  case 'open-episode':selectedClipId=null;navigate(`studio/${ep.id}/${ep.status==='ready'?4:ep.status==='editing'?3:1}`);break;
  case 'open-step':stopPlayback();navigate(`studio/${ep.id}/${node.dataset.step}`);break;
  case 'filter':navigate(`episodes?filter=${node.dataset.filter}`);break;
  case 'search':openModal('Encuentra tu historia.',`<label class="search-box">${icon('search')}<input id="global-search" placeholder="Busca por título o por día…" aria-label="Buscar episodio"></label><div id="search-results" class="search-results"></div>`);break;
  case 'mobile-menu':openModal('Tu espacio creativo.',`<div class="mobile-menu-grid">${[['ideas','bulb','Ideas'],['progress','chart','Progreso'],['reminders','bell','Recordatorios'],['settings','settings','Mi serie']].map(([r,i,label])=>btn(label,'nav','secondary',i,`data-route="${r}"`)).join('')}</div>`,btn('Qué incluye esta demo','about','ghost','info'));break;
  case 'upload':uploadEpisode=ep.id;document.querySelector('#clip-upload').click();break;
  case 'preview-clip':{const c=ep.clips.find(c=>c.id===clipId);if(!c?.src){toast('Vuelve a añadir este archivo para reproducirlo.','error');break;}openModal(e(c.name),`<video class="modal-video" src="${e(c.src)}" poster="${e(c.poster||'')}" controls playsinline autoplay></video><p class="field-help">${c.local?'Tu clip permanece en este navegador.':'Escena ilustrada de demostración. Este clip no tiene audio.'}</p>`);break;}
  case 'select-hook':ep.hookIndex=Number(node.dataset.index);persist();render();toast('Apertura elegida. Puedes darle tu propia voz.');break;
  case 'generate-hooks':{const note=(ep.notes||ep.title).trim().slice(0,150);ep.hooks=[{type:'Directo',text:`Día ${ep.day}: ${note}`,needsRecording:true},{type:'Personal',text:`Hoy quiero recordar algo: ${note.charAt(0).toLowerCase()+note.slice(1)}`,needsRecording:true},{type:'Curiosidad',text:`¿Con qué me quedo de este día? ${note}`,needsRecording:true}];ep.hookIndex=0;persist();render();toast('Tres plantillas de apertura basadas en tu nota. No se ha analizado el video con IA.');break;}
  case 'select-clip':stopPlayback();selectedClipId=clipId;render();break;
  case 'toggle-clip':{const c=ep.clips.find(c=>c.id===clipId);snapshot(ep);c.selected=!c.selected;edited(ep);updateEpisode(ep);break;}
  case 'lock-clip':{const c=ep.clips.find(c=>c.id===clipId);c.locked=!c.locked;persist();render();toast(c.locked?'Fragmento protegido frente a las sugerencias de corte.':'Protección desactivada.');break;}
  case 'move-clip':{const index=ep.clips.findIndex(c=>c.id===clipId),target=index+Number(node.dataset.delta);if(target>=0&&target<ep.clips.length){snapshot(ep);[ep.clips[index],ep.clips[target]]=[ep.clips[target],ep.clips[index]];edited(ep);updateEpisode(ep);}break;}
  case 'undo-edit':{const history=undoHistory.get(ep.id);if(history?.length){ep.clips=JSON.parse(history.pop());edited(ep);updateEpisode(ep);toast('Último cambio del montaje deshecho.');}else toast('Todavía no hay cambios que deshacer en esta sesión.');break;}
  case 'suggest-cuts':{snapshot(ep);ep.clips.forEach((c,i)=>{if(c.locked)return;const trim=Math.min(c.duration*.1,.8);c.start=Number(trim.toFixed(1));c.end=Number(Math.max(c.start+.5,c.duration-trim*(i%2?2:1)).toFixed(1));c.reason='Recorte ilustrativo de inicio y final. Revisa la escena: esta demo no analiza su contenido.';});edited(ep);updateEpisode(ep);toast('Plantilla de cortes aplicada. Revisa los fragmentos antes de exportar.');break;}
  case 'clip-script':{const c=ep.clips.find(c=>c.id===clipId);openModal('Notas de este fragmento',`<span class="tag">${c.local?'TU MATERIAL':'GUION FICTICIO DE EJEMPLO'}</span><h3>${e(c.name)}</h3><p>${e(c.transcript||'Este clip no tiene una transcripción. La conexión a reconocimiento de voz pertenece a la siguiente fase.')}</p><p class="field-help">La demo no transcribe ni reconoce lo que ocurre en tus videos.</p>`);break;}
  case 'play-montage':await playMontage(ep);break;
  case 'toggle-overlays':ep.overlays=!ep.overlays;edited(ep);persist();render();break;
  case 'export-video':await handleExport(ep);break;
  case 'cancel-export':exportController?.abort();break;
  case 'export-plan':{const plan={product:'Vlog Studio',type:'edit-plan',version:ep.editVersion||0,episode:{day:ep.day,title:ep.title,experienceDate:ep.experienceDate},format:state.series.format,hook:ep.hooks[ep.hookIndex]?.text,hookRequiresRecording:true,clips:ep.clips.filter(c=>c.selected).map(c=>({name:c.name,start:c.start,end:c.end,duration:c.end-c.start,source:c.local?'local-user-file':'synthetic-demo'})),note:'Este archivo contiene instrucciones de edición; no incluye los archivos de video.'};downloadBlob(new Blob([JSON.stringify(plan,null,2)],{type:'application/json'}),`plan-dia-${ep.day}.json`);toast('Plan de edición descargado.');break;}
  case 'copy-caption':{const text=ep.caption||`Día ${ep.day} en India · ${ep.title}`;try{await navigator.clipboard.writeText(text);toast('Título copiado.');}catch{openModal('Tu título',`<textarea rows="4" readonly>${e(text)}</textarea><p>Puedes seleccionarlo y copiarlo.</p>`);}break;}
  case 'publish-episode':publishModal(ep);break;
  case 'edit-episode':editEpisodeModal(ep);break;
  case 'calendar-day':calendarSelected=id;if(route().view!=='calendar')navigate('calendar');else render();break;
  case 'calendar-month':calendarOffset+=Number(node.dataset.delta);render();break;
  case 'calendar-today':calendarOffset=0;calendarSelected=state.episodes.find(x=>x.day===state.series.currentDay)?.id||'';render();break;
  case 'new-episode':{const next=state.episodes.find(x=>x.status==='planned');openModal('Una nueva historia.',`<form id="new-episode-form"><label class="form-field"><span class="field-label">Día de la serie</span><input type="number" name="day" min="1" max="120" required value="${next?.day||state.episodes.length+1}"></label><label class="form-field"><span class="field-label">¿Cómo se llama este episodio?</span><input name="title" maxlength="120" required placeholder="Un pequeño momento que vale la pena contar"></label><button type="submit" class="btn primary">Crear episodio ${icon('arrow')}</button></form>`);break;}
  case 'use-idea':{const idea=state.ideas.find(x=>x.id===id),target=state.episodes.find(x=>x.day===state.series.currentDay)||ep;if(idea){target.notes=[target.notes,idea.text].filter(Boolean).join('\n');idea.used=true;persist();navigate(`studio/${target.id}/2`);toast('Idea añadida a las notas de tu episodio.');}break;}
  case 'delete-idea':state.ideas=state.ideas.filter(x=>x.id!==id);persist();render();toast('Idea eliminada de este espacio.');break;
  case 'demo-ideas':state.ideas.unshift({id:'idea-'+Date.now(),text:'Vuelve a un lugar que conociste al principio y cuenta qué notas diferente.',tag:'Reflexión',used:false},{id:'idea-'+(Date.now()+1),text:'Documenta un pequeño ritual de tu día: cómo empieza, qué disfrutas y por qué lo repites.',tag:'Cotidiano',used:false});persist();render();toast('Dos ideas de ejemplo añadidas.');break;
  case 'test-reminder':{const r=state.reminders.find(x=>x.id===id);toast(r?.type==='capture'?'Aviso de ejemplo: ¿qué momento quieres recordar hoy?':r?.type==='publish'?'Aviso de ejemplo: tu historia está lista para compartir.':'Aviso de ejemplo: tienes un episodio esperando su próximo corte.');break;}
  case 'series-pause':state.series.status=state.series.status==='active'?'paused':'active';persist();render();toast(state.series.status==='active'?'Serie retomada.':'Serie en pausa. Tu historial se conserva.');break;
  case 'series-close':openModal('Cierra esta etapa.',`<p>Tu serie y sus episodios se conservarán. El cierre no marcará los pendientes como publicados.</p><p>Podrás retomar la serie desde Configuración.</p>`,btn('Seguir creando','close-modal','secondary')+btn('Cerrar mi serie','confirm-close-series','primary','check'));break;
  case 'confirm-close-series':state.series.status='closed';state.reminders.forEach(r=>r.enabled=false);persist();closeModal();render();toast('Serie cerrada. Tu recorrido queda guardado.');break;
  case 'reset-demo':openModal('Volver a empezar la demo.',`<p>Se reemplazarán los cambios, ideas y clips guardados en este navegador por los datos de ejemplo. Los videos originales de tu dispositivo no se modifican.</p><p>Si quieres conservar el trabajo, descarga primero tus datos y los videos exportados.</p>`,btn('Conservar mi trabajo','close-modal','secondary')+btn('Reiniciar demo','confirm-reset','danger','refresh'));break;
  case 'confirm-reset':await clearLocalMedia();state=createSeedState();undoHistory.clear();selectedClipId=null;calendarOffset=0;calendarSelected='';episodeQuery='';persist();closeModal();navigate('today');toast('La demo está lista para un nuevo recorrido.');break;
  case 'export-data':downloadBlob(new Blob([safeStateForStorage(state)],{type:'application/json'}),'vlog-studio-respaldo.json');toast('Respaldo de organización descargado. Los archivos de video se conservan por separado.');break;
  case 'import-data':{const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{try{const file=input.files[0];if(!file)return;if(file.size>8*1024*1024)throw new Error('El respaldo es demasiado grande.');const imported=JSON.parse(await file.text());if(imported.schemaVersion!==1||!imported.series||!Array.isArray(imported.episodes)||!imported.episodes.length||imported.episodes.length>180||!Array.isArray(imported.ideas)||!Array.isArray(imported.reminders))throw new Error('El archivo no es un respaldo compatible.');for(const episode of imported.episodes){if(!Array.isArray(episode.clips)||!Array.isArray(episode.hooks)||!Number.isFinite(episode.day)||typeof episode.title!=='string')throw new Error('Hay episodios inválidos en el archivo.');for(const c of episode.clips){if(!c.local&&!/^\.\/assets\/scene-(morning|market|chai|evening)\.mp4$/.test(c.src||'')){c.src='';c.missing=true;}if(c.poster&&!/^\.\/assets\/scene-|^data:image\/(jpeg|png);base64,/.test(c.poster))c.poster='';}}await hydrateLocalClips(imported);state=imported;persist();render();toast('Organización restaurada. Los clips locales requieren estar en este navegador.');}catch(error){toast(error.message,'error');}};input.click();break;}
 }
}

document.addEventListener('click',event=>{
 if(exportController&&event.target.closest('a[href^="#"]')){event.preventDefault();toast('Mantén esta pantalla abierta hasta que termine la exportación.','error');return;}
 const node=event.target.closest('[data-action]');if(node){event.preventDefault();action(node.dataset.action,node).catch(error=>toast(error.message||'No se pudo completar la acción.','error'));}
 else if(event.target.classList.contains('modal-backdrop'))closeModal();
});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape')closeModal();
 if(event.key==='Tab'&&modalRoot.firstElementChild){const all=[...modalRoot.querySelectorAll('button,a[href],input,textarea,select')].filter(x=>!x.disabled);if(!all.length)return;const first=all[0],last=all.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
});

document.addEventListener('input',event=>{
 const node=event.target;
 if(node.dataset.save)saveField(node);
 if(node.id==='global-search'){const q=node.value.toLocaleLowerCase();document.querySelector('#search-results').innerHTML=state.episodes.filter(ep=>`${ep.title} ${ep.day}`.toLocaleLowerCase().includes(q)).slice(0,7).map(ep=>`<button class="search-result" data-action="open-episode" data-id="${ep.id}"><span>Día ${ep.day}</span><strong>${e(ep.title)}</strong>${icon('right')}</button>`).join('');}
 if(node.id==='episode-search'){episodeQuery=node.value;const focus=node.selectionStart;const r=route();app.innerHTML=shell(state,r,episodesView(state,r.filter,episodeQuery));const input=document.querySelector('#episode-search');input.focus();try{input.setSelectionRange(focus,focus);}catch{}}
 if(node.dataset.trim){const[ep,c]=clipBy(node.dataset.id,node.dataset.clip);if(!trimSnapshot){snapshot(ep);trimSnapshot=c.id;}let value=Number(node.value);if(node.dataset.trim==='start')c.start=Math.min(value,c.end-.5);else c.end=Math.max(value,c.start+.5);node.value=c[node.dataset.trim];document.querySelector('#trim-start-label').textContent=c.start.toFixed(1)+' s';document.querySelector('#trim-end-label').textContent=c.end.toFixed(1)+' s';document.querySelector('#trim-duration-label').textContent=(c.end-c.start).toFixed(1)+' s';const video=document.querySelector('#studio-video');if(video&&node.dataset.trim==='start')video.currentTime=c.start;}
});

document.addEventListener('change',event=>{
 const node=event.target;
 if(node.dataset.trim){const ep=getEpisode(state,node.dataset.id);trimSnapshot=null;edited(ep);persist();render();return;}
 if(node.dataset.change==='clip-selected'){const[ep,c]=clipBy(node.dataset.id,node.dataset.clip);snapshot(ep);c.selected=node.checked;edited(ep);persist();render();}
 if(node.dataset.change==='format'){state.series.format=node.value;persist();render();}
 if(node.dataset.change==='overlays'){const ep=getEpisode(state,node.dataset.id);ep.overlays=node.checked;edited(ep);persist();}
 if(node.dataset.change==='reminder-enabled'){const r=state.reminders.find(r=>r.id===node.dataset.id);if(r){r.enabled=node.checked;persist();toast(r.enabled?'Preferencia guardada. Los avisos automáticos son parte de la siguiente fase.':'Recordatorio desactivado.');}}
 if(node.dataset.save)saveField(node);
});

document.addEventListener('submit',event=>{
 const form=event.target;event.preventDefault();const data=new FormData(form);
 try{
 if(form.id==='publish-form'){const ep=getEpisode(state,form.dataset.id),url=String(data.get('url')||'');if(url&&!/^https?:\/\//i.test(url))throw new Error('Usa un enlace que empiece con https://.');ep.status='published';ep.publishedAt=String(data.get('date'));ep.publicationReportedAt=new Date().toISOString();ep.publicationUrl=url;ep.publicationEvidence='user-reported';ep.platform=data.get('platform');ep.publishedVersion=ep.editVersion||0;ep.hasUnpublishedChanges=false;persist();closeModal();render();toast(`Día ${ep.day} registrado. Una historia más en tu serie.`);}
 if(form.id==='episode-form'){const ep=getEpisode(state,form.dataset.id);ep.title=String(data.get('title')).trim();ep.story=String(data.get('story')||'');const date=String(data.get('date'));if(date!==ep.plannedPublishDate){ep.originalPublishDate=ep.originalPublishDate||ep.plannedPublishDate;ep.planHistory=ep.planHistory||[];ep.planHistory.push({from:ep.plannedPublishDate,to:date,changedAt:new Date().toISOString()});ep.plannedPublishDate=date;}const next=String(data.get('status'));if(ep.status==='published'&&next!=='published'){ep.previousPublications=ep.previousPublications||[];ep.previousPublications.push({publishedAt:ep.publishedAt,evidence:ep.publicationEvidence,url:ep.publicationUrl});ep.publishedAt=null;}ep.status=next;persist();closeModal();render();toast('Episodio actualizado.');}
 if(form.id==='new-episode-form'){const day=Number(data.get('day'));if(!Number.isInteger(day)||day<1||day>120)throw new Error('Elige un día entre 1 y 120.');let ep=state.episodes.find(x=>x.day===day);if(ep&&ep.status!=='planned')throw new Error('Este día ya tiene un episodio. Ábrelo para continuar.');if(!ep){ep={id:`ep-${String(day).padStart(2,'0')}`,day,number:day,experienceDate:isoAdd(state.series.startDate,day-1),plannedPublishDate:isoAdd(state.series.startDate,day-1),status:'planned',clips:[],hooks:[{type:'Mi apertura',text:'',needsRecording:true}],hookIndex:0,notes:''};state.episodes.push(ep);state.episodes.sort((a,b)=>a.day-b.day);}ep.title=String(data.get('title')).trim();persist();closeModal();navigate(`studio/${ep.id}/1`);toast('Tu episodio tiene un lugar. Añade los primeros clips.');}
 if(form.id==='idea-form'){const text=String(data.get('text')||'').trim();if(!text)throw new Error('Escribe la idea que quieres guardar.');state.ideas.unshift({id:'idea-'+Date.now(),text,tag:String(data.get('tag')||'Mi idea'),used:false});persist();render();toast('Idea guardada para tu próxima historia.');}
 if(form.id==='series-form'){const start=String(data.get('startDate')),goalType=String(data.get('goalType'));let goal=Number(data.get('goal'));if(goalType==='date'){const end=String(data.get('endDate'));goal=Math.round((new Date(end+'T12:00:00Z')-new Date(start+'T12:00:00Z'))/86400000)+1;}if(!Number.isInteger(goal)||goal<1||goal>120)throw new Error('La meta debe estar entre 1 y 120 días o episodios.');const currentDay=Number(data.get('currentDay')||state.series.currentDay);if(!Number.isInteger(currentDay)||currentDay<1||currentDay>120)throw new Error('Revisa el día actual de la serie.');const oldStart=state.series.startDate;Object.assign(state.series,{name:String(data.get('name')).trim(),startDate:start,goalType,goal,timezone:String(data.get('timezone')),format:String(data.get('format')),targetDuration:Math.max(5,Math.min(600,Number(data.get('targetDuration'))||60)),currentDay,endDate:isoAdd(start,goal-1)});if(start!==oldStart)state.episodes.forEach(ep=>{ep.experienceDate=isoAdd(start,ep.day-1);if(ep.status==='planned')ep.plannedPublishDate=ep.experienceDate;});for(let day=1;day<=goal;day++){if(!state.episodes.some(ep=>ep.day===day))state.episodes.push({id:`ep-${String(day).padStart(2,'0')}`,day,number:day,title:`Mi historia del día ${day}`,story:'',notes:'',experienceDate:isoAdd(start,day-1),plannedPublishDate:isoAdd(start,day-1),status:'planned',clips:[],hooks:[{type:'Mi apertura',text:'',needsRecording:true}],hookIndex:0});}state.episodes.sort((a,b)=>a.day-b.day);persist();render();toast('Tu serie está actualizada. Los episodios anteriores se conservan.');}
 }catch(error){toast(error.message,'error');}
});

async function addFiles(files,epId){const ep=getEpisode(state,epId)||currentEpisode();if(!files.length)return;toast('Preparando tus clips en este navegador…');let added=0;for(const file of files){try{const clip=await importClip(file);ep.clips.push(clip);added++;}catch(error){toast(`${file.name}: ${error.message}`,'error');}}if(added){if(ep.status==='planned'||ep.status==='skipped')ep.status='material';ep.editVersion=(ep.editVersion||0)+1;persist();render();toast(`${added} ${added===1?'clip añadido':'clips añadidos'}. No se han enviado a ningún servidor.`);}}
document.querySelector('#clip-upload').addEventListener('change',async event=>{await addFiles([...event.target.files],uploadEpisode);event.target.value='';});
document.addEventListener('dragover',event=>{if(event.dataTransfer?.types.includes('Files')){event.preventDefault();event.target.closest('.upload-zone')?.classList.add('dragging');}});
document.addEventListener('dragleave',event=>event.target.closest('.upload-zone')?.classList.remove('dragging'));
document.addEventListener('drop',event=>{if(event.dataTransfer?.files.length){event.preventDefault();if(route().view==='studio')addFiles([...event.dataTransfer.files],currentEpisode().id);else toast('Abre un episodio para añadir tus clips.');}});
window.addEventListener('hashchange',()=>{stopPlayback();closeModal();render();window.scrollTo({top:0,behavior:'instant'});});
window.addEventListener('beforeunload',event=>{if(exportController){event.preventDefault();event.returnValue='';}});

render();
await hydrateLocalClips(state);
render();
persist();
