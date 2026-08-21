import { useEffect, useRef } from 'react'
import { Terminal as TerminalIcon } from 'lucide-react'
import type { TerminalLine } from '../types'

interface TerminalProps {
  lines: TerminalLine[]
  isRunning: boolean
  statusMessage?: string
}

const lineColors: Record<TerminalLine['type'], string> = {
  stdout: 'text-emerald-300',
  stderr: 'text-amber-300',
  info: 'text-sky-300',
  error: 'text-rose-400',
}

const linePrefixes: Record<TerminalLine['type'], string> = {
  stdout: '›',
  stderr: '!',
  info: 'ℹ',
  error: '✕',
}

export default function Terminal({ lines, isRunning, statusMessage }: TerminalProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines, isRunning])

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-700/60 bg-[#0d1117]">
      <div className="flex items-center gap-2 border-b border-slate-700/60 px-4 py-2.5">
        <TerminalIcon className="h-4 w-4 text-emerald-400" />
        <span className="text-sm font-medium text-slate-300">Salida</span>
        {isRunning && (
          <span className="ml-auto animate-pulse-soft text-xs text-sky-400">Ejecutando...</span>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed">
        {statusMessage && lines.length === 0 && (
          <p className="text-slate-500">{statusMessage}</p>
        )}

        {lines.length === 0 && !statusMessage && !isRunning && (
          <p className="text-slate-600">
            Presiona <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400">▶ Ejecutar</kbd>{' '}
            para ver la salida de tu código aquí.
          </p>
        )}

        {lines.map((line, i) => (
          <div key={i} className={`flex gap-2 ${lineColors[line.type]}`}>
            <span className="select-none opacity-50">{linePrefixes[line.type]}</span>
            <span className="whitespace-pre-wrap break-all">{line.text}</span>
          </div>
        ))}

        {isRunning && (
          <div className="mt-1 flex gap-2 text-sky-400">
            <span className="animate-pulse-soft">▌</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
