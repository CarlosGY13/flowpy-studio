# FlowPy Studio

Una plataforma gratuita para aprender Python viendo cómo cambia un programa: escribe código, ejecútalo, explora su diagrama de flujo y avanza paso a paso con Debug.

> Pensada para alumnos que están empezando y docentes que quieren explicar la lógica de un programa de manera visual.

## Usar la plataforma

Cuando esté publicada, ábrela en:

**https://carlosgy13.github.io/flowpy-studio/**

No requiere crear una cuenta, instalar Python ni descargar nada. Python y NumPy se ejecutan directamente en el navegador.

## Qué puedes hacer

- Escribir y ejecutar Python 3 en el navegador.
- Ver un diagrama de flujo generado desde el código.
- Mover los bloques del diagrama, acercar/alejar y usar pantalla completa.
- Usar ejemplos de `if`, `for`, NumPy, funciones e `input()`.
- Depurar línea por línea y observar las variables que cambian.
- Pasar el cursor sobre una variable en Debug para ver su valor.
- Responder `input()` desde la salida, incluso dentro de ciclos.
- Abrir el subflujo de una función al hacer clic en su llamada.
- Resolver retos guiados de condicionales, bucles y errores de sintaxis.
- Conservar automáticamente el código y las posiciones del diagrama en el navegador.

## Guía rápida para alumnos

1. Escribe código en el editor o abre **Ejemplos**.
2. Pulsa **Ejecutar** para ver la salida y el diagrama.
3. Pulsa **Debug** para avanzar con **Siguiente** y revisar variables.
4. Si el programa llama a `input()`, responde en el panel de salida cuando llegue a esa línea.
5. Prueba los **Retos** para practicar.

## Para docentes

FlowPy Studio es útil para explicar:

- Secuencia de instrucciones y asignación de variables.
- Decisiones con `if` y `else`.
- Repetición con `for` y `while`.
- Funciones como procesos predefinidos.
- Errores de sintaxis, tipos de datos y entradas de usuario.

Puedes compartir el enlace de la plataforma con el grupo. Cada estudiante conserva su código localmente en su propio navegador.

## Ejecutarlo localmente

```bash
npm install
npm run dev
```

Luego abre [http://localhost:5173](http://localhost:5173).

Para crear la versión de producción:

```bash
npm run build
```

## Tecnologías

- React, TypeScript y Vite
- Tailwind CSS y CodeMirror
- Pyodide: Python y NumPy en WebAssembly
- GitHub Pages para publicación gratuita

## Publicación

Cada cambio enviado a la rama `main` genera automáticamente una nueva versión pública mediante GitHub Pages.
