import { escapeHtml as e, formatDuration } from './data.js';
const paths = {
 home:'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
 film:'M4 3h16v18H4zM4 8h16M4 16h16M8 3v18M16 3v18',
 calendar:'M4 5h16v16H4zM8 3v4M16 3v4M4 10h16M8 14h1M12 14h1M16 14h1M8 18h1M12 18h1',
 sparkles:'m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3zM20 2v4M18 4h4',
 chart:'M4 20V10M10 20V4M16 20v-7M22 20H2',
 settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
 bell:'M6 9a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9M9 21h6',
 arrow:'M4 12h16M14 6l6 6-6 6',
 plus:'M12 5v14M5 12h14',
 check:'m5 12 4 4L19 6',
 clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2',
 upload:'M12 16V3M7 8l5-5 5 5M4 15v6h16v-6',
 download:'M12 3v13M7 11l5 5 5-5M4 16v5h16v-5',
 x:'m6 6 12 12M18 6 6 18',
 search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6',
 edit:'m16 3 5 5-12 12-6 1 1-6zM13 6l5 5',
 trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
 left:'m15 6-6 6 6 6',
 right:'m9 6 6 6-6 6',
 play:'m8 4 12 8-12 8z',
 pause:'M8 5v14M16 5v14',
 volume:'m3 9 5 0 5-5v16l-5-5H3zM17 8a6 6 0 0 1 0 8',
 refresh:'M20 7v5h-5M4 17v-5h5M5 8a8 8 0 0 1 13-3l2 3M4 16l2 3a8 8 0 0 0 13-3',
 undo:'M8 4 3 9l5 5M3 9h10a7 7 0 0 1 0 14',
 lock:'M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4',
 heart:'M20 5c-3-3-7-1-8 2-1-3-5-5-8-2s-1 7 8 15C21 12 23 8 20 5z',
 up:'m6 15 6-6 6 6',
 down:'m6 9 6 6 6-6',
 bulb:'M8 16c0-3-3-3-3-7a7 7 0 0 1 14 0c0 4-3 4-3 7zM9 20h6M10 23h4',
 external:'M14 3h7v7M21 3l-11 11M10 3H3v18h18v-7',
 info:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 11v6M12 7h.01',
 moon:'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11',
 pin:'M12 22S4 14 4 9a8 8 0 0 1 16 0c0 5-8 13-8 13M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
 grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
 eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
 folder:'M3 5h7l2 3h9v13H3z',
 more:'M5 12h.01M12 12h.01M19 12h.01',
 coffee:'M4 8h12v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3zM16 9h3a3 3 0 0 1 0 6h-3M7 3v2M11 2v3',
 scissors:'M5 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6M5 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6M8 7l13 13M8 17 21 4',
 logout:'M9 3H3v18h6M13 7l5 5-5 5M8 12h13'
};
export const icon = (name, cls='') => `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.sparkles}"/></svg>`;
export const statusNames={published:'Publicado',ready:'Listo para publicar',editing:'En edición',material:'Con material',planned:'Por grabar',skipped:'Omitido'};
export const badge=status=>`<span class="status-badge ${e(status)}"><span></span>${statusNames[status] || e(status)}</span>`;
export const btn=(text,action,kind='secondary',ico='',extra='')=>`<button type="button" class="btn ${kind}" data-action="${action}" ${extra}>${ico?icon(ico):''}<span>${text}</span></button>`;
export function dateLabel(date,options={day:'numeric',month:'short'}) { if(!date)return 'Sin fecha'; return new Intl.DateTimeFormat('es-MX',{...options,timeZone:'UTC'}).format(new Date(date.slice(0,10)+'T12:00:00Z')); }
export function isoAdd(date,days){const value=new Date(date+'T12:00:00Z');value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10);}
export const selectedDuration=ep=>(ep.clips||[]).filter(c=>c.selected&&!c.missing).reduce((sum,c)=>sum+Math.max(0,c.end-c.start),0);
export function episodeRow(ep){return `<button class="episode-row" data-action="open-episode" data-id="${e(ep.id)}"><img class="episode-thumb" src="${e(ep.clips?.[0]?.poster || './assets/scene-morning.svg')}" alt="" loading="lazy"><div class="episode-info"><span class="episode-day">DÍA ${ep.day} <span>· ${dateLabel(ep.experienceDate)}</span></span><strong class="episode-title">${e(ep.title)}</strong><span class="episode-meta">${ep.clips?.length||0} clips <span>·</span> ${formatDuration(selectedDuration(ep))} de montaje</span></div>${badge(ep.status)}${icon('right')}</button>`;}
export function pageHeader(eyebrow,title,subtitle,actions=''){return `<div class="page-header"><div><div class="eyebrow">${eyebrow}</div><h1 class="page-title">${title}</h1><p class="page-subtitle">${subtitle}</p></div>${actions?`<div class="header-actions">${actions}</div>`:''}</div>`;}
