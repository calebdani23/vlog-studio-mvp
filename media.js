const DB_NAME = 'vlog-studio-media-v1';
let dbPromise;
const objectUrls = new Map();

function openDB() {
  if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('clips');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function dbOperation(mode, operation) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('clips', mode);
    const request = operation(tx.objectStore('clips'));
    let value;
    request.onsuccess = () => { value = request.result; };
    tx.oncomplete = () => resolve(value);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('No se pudo guardar el clip.'));
  });
}

export async function hydrateLocalClips(state) {
  for (const episode of state.episodes) for (const clip of episode.clips || []) {
    if (!clip.local) continue;
    try {
      const file = await dbOperation('readonly', store => store.get(clip.id));
      if (file) { clip.src = URL.createObjectURL(file); objectUrls.set(clip.id, clip.src); clip.missing = false; }
      else { clip.missing = true; clip.src = ''; }
    } catch { clip.missing = true; clip.src = ''; }
  }
}

export async function clearLocalMedia() {
  try { await dbOperation('readwrite', store => store.clear()); } catch {}
  for (const url of objectUrls.values()) URL.revokeObjectURL(url);
  objectUrls.clear();
}

export function safeStateForStorage(state) {
  return JSON.stringify(state, (key, value) => {
    if (key === 'src' && typeof value === 'string' && value.startsWith('blob:')) return '';
    if (key === 'downloadUrl') return undefined;
    return value;
  });
}

export async function importClip(file) {
  if (!file.type.startsWith('video/')) throw new Error('Elige un archivo de video.');
  if (file.size > 250 * 1024 * 1024) throw new Error('Para esta demo, cada clip puede pesar hasta 250 MB.');
  const id = `local-${crypto.randomUUID?.() || Date.now() + '-' + Math.random().toString(36).slice(2)}`;
  const src = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.preload = 'auto'; video.src = src;
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('El navegador no pudo abrir este formato. Prueba con un MP4.')), 18000);
      video.onloadeddata = () => { clearTimeout(timer); resolve(); };
      video.onerror = () => { clearTimeout(timer); reject(new Error('No se pudo reproducir este archivo. Prueba con un MP4 compatible.')); };
    });
    if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error('No se pudo leer la duración del clip.');
    const canvas = document.createElement('canvas'); canvas.width = 180; canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#20221f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawContain(ctx, video, 180, 240);
    const poster = canvas.toDataURL('image/jpeg', 0.65);
    await dbOperation('readwrite', store => store.put(file, id));
    objectUrls.set(id, src);
    return {id, name:file.name, src, poster, duration:video.duration, start:0, end:Math.min(video.duration, 15), selected:true, local:true, reason:'Tu clip. Elige el fragmento que cuenta mejor tu historia.', transcript:'', locked:false};
  } catch (error) { URL.revokeObjectURL(src); throw error; }
  finally { video.removeAttribute('src'); video.load(); }
}

function drawContain(ctx, source, width, height) {
  const sw = source.videoWidth || source.naturalWidth || width;
  const sh = source.videoHeight || source.naturalHeight || height;
  const ratio = Math.min(width / sw, height / sh);
  const w = sw * ratio, h = sh * ratio;
  ctx.drawImage(source, (width-w)/2, (height-h)/2, w, h);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines=3) {
  const words = text.split(/\s+/); let line='', row=0;
  for (const word of words) {
    const candidate=line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) { ctx.fillText(line,x,y+row*lineHeight); row++; line=word; if(row>=maxLines) return; }
    else line=candidate;
  }
  if(row<maxLines) ctx.fillText(line,x,y+row*lineHeight);
}

export function supportedExportType() {
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return null;
  return ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(type => MediaRecorder.isTypeSupported(type)) || null;
}

export async function renderVideo({clips, title, format='9:16', overlays=true, onProgress=()=>{}, signal}) {
  const type = supportedExportType();
  if (!type) throw new Error('Este navegador no permite exportar video aquí. Puedes descargar el plan de edición o usar Chrome.');
  const selected = clips.filter(c => c.selected);
  const unavailable = selected.find(c => c.missing || !c.src);
  if (unavailable) throw new Error(`Falta el archivo de «${unavailable.name || 'un clip seleccionado'}». Excluye ese clip del montaje y, si quieres conservarlo, vuelve a importarlo.`);
  const chosen = selected.filter(c => c.end > c.start);
  if (!chosen.length) throw new Error('Selecciona al menos un fragmento para exportar.');
  const canvas = document.createElement('canvas');
  canvas.width = format === '16:9' ? 960 : format === '1:1' ? 640 : 540;
  canvas.height = format === '16:9' ? 540 : format === '1:1' ? 640 : 960;
  const ctx = canvas.getContext('2d');
  const canvasStream = canvas.captureStream(24);
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  await audioContext.resume();
  const audioOutput = audioContext.createMediaStreamDestination();
  const stream = new MediaStream([...canvasStream.getVideoTracks(), ...audioOutput.stream.getAudioTracks()]);
  const recorder = new MediaRecorder(stream, {mimeType:type,videoBitsPerSecond:1600000});
  const chunks=[];
  recorder.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
  const finish = new Promise((resolve,reject)=>{recorder.onstop=()=>resolve(new Blob(chunks,{type}));recorder.onerror=e=>reject(e.error || new Error('Falló la exportación.'));});
  let currentVideo, frameId, aborted=false, total=chosen.reduce((a,c)=>a+c.end-c.start,0), completed=0;
  const abort=()=>{aborted=true; currentVideo?.pause();};
  signal?.addEventListener('abort', abort, {once:true});
  if(signal?.aborted) abort();
  ctx.fillStyle='#20221f';ctx.fillRect(0,0,canvas.width,canvas.height);
  try {
    for (const clip of chosen) {
      if(aborted) throw new DOMException('Exportación cancelada','AbortError');
      const video=document.createElement('video'); currentVideo=video;
      video.crossOrigin='anonymous'; video.playsInline=true;video.preload='auto';video.src=clip.src;
      await new Promise((resolve,reject)=>{ const timer=setTimeout(()=>reject(new Error('No se pudo cargar '+clip.name)),15000); video.onloadeddata=()=>{clearTimeout(timer);resolve();};video.onerror=()=>{clearTimeout(timer);reject(new Error('No se pudo abrir '+clip.name));}; });
      if(aborted) throw new DOMException('Exportación cancelada','AbortError');
      const source=audioContext.createMediaElementSource(video);source.connect(audioOutput);
      if(clip.start>0.02) await new Promise(resolve=>{video.onseeked=()=>resolve();video.currentTime=clip.start;});
      if(aborted) throw new DOMException('Exportación cancelada','AbortError');
      const draw=()=>{
        ctx.fillStyle='#20221f';ctx.fillRect(0,0,canvas.width,canvas.height);
        drawContain(ctx,video,canvas.width,canvas.height);
        if(overlays){
          const g=ctx.createLinearGradient(0,canvas.height*.6,0,canvas.height);g.addColorStop(0,'transparent');g.addColorStop(1,'rgba(0,0,0,.68)');ctx.fillStyle=g;ctx.fillRect(0,canvas.height*.6,canvas.width,canvas.height*.4);
          ctx.fillStyle='white';ctx.font=`600 ${Math.round(canvas.width*.055)}px sans-serif`;ctx.textBaseline='top';wrapText(ctx,title,canvas.width*.065,canvas.height*.8,canvas.width*.85,canvas.width*.07,2);
          ctx.font=`500 ${Math.round(canvas.width*.022)}px sans-serif`;ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillText('VLOG STUDIO · MONTAJE DE DEMOSTRACIÓN',canvas.width*.065,canvas.height*.94);
        }
        onProgress(Math.min(.99,(completed+Math.max(0,video.currentTime-clip.start))/total));
      };
      draw();
      frameId=setInterval(draw,1000/24);
      // Loading and seeking happen outside the recorded timeline.
      if(recorder.state==='inactive') recorder.start(300);
      else if(recorder.state==='paused') recorder.resume();
      await video.play();
      await new Promise((resolve,reject)=>{
        const check=setInterval(()=>{
          if(aborted){clearInterval(check);reject(new DOMException('Exportación cancelada','AbortError'));}
          else if(video.currentTime>=Math.min(clip.end,video.duration)-.04 || video.ended){clearInterval(check);resolve();}
        },40);
      });
      video.pause();
      if(recorder.state==='recording') recorder.pause();
      clearInterval(frameId);source.disconnect();completed+=clip.end-clip.start;video.removeAttribute('src');video.load();
    }
    recorder.stop();
    const blob=await finish;onProgress(1);
    return {blob,extension:type.includes('mp4')?'mp4':'webm',duration:total};
  } finally {
    currentVideo?.pause();clearInterval(frameId);
    if(recorder.state!=='inactive') recorder.stop();
    stream.getTracks().forEach(t=>t.stop());await audioContext.close();signal?.removeEventListener('abort',abort);
  }
}

export function downloadBlob(blob, name) {
  const url=URL.createObjectURL(blob), a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
