import { escapeHtml as e, formatDuration, getMetrics } from './data.js';
import { icon, badge, btn, dateLabel, isoAdd, selectedDuration, episodeRow, pageHeader } from './ui.js';

// These views only return markup. Storage, navigation, and actions belong to app.js.
const DAY_MS = 86_400_000;
const DEFAULT_DATE = '2026-11-06';
const STATUS_NAMES = { published: 'Publicado', ready: 'Listo', editing: 'En edición', material: 'Con material', planned: 'Por grabar', skipped: 'Omitido' };
const asList = value => Array.isArray(value) ? value : [];
const integer = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.floor(Number(value)) : fallback;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const episodeList = state => [...new Map(asList(state?.episodes).filter(ep => ep && ep.id).map(ep => [ep.id, ep])).values()];
const isoDate = value => {
  const text = String(value ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return '';
  const parsed = new Date(`${text}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === text ? text : '';
};
const friendlyDate = (value, options = { day: 'numeric', month: 'short' }) => isoDate(value) ? dateLabel(isoDate(value), options) : 'Sin fecha';
const dayGap = (from, to) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / DAY_MS);
const dataId = id => `data-id="${e(id)}"`;
const empty = (title, text, symbol = 'folder') => `<div class="empty-state">${icon(symbol)}<h3>${e(title)}</h3><p>${e(text)}</p></div>`;
const field = (label, id, control, help = '') => `<div class="form-field"><label for="${e(id)}">${e(label)}</label>${control}${help ? `<span class="field-help">${e(help)}</span>` : ''}</div>`;
const stat = (label, value, foot, symbol) => `<article class="stat-card"><div class="stat-label"><span>${e(label)}</span>${icon(symbol)}</div><div class="stat-value">${e(value)}</div><div class="stat-foot">${e(foot)}</div></article>`;

function calendarDetail(episode) {
  if (!episode) return `<aside class="card">${empty('Elige un episodio', 'Selecciona un día de la serie para ver su historia, material y publicación.', 'calendar')}</aside>`;
  const published = episode.status === 'published';
  const publication = published
    ? friendlyDate(episode.publishedAt, { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Todavía no registrada';
  const evidence = episode.publicationEvidence === 'demo' ? 'Registro de demostración' : published ? 'Publicación registrada por ti' : 'Se completa al registrar la publicación';
  const clips = asList(episode.clips);
  const duration = formatDuration(selectedDuration({ clips }));
  return `<aside>
    <section class="card">
      <div class="card-heading"><div><div class="eyebrow">DÍA ${e(integer(episode.day, 1))}</div><h2 style="font:400 25px/1.25 var(--serif);margin-top:7px">${e(episode.story || episode.title || 'Una historia por contar')}</h2></div></div>
      <div class="card-body">
        ${badge(episode.status || 'planned')}
        <dl style="display:grid;gap:17px;margin:22px 0;font-size:12px">
          <div><dt style="color:var(--muted);margin-bottom:3px">Día de la experiencia</dt><dd style="margin:0;font-weight:600">${e(friendlyDate(episode.experienceDate, { day: 'numeric', month: 'long', year: 'numeric' }))}</dd></div>
          <div><dt style="color:var(--muted);margin-bottom:3px">Publicación prevista</dt><dd style="margin:0;font-weight:600">${e(friendlyDate(episode.plannedPublishDate, { day: 'numeric', month: 'long' }))}</dd></div>
          <div><dt style="color:var(--muted);margin-bottom:3px">Publicación registrada</dt><dd style="margin:0;font-weight:600">${e(publication)}</dd><dd class="field-help" style="margin-left:0">${e(evidence)}</dd></div>
          <div><dt style="color:var(--muted);margin-bottom:3px">Material del episodio</dt><dd style="margin:0">${e(clips.length)} clips · ${e(duration)} de montaje seleccionado</dd></div>
        </dl>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${btn('Abrir episodio', 'open-episode', 'primary', 'arrow', dataId(episode.id))}
          ${btn('Editar datos', 'edit-episode', 'secondary small', 'edit', dataId(episode.id))}
          ${btn(published ? 'Publicación registrada' : 'Registrar publicación', 'publish-episode', 'ghost small', 'check', `${dataId(episode.id)} ${published ? 'disabled' : ''}`)}
        </div>
      </div>
    </section>
    <div class="notice">${icon('info')}<p>El día que cuentas conserva su lugar en la serie, aunque publiques el video después.</p></div>
  </aside>`;
}

export function calendarView(state, monthOffset = 0, selectedId = '') {
  const metrics = getMetrics(state);
  const currentDate = isoDate(metrics.date) || DEFAULT_DATE;
  const current = new Date(`${currentDate}T12:00:00Z`);
  const offset = clamp(integer(monthOffset), -120, 120);
  const first = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + offset, 1, 12));
  const firstISO = first.toISOString().slice(0, 10);
  const month = first.getUTCMonth();
  const monthName = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first);
  const start = isoAdd(firstISO, -((first.getUTCDay() + 6) % 7));
  const episodes = episodeList(state);
  const byDate = new Map();
  for (const episode of episodes) {
    const date = isoDate(episode.experienceDate);
    if (!date) continue;
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push(episode);
  }
  const selected = episodes.find(ep => ep.id === selectedId)
    || (offset === 0 ? byDate.get(currentDate)?.[0] : null)
    || episodes.find(ep => isoDate(ep.experienceDate).slice(0, 7) === firstISO.slice(0, 7));
  const weekdayLabels = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = isoAdd(start, index);
    const value = new Date(`${date}T12:00:00Z`);
    const entries = byDate.get(date) || [];
    const isToday = date === currentDate;
    const isSelected = entries.some(ep => ep.id === selected?.id);
    const classes = `calendar-cell${value.getUTCMonth() !== month ? ' muted' : ''}${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`;
    const dateText = `<span class="calendar-day-number">${e(value.getUTCDate())}</span>${isToday ? '<span style="font-size:8px;color:var(--accent);margin-left:3px">HOY</span>' : ''}`;
    const event = (ep, isButton) => {
      const tag = isButton ? 'button' : 'span';
      const attrs = isButton ? `type="button" data-action="calendar-day" ${dataId(ep.id)} aria-pressed="${ep.id === selected?.id}"` : '';
      return `<${tag} class="calendar-event ${e(ep.status || 'planned')}" ${attrs} title="${e(ep.title || ep.story || '')}"><span class="calendar-dot ${e(ep.status || 'planned')}"></span>Día ${e(integer(ep.day, 1))} · ${e(STATUS_NAMES[ep.status] || 'Por revisar')}</${tag}>`;
    };
    if (entries.length === 1) return `<button type="button" class="${classes}" data-action="calendar-day" ${dataId(entries[0].id)} aria-pressed="${isSelected}" ${isToday ? 'aria-current="date"' : ''} aria-label="${e(`${friendlyDate(date, { day: 'numeric', month: 'long' })}. Día ${integer(entries[0].day, 1)}. ${STATUS_NAMES[entries[0].status] || 'Por revisar'}`)}">${dateText}${event(entries[0], false)}</button>`;
    return `<div class="${classes}" ${isToday ? 'aria-current="date"' : ''}>${dateText}${entries.map(ep => event(ep, true)).join('')}</div>`;
  }).join('');
  return `${pageHeader('TU SERIE, DÍA A DÍA', 'Una historia que continúa.', 'Cada día tiene su lugar. Revisa el material, retoma un episodio y conserva el orden de tu serie.')}
    <div class="two-column">
      <section class="card"><div class="card-body">
        <div class="calendar-toolbar"><h2 style="text-transform:capitalize">${e(monthName)}</h2><div>
          <button type="button" class="icon-btn" data-action="calendar-month" data-delta="-1" aria-label="Mes anterior">${icon('left')}</button>
          <button type="button" class="icon-btn" data-action="calendar-month" data-delta="1" aria-label="Mes siguiente">${icon('right')}</button>
        </div></div>
        <div class="calendar-grid" aria-label="${e(`Calendario de experiencias de ${monthName}`)}">${weekdayLabels.map(day => `<div class="calendar-weekday">${e(day)}</div>`).join('')}${cells}</div>
        <div class="legend"><span><i class="calendar-dot"></i>Publicado</span><span><i class="calendar-dot ready"></i>Listo</span><span><i class="calendar-dot editing"></i>En edición</span><span><i class="calendar-dot planned"></i>Por grabar</span></div>
        <p class="field-help" style="margin-top:14px">Día actual de la demo: ${e(friendlyDate(currentDate, { day: 'numeric', month: 'long', year: 'numeric' }))}. Los episodios se ubican según el día de la experiencia.</p>
      </div></section>
      ${calendarDetail(selected)}
    </div>`;
}

export function progressView(state) {
  const metrics = getMetrics(state);
  const episodes = episodeList(state);
  const series = state?.series || {};
  const start = isoDate(series.startDate) || '2026-10-26';
  const current = isoDate(metrics.date) || DEFAULT_DATE;
  const plannedDates = episodes.map(ep => isoDate(ep.plannedPublishDate)).filter(Boolean);
  const publicationDates = episodes.filter(ep => ep.status === 'published').map(ep => isoDate(ep.publishedAt)).filter(Boolean);
  const endCandidates = [isoAdd(start, Math.max(0, metrics.goal - 1)), isoDate(series.endDate), ...plannedDates, ...publicationDates].filter(Boolean).sort();
  const end = endCandidates[endCandidates.length - 1] || start;
  const weeks = clamp(Math.ceil((dayGap(start, end) + 1) / 7), 1, 18);
  const weekly = Array.from({ length: weeks }, (_, index) => {
    const from = isoAdd(start, index * 7);
    const until = isoAdd(from, 6);
    return {
      from, until,
      published: publicationDates.filter(date => date >= from && date <= until).length,
      planned: plannedDates.filter(date => date >= from && date <= until).length,
      active: current >= from && current <= until,
    };
  });
  const maxValue = Math.max(1, ...weekly.map(week => Math.max(week.published, week.planned)));
  const chartDescription = weekly.map((week, index) => `Semana ${index + 1}: ${week.published} publicaciones registradas y ${week.planned} previstas`).join('. ');
  const withoutDate = episodes.filter(ep => ep.status === 'published' && !isoDate(ep.publishedAt)).length;
  const pending = episodes.filter(ep => !['published', 'skipped'].includes(ep.status) && isoDate(ep.plannedPublishDate) && ep.plannedPublishDate.slice(0, 10) <= current).sort((a, b) => String(a.plannedPublishDate).localeCompare(String(b.plannedPublishDate))).slice(0, 3);
  const pipeline = [['material', 'Con material'], ['editing', 'En edición'], ['ready', 'Listos'], ['published', 'Publicados'], ['planned', 'Por grabar'], ['skipped', 'Omitidos']];
  const goalText = series.goalType === 'date' ? `Cierre previsto: ${friendlyDate(series.endDate || end)}` : `Objetivo: ${metrics.goal} ${series.goalType === 'episodes' ? 'episodios' : 'días de serie'}`;
  return `${pageHeader('PROGRESO DE LA SERIE', 'Cada episodio cuenta.', 'Observa lo que ya terminaste y encuentra el siguiente paso para seguir contando tu historia.')}
    <div class="stats-grid">
      ${stat('Episodios publicados', `${metrics.published} / ${metrics.goal}`, `${metrics.progress}% del objetivo de la serie`, 'check')}
      ${stat('Cumplimiento hasta hoy', `${metrics.completion}%`, `${metrics.publishedDue} de ${metrics.due} episodios previstos hasta hoy`, 'calendar')}
      ${stat('En preparación', metrics.inProgress, 'Episodios con material o en edición', 'scissors')}
      ${stat('Por retomar', metrics.overdue, 'Pendientes con fecha anterior al día actual', 'clock')}
    </div>
    <div class="two-column">
      <section class="card">
        <div class="card-heading"><div><h2>Publicaciones por semana</h2><p>Publicadas / previstas · semanas de tu serie</p></div>${icon('chart')}</div>
        <div class="card-body"><div style="overflow-x:auto"><div class="bar-chart" role="img" aria-label="${e(chartDescription)}" style="min-width:${e(Math.max(280, weeks * 49))}px">
          ${weekly.map((week, index) => `<div class="bar-column${week.active ? ' active' : ''}" title="${e(`${friendlyDate(week.from)} a ${friendlyDate(week.until)}: ${week.published} publicadas de ${week.planned} previstas`)}"><strong>${e(week.published)} / ${e(week.planned)}</strong><div class="bar-fill" style="--bar-height:${e(Math.round(week.published / maxValue * 76))}%"></div><span class="bar-label">Sem. ${e(index + 1)}</span></div>`).join('')}
        </div></div>
        <p class="field-help" style="margin-top:18px">Las barras usan la fecha de publicación registrada, aunque el episodio cuente un día anterior. ${withoutDate ? `${e(withoutDate)} publicaciones sin fecha no aparecen en las barras.` : 'Las semanas futuras conservan el plan sin sumar publicaciones.'}</p>
        </div>
      </section>
      <section class="card"><div class="card-heading"><div><h2>El camino hasta tu meta</h2><p>${e(goalText)}</p></div>${icon('pin')}</div><div class="card-body">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:12px"><strong>${e(metrics.published)} publicados</strong><span style="color:var(--muted)">${e(metrics.remaining)} por completar</span></div>
        <div class="progress-track" role="progressbar" aria-label="Progreso de publicaciones" aria-valuemin="0" aria-valuemax="${e(metrics.goal)}" aria-valuenow="${e(Math.min(metrics.published, metrics.goal))}"><div class="progress-fill" style="width:${e(metrics.progress)}%"></div></div>
        <div style="display:grid;gap:13px;margin-top:23px">${pipeline.map(([status, label]) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">${badge(status)}<strong aria-label="${e(label)}">${e(metrics[status] || 0)}</strong></div>`).join('')}</div>
      </div></section>
    </div>
    <section class="card" style="margin-top:22px"><div class="card-heading"><div><h2>Un siguiente paso concreto</h2><p>Retoma primero una historia que ya empezaste.</p></div>${icon('arrow')}</div>
      ${pending.length ? pending.map(ep => episodeRow({ ...ep, day: integer(ep.day, 1), experienceDate: isoDate(ep.experienceDate) || current })).join('') : empty('Todo al día', 'No hay episodios pendientes hasta el día actual de la serie.', 'check')}
    </section>
    <p class="field-help" style="margin-top:16px">Los registros precargados son de demostración. El progreso se calcula con los estados guardados; no representa estadísticas de una red social ni tiempo ahorrado.</p>`;
}

export function ideasView(state) {
  const ideas = asList(state?.ideas).filter(idea => idea && idea.id);
  const used = ideas.filter(idea => idea.used).length;
  return `${pageHeader('BANCO DE IDEAS', 'Lo pequeño también es una historia.', 'Guarda un momento, una pregunta o un posible inicio. Vuelve cuando necesites un punto de partida.', btn('Plantillas de ejemplo', 'demo-ideas', 'secondary', 'sparkles'))}
    <section class="card" style="margin-bottom:25px"><div class="card-body"><form id="idea-form">
      ${field('¿Qué te gustaría contar?', 'idea-text', '<textarea id="idea-text" name="text" class="textarea" rows="3" maxlength="500" required placeholder="Una escena del camino, algo que aprendí, una pregunta que quiero responder…"></textarea>')}
      <div style="display:flex;align-items:flex-end;flex-wrap:wrap;gap:14px">
        <div class="form-field" style="flex:1;min-width:180px;margin:0"><label for="idea-tag">Tipo de idea</label><select id="idea-tag" name="tag" class="select">${['Narrativa', 'Hook', 'Continuidad', 'Escena', 'Cierre'].map(tag => `<option value="${e(tag)}">${e(tag)}</option>`).join('')}</select></div>
        <button type="submit" class="btn primary">${icon('plus')}<span>Guardar idea</span></button>
      </div>
    </form></div></section>
    <div class="section-heading"><h2>Tus próximas historias</h2><span>${e(ideas.length - used)} disponibles · ${e(used)} usadas</span></div>
    ${ideas.length ? `<div class="idea-grid">${ideas.map(idea => `<article class="idea-card">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:9px;width:100%"><span class="tag">${e(idea.tag || 'Idea')}</span>${idea.used ? `<span class="tag">${icon('check')}Usada</span>` : icon('bulb')}</div>
      <h3>${e(idea.text || 'Una idea por desarrollar')}</h3>
      <p>${idea.used ? 'Puedes retomarla con otro enfoque y darle una nueva historia.' : 'Un punto de partida que puedes adaptar a lo que realmente ocurra.'}</p>
      <div style="display:flex;justify-content:space-between;gap:8px;width:100%;margin-top:auto">
        ${btn(idea.used ? 'Volver a usar' : 'Usar idea', 'use-idea', 'secondary small', 'arrow', dataId(idea.id))}
        <button type="button" class="icon-btn" data-action="delete-idea" ${dataId(idea.id)} aria-label="${e(`Eliminar idea: ${idea.text || 'sin título'}`)}">${icon('trash')}</button>
      </div>
    </article>`).join('')}</div>` : `<section class="card">${empty('Aquí empieza tu siguiente historia', 'Guarda tu primera idea arriba o explora las plantillas de ejemplo.', 'bulb')}</section>`}
    <div class="notice">${icon('sparkles')}<p>Las plantillas son sugerencias de demostración. Revisa y adapta cada idea a tu experiencia antes de convertirla en un episodio.</p></div>`;
}

export function remindersView(state) {
  const reminders = asList(state?.reminders).filter(reminder => reminder && reminder.id);
  const labels = {
    capture: ['Un momento para grabar', 'Captura una escena o anota qué quieres recordar del día.', 'film'],
    edit: ['Un espacio para editar', 'Retoma tu material y termina un paso del montaje.', 'scissors'],
    publish: ['Revisar y publicar', 'Comprueba el video terminado y registra su publicación.', 'check'],
  };
  const dayNames = { 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom' };
  return `${pageHeader('RECORDATORIOS', 'Hazle un espacio a tu historia.', 'Elige horarios que encajen con tu día. Puedes ajustar el ritmo cuando lo necesites.')}
    <div class="two-column"><section class="card"><div class="card-heading"><div><h2>Tu rutina de creación</h2><p>Zona horaria de la serie: ${e(state?.series?.timezone || 'Asia/Kolkata')}</p></div>${icon('bell')}</div><div class="card-body">
      ${reminders.length ? reminders.map(reminder => {
        const [title, description, symbol] = labels[reminder.type] || ['Un momento para tu serie', 'Reserva un espacio para seguir avanzando.', 'bell'];
        const days = [...new Set(asList(reminder.days).map(day => integer(day)).filter(day => day >= 1 && day <= 7))].sort((a, b) => a - b);
        const dayText = days.length === 7 ? 'Todos los días' : days.length ? days.map(day => dayNames[day]).join(' · ') : 'Sin días configurados';
        const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(String(reminder.time)) ? reminder.time : '09:00';
        return `<div class="reminder-row" style="flex-wrap:wrap"><div style="display:flex;align-items:flex-start;gap:12px;flex:1;min-width:180px">${icon(symbol)}<div><strong>${e(title)}</strong><p>${e(description)}</p><small>${e(dayText)}</small></div></div>
          <div style="display:flex;align-items:center;gap:13px"><input type="time" class="input" style="width:112px" value="${e(time)}" data-save="reminder-time" ${dataId(reminder.id)} aria-label="${e(`Hora de ${title.toLowerCase()}`)}"><label class="switch"><input type="checkbox" data-change="reminder-enabled" ${dataId(reminder.id)} ${reminder.enabled ? 'checked' : ''} aria-label="${e(`Activar ${title.toLowerCase()}`)}"></label></div>
          <div style="width:100%;padding-left:32px">${btn('Probar aviso', 'test-reminder', 'ghost small', 'bell', dataId(reminder.id))}</div>
        </div>`;
      }).join('') : empty('Elige un ritmo para tu serie', 'No hay recordatorios configurados en este espacio.', 'bell')}
    </div></section>
    <aside><section class="hint-card">${icon('coffee')}<div class="eyebrow">UN PASO A LA VEZ</div><h2>Una rutina que puedas sostener.</h2><p>Reserva un momento pequeño para grabar y otro para terminar. Si un día cambia, retoma la historia desde donde la dejaste.</p></section>
      <div class="notice">${icon('info')}<p>Esta configuración se guarda en este navegador. «Probar aviso» muestra un ejemplo dentro de la app; no programa notificaciones cuando está cerrada.</p></div>
    </aside></div>`;
}

export function settingsView(state) {
  const series = state?.series || {};
  const start = isoDate(series.startDate) || '2026-10-26';
  const goal = clamp(integer(series.goal, 30), 1, 120);
  const end = isoDate(series.endDate) || isoAdd(start, goal - 1);
  const goalType = ['days', 'episodes', 'date'].includes(series.goalType) ? series.goalType : 'days';
  const timezone = String(series.timezone || 'Asia/Kolkata');
  const zones = [...new Set([timezone, 'Asia/Kolkata', 'America/Mexico_City', 'Asia/Dubai', 'Europe/Madrid', 'UTC'])];
  const paused = series.status === 'paused';
  const closed = series.status === 'closed';
  const seriesStatus = closed ? 'Cerrada' : paused ? 'En pausa' : 'En curso';
  return `${pageHeader('AJUSTES DE TU SERIE', 'Dale forma a tu proyecto.', 'Define tu objetivo, el formato y el ritmo. Conserva tus avances mientras ajustas el plan.')}
    <div class="settings-grid">
      <section class="card"><div class="card-heading"><div><h2>La serie</h2><p>Un objetivo claro, con espacio para adaptarte.</p></div><span class="tag">${e(seriesStatus)}</span></div><div class="card-body">
        <form id="series-form">
          ${field('Nombre de la serie', 'series-name', `<input id="series-name" name="name" class="input" value="${e(series.name || '')}" maxlength="100" required placeholder="Mi próxima historia">`)}
          ${field('Fecha de inicio', 'series-start', `<input id="series-start" name="startDate" class="input" type="date" value="${e(start)}" required>`)}
          ${field('Cómo quieres definir la meta', 'series-goal-type', `<select id="series-goal-type" name="goalType" class="select">${[['days', 'Un número de días'], ['episodes', 'Un número de episodios'], ['date', 'Una fecha de cierre']].map(([value, label]) => `<option value="${e(value)}" ${value === goalType ? 'selected' : ''}>${e(label)}</option>`).join('')}</select>`)}
          <div class="settings-grid" style="gap:14px">
            ${field('Meta de días o episodios', 'series-goal', `<input id="series-goal" name="goal" class="input" type="number" min="1" max="120" step="1" value="${e(goal)}" required>`, 'Entre 1 y 120, según el tipo de meta.')}
            ${field('Fecha de cierre', 'series-end', `<input id="series-end" name="endDate" class="input" type="date" min="${e(start)}" value="${e(end)}">`, 'Se utiliza cuando eliges una fecha de cierre.')}
          </div>
          ${field('Zona horaria', 'series-timezone', `<select id="series-timezone" name="timezone" class="select">${zones.map(zone => `<option value="${e(zone)}" ${zone === timezone ? 'selected' : ''}>${e(zone)}</option>`).join('')}</select>`)}
          <div class="settings-grid" style="gap:14px">
            ${field('Formato del video', 'series-format', `<select id="series-format" name="format" class="select">${[['9:16', 'Vertical · 9:16'], ['16:9', 'Horizontal · 16:9'], ['1:1', 'Cuadrado · 1:1']].map(([value, label]) => `<option value="${e(value)}" ${value === (series.format || '9:16') ? 'selected' : ''}>${e(label)}</option>`).join('')}</select>`)}
            ${field('Duración orientativa en segundos', 'series-duration', `<input id="series-duration" name="targetDuration" class="input" type="number" min="1" max="3600" step="1" value="${e(clamp(integer(series.targetDuration, 60), 1, 3600))}" required>`, 'Una referencia para editar; no un límite automático.')}
          </div>
          ${field('Día actual de la demostración', 'series-current-day', `<input id="series-current-day" name="currentDay" class="input" type="number" min="1" max="120" step="1" value="${e(clamp(integer(series.currentDay, 12), 1, 120))}">`, 'Permite explorar el calendario y los pendientes en otro día de la serie.')}
          <button type="submit" class="btn primary">${icon('check')}<span>Guardar ajustes</span></button>
        </form>
      </div></section>
      <div>
        <section class="card"><div class="card-heading"><div><h2>El ritmo del proyecto</h2><p>Puedes hacer una pausa y conservar lo que llevas.</p></div>${icon('clock')}</div><div class="card-body"><p>${closed ? 'La serie está cerrada. Tus episodios siguen disponibles para consulta.' : paused ? 'La serie está en pausa. Puedes reanudarla cuando quieras continuar.' : 'Tu serie está en curso. Una pausa conserva el material y el progreso.'}</p>
          <div style="display:flex;flex-wrap:wrap;gap:9px;margin-top:18px">${btn(paused ? 'Reanudar serie' : 'Pausar serie', 'series-pause', 'secondary', paused ? 'play' : 'pause', closed ? 'disabled' : '')}${btn(closed ? 'Serie cerrada' : 'Cerrar serie', 'series-close', 'ghost', 'check', closed ? 'disabled' : '')}</div>
        </div></section>
        <section class="card"><div class="card-heading"><div><h2>Tu espacio de trabajo</h2><p>Conserva una copia de tus avances.</p></div>${icon('folder')}</div><div class="card-body"><p>Los cambios se guardan en este navegador. Exporta un respaldo antes de cambiar de dispositivo o reiniciar la demostración.</p>
          <div style="display:flex;flex-wrap:wrap;gap:9px;margin-top:18px">${btn('Exportar respaldo', 'export-data', 'secondary small', 'download')}${btn('Importar respaldo', 'import-data', 'secondary small', 'upload')}</div>
          <p class="field-help" style="margin-top:13px">El respaldo guarda la organización y los ajustes. Conserva también tus archivos de video originales.</p>
          <div style="margin-top:20px;padding-top:18px;border-top:1px solid var(--line)">${btn('Reiniciar demostración', 'reset-demo', 'danger small', 'refresh')}</div>
        </div></section>
        <section class="card"><div class="card-heading"><div><h2>Sobre esta demostración</h2><p>Un espacio para probar el flujo completo.</p></div>${icon('info')}</div><div class="card-body"><p>Las escenas, los guiones y los registros precargados son ejemplos sintéticos. Las sugerencias muestran plantillas de muestra; no hay una generación con IA conectada.</p><div style="margin-top:17px">${btn('Ver qué puedes probar', 'about', 'ghost small', 'arrow')}</div></div></section>
      </div>
    </div>`;
}
