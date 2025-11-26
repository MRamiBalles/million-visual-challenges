# Contributing to Million Visual Challenges

¡Gracias por tu interés en contribuir! Este es un proyecto académico open-source y toda ayuda es bienvenida.

## 🎯 Formas de Contribuir

### 1. Reportar Bugs
- Usa el [Issue Tracker](https://github.com/MRamiBalles/million-visual-challenges/issues)
- Describe el problema claramente
- Incluye pasos para reproducirlo
- Adjunta screenshots si es relevante

### 2. Sugerir Features
- Abre un Issue con la etiqueta `feature-request`
- Explica el caso de uso
- Describe la solución propuesta

### 3. Mejorar Documentación
- Correcciones de typos
- Clarificaciones
- Traducciones
- Ejemplos adicionales

### 4. Contribuir Código

#### Setup del Entorno

```bash
# Fork del proyecto
git clone https://github.com/MRamiBalles/million-visual-challenges
cd million-visual-challenges

# Instalar dependencias
npm install

# Configurar Supabase
supabase link --project-ref vjskpckixgukiffaxypl
supabase db push

# Ejecutar en desarrollo
npm run dev
```

#### Workflow de Desarrollo

1. **Crear branch desde `main`**
   ```bash
   git checkout -b feature/nombre-descriptivo
   # o
   git checkout -b fix/nombre-del-bug
   ```

2. **Hacer cambios**
   - Sigue las convenciones de código
   - Escribe código TypeScript tipado
   - Usa componentes shadcn/ui existentes
   - Añade tests si es aplicable

3. **Commit**
   ```bash
   # Usa conventional commits
   git commit -m "feat(riemann): add zeta function visualization"
   git commit -m "fix(auth): resolve login redirect issue"
   git commit -m "docs(setup): clarify migration steps"
   ```

4. **Push y PR**
   ```bash
   git push origin feature/nombre-descriptivo
   ```
   - Abre Pull Request en GitHub
   - Describe los cambios
   - Referencia Issues relacionados

## 📝 Convenciones de Código

### TypeScript
- Usa TypeScript strict mode
- Define tipos explícitos
- Evita `any`, usa `unknown` si es necesario
- Documenta funciones complejas

### React
- Componentes funcionales con hooks
- Props tipadas con interfaces
- Usa `React.FC` para componentes
- Nombres descriptivos: `ProblemHeader`, `VisualizationCanvas`

### Styling
- TailwindCSS para estilos
- Usa variables CSS del theme
- Componentes shadcn/ui cuando sea posible
- Responsive por defecto (mobile-first)

### Commits
Formato: `<type>(<scope>): <description>`

**Types:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formateo, sin cambios de código
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Mantenimiento

**Scopes:**
- `pvsnp`, `riemann`, `navier-stokes`, etc. (problemas)
- `auth`, `db`, `ui`, `api`, etc. (sistemas)

## 🧪 Testing

```bash
# Run tests (cuando estén configurados)
npm run test

# Type check
npm run typecheck

# Lint
npm run lint
```

## 🎨 Visualizaciones

Si contribuyes visualizaciones:
- Usa Three.js / React Three Fiber para 3D
- Usa D3.js para gráficos 2D
- Optimiza performance (60 FPS)
- Añade controles interactivos
- Documenta parámetros de configuración

## 📚 Contenido Académico

Para contenido matemático:
- Verifica fuentes académicas
- Cita papers apropiadamente
- Usa LaTeX para ecuaciones
- Provee explicaciones en 3 niveles

## 🔬 Investigación

Para papers y referencias:
- Verifica DOI o arXiv ID
- Include abstract/resumen
- Lista autores completos
- Añade año de publicación

## ⚖️ Licencia

Al contribuir, aceptas que tus contribuciones se licencien bajo MIT License.

## 💚 Código de Conducta

- Se respetuoso y profesional
- Acepta crítica constructiva
- Enfócate en mejorar el proyecto
- Ayuda a otros contribuidores

## 📞 Contacto

- **Issues**: [GitHub Issues](https://github.com/MRamiBalles/million-visual-challenges/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MRamiBalles/million-visual-challenges/discussions)
- **Email**: [tu-email@ejemplo.com]

## 🙏 Reconocimientos

Los contribuidores serán listados en CONTRIBUTORS.md

---

¡Gracias por hacer de este proyecto algo mejor! 🚀
