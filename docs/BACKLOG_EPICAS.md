# Backlog inicial por Épicas — Lab2hand (Design Thinking)

## Propósito
Definir un conjunto de épicas derivadas de problemas reales (DT) con hipótesis y métricas, listas para desglosarse en historias elegibles por DoR/DoD.

## Convenciones
- Cada épica debe vincularse a evidencia en `/docs/DT/` y a decisiones técnicas en `/docs/ADRs/` cuando aplique.
- Priorización: RICE + MoSCoW.
- Historias con formato Dado/Cuando/Entonces y métricas de éxito.

---

## Épica 1 — Configurar y ejecutar un **experimento base** en < 2 minutos

### Problema (AS-IS)
Docentes y estudiantes tardan demasiado configurando un experimento inicial; hay fricción en parámetros y validaciones.

### HMW
¿Cómo podríamos **reducir el tiempo de configuración** para que un usuario **inicie un experimento en < 2 minutos** sin requerir conectividad perfecta?

### Hipótesis
Si simplificamos la configuración con un asistente y valores por defecto inteligentes, **≥70%** de usuarios completará la configuración en **< 120 s** con **≤1 error**.

### Métricas objetivo
- Éxito de tarea ≥ 70%  
- Tiempo de tarea ≤ 120 s  
- Errores por sesión ≤ 1

### Criterios de aceptación (alto nivel)
- Asistente paso a paso con validaciones inline.
- Valores por defecto coherentes al contexto.
- Guardado de borradores y reanudación.

### Dependencias
- UI base del flujo.
- Modelo mínimo de datos de “experimento”.

### Riesgos
- Complejidad de validaciones contextuales.
- Dispositivos de bajo rendimiento.

### Trazabilidad
- DT: Personas, Mapa de Empatía, Journey as-is/to-be, HMW.
- ADRs: arquitectura de front, manejo de estado, validaciones.

### RICE (estimación inicial)
- Reach: 100 usuarios/mes (docentes/estudiantes)
- Impact: 3/3
- Confidence: 0.6
- Effort: 8 puntos
- Score aproximado: (100×3×0.6)/8 = 22.5

### Historias ejemplo
- Historia 1: Asistente de configuración
  - Dado que el usuario abre “Nuevo experimento”
  - Cuando completa los pasos con valores por defecto
  - Entonces puede iniciar el experimento en < 120 s y sin errores críticos

- Historia 2: Validaciones inline
  - Dado un campo obligatorio vacío
  - Cuando el usuario intenta avanzar
  - Entonces se muestra una validación clara y se indica cómo corregir

---

## Épica 2 — **Captura y graficación** de datos del experimento

### Problema (AS-IS)
Los usuarios registran datos manualmente y no obtienen visualización inmediata y útil.

### HMW
¿Cómo podríamos **capturar datos de forma simple** y **visualizarlos al instante** sin abrumar, incluso offline?

### Hipótesis
Si ofrecemos captura guiada (tabla/inputs) y gráfica inmediata (línea/dispersion), **≥75%** entenderá la tendencia en **≤30 s** tras ingresar datos.

### Métricas objetivo
- Éxito de tarea (agregar y ver gráfica) ≥ 80%
- Tiempo hasta primera gráfica ≤ 30 s
- Comprensión auto-reportada ≥ 4/5

### Criterios de aceptación (alto nivel)
- Tabla editable con validaciones de tipo/unidad.
- Gráfica reactiva (actualiza en tiempo real).
- Exportación a CSV/PNG.

### Dependencias
- Esquema de datos de mediciones.
- Librería de gráficos.

### Riesgos
- Performance con muchos puntos.
- Coherencia de unidades.

### Trazabilidad
- DT: Journey, Brief de Prototipo, Guion e Informe de Test.
- ADRs: librería de gráficos, estructura de datos.

### RICE (estimación inicial)
- Reach: 100 usuarios/mes
- Impact: 3/3
- Confidence: 0.65
- Effort: 10 puntos
- Score: (100×3×0.65)/10 = 19.5

### Historias ejemplo
- Historia 1: Registro de mediciones
  - Dado un experimento activo
  - Cuando el usuario ingresa pares (t, valor)
  - Entonces la gráfica se actualiza de inmediato y valida unidades

- Historia 2: Exportación
  - Dado un conjunto de mediciones
  - Cuando el usuario elige exportar
  - Entonces descarga CSV y/o la imagen de la gráfica

---

## Épica 3 — **Autenticación y perfiles** mínimos (docente/estudiante)

### Problema (AS-IS)
Se requiere trazabilidad por rol y sesiones persistentes, sin fricción.

### HMW
¿Cómo podríamos **autenticar** con baja fricción manteniendo **seguridad básica** y perfiles adaptados por rol?

### Hipótesis
Con registro/login sencillo y sesiones seguras, **≥80%** completará onboarding en **≤90 s** y volverá a iniciar sesión en **≤20 s**.

### Métricas objetivo
- Éxito de login ≥ 95%
- Tiempo de onboarding ≤ 90 s
- Tiempo de re-login ≤ 20 s

### Criterios de aceptación (alto nivel)
- Registro/login con email + contraseña (o proveedor escolar a futuro).
- Sesión persistente con expiración razonable.
- Pantallas según rol (menú y permisos).

### Dependencias
- Modelo de usuarios/roles.
- ADR de autenticación.

### Riesgos
- Recuperación de contraseña.
- Endurecimiento CORS/Helmet.

### Trazabilidad
- DT: Personas diferenciadas por rol.
- ADRs: estrategia de tokens, sesiones, CORS.

### RICE (estimación inicial)
- Reach: 100 usuarios/mes
- Impact: 2/3
- Confidence: 0.7
- Effort: 8 puntos
- Score: (100×2×0.7)/8 = 17.5

### Historias ejemplo
- Historia 1: Login
  - Dado un usuario registrado
  - Cuando ingresa credenciales válidas
  - Entonces accede al panel según su rol y queda sesión persistente

- Historia 2: Cierre de sesión
  - Dado un usuario autenticado
  - Cuando pulsa “Cerrar sesión”
  - Entonces el token se invalida y se redirige a la pantalla de inicio

---

## Épica 4 — **Offline-first / PWA** para continuidad sin internet

### Problema (AS-IS)
Conectividad inestable impide usar la plataforma en aula o campo.

### HMW
¿Cómo podríamos **garantizar continuidad offline** con sincronización segura cuando vuelva la conexión?

### Hipótesis
Con cacheo de assets y cola de acciones, **≥70%** completará tareas básicas offline y sincronizará sin conflicto al reconectar.

### Métricas objetivo
- Tareas clave completables offline ≥ 70%
- Tasa de sincronización exitosa ≥ 95%
- Conflictos de datos ≤ 2% de sesiones

### Criterios de aceptación (alto nivel)
- PWA instalable.
- Cache de assets críticos.
- Cola de eventos y reintento con backoff.

### Dependencias
- Librería/estrategia SW (Workbox).
- Estrategia de merge de datos.

### Riesgos
- Conflictos y duplicados.
- Consumo de almacenamiento.

### Trazabilidad
- DT: Evidencia de conectividad real de los usuarios.
- ADRs: estrategia de cache/sync.

### RICE (estimación inicial)
- Reach: 60 usuarios/mes
- Impact: 3/3
- Confidence: 0.55
- Effort: 13 puntos
- Score: (60×3×0.55)/13 ≈ 7.6

### Historias ejemplo
- Historia 1: PWA instalable
  - Dado un navegador compatible
  - Cuando el usuario elige “Instalar”
  - Entonces la app queda disponible como PWA y abre sin conexión

- Historia 2: Captura offline
  - Dado que no hay internet
  - Cuando el usuario ingresa mediciones
  - Entonces quedan en cola y se sincronizan al reconectar

---

## Épica 5 — **Telemetría básica** y feedback in-app

### Problema (AS-IS)
No hay visibilidad de uso real ni puntos de fricción en producción.

### HMW
¿Cómo podríamos **medir adopción, retención y errores** y habilitar **feedback in-app** con bajo esfuerzo?

### Hipótesis
Con eventos mínimos (inicio de flujo, éxito de tarea, errores) y un canal de feedback, detectaremos **≥3 hallazgos accionables por sprint**.

### Métricas objetivo
- Eventos críticos instrumentados (≥5)
- Hallazgos accionables por sprint ≥ 3
- Errores por usuario ↓ tendencia

### Criterios de aceptación (alto nivel)
- Instrumentación de eventos clave.
- Visión simple de métricas (dashboard básico).
- Widget de feedback con captura contextual.

### Dependencias
- Librería de analítica/logging.
- Endpoint de feedback (o servicio externo).

### Riesgos
- Privacidad/datos personales.
- Ruido en eventos.

### Trazabilidad
- DT: Informe de Test → hipótesis de adopción/retención.
- ADRs: elección de analítica/logging.

### RICE (estimación inicial)
- Reach: 100 usuarios/mes
- Impact: 2/3
- Confidence: 0.6
- Effort: 6 puntos
- Score: (100×2×0.6)/6 = 20

### Historias ejemplo
- Historia 1: Eventos de flujo
  - Dado un usuario que inicia el flujo de experimento
  - Cuando completa o abandona
  - Entonces se registra un evento con resultado y duración

- Historia 2: Feedback contextual
  - Dado que el usuario encuentra una fricción
  - Cuando pulsa “Enviar feedback”
  - Entonces se envía un reporte con pantalla/acción y comentario
