import type { DebugStep, FlowGraph, FlowNode, TerminalLine } from '../types'

declare global {
  interface Window {
    loadPyodide?: (config?: { indexURL?: string }) => Promise<PyodideInterface>
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>
  loadPackage: (names: string | string[]) => Promise<void>
  globals: {
    set: (name: string, value: unknown) => void
    get: (name: string) => unknown
  }
}

let pyodidePromise: Promise<PyodideInterface> | null = null

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'

let scriptLoaded = false

async function loadPyodideScript(): Promise<void> {
  if (scriptLoaded && window.loadPyodide) return

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${PYODIDE_CDN}pyodide.js`
    script.onload = () => {
      scriptLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error('No se pudo cargar Pyodide'))
    document.head.appendChild(script)
  })
}

export async function initPyodide(onStatus?: (msg: string) => void): Promise<PyodideInterface> {
  if (pyodidePromise) return pyodidePromise

  pyodidePromise = (async () => {
    onStatus?.('Cargando Python en el navegador...')
    await loadPyodideScript()
    const pyodide = await window.loadPyodide!({ indexURL: PYODIDE_CDN })
    onStatus?.('Instalando NumPy...')
    await pyodide.loadPackage('numpy')
    onStatus?.('Preparando analizador de diagramas...')
    await pyodide.runPythonAsync(FLOWCHART_PARSER_PY)
    onStatus?.('¡Listo!')
    return pyodide
  })()

  return pyodidePromise
}

export async function runPythonCode(
  code: string,
  pyodide: PyodideInterface,
  inputs: string[] = []
): Promise<{ output: TerminalLine[]; graph: FlowGraph | null; error: string | null }> {
  const output: TerminalLine[] = []

  pyodide.globals.set('_user_code', code)
  pyodide.globals.set('_flowpy_inputs', inputs)

  const runnerPy = `
import io, json
from contextlib import redirect_stdout, redirect_stderr

_stdout_buf = io.StringIO()
_stderr_buf = io.StringIO()
_result = {"lines": [], "graph": None, "error": None}
_input_values = iter(list(_flowpy_inputs))

def _simulated_input(prompt=""):
    try:
        return next(_input_values)
    except StopIteration:
        raise EOFError(f"FLOWPY_INPUT:{prompt}")

def _friendly_error(error):
    if isinstance(error, EOFError) and str(error).startswith("FLOWPY_INPUT:"):
        return str(error)
    if isinstance(error, SyntaxError):
        return f"Error de sintaxis en línea {error.lineno}: {error.msg}"
    if isinstance(error, ValueError) and "invalid literal for int" in str(error):
        bad_value = str(error).split(":", 1)[-1].strip()
        return f"Se esperaba un número entero, pero se recibió {bad_value}. Ingresa solo dígitos, por ejemplo: 18."
    if isinstance(error, NameError):
        return f"Usaste una variable que no existe todavía: {error}. Revisa su nombre o asígnale un valor antes."
    if isinstance(error, TypeError):
        return f"Los tipos de datos no son compatibles: {error}"
    if isinstance(error, ZeroDivisionError):
        return "No se puede dividir entre cero."
    return f"{type(error).__name__}: {error}"

try:
    _result["graph"] = build_flowchart(_user_code)
except Exception as e:
    # A parser failure must never make the diagram area look as if nothing ran.
    # Keep a small, valid graph and surface the reason in the terminal.
    _result["graph"] = {
        "nodes": [
            {"id": "start", "type": "start", "label": "Inicio"},
            {"id": "parser-error", "type": "process", "label": "No se pudo analizar el código"},
            {"id": "end", "type": "end", "label": "Fin"},
        ],
        "edges": [
            {"from": "start", "to": "parser-error"},
            {"from": "parser-error", "to": "end"},
        ],
    }
    _result["lines"].append({"type": "stderr", "text": f"Analizador de diagrama: {e}"})

try:
    _ns = {"__name__": "__main__", "input": _simulated_input}
    with redirect_stdout(_stdout_buf), redirect_stderr(_stderr_buf):
        exec(_user_code, _ns)
except Exception as e:
    _result["error"] = _friendly_error(e)

for line in _stdout_buf.getvalue().splitlines():
    _result["lines"].append({"type": "stdout", "text": line})
for line in _stderr_buf.getvalue().splitlines():
    if line:
        _result["lines"].append({"type": "stderr", "text": line})

_result_json = json.dumps(_result)
_result_json
`

  try {
    const resultJson = (await pyodide.runPythonAsync(runnerPy)) as string
    if (typeof resultJson !== 'string') {
      throw new Error('No se pudo obtener el resultado del analizador de flujo')
    }
    const result = JSON.parse(resultJson) as {
      lines: TerminalLine[]
      graph: FlowGraph | null
      error: string | null
    }

    output.push(...result.lines)

    if (result.error) {
      output.push({ type: 'error', text: result.error })
    }

    return { output, graph: result.graph, error: result.error }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    output.push({ type: 'error', text: msg })
    return { output, graph: null, error: msg }
  }
}

export async function debugPythonCode(
  code: string,
  pyodide: PyodideInterface,
  inputs: string[] = []
): Promise<{ output: TerminalLine[]; graph: FlowGraph | null; steps: DebugStep[]; error: string | null }> {
  pyodide.globals.set('_user_code', code)
  pyodide.globals.set('_flowpy_inputs', inputs)

  const debuggerPy = `
import io, json, sys
from contextlib import redirect_stdout, redirect_stderr

_stdout_buf = io.StringIO()
_stderr_buf = io.StringIO()
_result = {"lines": [], "graph": None, "steps": [], "error": None}
_source_lines = _user_code.splitlines()
_last_stdout = ""
_input_values = iter(list(_flowpy_inputs))

def _simulated_input(prompt=""):
    try:
        return next(_input_values)
    except StopIteration:
        raise EOFError(f"FLOWPY_INPUT:{prompt}")

def _friendly_error(error):
    if isinstance(error, EOFError) and str(error).startswith("FLOWPY_INPUT:"):
        return str(error)
    if isinstance(error, SyntaxError):
        return f"Error de sintaxis en línea {error.lineno}: {error.msg}"
    if isinstance(error, ValueError) and "invalid literal for int" in str(error):
        bad_value = str(error).split(":", 1)[-1].strip()
        return f"Se esperaba un número entero, pero se recibió {bad_value}. Ingresa solo dígitos, por ejemplo: 18."
    if isinstance(error, NameError):
        return f"Usaste una variable que no existe todavía: {error}. Revisa su nombre o asígnale un valor antes."
    if isinstance(error, TypeError):
        return f"Los tipos de datos no son compatibles: {error}"
    if isinstance(error, ZeroDivisionError):
        return "No se puede dividir entre cero."
    return f"{type(error).__name__}: {error}"

def _debug_value(value):
    try:
        text = repr(value)
    except Exception:
        text = "<no representable>"
    return text if len(text) <= 100 else text[:99] + "…"

def _trace(frame, event, arg):
    global _last_stdout
    if event == "line" and frame.f_code.co_filename == "<flowpy-debug>":
        # A line event occurs just before its line is executed. Therefore,
        # output accumulated since the previous event belongs to the previous
        # debug step, not to every future step.
        current_stdout = _stdout_buf.getvalue()
        if _result["steps"]:
            _result["steps"][-1]["output"] = current_stdout[len(_last_stdout):].splitlines()
        _last_stdout = current_stdout
        line_no = frame.f_lineno
        variables = {
            name: _debug_value(value)
            for name, value in frame.f_locals.items()
            if not name.startswith("__") and name not in ("input",)
        }
        _result["steps"].append({
            "line": line_no,
            "code": _source_lines[line_no - 1].strip() if line_no <= len(_source_lines) else "",
            "variables": variables,
            "output": [],
        })
    return _trace

try:
    _result["graph"] = build_flowchart(_user_code)
except Exception:
    pass

_ns = {"__name__": "__main__", "input": _simulated_input}
try:
    with redirect_stdout(_stdout_buf), redirect_stderr(_stderr_buf):
        sys.settrace(_trace)
        try:
            exec(compile(_user_code, "<flowpy-debug>", "exec"), _ns)
        finally:
            sys.settrace(None)
except Exception as e:
    _result["error"] = _friendly_error(e)

# Capture a print on the final executed line, which has no following trace.
if _result["steps"]:
    current_stdout = _stdout_buf.getvalue()
    _result["steps"][-1]["output"] = current_stdout[len(_last_stdout):].splitlines()

for line in _stdout_buf.getvalue().splitlines():
    _result["lines"].append({"type": "stdout", "text": line})
for line in _stderr_buf.getvalue().splitlines():
    if line:
        _result["lines"].append({"type": "stderr", "text": line})
_result_json = json.dumps(_result)
_result_json
`

  try {
    const resultJson = (await pyodide.runPythonAsync(debuggerPy)) as string
    const result = JSON.parse(resultJson) as {
      lines: TerminalLine[]
      graph: FlowGraph | null
      steps: DebugStep[]
      error: string | null
    }
    const output = [...result.lines]
    if (result.error) output.push({ type: 'error', text: result.error })
    return { output, graph: result.graph, steps: result.steps, error: result.error }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { output: [{ type: 'error', text: message }], graph: null, steps: [], error: message }
  }
}

const FLOWCHART_PARSER_PY = `
import ast
import json

def _short(text, max_len=48):
    text = " ".join(text.split())
    if len(text) <= max_len:
        return text
    return text[: max_len - 1] + "…"

def _expr_label(node):
    if node is None:
        return ""
    try:
        return _short(ast.unparse(node))
    except Exception:
        # Some AST helper nodes (for example operators) cannot be unparsed on
        # every supported Python version.  Their class name is still clearer
        # than losing the whole diagram.
        return type(node).__name__.replace("Add", "+").replace("Sub", "-")

def _is_numpy_call(node):
    if not isinstance(node, ast.Call):
        return False
    func = node.func
    if isinstance(func, ast.Attribute):
        if isinstance(func.value, ast.Name) and func.value.id in ("np", "numpy"):
            return True
    if isinstance(func, ast.Name) and func.id in ("array", "arange", "linspace", "zeros", "ones"):
        return True
    return False

class FlowBuilder:
    def __init__(self):
        self.nodes = []
        self.edges = []
        self._counter = 0
        self.end_id = None
        self.function_names = set()

    def _new_id(self):
        self._counter += 1
        return f"n{self._counter}"

    def _add_node(self, ntype, label, function_name=None):
        nid = self._new_id()
        node = {"id": nid, "type": ntype, "label": _short(label, 56)}
        if function_name:
            node["functionName"] = function_name
        self.nodes.append(node)
        return nid

    def _connect(self, src, dst, label=None):
        if src and dst:
            edge = {"from": src, "to": dst}
            if label:
                edge["label"] = label
            self.edges.append(edge)

    def build(self, code):
        self.nodes = []
        self.edges = []
        self._counter = 0
        start = self._add_node("start", "Inicio")
        self.end_id = self._add_node("end", "Fin")
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            err = self._add_node("process", f"Error de sintaxis: {e.msg}")
            self._connect(start, err)
            self._connect(err, self.end_id)
            return {"nodes": self.nodes, "edges": self.edges}

        self.function_names = {
            node.name for node in ast.walk(tree)
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
        }
        body_exit = self._build_body(tree.body, start)
        self._connect(body_exit, self.end_id)
        return {"nodes": self.nodes, "edges": self.edges}

    def build_function(self, function_node):
        self.nodes = []
        self.edges = []
        self._counter = 0
        start = self._add_node("start", f"Inicio: {function_node.name}()")
        self.end_id = self._add_node("end", f"Fin: {function_node.name}()")
        body_exit = self._build_body(function_node.body, start)
        self._connect(body_exit, self.end_id)
        return {"nodes": self.nodes, "edges": self.edges}

    def _build_body(self, stmts, entry):
        prev = entry
        for stmt in stmts:
            try:
                prev = self._build_stmt(stmt, prev)
            except Exception as e:
                # Preserve the surrounding control-flow graph when one source
                # statement uses syntax we do not explicitly model yet.
                fallback = self._add_node("process", f"{type(stmt).__name__}: {_short(str(e), 36)}")
                self._connect(prev, fallback)
                prev = fallback
        return prev

    def _build_stmt(self, stmt, entry):
        if isinstance(stmt, ast.Assign):
            for target in stmt.targets:
                label = f"{_expr_label(target)} = {_expr_label(stmt.value)}"
                ntype = "numpy" if _is_numpy_call(stmt.value) else (
                    "function" if self._is_user_function_call(stmt.value) else "process"
                )
                function_name = self._function_call_name(stmt.value) if ntype == "function" else None
                nid = self._add_node(ntype, label, function_name)
                self._connect(entry, nid)
                entry = nid
            return entry

        if isinstance(stmt, ast.AugAssign):
            op = {
                ast.Add: "+", ast.Sub: "-", ast.Mult: "*", ast.Div: "/",
                ast.FloorDiv: "//", ast.Mod: "%", ast.Pow: "**", ast.BitOr: "|",
                ast.BitAnd: "&", ast.BitXor: "^", ast.LShift: "<<", ast.RShift: ">>",
            }.get(type(stmt.op), type(stmt.op).__name__)
            label = f"{_expr_label(stmt.target)} {op}= {_expr_label(stmt.value)}"
            nid = self._add_node("process", label)
            self._connect(entry, nid)
            return nid

        if isinstance(stmt, ast.AnnAssign) and stmt.value:
            label = f"{_expr_label(stmt.target)}: ... = {_expr_label(stmt.value)}"
            nid = self._add_node("process", label)
            self._connect(entry, nid)
            return nid

        if isinstance(stmt, ast.Expr):
            val = stmt.value
            if isinstance(val, ast.Call):
                if _is_numpy_call(val):
                    nid = self._add_node("numpy", _expr_label(val))
                elif self._is_user_function_call(val):
                    nid = self._add_node("function", _expr_label(val), self._function_call_name(val))
                elif isinstance(val.func, ast.Name) and val.func.id == "print":
                    args = ", ".join(_expr_label(a) for a in val.args)
                    nid = self._add_node("io", f"print({args})")
                else:
                    nid = self._add_node("process", _expr_label(val))
            else:
                nid = self._add_node("process", _expr_label(val))
            self._connect(entry, nid)
            return nid

        if isinstance(stmt, ast.If):
            cond = self._add_node("decision", f"¿{_expr_label(stmt.test)}?")
            self._connect(entry, cond)
            then_edge = len(self.edges)
            then_exit = self._build_body(stmt.body, cond)
            if len(self.edges) > then_edge:
                self.edges[then_edge]["label"] = "Sí"
            if stmt.orelse:
                else_edge = len(self.edges)
                else_exit = self._build_body(stmt.orelse, cond)
                if len(self.edges) > else_edge:
                    self.edges[else_edge]["label"] = "No"
            else:
                else_exit = cond
            merge = self._add_node("process", "continuar")
            self._connect(then_exit, merge)
            if stmt.orelse:
                self._connect(else_exit, merge)
            else:
                self._connect(cond, merge, "No")
            return merge

        if isinstance(stmt, (ast.For, ast.AsyncFor)):
            target = _expr_label(stmt.target)
            iter_ = _expr_label(stmt.iter)
            # A for loop is a decision repeated for every remaining element:
            # enter its body while an item is available, otherwise continue
            # with the statement after the loop.
            header = self._add_node("loop", f"¿siguiente {target} en {iter_}?")
            self._connect(entry, header)
            body_edge = len(self.edges)
            body_exit = self._build_body(stmt.body, header)
            if len(self.edges) > body_edge:
                self.edges[body_edge]["label"] = "Sí"
            self._connect(body_exit, header, "repetir")
            after = self._add_node("process", "continuar después del bucle")
            self._connect(header, after, "No")
            if stmt.orelse:
                else_exit = self._build_body(stmt.orelse, header)
                self._connect(else_exit, after)
            return after

        if isinstance(stmt, ast.While):
            cond = self._add_node("decision", f"¿{_expr_label(stmt.test)}?")
            self._connect(entry, cond)
            body_edge = len(self.edges)
            body_exit = self._build_body(stmt.body, cond)
            if len(self.edges) > body_edge:
                self.edges[body_edge]["label"] = "Sí"
            self._connect(body_exit, cond, "repetir")
            after = self._add_node("process", "fin del bucle")
            self._connect(cond, after, "No")
            return after

        if isinstance(stmt, (ast.FunctionDef, ast.AsyncFunctionDef)):
            # Definitions are available as subflows from their call nodes;
            # they do not execute in the main program flow.
            return entry

        if isinstance(stmt, ast.Return):
            val = _expr_label(stmt.value) if stmt.value else ""
            label = f"return {val}".strip()
            nid = self._add_node("process", label)
            self._connect(entry, nid)
            return nid

        if isinstance(stmt, ast.Import):
            names = ", ".join(a.name for a in stmt.names)
            nid = self._add_node("process", f"import {names}")
            self._connect(entry, nid)
            return nid

        if isinstance(stmt, ast.ImportFrom):
            names = ", ".join(a.name for a in stmt.names)
            nid = self._add_node("process", f"from {stmt.module} import {names}")
            self._connect(entry, nid)
            return nid

        if isinstance(stmt, ast.Break):
            nid = self._add_node("process", "break")
            self._connect(entry, nid)
            return nid

        if isinstance(stmt, ast.Continue):
            nid = self._add_node("process", "continue")
            self._connect(entry, nid)
            return nid

        if isinstance(stmt, ast.Pass):
            nid = self._add_node("process", "pass")
            self._connect(entry, nid)
            return nid

        label = type(stmt).__name__
        nid = self._add_node("process", label)
        self._connect(entry, nid)
        return nid

    def _is_user_function_call(self, node):
        return (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Name)
            and node.func.id in self.function_names
        )

    def _function_call_name(self, node):
        return node.func.id if self._is_user_function_call(node) else None

def build_flowchart(code):
    main_graph = FlowBuilder().build(code)
    try:
        tree = ast.parse(code)
        functions = {}
        names = {
            node.name for node in ast.walk(tree)
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
        }
        for node in tree.body:
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                builder = FlowBuilder()
                builder.function_names = names
                functions[node.name] = builder.build_function(node)
        if functions:
            main_graph["functions"] = functions
    except Exception:
        pass
    return main_graph
`

export const DEFAULT_CODE = `# ¡Bienvenido a FlowPy Studio!
# Escribe Python 3 aquí y mira el diagrama de flujo.

import numpy as np

# Crear un arreglo de números
numeros = np.array([1, 2, 3, 4, 5])

# Calcular el promedio
promedio = np.mean(numeros)

print("Los números son:", numeros)
print("El promedio es:", promedio)

# Usar un bucle para mostrar cada número
for n in numeros:
    if n > promedio:
        print(n, "está por encima del promedio")
    else:
        print(n, "está por debajo o igual al promedio")
`

export const EXAMPLES: { name: string; code: string }[] = [
  {
    name: 'Estructuras condicionales · if / else',
    code: `edad = 18

if edad >= 18:
    print("Puedes votar")
else:
    print("Aún no puedes votar")`,
  },
  {
    name: 'Estructuras iterativas · for',
    code: `for numero in range(1, 6):
    print("Número:", numero)`,
  },
  {
    name: 'Decisiones dentro de un bucle',
    code: `numeros = [3, 8, 12, 5, 20]

for numero in numeros:
    if numero >= 10:
        print(numero, "es mayor o igual a 10")
    else:
        print(numero, "es menor que 10")`,
  },
  {
    name: 'Arreglos y promedios con NumPy',
    code: `import numpy as np

datos = np.array([10, 20, 30, 40, 50])
promedio = np.mean(datos)

print("Datos:", datos)
print("Promedio:", promedio)`,
  },
  {
    name: 'Funciones y valores de retorno',
    code: `def calcular_total(numeros):
    total = sum(numeros)
    return total

valores = [4, 8, 15, 16]
resultado = calcular_total(valores)
print("Total:", resultado)`,
  },
  {
    name: 'Entrada de datos y ciclo while',
    code: `edad = int(input("¿Qué edad tienes?"))

while edad != 18:
    print("Todavía no tienes 18 años")
    edad = int(input("¿Qué edad tienes?"))

print("¡Ahora tienes 18 años!")`,
  },
]

export function layoutGraph(graph: FlowGraph): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()
  const adjacency = new Map<string, string[]>()
  const nodeOrder = new Map<string, number>()

  for (const [index, node] of graph.nodes.entries()) {
    adjacency.set(node.id, [])
    nodeOrder.set(node.id, index)
  }

  for (const edge of graph.edges) {
    adjacency.get(edge.from)?.push(edge.to)
  }

  const startId = graph.nodes.find((node) => node.type === 'start')?.id ?? graph.nodes[0]?.id
  const endId = graph.nodes.find((node) => node.type === 'end')?.id
  const layers = new Map<string, number>()

  // Nodes are emitted in source order by FlowBuilder.  Edges that go back to
  // an earlier node are the "repetir" links of a loop, not a new forward step.
  // Treating those as forward edges made breadth-first layout pull inner nodes
  // toward the top and left the chart visually tangled.
  const isForwardEdge = (from: string, to: string) => {
    if (to === endId) return true
    const fromOrder = nodeOrder.get(from) ?? -1
    const toOrder = nodeOrder.get(to) ?? -1
    return toOrder > fromOrder
  }

  if (startId) {
    layers.set(startId, 0)

    for (const node of graph.nodes) {
      if (node.id === endId) continue
      const layer = layers.get(node.id)
      if (layer === undefined) continue
      for (const next of adjacency.get(node.id) ?? []) {
        if (!isForwardEdge(node.id, next) || next === endId) continue
        layers.set(next, Math.max(layers.get(next) ?? 0, layer + 1))
      }
    }
  }

  // The end node is created before the AST body, so its numeric creation order
  // is not useful. It always belongs after the last reachable flow step.
  if (endId) {
    const lastLayer = Math.max(0, ...[...layers.entries()]
      .filter(([id]) => id !== endId)
      .map(([, layer]) => layer))
    layers.set(endId, lastLayer + 1)
  }

  for (const node of graph.nodes) {
    if (layers.has(node.id)) continue
    // Keep a diagram visible even for malformed or partially supported ASTs.
    layers.set(node.id, Math.max(0, ...layers.values()) + 1)
  }

  const byLayer = new Map<number, FlowNode[]>()
  for (const node of graph.nodes) {
    const layer = layers.get(node.id) ?? 0
    if (!byLayer.has(layer)) byLayer.set(layer, [])
    byLayer.get(layer)!.push(node)
  }

  const NODE_W = 220
  // Leave dedicated lanes for the Sí/No branches and loop-back arrows.
  // This keeps labels and connections legible in nested for + if diagrams.
  const GAP_X = 150
  const GAP_Y = 140
  const layerY = new Map<number, number>()
  let nextY = 0
  // Map preserves insertion order. The end node is allocated early by the
  // parser, so iterate by layer number instead of node creation order.
  const orderedLayers = [...byLayer.entries()].sort(([first], [second]) => first - second)

  // Decision nodes are considerably taller than normal process nodes. A fixed
  // row height made their lower half overlap the following layer, especially
  // in if statements nested inside loops.
  for (const [layer, nodes] of orderedLayers) {
    const tallestNode = Math.max(...nodes.map((node) => getNodeDimensions(node.type).h))
    layerY.set(layer, nextY + tallestNode / 2)
    nextY += tallestNode + GAP_Y
  }

  for (const [layer, nodes] of orderedLayers) {
    const totalWidth = nodes.length * NODE_W + (nodes.length - 1) * GAP_X
    let x = -totalWidth / 2 + NODE_W / 2
    for (const node of nodes) {
      positions.set(node.id, { x, y: layerY.get(layer) ?? 0 })
      x += NODE_W + GAP_X
    }
  }

  return positions
}

export function getNodeDimensions(type: FlowNode['type']): { w: number; h: number } {
  switch (type) {
    case 'decision':
      return { w: 200, h: 200 }
    case 'loop':
      return { w: 230, h: 80 }
    case 'start':
    case 'end':
      return { w: 160, h: 56 }
    default:
      return { w: 220, h: 72 }
  }
}
