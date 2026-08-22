import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Play,
  Sparkles,
  BookOpen,
  Code2,
  Loader2,
  ChevronDown,
  HelpCircle,
  Bug,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import CodeEditor from './components/CodeEditor'
import Terminal from './components/Terminal'
import FlowchartView from './components/FlowchartView'
import {
  DEFAULT_CODE,
  debugPythonCode,
  EXAMPLES,
  initPyodide,
  runPythonCode,
} from './lib/pythonRunner'
import type { DebugStep, FlowGraph, TerminalLine } from './types'

type PyodideInstance = Awaited<ReturnType<typeof initPyodide>>

function getInputPrompt(error: string | null): string | null {
  if (!error?.startsWith('FLOWPY_INPUT:')) return null
  return error.slice('FLOWPY_INPUT:'.length)
}

function getSyntaxErrorLine(error: string | null): number | undefined {
  const normalized = error?.toLowerCase() ?? ''
  if (!normalized.includes('syntax') && !normalized.includes('sintaxis')) return undefined
  const match = normalized.match(/line\s+(\d+)/i)
  return match ? Number(match[1]) : undefined
}

function DebugPanel({
  steps,
  stepIndex,
  output,
  inputPanel,
  canNext = false,
  onPrevious,
  onNext,
}: {
  steps: DebugStep[]
  stepIndex: number
  output: TerminalLine[]
  inputPanel?: React.ReactNode
  canNext?: boolean
  onPrevious: () => void
  onNext: () => void
}) {
  const step = steps[stepIndex]
  const previousVariables = steps[stepIndex - 1]?.variables ?? {}

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-amber-500/30 bg-slate-950">
      <div className="flex items-center gap-2 border-b border-amber-500/20 px-3 py-2">
        <Bug className="h-4 w-4 text-amber-300" />
        <span className="text-sm font-medium text-slate-200">Depuración paso a paso</span>
        <span className="ml-auto text-xs text-slate-500">
          {steps.length ? `${stepIndex + 1} / ${steps.length}` : 'sin pasos'}
        </span>
      </div>

      {step ? (
        <div className="min-h-0 flex-1 overflow-auto p-3">
          <p className="mb-3 font-mono text-xs text-amber-200">
            Línea {step.line}: <span className="text-slate-300">{step.code || '(línea vacía)'}</span>
          </p>
          <p className="mb-2 text-xs font-medium text-slate-400">Variables antes de ejecutar esta línea</p>
          <div className="grid gap-2 font-mono text-xs sm:grid-cols-2">
            {Object.entries(step.variables).length ? (
              Object.entries(step.variables).map(([name, value]) => {
                const isNew = !(name in previousVariables)
                const hasChanged = !isNew && previousVariables[name] !== value
                return (
                <div
                  key={name}
                  className={`min-w-0 rounded-lg border bg-slate-900/80 p-2 shadow-sm ${
                    isNew || hasChanged ? 'border-amber-400/60 ring-1 ring-amber-400/15' : 'border-sky-500/20'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    <span>Variable</span>
                    {(isNew || hasChanged) && (
                      <span className="rounded bg-amber-400/15 px-1 py-0.5 text-[9px] text-amber-200">
                        {isNew ? 'nueva' : 'cambió'}
                      </span>
                    )}
                  </div>
                  <div className="truncate text-violet-300">{name}</div>
                  <div className="mt-1 break-words rounded bg-slate-950 px-1.5 py-1 text-sky-200">{value}</div>
                </div>
                )
              })
            ) : (
              <p className="text-slate-600">Aún no hay variables.</p>
            )}
          </div>

        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-slate-500">
          No se ejecutaron líneas para depurar.
        </div>
      )}

      <div className="flex justify-between border-t border-slate-800 p-2">
        <button
          onClick={onPrevious}
          disabled={stepIndex === 0}
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </button>
        <button
          onClick={onNext}
          disabled={!steps.length || !canNext}
          className="flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-1.5 text-xs text-amber-200 hover:bg-amber-500/25 disabled:opacity-40"
        >
          Siguiente <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="h-[38%] min-h-28 border-t border-slate-800">
        <div className="flex h-full min-h-0 flex-col">
          <div className="min-h-0 flex-1">
            <Terminal lines={output} isRunning={false} />
          </div>
          {inputPanel}
        </div>
      </div>
    </div>
  )
}

function InputPanel({
  mode,
  prompts,
  values,
  onChange,
  onCancel,
  onSubmit,
  embedded = false,
  output = [],
}: {
  mode: 'run' | 'debug'
  prompts: string[]
  values: string[]
  onChange: (index: number, value: string) => void
  onCancel: () => void
  onSubmit: () => void
  embedded?: boolean
  output?: TerminalLine[]
}) {
  const requestForm = (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className={embedded ? 'shrink-0 border-t border-sky-400/20 bg-slate-950 p-2' : 'shrink-0 border-t border-sky-400/20 p-4'}
    >
      <p className="mb-2 font-mono text-xs text-emerald-300">› El programa solicita una entrada para continuar.</p>
      <div className="space-y-2">
        {prompts.map((prompt, index) => (
          <label key={`${prompt}-${index}`} className="block font-mono text-sm text-emerald-300">
            › {prompt || `Entrada ${index + 1}`}
            <input
              autoFocus={index === 0}
              value={values[index] ?? ''}
              onChange={(event) => onChange(index, event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-sky-100 outline-none transition focus:border-sky-400"
            />
          </label>
        ))}
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800">
          Cancelar
        </button>
        <button type="submit" className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-400">
          {mode === 'debug' ? 'Continuar Debug' : 'Continuar'}
        </button>
      </div>
    </form>
  )

  if (embedded) return requestForm

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-sky-400/30 bg-[#0d1117]">
      <div className="min-h-0 flex-1">
        <Terminal lines={output} isRunning={false} />
      </div>
      {requestForm}
    </div>
  )
}

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
  const [debugSteps, setDebugSteps] = useState<DebugStep[] | null>(null)
  const [debugStepIndex, setDebugStepIndex] = useState(0)
  const [sidePanelWidth, setSidePanelWidth] = useState(540)
  const [isResizingPanels, setIsResizingPanels] = useState(false)
  const [bottomPanelHeight, setBottomPanelHeight] = useState(320)
  const [isResizingBottomPanel, setIsResizingBottomPanel] = useState(false)
  const [pendingInputMode, setPendingInputMode] = useState<'run' | 'debug' | null>(null)
  const [inputPrompts, setInputPrompts] = useState<string[]>([])
  const [inputValues, setInputValues] = useState<string[]>([])
  const [queuedInputValues, setQueuedInputValues] = useState<string[]>([])
  const [deferredDebugInput, setDeferredDebugInput] = useState<{ prompt: string; inputs: string[] } | null>(null)
  const [debugHistorySteps, setDebugHistorySteps] = useState<DebugStep[]>([])
  const [syntaxErrorLine, setSyntaxErrorLine] = useState<number | undefined>()
  const [hasRestoredCode, setHasRestoredCode] = useState(false)
  const resizeStart = useRef({ x: 0, width: 540 })
  const bottomResizeStart = useRef({ y: 0, height: 320 })

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

  useEffect(() => {
    if (!isResizingBottomPanel) return

    const resize = (event: PointerEvent) => {
      const delta = bottomResizeStart.current.y - event.clientY
      const maxHeight = Math.max(220, window.innerHeight - 260)
      setBottomPanelHeight(Math.min(maxHeight, Math.max(170, bottomResizeStart.current.height + delta)))
    }
    const stopResize = () => setIsResizingBottomPanel(false)
    window.addEventListener('pointermove', resize)
    window.addEventListener('pointerup', stopResize)
    return () => {
      window.removeEventListener('pointermove', resize)
      window.removeEventListener('pointerup', stopResize)
    }
  }, [isResizingBottomPanel])

  const startPanelResize = (event: React.PointerEvent<HTMLDivElement>) => {
    resizeStart.current = { x: event.clientX, width: sidePanelWidth }
    setIsResizingPanels(true)
  }

  const startBottomPanelResize = (event: React.PointerEvent<HTMLDivElement>) => {
    bottomResizeStart.current = { y: event.clientY, height: bottomPanelHeight }
    setIsResizingBottomPanel(true)
  }

  useEffect(() => {
    initPyodide((msg) => setLoadStatus(msg))
      .then((instance) => {
        setPyodide(instance)
        setIsLoadingPyodide(false)
        setTerminalLines([{ type: 'info', text: '¡Escribe tu código y presiona Ejecutar!' }])
      })
      .catch((err) => {
        setIsLoadingPyodide(false)
        setTerminalLines([{ type: 'error', text: `Error al cargar Python: ${err.message}` }])
      })
  }, [])

  useEffect(() => {
    try {
      const savedCode = window.localStorage.getItem('flowpy-code')
      if (savedCode) setCode(savedCode)
    } catch {
      // The editor remains usable when browser storage is unavailable.
    } finally {
      setHasRestoredCode(true)
    }
  }, [])

  useEffect(() => {
    if (!hasRestoredCode) return
    try {
      window.localStorage.setItem('flowpy-code', code)
    } catch {
      // Saving is best-effort; do not interrupt editing in private/restricted modes.
    }
  }, [code, hasRestoredCode])

  const waitForInput = (mode: 'run' | 'debug', prompt: string, previousInputs: string[]) => {
    setQueuedInputValues(previousInputs)
    setInputPrompts([prompt])
    setInputValues([''])
    setPendingInputMode(mode)
    setActivePanel('terminal')
  }

  const executeRun = useCallback(async (inputs: string[]) => {
    if (!pyodide || isRunning) return

    setIsRunning(true)
    setActivePanel('terminal')
    setTerminalLines([{ type: 'info', text: 'Ejecutando código...' }])
    setFlowGraph(null)
    setDebugSteps(null)
    setDeferredDebugInput(null)

    try {
      const result = await runPythonCode(code, pyodide, inputs)
      setSyntaxErrorLine(getSyntaxErrorLine(result.error))
      const prompt = getInputPrompt(result.error)
      if (prompt !== null) {
        setFlowGraph(result.graph)
        setTerminalLines(result.output.filter((line) => line.text !== result.error))
        waitForInput('run', prompt, inputs)
        return
      }
      setTerminalLines(result.output.length > 0 ? result.output : [{ type: 'info', text: '(sin salida)' }])
      setFlowGraph(result.graph)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTerminalLines([{ type: 'error', text: msg }])
    } finally {
      setIsRunning(false)
    }
  }, [code, pyodide, isRunning])

  const executeDebug = useCallback(async (inputs: string[], previousSteps: DebugStep[] = []) => {
    if (!pyodide || isRunning) return

    setIsRunning(true)
    setActivePanel('terminal')
    setTerminalLines([{ type: 'info', text: 'Preparando depuración...' }])
    setFlowGraph(null)
    setDebugSteps(null)

    try {
      const result = await debugPythonCode(code, pyodide, inputs)
      setSyntaxErrorLine(getSyntaxErrorLine(result.error))
      // Input simulation replays the already-known answers internally. Keep
      // only the unseen trace tail so the UI continues from the current line.
      const continuedSteps = [...previousSteps, ...result.steps.slice(previousSteps.length)]
      const prompt = getInputPrompt(result.error)
      if (prompt !== null) {
        setFlowGraph(result.graph)
        setTerminalLines(result.output.filter((line) => line.text !== result.error))
        setDebugSteps(continuedSteps)
        setDebugStepIndex(previousSteps.length)
        setDeferredDebugInput({ prompt, inputs })
        return
      }
      setTerminalLines(result.output.length > 0 ? result.output : [{ type: 'info', text: '(sin salida)' }])
      setFlowGraph(result.graph)
      setDebugSteps(continuedSteps)
      setDebugStepIndex(previousSteps.length)
      setDeferredDebugInput(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTerminalLines([{ type: 'error', text: msg }])
    } finally {
      setIsRunning(false)
    }
  }, [code, pyodide, isRunning])

  const handleRun = useCallback(() => executeRun([]), [executeRun])
  const handleDebug = useCallback(() => {
    setDebugHistorySteps([])
    executeDebug([])
  }, [executeDebug])

  const nextDebugStep = () => {
    if (!debugSteps) return
    if (deferredDebugInput && debugStepIndex >= debugSteps.length - 1) {
      const { prompt, inputs } = deferredDebugInput
      setDeferredDebugInput(null)
      setDebugHistorySteps(debugSteps)
      waitForInput('debug', prompt, inputs)
      return
    }
    setDebugStepIndex((index) => Math.min(debugSteps.length - 1, index + 1))
  }

  const submitInputs = () => {
    const mode = pendingInputMode
    setPendingInputMode(null)
    const inputs = [...queuedInputValues, inputValues[0] ?? '']
    if (mode === 'run') executeRun(inputs)
    if (mode === 'debug') executeDebug(inputs, debugHistorySteps)
  }

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
    setSyntaxErrorLine(undefined)
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
            <p className="text-[11px] text-slate-500">Aprendiendo Python</p>
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
              <div className="absolute right-0 top-full z-50 mt-1 w-72 animate-fade-in overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-xl">
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
            onClick={handleDebug}
            disabled={isLoadingPyodide || isRunning || !pyodide}
            className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            title="Ejecutar paso a paso"
          >
            <Bug className="h-4 w-4" />
            Debug
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
            </div>
            <div className="min-h-0 flex-1 p-3">
              <CodeEditor
                value={code}
                onChange={(value) => {
                  setCode(value)
                  setSyntaxErrorLine(undefined)
                }}
                activeLine={debugSteps?.[debugStepIndex]?.line}
                debugVariables={debugSteps?.[debugStepIndex]?.variables}
                errorLine={syntaxErrorLine}
              />
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

            <div className="flex min-h-0 flex-1 flex-col p-3">
              <div
                className={`min-h-0 flex-1 pb-1.5 ${
                  activePanel === 'diagram' ? 'block' : 'hidden lg:block'
                }`}
              >
                <FlowchartView graph={flowGraph} isLoading={isRunning} />
              </div>
              <div
                role="separator"
                aria-orientation="horizontal"
                aria-label="Cambiar alto de diagrama y salida"
                onPointerDown={startBottomPanelResize}
                className="relative z-10 hidden h-1 shrink-0 cursor-row-resize bg-slate-800 transition hover:bg-sky-400 lg:block"
              />
              <div
                className={`min-h-0 flex-1 pt-1.5 lg:h-[var(--bottom-panel-height)] lg:flex-none ${
                  activePanel === 'terminal' ? 'block' : 'hidden lg:block'
                }`}
                style={{ '--bottom-panel-height': `${bottomPanelHeight}px` } as React.CSSProperties}
              >
                {pendingInputMode === 'debug' && debugSteps ? (
                  <DebugPanel
                    steps={debugSteps}
                    stepIndex={debugStepIndex}
                    output={[
                      ...debugSteps
                        .slice(0, debugStepIndex + 1)
                        .flatMap((step) => step.output.map((text) => ({ type: 'stdout' as const, text }) as TerminalLine)),
                      ...terminalLines.filter((line) => line.type === 'error' || line.type === 'stderr'),
                    ]}
                    inputPanel={
                      <InputPanel
                        mode="debug"
                        embedded
                        prompts={inputPrompts}
                        values={inputValues}
                        onChange={(index, value) =>
                          setInputValues((values) => values.map((current, currentIndex) => (
                            currentIndex === index ? value : current
                          )))
                        }
                        onCancel={() => {
                          setPendingInputMode(null)
                          setQueuedInputValues([])
                        }}
                        onSubmit={submitInputs}
                      />
                    }
                    onPrevious={() => setDebugStepIndex((index) => Math.max(0, index - 1))}
                    onNext={nextDebugStep}
                    canNext={Boolean(deferredDebugInput) || debugStepIndex < debugSteps.length - 1}
                  />
                ) : pendingInputMode ? (
                  <InputPanel
                    mode={pendingInputMode}
                    output={terminalLines}
                    prompts={inputPrompts}
                    values={inputValues}
                    onChange={(index, value) =>
                      setInputValues((values) => values.map((current, currentIndex) => (
                        currentIndex === index ? value : current
                      )))
                    }
                    onCancel={() => {
                      setPendingInputMode(null)
                      setQueuedInputValues([])
                    }}
                    onSubmit={submitInputs}
                  />
                ) : debugSteps ? (
                  <DebugPanel
                    steps={debugSteps}
                    stepIndex={debugStepIndex}
                    output={[
                      ...debugSteps
                        .slice(0, debugStepIndex + 1)
                        .flatMap((step) => step.output.map((text) => ({ type: 'stdout' as const, text }) as TerminalLine)),
                      ...terminalLines.filter((line) => line.type === 'error' || line.type === 'stderr'),
                    ]}
                    onPrevious={() => setDebugStepIndex((index) => Math.max(0, index - 1))}
                    onNext={nextDebugStep}
                    canNext={Boolean(deferredDebugInput) || debugStepIndex < debugSteps.length - 1}
                  />
                ) : (
                  <Terminal lines={terminalLines} isRunning={isRunning} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close examples */}
      {showExamples && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowExamples(false)
          }}
        />
      )}

    </div>
  )
}
