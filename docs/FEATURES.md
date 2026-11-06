# Funciones y cobertura de Vlog Studio

Esta matriz conserva **39 identificadores funcionales** para revisar la demo. Distingue operaciones locales, recorridos parciales, plantillas ilustrativas y capacidades que requieren una ampliación. La existencia de una pantalla no implica que haya análisis automático o una integración externa detrás de ella.

## Cómo leer la cobertura

- **Local:** operación que se realiza con el estado o los archivos del navegador.
- **Parcial:** el recorrido está representado, con un alcance menor que el requisito completo.
- **Plantilla:** texto o regla de demostración; no es el resultado de un modelo de IA.
- **Pendiente:** capacidad que esta demo no implementa.

La revisión final del comportamiento debe hacerse con la versión del código y el navegador utilizados. Esta tabla no constituye una certificación de compatibilidad con todos los dispositivos.

## 1. Serie y episodios — 6 requisitos

| ID | Requisito | Cobertura de la demo |
| --- | --- | --- |
| S01 | Crear o configurar una serie | **Local.** Una serie activa con nombre, inicio, meta y preferencias. El estado inicial es ficticio. |
| S02 | Definir el objetivo | **Parcial.** La demo presenta una meta de días y duración objetivo. La resolución completa de conflictos entre fechas, cantidades y distintos tipos de meta requiere ampliar las reglas. |
| S03 | Separar día, episodio y fechas | **Local.** El modelo distingue `day`, `number`, `experienceDate`, `plannedPublishDate` y `publishedAt`. No usa el total de publicaciones para renumerar días. |
| S04 | Mantener la ficha del episodio | **Local.** Historia, notas, estado, hooks, clips y decisiones de edición permanecen asociados a un ID estable. |
| S05 | Reprogramar, pausar, omitir o cerrar | **Parcial.** El calendario permite gestionar el trabajo local. Un historial auditable completo y un programador externo quedan fuera de este prototipo. |
| S06 | Incorporar publicaciones anteriores | **Parcial.** Hay registros ficticios precargados y gestión manual del estado; no se importan automáticamente publicaciones desde redes sociales. |

## 2. Hook y narrativa — 5 requisitos

| ID | Requisito | Cobertura de la demo |
| --- | --- | --- |
| N01 | Ofrecer opciones de hook | **Plantilla.** Opciones editables para explorar el recorrido. No son recomendaciones de un modelo que haya analizado el video. |
| N02 | Dar una guía flexible | **Plantilla.** Apoyo textual para ordenar la historia; el usuario mantiene el control sobre sus notas y su redacción. |
| N03 | Mantener hechos y estilo | **Parcial.** Los ejemplos están identificados como ficticios y el usuario revisa el texto. No hay verificación semántica automática de hechos o estilo. |
| N04 | Recuperar continuidad narrativa | **Pendiente.** No existe un modelo que relacione promesas, acontecimientos o temas entre videos. El historial se consulta como datos de episodios. |
| N05 | Sugerir tomas faltantes | **Pendiente.** Las ideas de muestra no constituyen una detección automática de material que falta grabar. |

## 3. Material — 5 requisitos

| ID | Requisito | Cobertura de la demo |
| --- | --- | --- |
| M01 | Importar y reproducir clips | **Local.** Selección de archivos, almacenamiento en IndexedDB y reproducción en el navegador. Los originales del dispositivo no se modifican. |
| M02 | Comprobar archivos | **Parcial.** Se comprueba el tipo, el límite de 250 MB por clip y la posibilidad de leer su duración y reproducirlo. No hay una matriz certificada de códecs y dispositivos. |
| M03 | Transcribir con tiempos | **Pendiente.** Los textos precargados son guiones ficticios sin alineación de audio. Los clips importados no reciben transcripciones automáticas. |
| M04 | Resumir y seleccionar momentos | **Plantilla.** Motivos y sugerencias de ejemplo acompañan a la selección manual. No se comprende automáticamente la historia de un video propio. |
| M05 | Conservar escenas sin diálogo | **Local.** Un clip puede seleccionarse y montarse sin tener texto o voz. Los medios de muestra son silenciosos. |

## 4. Montaje y salida — 7 requisitos

| ID | Requisito | Cobertura de la demo |
| --- | --- | --- |
| E01 | Proponer cortes revisables | **Plantilla.** Las sugerencias ilustran el flujo. Los puntos de corte se revisan y ajustan manualmente; no hay detección semántica de pausas o momentos destacados. |
| E02 | Montar fragmentos | **Local.** Selección, puntos de entrada y salida y reordenación de clips. La exportación utiliza los fragmentos elegidos. |
| E03 | Controlar la duración | **Local.** La suma de los intervalos permite comparar el montaje con el objetivo. No se inventa material para completar una duración. |
| E04 | Previsualizar y recuperar decisiones | **Parcial.** Se puede revisar el material y modificar los cortes. Un historial completo de versiones con deshacer profesional requiere ampliar el editor. |
| E05 | Exportar un video | **Local.** Exportación real mediante `canvas` y `MediaRecorder`, en WebM o MP4 según compatibilidad. Es un render de demostración en el navegador. |
| E06 | Añadir título y subtítulos | **Parcial.** El motor puede dibujar un título sobre el montaje. No genera subtítulos sincronizados a partir de voz ni añade locución automáticamente. |
| E07 | Conservar preferencias | **Parcial.** Las preferencias y decisiones disponibles se guardan localmente. No existe aprendizaje automático del estilo personal. |

### Perfil audiovisual

El perfil vertical es **540 × 960**. El motor también contempla 960 × 540 y 640 × 640. La captura del canvas se configura a 24 fotogramas por segundo; el resultado depende del navegador, su decodificación y los recursos del dispositivo.

Esta salida sirve para evaluar el recorrido y el montaje básico. No representa un exportador de producción a 1080p ni una promesa de edición exacta a nivel de fotograma.

Los cuatro MP4 de ejemplo no tienen audio. Los guiones ficticios visibles no se convierten en voz. Al probar un video propio con sonido, la calidad y sincronía del resultado deben comprobarse reproduciendo el archivo exportado.

## 5. Constancia — 5 requisitos

| ID | Requisito | Cobertura de la demo |
| --- | --- | --- |
| C01 | Mostrar el siguiente paso | **Local.** La vista Hoy conecta el estado del episodio con el recorrido del estudio. |
| C02 | Mostrar un calendario | **Local.** Los episodios tienen fecha, número y estado, con acceso a su trabajo pendiente. |
| C03 | Configurar recordatorios | **Local.** Horarios, días y activación se conservan en el navegador. No hay entrega garantizada ni notificaciones con la aplicación cerrada. |
| C04 | Retomar trabajo pendiente | **Parcial.** El estado local permite volver a un episodio y cambiar su planificación. No existe una cola externa de avisos que se ejecute sin la app. |
| C05 | Resumir el avance | **Parcial.** Las métricas muestran el estado actual. No se envía un resumen periódico por correo o mensajería. |

## 6. Publicación y progreso — 4 requisitos

| ID | Requisito | Cobertura de la demo |
| --- | --- | --- |
| P01 | Preparar una salida publicable | **Local.** Descarga del montaje y del plan JSON. El archivo exportado y el plan son entregables distintos. |
| P02 | Registrar una publicación | **Local.** Confirmación manual asociada al episodio. Una URL aportada no implica que la aplicación haya verificado el contenido. |
| P03 | Publicar por integración | **Pendiente.** No hay OAuth, cuentas conectadas ni llamadas a APIs de redes sociales. |
| P04 | Medir continuidad | **Local.** Se cuentan episodios y estados, con deduplicación por ID. Los registros de muestra siguen siendo ficticios. |

### Reglas de las métricas

La fecha de referencia de la demo se calcula desde `series.startDate` y `series.currentDay`; no avanza automáticamente usando el reloj del dispositivo.

| Campo | Significado |
| --- | --- |
| `published` | Episodios con estado publicado, contados una sola vez por ID. |
| `due` | Episodios previstos hasta el día de referencia, incluido ese día. |
| `overdue` | Pendientes anteriores al día de referencia; excluye episodios publicados u omitidos. |
| `pending` | Pendientes previstos hasta hoy, incluido hoy; excluye omisiones explícitas. |
| `progress` | Porcentaje de publicaciones respecto de la meta de la serie. |
| `completion` | Porcentaje de episodios publicados respecto de los previstos hasta hoy. |

En el estado inicial hay 9 publicados de 30, por lo que `progress` es 30 %. Hay 12 previstos hasta hoy, por lo que `completion` es 75 %. Los días 10 y 11 son los dos atrasos; el día 12 todavía es trabajo previsto para hoy.

## 7. Calidad y datos — 7 requisitos

| ID | Requisito | Cobertura de la demo |
| --- | --- | --- |
| R01 | Guardar y recuperar | **Local.** Datos en `localStorage` y videos importados en IndexedDB, vinculados al navegador y al origen del sitio. No hay copia en la nube. |
| R02 | Recuperar procesos | **Parcial.** El usuario puede reintentar una importación o exportación. No hay una cola persistente que continúe un render después de cerrar el navegador. |
| R03 | Controlar acceso | **Parcial.** Se procesan archivos elegidos por el usuario y los clips locales no se suben. No existen cuentas, autenticación ni aislamiento de equipos en un servidor. |
| R04 | Conservar originales y limpiar copias | **Parcial.** Los originales no se editan. Las copias del navegador dependen de su almacenamiento; no hay una política central de conservación. |
| R05 | Explicar el origen de recomendaciones | **Plantilla.** Los ejemplos y guiones sintéticos se identifican como tales. No se presenta un razonamiento de IA o una transcripción como si se hubiese ejecutado. |
| R06 | Mantener compatibilidad audiovisual | **Parcial.** Importación, reproducción y exportación dependen de las APIs y formatos del navegador. Se requiere comprobación con los archivos y dispositivos objetivo. |
| R07 | Establecer límites y consumo | **Parcial.** Límite de 250 MB por clip, procesamiento local y progreso de exportación. No existen facturación por uso, cuotas de servidor ni un panel de costes de IA. |

## Recorrido manual de revisión

Estas comprobaciones describen qué revisar; no afirman que se hayan ejecutado en todos los navegadores.

1. **Inicio:** abrir `#today` y comprobar que el ejemplo tiene 30 episodios, 9 publicaciones ficticias y día actual 12.
2. **Estudio:** abrir `#studio/ep-12/1` y recorrer los pasos hasta `#studio/ep-12/4`, conservando las decisiones entre ellos.
3. **Notas:** modificar una nota, recargar y comprobar que permanece en el mismo navegador y origen.
4. **Material de muestra:** reproducir los cuatro clips y comprobar que son ilustraciones de demostración sin audio.
5. **Selección:** excluir uno de los cuatro clips de 12 segundos y comprobar que la duración seleccionada baja de 48 a 36 segundos.
6. **Edición:** reactivar el clip, modificar sus límites y reordenarlo; comprobar que esos cambios afectan al plan y al archivo exportado.
7. **Archivo propio:** importar un video compatible, reproducirlo y volver a abrir la aplicación. Comprobar que se recupera desde IndexedDB y que no aparece una transcripción inventada.
8. **Hooks:** editar una propuesta y comprobar que sigue siendo texto revisable; no se genera audio por haber elegido un hook.
9. **Exportación:** descargar un montaje breve y abrirlo en un reproductor. Revisar contenido, orden, límites, orientación y sonido cuando el material lo tenga.
10. **Plan JSON:** descargarlo y comprobar que incluye decisiones y referencias, sin contener los videos originales.
11. **Publicación:** exportar sin marcar publicado y comprobar que el contador no cambia. Registrar después la publicación manual y comprobar que ese episodio se cuenta una sola vez.
12. **Calendario:** abrir `#calendar`, revisar el día 12 y los pendientes anteriores; comprobar que una publicación tardía no cambia el día narrado.
13. **Recordatorios:** cambiar un horario y recargar. Comprobar persistencia de la configuración, sin interpretar esto como una prueba de notificación en segundo plano.
14. **Datos locales:** probar la recuperación en el mismo origen. Un navegador distinto o los datos del sitio borrados no deben presentarse como una sincronización de cuenta.

## Ampliaciones que requieren desarrollo propio

La transcripción real, el análisis narrativo del video, la selección semántica de cortes, la continuidad entre episodios, las cuentas y colaboración, el procesamiento en servidor, el render de producción, las notificaciones con la app cerrada y la publicación por APIs requieren integración, reglas y validación adicionales.

Esta separación permite evaluar la interfaz y las operaciones locales sin atribuir a la demo servicios que no están conectados.
