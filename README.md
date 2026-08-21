# FlowPy Studio

Herramienta web para aprender Python 3 escribiendo código y visualizando diagramas de flujo en tiempo real. Incluye soporte para NumPy, terminal integrada y una interfaz pensada para principiantes.

## Características

- **Editor Python 3** con resaltado de sintaxis
- **Ejecución en el navegador** con Pyodide (Python + NumPy, sin servidor)
- **Diagrama de flujo estilizado** generado automáticamente desde el código
- **Terminal** para ver la salida de `print()` y errores
- **Ejemplos incluidos** para empezar rápido
- **Interfaz en español** orientada a quienes usan código por primera vez

## Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173), escribe código Python y presiona **Ejecutar** (o `⌘+Enter` / `Ctrl+Enter`).

## Tipos de nodos en el diagrama

| Color | Significado |
|-------|-------------|
| Verde ovalado | Inicio / Fin |
| Azul | Proceso (asignaciones, expresiones) |
| Ámbar (rombo) | Decisión (`if`, `while`) |
| Fucsia | Bucle (`for`, `while`) |
| Teal | Operaciones NumPy |
| Violeta | Entrada/Salida (`print`) |

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- CodeMirror 6
- Pyodide (Python 3 + NumPy en WASM)
