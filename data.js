/**
 * Synthetic demo data for Vlog Studio.
 * All stories, scripts and publication records below are fictional examples.
 * No client recordings, transcripts or real publication URLs are included.
 */

const START_DATE = '2026-10-26';
const DAY_MS = 86_400_000;

const STORY_IDEAS = [
  ['La primera mañana', 'Presentar la serie y encontrar un pequeño momento que represente la llegada.'],
  ['Aprender a mirar despacio', 'Una caminata corta y tres detalles que suelen pasar desapercibidos.'],
  ['El desayuno que no esperaba', 'Contar una primera impresión y cerrar con lo que probaría otra vez.'],
  ['Un camino diferente', 'Comparar la ruta planeada con el recorrido que terminó haciendo.'],
  ['El sonido de una calle', 'Construir una pequeña historia con ambiente y pocos comentarios.'],
  ['Mi rincón para hacer una pausa', 'Mostrar un lugar tranquilo y explicar por qué volvería.'],
  ['Una semana de pequeñas sorpresas', 'Elegir un aprendizaje de la primera semana, sin resumirlo todo.'],
  ['Salir sin un plan perfecto', 'Seguir una idea sencilla y observar cómo cambia durante el día.'],
  ['Algo que ya se siente cotidiano', 'Recuperar un detalle de los primeros días y contar qué cambió.'],
  ['Una tarde siguiendo los colores', 'Unir tres escenas de una caminata con una reflexión breve.'],
  ['El desvío que valió la pena', 'Ordenar el material del trayecto y conservar el momento del descubrimiento.'],
  ['Un chai antes de perderme por la ciudad', 'Historia ficticia de muestra: salgo a caminar, paso por el mercado, me detengo por un chai y cierro el día con una reflexión.'],
  ['Una pregunta para empezar el día', 'Idea por desarrollar: elegir una pregunta y buscar su respuesta durante la jornada.'],
  ['Dos semanas, una costumbre nueva', 'Idea por desarrollar: mostrar una rutina que antes resultaba desconocida.'],
  ['El pequeño reto de hoy', 'Idea por desarrollar: intentar algo sencillo y contar el resultado real.'],
  ['Una mañana con menos prisa', 'Idea por desarrollar: registrar detalles, sonidos y una pausa.'],
  ['La historia detrás de una foto', 'Idea por desarrollar: usar una fotografía propia como punto de partida.'],
  ['Volver al mismo lugar', 'Idea por desarrollar: comparar una nueva visita con la primera impresión.'],
  ['Un detalle que casi no grabé', 'Idea por desarrollar: encontrar un momento pequeño que tenga sentido por sí solo.'],
  ['Lo que haría distinto', 'Idea por desarrollar: contar una decisión y un aprendizaje concreto.'],
  ['Tres semanas en una escena', 'Idea por desarrollar: elegir una sola escena que represente el avance de la serie.'],
  ['El plan que cambió a mitad', 'Idea por desarrollar: seguir el día real aunque sea distinto al plan inicial.'],
  ['Una conversación que me dejó pensando', 'Idea por desarrollar: contar una reflexión propia sin atribuir palabras no registradas.'],
  ['Una ruta para repetir', 'Idea por desarrollar: mostrar el recorrido y explicar qué lo hace memorable.'],
  ['Lo que ahora noto primero', 'Idea por desarrollar: contrastar los detalles que atraían la atención al inicio y ahora.'],
  ['Una tarde para observar', 'Idea por desarrollar: dejar espacio al ambiente y seleccionar una reflexión breve.'],
  ['Mi momento favorito de la semana', 'Idea por desarrollar: recuperar un momento de material propio ya revisado.'],
  ['Lo que quiero recordar', 'Idea por desarrollar: escoger un recuerdo concreto y contar por qué importa.'],
  ['Antes del último episodio', 'Idea por desarrollar: revisar qué quedó por contar y elegir un cierre posible.'],
  ['Treinta días, una historia', 'Idea por desarrollar: cerrar la serie con una reflexión basada en lo que sí ocurrió.'],
];

const SCENES = [
  {
    key: 'morning',
    name: 'Mañana · salir a explorar',
    reason: 'Presenta el comienzo del día y da contexto al recorrido.',
    transcript: 'Guion ficticio de muestra: Hoy salí a caminar sin una ruta demasiado clara. Quería encontrar una pequeña historia en el camino.',
  },
  {
    key: 'market',
    name: 'Mercado · el recorrido',
    reason: 'Aporta una escena de ambiente entre el inicio y la pausa del chai.',
    transcript: 'Guion ficticio de muestra: Pasé por el mercado y bajé el ritmo. Entre tantos colores, decidí mirar un poco antes de seguir.',
  },
  {
    key: 'chai',
    name: 'Chai · una pausa',
    reason: 'Es el momento central de esta historia de demostración.',
    transcript: 'Guion ficticio de muestra: Me detuve por un chai. No era parte del plan, pero esa pausa terminó siendo mi momento favorito del día.',
  },
  {
    key: 'evening',
    name: 'Atardecer · cerrar el día',
    reason: 'Ofrece una imagen de cierre y espacio para una reflexión breve.',
    transcript: 'Guion ficticio de muestra: Al volver, pensé que no todos los días necesitan una gran aventura. A veces basta con prestar un poco más de atención.',
  },
];

/** Calendar-only arithmetic keeps the demo independent of browser timezone. */
const addDays = (isoDate, offset) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate ?? ''));
  if (!match) return null;
  const timestamp = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const date = new Date(timestamp + offset * DAY_MS);
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : null;
};

const makeClips = (episodeId) => SCENES.map((scene) => ({
  id: `${episodeId}-${scene.key}`,
  name: scene.name,
  src: `./assets/scene-${scene.key}.mp4`,
  poster: `./assets/scene-${scene.key}.svg`,
  duration: 12,
  start: 0,
  end: 12,
  selected: true,
  reason: scene.reason,
  transcript: scene.transcript,
  synthetic: true,
  transcriptSource: 'demo-script',
}));

const makeHooks = (day, story) => {
  if (day === 12) {
    return [
      {
        type: 'Curiosidad',
        text: 'Salí a conocer la ciudad y terminé encontrando mi momento favorito en una taza de chai.',
        needsRecording: true,
      },
      {
        type: 'Momento del día',
        text: 'Me detuve por un chai. No era parte del plan, pero esa pausa terminó siendo mi momento favorito del día.',
        needsRecording: true,
      },
      {
        type: 'Reflexión',
        text: 'Día 12 en India: hoy aprendí que una buena historia también puede empezar con una pausa.',
        needsRecording: true,
      },
    ];
  }

  return [
    {
      type: 'Pregunta',
      text: `¿Qué historia puede salir de un día como hoy? Día ${day} en India.`,
      needsRecording: true,
    },
    {
      type: 'Directo',
      text: `Día ${day} en India: ${story.charAt(0).toLowerCase()}${story.slice(1)}.`,
      needsRecording: true,
    },
    {
      type: 'Personal',
      text: 'Hoy quiero quedarme con un solo momento. Esta es su historia.',
      needsRecording: true,
    },
  ];
};

/** Returns a fresh, mutable state; each call owns its arrays and objects. */
export const createSeedState = () => {
  const episodes = STORY_IDEAS.map(([story, notes], index) => {
    const day = index + 1;
    const id = `ep-${String(day).padStart(2, '0')}`;
    const experienceDate = addDays(START_DATE, index);
    const status = day <= 9 ? 'published'
      : day === 10 ? 'ready'
        : day === 11 ? 'editing'
          : day === 12 ? 'material'
            : 'planned';

    return {
      id,
      day,
      number: day,
      title: `Día ${day} · ${story}`,
      story,
      notes,
      experienceDate,
      plannedPublishDate: experienceDate,
      status,
      hookIndex: 0,
      hooks: makeHooks(day, story),
      clips: day <= 12 ? makeClips(id) : [],
      publishedAt: status === 'published' ? `${experienceDate}T18:30:00+05:30` : null,
      publicationUrl: '',
      publicationEvidence: status === 'published' ? 'demo' : null,
      synthetic: true,
    };
  });

  return {
    schemaVersion: 1,
    isDemo: true,
    synthetic: true,
    seed: 'demo',
    series: {
      name: 'India, un día a la vez',
      startDate: START_DATE,
      goalType: 'days',
      goal: 30,
      timezone: 'Asia/Kolkata',
      status: 'active',
      format: '9:16',
      targetDuration: 60,
      currentDay: 12,
    },
    episodes,
    reminders: [
      { id: 'reminder-capture', type: 'capture', time: '09:00', enabled: true, days: [1, 2, 3, 4, 5, 6, 7] },
      { id: 'reminder-edit', type: 'edit', time: '18:00', enabled: true, days: [1, 2, 3, 4, 5, 6, 7] },
      { id: 'reminder-publish', type: 'publish', time: '20:00', enabled: false, days: [1, 2, 3, 4, 5, 6, 7] },
    ],
    ideas: [
      { id: 'idea-01', text: 'Contar el día a través de tres sonidos y una reflexión.', tag: 'Narrativa', used: false },
      { id: 'idea-02', text: 'Volver a un lugar del primer episodio y observar qué cambió.', tag: 'Continuidad', used: false },
      { id: 'idea-03', text: 'Abrir con el momento del chai y después mostrar cómo llegué ahí.', tag: 'Hook', used: true },
      { id: 'idea-04', text: 'Elegir un detalle cotidiano para cerrar la semana.', tag: 'Cierre', used: false },
    ],
  };
};

/** Escapes plain text before interpolation into HTML. */
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

/** Formats rounded, nonnegative seconds as m:ss or h:mm:ss. */
export const formatDuration = (seconds) => {
  const numeric = Number(seconds);
  const total = Number.isFinite(numeric) ? Math.max(0, Math.round(numeric)) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = String(total % 60).padStart(2, '0');
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${remainder}`
    : `${minutes}:${remainder}`;
};

/** Returns the live episode object, so callers can update the shared state. */
export const getEpisode = (state, id) => (
  Array.isArray(state?.episodes) ? state.episodes.find((episode) => episode?.id === id) ?? null : null
);

/**
 * Progress is anchored to series.currentDay, not the host clock.
 * due includes today; overdue excludes today and deliberately skipped episodes.
 * Publications are counted once per episode ID, including in multi-channel UIs.
 * Percentage fields range from 0 to 100. Counts stay truthful above the goal.
 */
export const getMetrics = (state) => {
  const unique = new Map();
  for (const episode of Array.isArray(state?.episodes) ? state.episodes : []) {
    if (episode?.id && !unique.has(episode.id)) unique.set(episode.id, episode);
  }
  const episodes = [...unique.values()];
  const currentDay = Math.max(1, Math.floor(Number(state?.series?.currentDay) || 1));
  const date = addDays(state?.series?.startDate ?? START_DATE, currentDay - 1)
    ?? addDays(START_DATE, currentDay - 1);
  const counts = { published: 0, ready: 0, editing: 0, material: 0, planned: 0, skipped: 0 };
  for (const episode of episodes) {
    if (Object.hasOwn(counts, episode.status)) counts[episode.status] += 1;
  }

  const plannedDate = (episode) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(episode.plannedPublishDate ?? ''))) {
      return episode.plannedPublishDate;
    }
    return addDays(state?.series?.startDate ?? START_DATE, Math.max(0, Number(episode.day || 1) - 1));
  };
  const dueEpisodes = episodes.filter((episode) => {
    const planned = plannedDate(episode);
    return planned && planned <= date;
  });
  const publishedDue = dueEpisodes.filter((episode) => episode.status === 'published').length;
  const pending = dueEpisodes.filter((episode) => !['published', 'skipped'].includes(episode.status)).length;
  const overdue = dueEpisodes.filter((episode) => (
    plannedDate(episode) < date && !['published', 'skipped'].includes(episode.status)
  )).length;
  const goalValue = Number(state?.series?.goal);
  const goal = Number.isFinite(goalValue) && goalValue > 0 ? Math.floor(goalValue) : episodes.length;
  const percent = (part, whole) => whole > 0 ? Math.min(100, Math.max(0, Math.round(part / whole * 100))) : 0;
  const progress = percent(counts.published, goal);
  const completion = percent(publishedDue, dueEpisodes.length);

  return {
    total: episodes.length,
    ...counts,
    currentDay,
    date,
    goal,
    due: dueEpisodes.length,
    dueToday: dueEpisodes.filter((episode) => plannedDate(episode) === date).length,
    publishedDue,
    overdue,
    pending,
    remaining: Math.max(0, goal - counts.published),
    inProgress: counts.editing + counts.material,
    withMaterial: episodes.filter((episode) => Array.isArray(episode.clips) && episode.clips.length > 0).length,
    progress,
    progressPercent: progress,
    completion,
    completionRate: completion,
  };
};
