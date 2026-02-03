# Spec Sheet: Agente de Triaje - Clínica de Psicología

## 1. Objetivo

Crear un agente de IA que actúe como primer punto de contacto (chatbot) para una clínica de psicología. El agente debe realizar un triaje básico, capturando datos del paciente y derivándolo al especialista adecuado.

## 2. Requerimientos de Usuario

- **Empatía y Profesionalismo**: El agente debe sonar profesional y empático.
- **Datos Requeridos**: Nombre, teléfono y motivo de consulta.
- **Derivación Determinística**: Basado en el motivo, recomendar un psicólogo específico y proporcionar su número de contacto.

## 3. Milestones (Hitos)

### Milestone 1: Definición de Agente y Tareas

- Configurar el `Agent` de Triaje con su `Role`, `Goal` y `Backstory`.
- Definir las `Tasks` secuenciales: `CaptureDataTask` y `DeriveSpecialistTask`.

### Milestone 2: Integración con Supabase

- Crear tabla `pacientes_triaje` para registrar los datos capturados.
- Crear tabla `especialistas` para la lógica de derivación.

### Milestone 3: Interfaz Web (Next.js)

- Implementar el componente de Chatbot.
- Conectar la interfaz con el backend de CrewAI.

## 4. Definición de Especialistas (Reales)

| Especialista | Especialidad | Teléfono |
| :--- | :--- | :--- |
| Francisco Pardo | Adultos, pareja, psicología afirmativa (LGTBIQ+) | +34 647 07 26 86 |
| Francesc Mengual | Adultos, jóvenes, adolescentes, psicología deportiva | +34 611 81 31 09 |
| Patricia Soriano | Adultos, parejas, terapia de familia | +34 697 26 28 80 |
| Celia García | Adultos, jóvenes, adolescentes | +34 664 66 33 45 |
| Paula de Andrés | Atención a adolescentes e infantil | +34 647 07 12 61 |
| Rocío | Logopeda | +34 647 07 11 18 |
| Elisa Greco | Familia, psicología neonatal y perinatal, embarazos | +34 647 072 089 |
| Paula Estarlich | Familia, jóvenes, adolescentes | +34 647 07 08 32 |
