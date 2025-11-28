# Million Visual Challenges
## Plataforma Interactiva para los Problemas del Milenio

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E)](https://supabase.com/)

**Por**: Manuel Ramírez Ballesteros  
**Proyecto Académico** - Universidad / Investigación Independiente

---

## 📖 Descripción

Plataforma académica interactiva dedicada a los **7 Problemas del Milenio** del Clay Mathematics Institute. Combina visualizaciones 3D interactivas, contenido didáctico multinivel, integración con IA para actualización automática de papers, y herramientas colaborativas de investigación.

### Problemas Incluidos

1. **P vs NP** - Ciencias de la Computación
2. **Hipótesis de Riemann** - Teoría de Números  
3. **Navier-Stokes** - Ecuaciones Diferenciales
4. **Yang-Mills** - Física Matemática
5. **Conjetura de Hodge** - Geometría Algebraica
6. **Birch & Swinnerton-Dyer** - Teoría de Números
7. **Conjetura de Poincaré** ✅ (RESUELTO)

---

## 🚀 Quick Start

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar Supabase (ver SETUP.md)
supabase link --project-ref vjskpckixgukiffaxypl
supabase db push

# 3. Ejecutar en desarrollo
npm run dev
```

**Ver [SETUP.md](./SETUP.md) para instrucciones completas de configuración.**

---

## ✨ Características

### Actuales (MVP)
- ✅ Visualizaciones interactivas básicas
- ✅ Sistema de usuarios y autenticación
- ✅ Base de datos completa (9 tablas)
- ✅ Perfiles de usuario con badges
- ✅ Sistema de likes y comentarios

### En Desarrollo (Sprint 0-1)
- 🔄 Integración con arXiv API
- 🔄 Resúmenes automáticos con GPT-4
- 🔄 7 páginas de problemas completas
- 🔄 Visualizaciones 3D avanzadas (Three.js)

### Roadmap (2-3 meses)
- 📍 Foros de discusión con LaTeX
- 📍 Editor colaborativo de pruebas
- 📍 Q&A con IA (RAG)
- 📍 Timeline de investigación
- 📍 Análisis de redes de citaciones

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + **TypeScript 5.8** + **Vite**
- **TailwindCSS** + **shadcn/ui** (components)
- **Three.js** / React Three Fiber (visualizaciones 3D)
- **D3.js** (gráficos y visualizaciones)
- **MathJax** (renderizado matemático)
- **Framer Motion** (animaciones)

### Backend
- **Supabase** (PostgreSQL + Auth + Storage + Edge Functions)
- **OpenAI API** (GPT-4 para summaries)
- **arXiv API** (papers académicos)
- **Semantic Scholar API** (citaciones)

### DevOps
- **GitHub Actions** (CI/CD)
- **Lovable** (deployment)
- **Sentry** (error tracking - planned)

---

## 📁 Estructura del Proyecto

```
million-visual-challenges/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── layout/      # Layout components
│   │   └── problem/     # Problem-specific components
│   ├── pages/           # Page components (routes)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities
│   ├── types/           # TypeScript types
│   └── data/            # Static data
├── supabase/
│   ├── migrations/      # Database migrations
│   └── functions/       # Edge Functions
├── public/              # Static assets
├── implementation_plan.md  # 📋 Plan completo
├── SETUP.md            # 🔧 Guía de configuración
└── .agent/workflows/   # Development workflows
```

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| **[SETUP.md](./SETUP.md)** | Guía completa de configuración inicial |
| **[implementation_plan.md](./.gemini/artifacts/implementation_plan.md)** | Plan de desarrollo detallado (8 sprints) |
| **[task.md](./.gemini/artifacts/task.md)** | Lista de tareas del proyecto |
| **[development-workflow.md](./.agent/workflows/development-workflow.md)** | Workflow de desarrollo |

---

## 🎯 Objetivos del Proyecto

### Educativo
- Democratizar el acceso a matemáticas avanzadas
- Explicaciones en 3 niveles (simple, intermedio, avanzado)
- Visualizaciones interactivas de conceptos abstractos

### Investigación
- Herramientas colaborativas para investigadores
- Actualización automática con publicaciones nuevas
- Foro académico con revisión por pares

### Tecnológico
- Probar integración IA + educación
- RAG (Retrieval Augmented Generation) para Q&A
- Visualizaciones WebGL/Three.js de alto rendimiento

---

## 👤 Autor

**Manuel Ramírez Ballesteros**  
Proyecto académico independiente

**Contacto y Colaboración**: ramiballes96@gmail.com

---

## 💰 Apoyo y Financiación

Este proyecto es completamente **open-source y gratuito**. Si encuentras valor en esta plataforma y deseas contribuir a su desarrollo continuo, hay varias formas de colaborar:

### Formas de Apoyar el Proyecto

1. **💻 Contribución de Código**  
   Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para guías de contribución

2. **💵 Financiación Directa**  
   Apoyo vía **PayPal**: [ramiballes96@gmail.com](mailto:ramiballes96@gmail.com)  
   *Toda donación, por pequeña que sea, ayuda a mantener y mejorar el proyecto*

3. **🐛 Reporte de Bugs**  
   [GitHub Issues](https://github.com/MRamiBalles/million-visual-challenges/issues)

4. **💡 Sugerencias y Feedback**  
   [GitHub Discussions](https://github.com/MRamiBalles/million-visual-challenges/discussions)

5. **📚 Propuestas Académicas**  
   Colaboraciones de investigación, papers conjuntos, o implementación de nuevas features

### Transparencia en el Uso de Fondos

Las donaciones se utilizan para:
- 💻 **Infraestructura**: Servidor y hosting (Supabase, bases de datos)
- 🤖 **APIs de IA**: Costos de OpenAI GPT-4, embeddings (~$24-50/mes)
- 📚 **Recursos Académicos**: Acceso a papers, journals, y bases de datos
- 🚀 **Desarrollo**: Nuevas funcionalidades y mejoras
- 📖 **Documentación**: Creación de tutoriales y materiales educativos

### Patrocinadores y Colaboradores

*¿Interesado en patrocinar este proyecto?*  
Contacta: **ramiballes96@gmail.com**

---

## 🤝 Contribuciones

Este es un proyecto académico open-source. Las contribuciones son bienvenidas.

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) (próximamente)

---

## 📝 Licencia

MIT License - Ver [LICENSE](./LICENSE)

---

## 🔗 Enlaces

- **Lovable Project**: https://lovable.dev/projects/5c23daba-a983-4ecf-b7be-a5a3649e43a3
- **Supabase Dashboard**: https://supabase.com/dashboard/project/vjskpckixgukiffaxypl
- **Clay Mathematics Institute**: https://www.claymath.org/millennium-problems/

---

## 📊 Estado del Proyecto

**Fase Actual**: Sprint 0 - Foundation & Architecture  
**Progreso MVP**: ~15%  
**Timeline**: MVP en 1 mes | Completo en 3 meses  
**Última actualización**: Noviembre 2025

---

**¿Preguntas o sugerencias?**  
Abre un issue o contacta al desarrollador.
