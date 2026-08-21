import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Play,
  Sparkles,
  BookOpen,
  Code2,
  Loader2,
  ChevronDown,
  HelpCircle,
} from 'lucide-react'
import CodeEditor from './components/CodeEditor'
import Terminal from './components/Terminal'
import FlowchartView from './components/FlowchartView'
import {
  DEFAULT_CODE,
  EXAMPLES,
  initPyodide,
  runPythonCode,
} from './lib/pythonRunner'
import type { FlowGraph, TerminalLine } from './types'

type PyodideInstance = Awaited<ReturnType<typeof initPyodide>>

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([])
  const [flowGraph, setFlowGraph] = useState<FlowGraph | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isLoadingPyodide, setIsLoadingPyodide] = useState(true)
  const [loadStatus, setLoadStatus] = useState('Iniciando...')
  const [pyodide, setPyodide] = useState<PyodideInstance | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [activePanel, setActivePanel] = useState<'diagram' | 'terminal'>('diagram')
  const [sidePanelWidth, setSidePanelWidth] = useState(540)
  const [isResizingPanels, setIsResizingPanels] = useState(false)
  const resizeStart = useRef({ x: 0, width: 540 })

  useEffect(() => {
    if (!isResizingPanels) return

    const resize = (event: PointerEvent) => {
      const delta = resizeStart.current.x - event.clientX
      const maxWidth = Math.max(360, window.innerWidth - 380)
      setSidePanelWidth(Math.min(maxWidth, Math.max(360, resizeStart.current.width + delta)))
    }
    const stopResize = () => setIsResizingPanels(false)
    window.addEventListener('pointermove', resize)
    window.addEventListener('pointerup', stopResize)
    return () => {
      window.removeEventListener('pointermove', resize)
      window.removeEventListener('pointerup', stopResize)
    }
  }, [isResizingPanels])

  const startPanelResize = (event: React.PointerEvent<HTMLDivElement>) => {
    resizeStart.current = { x: event.clientX, width: sidePanelWidth }
    setIsResizingPanels(true)
  }

  useEffect(() => {
    initPyodide((msg) => setLoadStatus(msg))
      .then((instance) => {
        setPyodide(instance)
        setIsLoadingPyodide(false)
        setTerminalLines([{ type: 'info', text: 'Python 3 + NumPy listos. ¡Escribe tu código y presiona Ejecutar!' }])
      })
      .catch((err) => {
        setIsLoadingPyodide(false)
        setTerminalLines([{ type: 'error', text: `Error al cargar Python: ${err.message}` }])
      })
  }, [])

  const handleRun = useCallback(async () => {
    if (!pyodide || isRunning) return

    setIsRunning(true)
    setActivePanel('terminal')
    setTerminalLines([{ type: 'info', text: 'Ejecutando código...' }])
    setFlowGraph(null)

    try {
      const result = await runPythonCode(code, pyodide)
      setTerminalLines(result.output.length > 0 ? result.output : [{ type: 'info', text: '(sin salida)' }])
      setFlowGraph(result.graph)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTerminalLines([{ type: 'error', text: msg }])
    } finally {
      setIsRunning(false)
    }
  }, [code, pyodide, isRunning])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleRun])

  const loadExample = (exampleCode: string) => {
    setCode(exampleCode)
    setShowExamples(false)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="relative z-50 flex shrink-0 items-center gap-4 border-b border-slate-800 bg-slate-900/80 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 shadow-lg shadow-sky-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">FlowPy Studio</h1>
            <p className="text-[11px] text-slate-500">Aprende Python viendo diagramas de flujo</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Examples dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
            >
              <BookOpen className="h-4 w-4" />
              Ejemplos
              <ChevronDown className={`h-3.5 w-3.5 transition ${showExamples ? 'rotate-180' : ''}`} />
            </button>
            {showExamples && (
              <div className="absolute right-0 top-full z-50 mt-1 w-52 animate-fade-in overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-xl">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.name}
                    onClick={() => loadExample(ex.code)}
                    className="block w-full px-4 py-2.5 text-left text-sm text-slate-300 transition hover:bg-slate-700"
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="rounded-lg border border-slate-700 bg-slate-800/60 p-2 text-slate-400 transition hover:border-slate-600 hover:text-white"
            title="Ayuda"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          <button
            onClick={handleRun}
            disabled={isLoadingPyodide || isRunning || !pyodide}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Ejecutar
          </button>
        </div>
      </header>

      {/* Help banner */}
      {showHelp && (
        <div className="animate-fade-in border-b border-sky-800/40 bg-sky-950/40 px-5 py-3">
          <div className="mx-auto flex max-w-4xl flex-col gap-2 text-sm text-sky-200/80">
            <p>
              <strong className="text-sky-300">¿Cómo funciona?</strong> Escribe código Python en el editor,
              presiona <strong className="text-white">Ejecutar</strong> (o ⌘+Enter) y verás la salida en la
              terminal y un diagrama de flujo de tu programa.
            </p>
            <p>
              Los nodos <span className="text-teal-300">verdes (NumPy)</span> representan operaciones con
              arrays. Los <span className="text-amber-300">rombos</span> son decisiones (if/while). Los{' '}
              <span className="text-fuchsia-300">morados</span> son bucles.
            </p>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoadingPyodide && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          <p className="text-sm text-slate-400">{loadStatus}</p>
          <p className="max-w-sm text-center text-xs text-slate-600">
            Estamos cargando Python y NumPy en tu navegador. Solo ocurre la primera vez.
          </p>
        </div>
      )}

      {/* Main layout */}
      {!isLoadingPyodide && (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Code editor panel */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-slate-800">
            <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2">
              <Code2 className="h-4 w-4 text-sky-400" />
              <span className="text-sm font-medium text-slate-300">Editor Python 3</span>
              <span className="ml-auto rounded-md bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-500">
                numpy disponible
              </span>
            </div>
            <div className="min-h-0 flex-1 p-3">
              <CodeEditor value={code} onChange={setCode} />
            </div>
          </div>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Cambiar ancho de paneles"
            onPointerDown={startPanelResize}
            className="relative z-10 hidden w-1 shrink-0 cursor-col-resize bg-slate-800 transition hover:bg-sky-400 lg:block"
          />

          {/* Right panel: diagram + terminal */}
          <div
            className="flex min-h-0 w-full flex-col lg:w-[var(--side-panel-width)] lg:shrink-0"
            style={{ '--side-panel-width': `${sidePanelWidth}px` } as React.CSSProperties}
          >
            {/* Mobile tabs */}
            <div className="flex border-b border-slate-800 lg:hidden">
              <button
                onClick={() => setActivePanel('diagram')}
                className={`flex-1 py-2.5 text-sm font-medium transition ${
                  activePanel === 'diagram'
                    ? 'border-b-2 border-violet-400 text-violet-300'
                    : 'text-slate-500'
                }`}
              >
                Diagrama
              </button>
              <button
                onClick={() => setActivePanel('terminal')}
                className={`flex-1 py-2.5 text-sm font-medium transition ${
                  activePanel === 'terminal'
                    ? 'border-b-2 border-emerald-400 text-emerald-300'
                    : 'text-slate-500'
                }`}
              >
                Salida
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
              <div
                className={`min-h-0 flex-1 ${
                  activePanel === 'diagram' ? 'block' : 'hidden lg:block'
                }`}
              >
                <FlowchartView graph={flowGraph} isLoading={isRunning} />
              </div>
              <div
                className={`min-h-0 flex-1 ${
                  activePanel === 'terminal' ? 'block' : 'hidden lg:block'
                } lg:max-h-[40%]`}
              >
                <Terminal lines={terminalLines} isRunning={isRunning} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close examples */}
      {showExamples && (
        <div className="fixed inset-0 z-40" onClick={() => setShowExamples(false)} />
      )}
    </div>
  )
}
