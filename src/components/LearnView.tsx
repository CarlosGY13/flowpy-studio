import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Archive,
  BookOpenCheck,
  Boxes,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Code2,
  Factory,
  Lightbulb,
  Pause,
  Play,
  Target,
  X,
} from 'lucide-react'
import { LESSONS, type LessonVisual } from '../learningData'
import CodeEditor from './CodeEditor'

const colorClasses: Record<string, string> = {
  sky: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  violet: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
  emerald: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  amber: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
}

function AnimationTimeline({ frame, paused, onSelect, onToggle }: { frame: number; paused: boolean; onSelect: (frame: number) => void; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-center gap-3" aria-label="Controles de animación">
      <button onClick={onToggle} className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-950/70 text-slate-400 transition hover:border-sky-400/40 hover:text-sky-200" title={paused ? 'Reproducir animación' : 'Pausar animación'} aria-label={paused ? 'Reproducir animación' : 'Pausar animación'}>
        {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
      </button>
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((index) => (
          <button key={index} onClick={() => onSelect(index)} className={`h-2 rounded-full transition-all duration-300 ${index === frame ? 'w-8 bg-sky-300' : 'w-3 bg-slate-700 hover:bg-slate-500'}`} title={`Ver paso ${index + 1}`} aria-label={`Ver paso ${index + 1}`} />
        ))}
      </div>
      <span className="w-8 text-right font-mono text-[9px] text-slate-600">{frame + 1}/4</span>
    </div>
  )
}

function AnalogyScene({ scene }: { scene: (typeof LESSONS)[number]['analogy']['scene'] }) {
  const [assignmentStep, setAssignmentStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const timer = window.setInterval(() => setAssignmentStep((step) => (step + 1) % 4), 2400)
    return () => window.clearInterval(timer)
  }, [scene, isPaused])

  const selectFrame = (frame: number) => {
    setAssignmentStep(frame)
    setIsPaused(true)
  }

  if (scene === 'wallet') {
    const incomeValue = assignmentStep < 1 ? null : assignmentStep >= 3 ? '4000.0' : '3200.0'
    const percentageValue = assignmentStep < 2 ? null : '10'
    const notes = ['Dos variables, todavía sin valor', 'Asignamos un valor a ingreso', 'Asignamos un valor a tasa_ahorro', 'Reasignamos ingreso; tasa_ahorro no cambia']
    return (
      <div className="flex min-h-56 flex-col justify-center overflow-hidden px-4 py-5">
        <div className="mb-3"><AnimationTimeline frame={assignmentStep} paused={isPaused} onSelect={selectFrame} onToggle={() => setIsPaused((paused) => !paused)} /></div>
        <p className="mb-3 min-h-4 text-center text-xs text-slate-300">{notes[assignmentStep]}</p>
        <div className="flex items-stretch justify-center gap-3 font-mono">
          <div className={`min-w-32 rounded-xl border border-sky-300/40 bg-sky-400/15 p-3 text-center transition-all duration-500 ${assignmentStep === 1 || assignmentStep === 3 ? 'scale-[1.03] ring-2 ring-sky-300/30' : ''}`}>
            <span className="block text-[9px] text-slate-400">variable</span>
            <strong className="mt-1 block text-xs text-white">ingreso</strong>
            <span key={incomeValue ?? 'empty-income'} className="assignment-value mt-3 block min-h-9 rounded-lg bg-slate-950/60 px-2 py-2 text-sm text-sky-100">{incomeValue ?? 'vacío'}</span>
            <span className="mt-1 block text-[9px] text-slate-500">float</span>
          </div>
          <div className={`min-w-32 rounded-xl border border-violet-300/40 bg-violet-400/15 p-3 text-center transition-all duration-500 ${assignmentStep === 2 ? 'scale-[1.03] ring-2 ring-violet-300/30' : ''}`}>
            <span className="block text-[9px] text-slate-400">variable</span>
            <strong className="mt-1 block text-xs text-white">tasa_ahorro</strong>
            <span key={percentageValue ?? 'empty-percentage'} className="assignment-value mt-3 block min-h-9 rounded-lg bg-slate-950/60 px-2 py-2 text-sm text-violet-100">{percentageValue ?? 'vacío'}</span>
            <span className="mt-1 block text-[9px] text-slate-500">int</span>
          </div>
        </div>
        {assignmentStep === 3 && <p className="mt-2 animate-fade-in text-center text-[11px] text-slate-400"><span className="line-through">3200.0</span> → 4000.0</p>}
      </div>
    )
  }

  if (scene === 'scale') {
    const operationNotes = [
      'Partimos de dos precios',
      'Calculamos cuánto cambió el precio',
      'Convertimos el cambio en un retorno',
      'La comparación enciende una respuesta lógica',
    ]
    return (
      <div className="flex min-h-56 flex-col justify-center px-4 py-5">
        <div className="mb-3"><AnimationTimeline frame={assignmentStep} paused={isPaused} onSelect={selectFrame} onToggle={() => setIsPaused((paused) => !paused)} /></div>
        <p className="mb-3 min-h-4 text-center text-xs text-slate-300">{operationNotes[assignmentStep]}</p>
        <div className="flex justify-center gap-3 font-mono">
          <div className="w-28 rounded-xl border border-sky-300/30 bg-sky-400/10 p-3 text-center"><span className="block text-[9px] text-slate-500">precio_compra</span><strong className="mt-2 block text-lg text-sky-100">48</strong></div>
          <div className="w-28 rounded-xl border border-violet-300/30 bg-violet-400/10 p-3 text-center"><span className="block text-[9px] text-slate-500">precio_actual</span><strong className="mt-2 block text-lg text-violet-100">54</strong></div>
        </div>
        <div className="mt-3 min-h-16">
          {assignmentStep === 0 && <p className="animate-fade-in py-4 text-center font-mono text-xs text-slate-500">48 → 54</p>}
          {assignmentStep === 1 && <p className="animate-fade-in rounded-lg bg-slate-950/60 px-3 py-3 text-center font-mono text-sm text-amber-200">cambio = 54 - 48 = 6</p>}
          {assignmentStep === 2 && <p className="animate-fade-in rounded-lg bg-slate-950/60 px-3 py-3 text-center font-mono text-sm text-sky-200">retorno = 6 / 48 = 12.5%</p>}
          {assignmentStep === 3 && <div className="animate-fade-in flex items-center justify-center gap-3 rounded-lg bg-slate-950/60 px-3 py-2 font-mono"><div className="text-center"><Lightbulb className="mx-auto h-6 w-6 fill-emerald-300 text-emerald-300" /><p className="text-[9px] text-slate-500">ganancia</p></div><span className="text-xs text-violet-300">and</span><div className="text-center"><Lightbulb className="mx-auto h-6 w-6 fill-emerald-300 text-emerald-300" /><p className="text-[9px] text-slate-500">meta 10%</p></div><ArrowRight className="h-4 w-4 text-slate-500" /><strong className="text-emerald-300">True</strong></div>}
        </div>
      </div>
    )
  }

  if (scene === 'train') {
    const activeListIndex = assignmentStep === 1 ? 0 : assignmentStep === 2 ? 2 : assignmentStep === 3 ? 4 : -1
    const listNotes = ['La lista conserva cinco saldos en orden', 'saldos[0] busca desde el inicio', 'saldos[2] avanza dos posiciones', 'saldos[-1] busca desde el final']
    return (
      <div className="flex min-h-56 flex-col justify-center overflow-hidden px-3 py-5">
        <div className="mb-3"><AnimationTimeline frame={assignmentStep} paused={isPaused} onSelect={selectFrame} onToggle={() => setIsPaused((paused) => !paused)} /></div>
        <p className="mb-4 text-center text-xs text-slate-300">{listNotes[assignmentStep]}</p>
        <div className="flex items-end justify-center gap-1">
          {['1200', '1320', '1280', '1450', '1510'].map((value, index) => (
            <div key={value} className={`min-w-12 rounded-lg border px-2 py-3 text-center font-mono transition-all duration-500 ${activeListIndex === index ? 'scale-105 border-amber-300/60 bg-amber-400/20 text-amber-100 ring-2 ring-amber-300/20' : 'border-violet-300/20 bg-violet-400/10 text-violet-100'}`}><span className="block text-[9px] text-slate-500">[{index}]</span>{value}</div>
          ))}
        </div>
        <p className="mt-3 min-h-5 text-center font-mono text-xs text-sky-200">{assignmentStep === 1 ? 'saldos[0] → 1200' : assignmentStep === 2 ? 'saldos[2] → 1280' : assignmentStep === 3 ? 'saldos[-1] → 1510' : 'saldos = [...]'}</p>
      </div>
    )
  }

  if (scene === 'archive') {
    const archiveNotes = ['El diccionario organiza fichas mediante claves', 'Elegimos la clave "ETF"', 'Dentro de ETF buscamos la clave "riesgo"', 'Python devuelve el valor "medio"']
    return (
      <div className="flex min-h-56 flex-col justify-center px-3 py-5">
        <div className="mb-3"><AnimationTimeline frame={assignmentStep} paused={isPaused} onSelect={selectFrame} onToggle={() => setIsPaused((paused) => !paused)} /></div>
        <p className="mb-3 text-center text-xs text-slate-300">{archiveNotes[assignmentStep]}</p>
        <div className="flex items-center justify-start gap-3 overflow-x-auto pb-1 font-mono sm:justify-center">
          <div className="rounded-xl border border-sky-300/30 bg-sky-400/10 p-3 text-center"><Archive className="mx-auto h-7 w-7 text-sky-300" /><span className="mt-1 block text-[10px] text-sky-100">portafolio</span></div>
          {assignmentStep >= 1 && <><ArrowRight className="h-4 w-4 text-slate-600" /><div className="animate-fade-in rounded-xl border border-violet-300/30 bg-violet-400/10 p-3 text-center text-violet-100"><span className="text-[10px]">[&quot;ETF&quot;]</span></div></>}
          {assignmentStep >= 2 && <><ArrowRight className="h-4 w-4 text-slate-600" /><div className="animate-fade-in rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-center text-amber-100"><span className="text-[10px]">[&quot;riesgo&quot;]</span></div></>}
          {assignmentStep >= 3 && <><ArrowRight className="h-4 w-4 text-slate-600" /><strong className="animate-fade-in rounded-lg bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">&quot;medio&quot;</strong></>}
        </div>
        <p className="mt-4 min-h-5 text-center font-mono text-[10px] text-slate-500">portafolio[&quot;ETF&quot;][&quot;riesgo&quot;]</p>
      </div>
    )
  }

  if (scene === 'blueprint') {
    const classNotes = ['La clase Cuenta define la plantilla', 'Creamos cuenta_ana desde la plantilla', 'Creamos cuenta_luis con otros datos', 'depositar(200) modifica solo cuenta_ana']
    return (
      <div className="flex min-h-56 flex-col justify-center px-3 py-5">
        <div className="mb-3"><AnimationTimeline frame={assignmentStep} paused={isPaused} onSelect={selectFrame} onToggle={() => setIsPaused((paused) => !paused)} /></div>
        <p className="mb-3 text-center text-xs text-slate-300">{classNotes[assignmentStep]}</p>
        <div className="flex items-center justify-start gap-2 overflow-x-auto pb-1 font-mono sm:justify-center">
          <div className="rounded-xl border border-sky-300/30 bg-sky-400/10 p-3 text-center"><Code2 className="mx-auto h-7 w-7 text-sky-300" /><strong className="mt-1 block text-xs text-sky-100">class Cuenta</strong><span className="text-[9px] text-slate-500">titular · saldo</span></div>
          {assignmentStep >= 1 && <ArrowRight className="h-4 w-4 text-slate-600" />}
          {assignmentStep >= 1 && <div className={`animate-fade-in rounded-xl border p-3 text-center ${assignmentStep === 3 ? 'border-emerald-300/50 bg-emerald-400/15' : 'border-violet-300/30 bg-violet-400/10'}`}><strong className="block text-[10px] text-white">cuenta_ana</strong><span className="mt-1 block text-xs text-violet-200">Ana</span><span className="block text-xs text-emerald-200">S/ {assignmentStep === 3 ? '1000' : '800'}</span></div>}
          {assignmentStep >= 2 && <div className="animate-fade-in rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-center"><strong className="block text-[10px] text-white">cuenta_luis</strong><span className="mt-1 block text-xs text-amber-100">Luis</span><span className="block text-xs text-emerald-200">S/ 1200</span></div>}
        </div>
        <p className="mt-3 min-h-5 text-center font-mono text-[10px] text-slate-500">{assignmentStep === 3 ? 'cuenta_ana.depositar(200)' : assignmentStep > 0 ? 'Cuenta(titular, saldo)' : 'class Cuenta: ...'}</p>
      </div>
    )
  }

  const machine = scene === 'machine'
  const processNotes = machine
    ? ['Creamos un array de rendimientos', 'Definimos un escenario de +2', 'NumPy suma 2 a cada posición', 'Obtenemos un array nuevo']
    : ['La función define tres parámetros', 'Enviamos tres argumentos', 'La fórmula procesa esos valores', 'return entrega el resultado']
  const inputValues = machine ? ['-1.2', '0.8', '2.1'] : ['1000', '8%', '3 años']
  return (
    <div className="flex min-h-56 flex-col justify-center overflow-hidden px-3 py-5">
      <div className="mb-3"><AnimationTimeline frame={assignmentStep} paused={isPaused} onSelect={selectFrame} onToggle={() => setIsPaused((paused) => !paused)} /></div>
      <p className="mb-3 text-center text-xs text-slate-300">{processNotes[assignmentStep]}</p>
      <div className="flex items-center justify-start gap-2 overflow-x-auto pb-1 font-mono text-xs sm:justify-center">
        <div className="flex gap-1">{inputValues.map((value) => <span key={value} className="rounded-md bg-sky-400/10 px-2 py-2 text-sky-200">{value}</span>)}</div>
        {machine && assignmentStep >= 1 && <><ArrowRight className="h-4 w-4 shrink-0 text-slate-500" /><span className="animate-fade-in rounded-lg bg-amber-400/10 px-2 py-2 text-amber-200">+ 2.0</span></>}
        {assignmentStep >= 2 && <><ArrowRight className="h-4 w-4 shrink-0 text-slate-500" /><div className="animate-fade-in rounded-xl border border-violet-300/30 bg-violet-400/10 p-3 text-center">{machine ? <Boxes className="mx-auto h-6 w-6 text-violet-200" /> : <Factory className="mx-auto h-6 w-6 text-violet-200" />}<span className="mt-1 block text-[10px] text-violet-100">{machine ? 'array + escenario' : 'proyectar_ahorro()'}</span></div></>}
        {assignmentStep >= 3 && <><ArrowRight className="h-4 w-4 shrink-0 text-slate-500" /><strong className="animate-fade-in rounded-lg bg-emerald-400/10 px-2 py-3 text-emerald-200">{machine ? '[0.8, 2.8, 4.1]' : '1259.71'}</strong></>}
      </div>
      {!machine && <div className={`mx-auto mt-3 max-w-md rounded-lg border border-amber-300/15 bg-amber-400/[0.05] px-3 py-2 text-center text-[10px] leading-4 text-slate-400 transition-opacity ${assignmentStep >= 1 ? 'opacity-100' : 'opacity-0'}`}><span className="text-amber-200">1000, 8 y 3</span> son argumentos. Dentro de la función se guardan en los parámetros <span className="font-mono text-sky-200">capital</span>, <span className="font-mono text-sky-200">tasa_anual</span> y <span className="font-mono text-sky-200">anios</span>.</div>}
    </div>
  )
}

function NumberField({ label, value, onChange, min = 0, max = 10000, step = 1 }: { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
      <input type="number" min={min} max={max} step={step} value={value} onChange={(event) => { if (event.target.value !== '') onChange(Number(event.target.value)) }} onBlur={(event) => { if (event.target.value === '') event.target.value = String(value) }} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-sky-100 outline-none focus:border-sky-400" />
    </label>
  )
}

function LessonInteraction({ lessonId }: { lessonId: string }) {
  const [income, setIncome] = useState(3200)
  const [savingRate, setSavingRate] = useState(10)
  const [buyPrice, setBuyPrice] = useState(48)
  const [currentPrice, setCurrentPrice] = useState(54)
  const [selectedMonth, setSelectedMonth] = useState(0)
  const [selectedAsset, setSelectedAsset] = useState('BONOS')
  const [shock, setShock] = useState(2)
  const [capital, setCapital] = useState(1000)
  const [rate, setRate] = useState(8)
  const [years, setYears] = useState(3)
  const [selectedAccount, setSelectedAccount] = useState<'ana' | 'luis'>('ana')
  const [depositAmount, setDepositAmount] = useState(100)
  const [accountBalances, setAccountBalances] = useState({ ana: 800, luis: 1200 })

  if (lessonId === 'variables') {
    const saving = income * savingRate / 100
    return (
      <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <NumberField label="Ingreso" value={income} onChange={setIncome} step={100} />
          <label className="block text-xs font-medium text-slate-400">
            Tasa de ahorro <strong className="float-right text-amber-200">{savingRate}%</strong>
            <input type="range" min="0" max="50" value={savingRate} onChange={(event) => setSavingRate(Number(event.target.value))} className="mt-3 w-full accent-amber-400" />
          </label>
          <p className="text-xs leading-5 text-slate-500">Cambia cualquiera de las dos entradas. Los nombres y la fórmula permanecen iguales.</p>
        </div>
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-[10px] uppercase tracking-wider text-emerald-300">ahorro</p><p className="mt-1 text-3xl font-bold text-white">S/ {saving.toFixed(2)}</p></div>
            <span className="rounded-full bg-emerald-400/10 px-2 py-1 font-mono text-[10px] text-emerald-200">float</span>
          </div>
          <div className="mt-4 rounded-lg bg-slate-950/60 p-3 font-mono text-xs">
            <p className="text-slate-400">ahorro = ingreso * tasa_ahorro / 100</p>
            <p className="mt-1 text-sky-200">{saving.toFixed(2)} = {income.toFixed(2)} * {savingRate} / 100</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-400">
            <span className="rounded bg-sky-400/10 px-2 py-1">ingreso: float</span>
            <span className="rounded bg-violet-400/10 px-2 py-1">tasa_ahorro: int</span>
          </div>
        </div>
      </div>
    )
  }

  if (lessonId === 'operations') {
    const priceChange = currentPrice - buyPrice
    const returnRate = (priceChange / buyPrice) * 100
    const isProfit = returnRate >= 0
    const meetsGoal = returnRate >= 10
    const approved = isProfit && meetsGoal
    const targetDistance = Math.abs(returnRate - 10)
    return (
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Precio de compra" value={buyPrice} onChange={setBuyPrice} step={0.1} min={1} />
            <NumberField label="Precio actual" value={currentPrice} onChange={setCurrentPrice} step={0.1} min={1} />
            <p className={`col-span-2 rounded-lg px-3 py-2 text-xs ${targetDistance < 0.01 ? 'bg-emerald-400/10 text-emerald-200' : 'bg-amber-400/[0.06] text-amber-200/80'}`}>{targetDistance < 0.01 ? '¡Encontraste exactamente 10 %!' : `Meta: llega a 10 %. Estás a ${targetDistance.toFixed(2)} puntos.`}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.05] p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">1 · resta</p><p className="mt-2 font-mono text-sm text-amber-200">cambio = {priceChange.toFixed(2)}</p><p className="mt-1 text-[10px] text-slate-500">actual - compra</p></div>
            <div className="rounded-xl border border-sky-400/15 bg-sky-400/[0.05] p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">2 · división</p><p className="mt-2 font-mono text-sm text-sky-200">retorno = {returnRate.toFixed(2)}%</p><p className="mt-1 text-[10px] text-slate-500">cambio / compra</p></div>
            <div className={`rounded-xl border p-3 ${isProfit ? 'border-emerald-400/20 bg-emerald-400/[0.06]' : 'border-rose-400/20 bg-rose-400/[0.06]'}`}><p className="text-[10px] uppercase tracking-wider text-slate-500">3 · comparación</p><div className="mt-2 flex items-center gap-2"><Lightbulb className={`h-6 w-6 ${isProfit ? 'fill-emerald-300 text-emerald-300' : 'fill-rose-300 text-rose-300'}`} /><p className={`font-mono text-sm ${isProfit ? 'text-emerald-200' : 'text-rose-200'}`}>{String(isProfit)}</p></div><p className="mt-1 text-[10px] text-slate-500">retorno &gt;= 0</p></div>
          </div>
        </div>
        <div className="grid gap-3 rounded-xl border border-slate-700/60 bg-slate-950/40 p-4 sm:grid-cols-2">
          <div><p className="font-mono text-xs text-sky-200">retorno = {returnRate.toFixed(2)}%</p><p className="mt-1 text-xs leading-5 text-slate-500">Es un número. Indica cuánto ganó o perdió la inversión.</p></div>
          <div><div className="flex flex-wrap items-center gap-2 font-mono text-xs"><span className={isProfit ? 'text-emerald-200' : 'text-rose-200'}>es_ganancia: {String(isProfit)}</span><span className="text-slate-600">and</span><span className={meetsGoal ? 'text-emerald-200' : 'text-rose-200'}>cumple_meta: {String(meetsGoal)}</span><ArrowRight className="h-3 w-3 text-slate-600" /><strong className={approved ? 'text-emerald-200' : 'text-rose-200'}>{String(approved)}</strong></div><p className="mt-2 text-xs leading-5 text-slate-500"><code>and</code> solo produce True cuando ambas condiciones son verdaderas.</p></div>
        </div>
      </div>
    )
  }

  if (lessonId === 'lists') {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May']
    const balances = [1200, 1320, 1280, 1450, 1510]
    return (
      <div><p className="mb-3 text-xs text-slate-400">Selecciona una posición y observa cómo se traduce a un índice:</p><div className="grid grid-cols-5 gap-2">{balances.map((balance, index) => <button key={months[index]} onClick={() => setSelectedMonth(index)} className={`rounded-xl border px-2 py-3 text-center transition ${selectedMonth === index ? 'border-amber-300/60 bg-amber-400/15 text-amber-100' : 'border-slate-700 bg-slate-950/50 text-slate-300'}`}><span className="block text-[10px] text-slate-500">{months[index]} · [{index}]</span><span className="font-mono text-sm">{balance}</span></button>)}</div><p className="mt-4 rounded-lg bg-slate-950/60 px-3 py-2 text-center font-mono text-sm text-sky-200">saldos[{selectedMonth}] → {balances[selectedMonth]}</p></div>
    )
  }

  if (lessonId === 'dictionaries') {
    const assets: Record<string, { risk: string; allocation: number; liquid: boolean }> = { BONOS: { risk: 'bajo', allocation: 40, liquid: true }, ETF: { risk: 'medio', allocation: 35, liquid: true }, DEPOSITO: { risk: 'bajo', allocation: 25, liquid: false } }
    const asset = assets[selectedAsset]
    return (
      <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]"><div className="space-y-2">{Object.keys(assets).map((name) => <button key={name} onClick={() => setSelectedAsset(name)} className={`w-full rounded-lg border px-3 py-2 text-left font-mono text-sm ${selectedAsset === name ? 'border-violet-400/50 bg-violet-400/10 text-violet-200' : 'border-slate-700 text-slate-400'}`}>{name}</button>)}</div><div className="rounded-xl border border-violet-400/20 bg-slate-950/60 p-4 font-mono text-sm"><p className="mb-3 text-violet-300">portafolio[&quot;{selectedAsset}&quot;]</p><div className="space-y-2 text-slate-300"><p>riesgo: <span className="text-sky-200">&quot;{asset.risk}&quot;</span></p><p>peso: <span className="text-amber-200">{asset.allocation}%</span></p><p>líquido: <span className="text-emerald-200">{String(asset.liquid)}</span></p></div></div></div>
    )
  }

  if (lessonId === 'numpy') {
    const returns = [-1.2, 0.8, 2.1, -0.4]
    const adjusted = returns.map((value) => value + shock)
    return (
      <div><label className="block text-xs font-medium text-slate-400">Escenario aplicado a todos los rendimientos: <strong className="text-amber-200">{shock > 0 ? '+' : ''}{shock}%</strong><input type="range" min="-5" max="5" step="0.5" value={shock} onChange={(event) => setShock(Number(event.target.value))} className="mt-2 w-full accent-violet-400" /></label><div className="mt-5 flex flex-wrap items-center justify-center gap-2 font-mono text-sm"><span className="text-slate-500">array</span>{returns.map((value, index) => <span key={index} className="rounded-lg bg-sky-400/10 px-3 py-2 text-sky-200">{value}%</span>)}<ArrowRight className="h-4 w-4 text-slate-500" />{adjusted.map((value, index) => <span key={index} className="rounded-lg bg-emerald-400/10 px-3 py-2 text-emerald-200">{value.toFixed(1)}%</span>)}</div></div>
    )
  }

  if (lessonId === 'classes') {
    const accountNames = { ana: 'Ana', luis: 'Luis' }
    const deposit = () => setAccountBalances((balances) => ({ ...balances, [selectedAccount]: balances[selectedAccount] + depositAmount }))
    return (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {(['ana', 'luis'] as const).map((account) => (
            <button key={account} onClick={() => setSelectedAccount(account)} className={`rounded-xl border p-4 text-left transition ${selectedAccount === account ? 'border-sky-400/50 bg-sky-400/10 ring-2 ring-sky-400/10' : 'border-slate-700 bg-slate-950/40 hover:border-slate-600'}`}>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">objeto cuenta_{account}</span>
              <span className="mt-2 block font-medium text-white">titular: {accountNames[account]}</span>
              <span className="mt-1 block font-mono text-lg text-emerald-300">saldo: S/ {accountBalances[account].toFixed(2)}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-3 rounded-xl border border-violet-400/20 bg-violet-400/[0.04] p-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <NumberField label={`Monto para cuenta_${selectedAccount}`} value={depositAmount} onChange={setDepositAmount} step={50} min={1} />
          <button onClick={deposit} className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-400">Ejecutar depositar()</button>
        </div>
        <div className="rounded-lg bg-slate-950/60 px-4 py-3 font-mono text-xs text-slate-300"><span className="text-violet-300">cuenta_{selectedAccount}</span>.depositar(<span className="text-amber-200">{depositAmount}</span>)<span className="ml-3 text-slate-600"># solo cambia este objeto</span></div>
      </div>
    )
  }

  const finalAmount = capital * Math.pow(1 + rate / 100, years)
  return (
    <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]"><div className="grid grid-cols-3 gap-3"><NumberField label="Capital" value={capital} onChange={setCapital} step={100} min={1} /><NumberField label="Tasa %" value={rate} onChange={setRate} min={0} max={100} /><NumberField label="Años" value={years} onChange={setYears} min={1} max={30} /></div><div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4"><p className="font-mono text-xs text-emerald-300">proyectar_ahorro(...)</p><p className="mt-2 text-2xl font-bold text-white">S/ {finalAmount.toFixed(2)}</p><p className="mt-1 text-xs text-slate-400">valor devuelto</p></div></div>
  )
}

export function ConceptVisual({ visual }: { visual: LessonVisual }) {
  if (visual.type === 'variables') {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {visual.items.map((item) => (
          <div key={item.name} className={`rounded-xl border p-3 ${colorClasses[item.color]}`}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold">{item.name}</span>
              <span className="rounded-full bg-slate-950/40 px-2 py-0.5 text-[10px]">{item.dataType}</span>
            </div>
            <div className="rounded-lg bg-slate-950/70 px-3 py-2 text-center font-mono text-lg text-white">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (visual.type === 'operation') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 py-7 font-mono">
        {[visual.left, visual.operator, visual.right].map((value, index) => (
          <div
            key={`${value}-${index}`}
            className={index === 1 ? 'text-2xl text-amber-300' : 'rounded-xl border border-sky-400/25 bg-sky-400/10 px-5 py-3 text-xl text-sky-100'}
          >
            {value}
          </div>
        ))}
        <ArrowRight className="h-5 w-5 text-slate-500" />
        <div className="rounded-xl border border-emerald-400/35 bg-emerald-400/10 px-5 py-3 text-xl text-emerald-300">
          {visual.result}
        </div>
      </div>
    )
  }

  if (visual.type === 'list') {
    return (
      <div className="overflow-x-auto py-5">
        <div className="mx-auto min-w-[430px] max-w-xl">
          <div className="mb-1 grid grid-cols-5 gap-2 text-center font-mono text-[11px] text-slate-500">
            {visual.values.map((_, index) => <span key={index}>índice {index}</span>)}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {visual.values.map((value, index) => (
              <div
                key={`${value}-${index}`}
                className={`rounded-xl border px-2 py-4 text-center font-mono text-lg transition ${
                  visual.activeIndex === index
                    ? 'border-amber-300 bg-amber-300/15 text-amber-100 ring-2 ring-amber-300/15'
                    : 'border-violet-400/25 bg-violet-400/10 text-violet-100'
                }`}
              >
                {value}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center font-mono text-xs text-amber-300">precios[2] → 110</p>
        </div>
      </div>
    )
  }

  if (visual.type === 'dictionary') {
    return (
      <div className="py-3">
        <div className="mx-auto max-w-md rounded-xl border border-sky-400/30 bg-sky-400/10 p-3 text-center font-mono text-sky-200">
          {visual.root}
        </div>
        <div className="mx-auto h-5 w-px bg-slate-600" />
        <div className="grid gap-3 sm:grid-cols-2">
          {visual.branches.map((branch) => (
            <div key={branch.key} className="rounded-xl border border-violet-400/25 bg-violet-400/10 p-3">
              <div className="mb-2 text-center font-mono font-semibold text-violet-200">{branch.key}</div>
              <div className="space-y-1.5">
                {branch.values.map((value) => (
                  <div key={value} className="rounded-lg bg-slate-950/60 px-3 py-2 font-mono text-xs text-slate-300">{value}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (visual.type === 'array') {
    return (
      <div className="overflow-x-auto py-4">
        <div className="mx-auto flex min-w-[560px] items-center justify-center gap-4 font-mono">
          <div className="flex gap-1.5">
            {visual.before.map((value) => <span key={value} className="rounded-lg bg-sky-400/10 px-2.5 py-3 text-sky-200">{value}</span>)}
          </div>
          <div className="rounded-lg bg-amber-400/10 px-3 py-2 text-sm text-amber-300">{visual.operation}</div>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" />
          <div className="flex gap-1.5">
            {visual.after.map((value) => <span key={value} className="rounded-lg bg-emerald-400/10 px-2.5 py-3 text-emerald-200">{value}</span>)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4 sm:flex-row">
      <div className="space-y-1.5">
        {visual.inputs.map((input) => (
          <div key={input} className="rounded-lg border border-sky-400/25 bg-sky-400/10 px-3 py-2 font-mono text-xs text-sky-200">{input}</div>
        ))}
      </div>
      <ArrowRight className="h-5 w-5 rotate-90 text-slate-500 sm:rotate-0" />
      <div className="rounded-xl border border-violet-400/30 bg-violet-400/10 px-5 py-5 font-mono text-sm font-semibold text-violet-200">
        {visual.process}
      </div>
      <ArrowRight className="h-5 w-5 rotate-90 text-slate-500 sm:rotate-0" />
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-6 py-5 font-mono text-xl font-bold text-emerald-200">
        {visual.output}
      </div>
    </div>
  )
}

function readCompletedLessons(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem('flowpy-lessons-completed') ?? '[]')
  } catch {
    return []
  }
}

export default function LearnView({ onOpenLab }: { onOpenLab: (code: string) => void }) {
  const scrollContainer = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [completed, setCompleted] = useState<string[]>(readCompletedLessons)
  const lesson = LESSONS[activeIndex]
  const isCorrect = selectedAnswer === lesson.challenge.correctIndex
  const progress = Math.round((completed.length / LESSONS.length) * 100)

  useEffect(() => {
    setSelectedAnswer(null)
    scrollContainer.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeIndex])

  useEffect(() => {
    try {
      window.localStorage.setItem('flowpy-lessons-completed', JSON.stringify(completed))
    } catch {
      // Progress saving is best-effort.
    }
  }, [completed])

  const chooseAnswer = (index: number) => {
    setSelectedAnswer(index)
    if (index === lesson.challenge.correctIndex) {
      setCompleted((current) => current.includes(lesson.id) ? current : [...current, lesson.id])
    }
  }

  return (
    <div ref={scrollContainer} className="min-h-0 flex-1 overflow-auto bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.09),transparent_32%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_28%)]">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur">
            <div className="border-b border-slate-800 p-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">Tu progreso</span>
                <span className="text-sky-300">{completed.length}/{LESSONS.length}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <nav className="p-2" aria-label="Lecciones">
              {LESSONS.map((item, index) => {
                const active = index === activeIndex
                const done = completed.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveIndex(index)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${active ? 'bg-sky-400/10 text-sky-100' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'}`}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> : <Circle className={`h-4 w-4 shrink-0 ${active ? 'text-sky-400' : 'text-slate-600'}`} />}
                    <span>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-600">Lección {item.number}</span>
                      <span className="text-sm font-medium">{item.shortTitle}</span>
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {LESSONS.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(index)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${index === activeIndex ? 'border-sky-400/50 bg-sky-400/10 text-sky-200' : 'border-slate-700 text-slate-400'}`}
              >
                {completed.includes(item.id) && <Check className="h-3 w-3 text-emerald-400" />}
                {item.number}. {item.shortTitle}
              </button>
            ))}
          </div>

          <section className="mb-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/65 p-6 shadow-xl shadow-slate-950/20 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-300">Lección {lesson.number} de {LESSONS.length}</span>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{lesson.eyebrow}</span>
            </div>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">{lesson.title}</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">{lesson.summary}</p>
          </section>

          <section className="mb-5 overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><Code2 className="h-4 w-4 text-violet-400" />Código</div>
              <span className="text-xs text-slate-600">Python 3</span>
            </div>
            <div className="bg-[#1e1e2e] p-2" style={{ height: `${Math.min(360, Math.max(190, lesson.code.split('\n').length * 24 + 36))}px` }}>
              <CodeEditor value={lesson.code} onChange={() => undefined} readOnly />
            </div>
            <div className="flex flex-col gap-4 border-t border-slate-800 bg-slate-900/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={() => onOpenLab(lesson.code)} className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
                <Play className="h-4 w-4" /> Abrir en el laboratorio
              </button>
            </div>
          </section>

          <section className="mb-5 overflow-hidden rounded-2xl border border-sky-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/50">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300"><Lightbulb className="h-4 w-4" /> Concepto en acción</div>
                <h3 className="text-2xl font-bold text-white">{lesson.analogy.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{lesson.analogy.story}</p>
                <div className="mt-4 rounded-xl border border-sky-300/15 bg-sky-400/[0.06] p-3 text-sm text-sky-100"><strong>Fíjate en:</strong> {lesson.analogy.mission}</div>
              </div>
              <div className="relative min-h-56 overflow-hidden border-t border-slate-800 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12),transparent_65%)] lg:border-l lg:border-t-0">
                <div className="absolute inset-x-8 bottom-5 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
                <AnalogyScene scene={lesson.analogy.scene} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-400/20 bg-slate-900/70 p-5 sm:p-6">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-white"><Lightbulb className="h-5 w-5 text-emerald-300" /> Explora: cambia los datos</div>
            <p className="mb-5 text-sm text-slate-500">No hay una única respuesta. Mueve los controles y observa qué cambia y qué permanece igual.</p>
            <LessonInteraction key={lesson.id} lessonId={lesson.id} />
          </section>

          <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/65 p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><BookOpenCheck className="h-5 w-5 text-sky-400" /> Lo que acabas de descubrir</div>
            <p className="max-w-4xl leading-7 text-slate-300">{lesson.explanation}</p>
            <div className="mt-4 flex flex-wrap gap-2">{lesson.keyIdeas.map((idea) => <span key={idea} className="rounded-full border border-sky-400/15 bg-sky-400/[0.06] px-3 py-1.5 text-xs text-sky-100"><Check className="mr-1.5 inline h-3 w-3 text-emerald-400" />{idea}</span>)}</div>
          </section>

          <section className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-amber-200"><Target className="h-5 w-5" /> Comprueba lo aprendido</div>
            <p className="mb-4 text-base text-slate-200">{lesson.challenge.question}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {lesson.challenge.options.map((option, index) => {
                const selected = selectedAnswer === index
                const correct = selected && isCorrect
                const wrong = selected && !isCorrect
                return (
                  <button key={option} onClick={() => chooseAnswer(index)} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left font-mono text-sm transition ${correct ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200' : wrong ? 'border-rose-400/60 bg-rose-400/10 text-rose-200' : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-amber-400/40'}`}>
                    {option}
                    {correct && <Check className="h-4 w-4" />}
                    {wrong && <X className="h-4 w-4" />}
                  </button>
                )
              })}
            </div>
            {selectedAnswer !== null && (
              <div className={`mt-4 animate-fade-in rounded-xl border p-4 text-sm ${isCorrect ? 'border-emerald-400/20 bg-emerald-400/5 text-emerald-100' : 'border-rose-400/20 bg-rose-400/5 text-rose-100'}`}>
                <strong>{isCorrect ? '¡Correcto! ' : 'Todavía no. '}</strong>{isCorrect ? lesson.challenge.explanation : lesson.challenge.hint}
              </div>
            )}
          </section>

          <div className="mt-6 flex items-center justify-between pb-8">
            <button disabled={activeIndex === 0} onClick={() => setActiveIndex((current) => Math.max(0, current - 1))} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 disabled:invisible"><ChevronLeft className="h-4 w-4" /> Anterior</button>
            <button disabled={activeIndex === LESSONS.length - 1} onClick={() => setActiveIndex((current) => Math.min(LESSONS.length - 1, current + 1))} className="flex items-center gap-1 rounded-lg bg-sky-400/10 px-3 py-2 text-sm font-medium text-sky-200 hover:bg-sky-400/15 disabled:invisible">Siguiente <ChevronRight className="h-4 w-4" /></button>
          </div>
        </main>
      </div>
    </div>
  )
}
