# Agente Psicofel - Asistente de Triaje Inteligente

Este repositorio contiene la implementación del **Asistente Psicofel**, un chatbot inteligente diseñado para realizar el triaje inicial de pacientes en una clínica de psicología, integrando una interfaz de alta fidelidad con lógica de agentes autónomos.

## 🚀 Características

- **Interfaz de Alta Fidelidad**: Landing page moderna que imita el diseño corporativo de Psicofel, con efectos de glassmorphism y diseño responsive.
- **Triaje Empático**: Flujo de conversación diseñado para capturar:
  - Nombre del paciente.
  - Teléfono de contacto (justificado por seguridad de sesión).
  - Motivo de consulta (analizado para derivación).
- **Derivación Automática**: El sistema analiza el motivo de consulta del usuario y lo deriva automáticamente al especialista más adecuado (Logopedia, Infantil, Pareja, Adultos, etc.).
- **Conversación Continua**: El chat permanece abierto tras la derivación para resolver dudas adicionales del paciente.
- **Persistencia**: Las sesiones se mantienen mediante almacenamiento local y se sincronizan con **Supabase** para el seguimiento en el panel de administración.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS.
- **Iconos**: [Lucide React](https://lucide.dev/).
- **Backend/Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime).
- **Orquestación de Agentes**: [CrewAI](https://www.crewai.com/) (Preparado para integración profunda).

## 📦 Instalación y Configuración

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/TU_USUARIO/agente-Psicofel.git
   cd agente-Psicofel
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Crea un archivo `.env.local` en la raíz con tus credenciales de Supabase:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
   ```

4. **Ejecutar en desarrollo**:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📂 Estructura del Proyecto

- `src/app/page.tsx`: Landing page principal de Psicofel.
- `src/components/ChatWidget.tsx`: Botón flotante y contenedor del chat.
- `src/components/ChatWindow.tsx`: Lógica cerebral del asistente y flujo de conversación.
- `src/lib/supabase.ts`: Cliente y funciones de base de datos.
- `docs/spec-sheets/`: Documentación técnica del triaje y especialistas.

## ⚖️ Licencia

Este proyecto está bajo la licencia MIT.
