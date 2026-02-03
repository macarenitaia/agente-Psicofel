# Architecture Decision Record (ADR)

## [2026-02-02] ADR 1: Confirmación de Conectividad Supabase

**Contexto**: El usuario solicitó confirmar la conexión con Supabase antes de proceder.
**Decisión**: Se verificó la conectividad mediante `curl.exe` a la API REST de Supabase utilizando la URL y el Anon Key encontrados en la configuración.
**Resultado**: Exitoso (HTTP 200 OK).

## [2026-02-02] ADR 2: Estructura del Proyecto

**Contexto**: El workspace actual es `crewAI-main` (librería), pero el usuario desea una "web".
**Decisión**: Se utilizará una estructura de aplicación Next.js dentro de un subdirectorio o siguiendo las reglas de `src/` definidas en MEMORY, integrando CrewAI como el motor de razonamiento.
**Prevención**: Mantener clara la separación entre la lógica de agentes (Python/CrewAI) y la interfaz de usuario (Next.js/TS).

## ADR 4: Refinamiento del Flujo del Chatbot y Empatía

**Fecha:** 3 de febrero de 2026
**Contexto:** El usuario solicitó un tono más empático, justificar la petición de teléfono para registro y permitir la conversación continua.
**Decisión:**

1. Cambiar la pregunta de triaje a "¿qué es lo que te ocurre?".
2. Cambiar la petición de teléfono para que se perciba como una medida de seguridad/registro por fallos de conexión.
3. Eliminar el bloqueo del chat al final del triaje para permitir seguimiento.
**Consecuencias:** Mejora en la retención de usuarios y sensación de acompañamiento.
