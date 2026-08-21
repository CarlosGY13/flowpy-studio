import { useEffect, useMemo, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, ChevronLeft, GitBranch } from 'lucide-react'
import type { FlowGraph, FlowNode } from '../types'
import { getNodeDimensions, layoutGraph } from '../lib/pythonRunner'

interface FlowchartViewProps {
  graph: FlowGraph | null
  isLoading?: boolean
}

const NODE_STYLES: Record<
  FlowNode['type'],
  { fill: string; stroke: string; text: string; glow: string }
> = {
  start: {
    fill: '#064e3b',
    stroke: '#34d399',
    text: '#a7f3d0',
    glow: 'rgba(52, 211, 153, 0.3)',
  },
  end: {
    fill: '#450a0a',
    stroke: '#f87171',
    text: '#fecaca',
    glow: 'rgba(248, 113, 113, 0.3)',
  },
  process: {
    fill: '#1e3a5f',
    stroke: '#60a5fa',
    text: '#bfdbfe',
    glow: 'rgba(96, 165, 250, 0.25)',
  },
  decision: {
    fill: '#422006',
    stroke: '#fbbf24',
    text: '#fde68a',
    glow: 'rgba(251, 191, 36, 0.3)',
  },
  io: {
    fill: '#312e81',
    stroke: '#a78bfa',
    text: '#ddd6fe',
    glow: 'rgba(167, 139, 250, 0.3)',
  },
  numpy: {
    fill: '#134e4a',
    stroke: '#2dd4bf',
    text: '#99f6e4',
    glow: 'rgba(45, 212, 191, 0.35)',
  },
  loop: {
    fill: '#4a044e',
    stroke: '#e879f9',
    text: '#f5d0fe',
    glow: 'rgba(232, 121, 249, 0.3)',
  },
  function: {
    fill: '#1e1b4b',
    stroke: '#818cf8',
    text: '#c7d2fe',
    glow: 'rgba(129, 140, 248, 0.3)',
  },
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (test.length <= maxChars) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word.length > maxChars ? word.slice(0, maxChars - 1) + '…' : word
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : [text]
}

function FlowNodeShape({
  node,
  x,
  y,
  onMouseDown,
  onClick,
}: {
  node: FlowNode
  x: number
  y: number
  onMouseDown?: (event: React.MouseEvent<SVGGElement>) => void
  onClick?: () => void
}) {
  const style = NODE_STYLES[node.type]
  const { w, h } = getNodeDimensions(node.type)
  const lines = wrapText(node.label, node.type === 'decision' ? 18 : 24)
  const lineHeight = 16
  const textStartY = y - ((lines.length - 1) * lineHeight) / 2

  const filterId = `glow-${node.id}`
  const nodeTitle = node.functionName ? `Haz clic para ver la función ${node.functionName}` : node.label

  if (node.type === 'start' || node.type === 'end') {
    return (
      <g onMouseDown={onMouseDown} onClick={onClick} className="cursor-grab active:cursor-grabbing">
        <title>{nodeTitle}</title>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={style.glow} />
          </filter>
        </defs>
        <ellipse
          cx={x}
          cy={y}
          rx={w / 2}
          ry={h / 2}
          fill={style.fill}
          stroke={style.stroke}
          strokeWidth={2}
          filter={`url(#${filterId})`}
        />
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          fill={style.text}
          fontSize={13}
          fontWeight={600}
          fontFamily="Inter, sans-serif"
        >
          {node.label}
        </text>
      </g>
    )
  }

  if (node.type === 'decision' || node.type === 'loop') {
    const half = w / 2
    const points = node.type === 'decision'
      ? `${x},${y - half} ${x + half},${y} ${x},${y + half} ${x - half},${y}`
      : `${x - w / 2 + 24},${y - h / 2} ${x + w / 2 - 24},${y - h / 2} ${x + w / 2},${y} ${x + w / 2 - 24},${y + h / 2} ${x - w / 2 + 24},${y + h / 2} ${x - w / 2},${y}`
    return (
      <g onMouseDown={onMouseDown} onClick={onClick} className="cursor-grab active:cursor-grabbing">
        <title>{nodeTitle}</title>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={style.glow} />
          </filter>
        </defs>
        <polygon
          points={points}
          fill={style.fill}
          stroke={style.stroke}
          strokeWidth={2}
          filter={`url(#${filterId})`}
        />
        {lines.map((line, i) => (
          <text
            key={i}
            x={x}
            y={textStartY + i * lineHeight + 5}
            textAnchor="middle"
            fill={style.text}
            fontSize={11}
            fontFamily="Inter, sans-serif"
          >
            {line}
          </text>
        ))}
      </g>
    )
  }

  const rx = node.type === 'numpy' ? 14 : 10
  return (
    <g onMouseDown={onMouseDown} onClick={onClick} className="cursor-grab active:cursor-grabbing">
      <title>{nodeTitle}</title>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={style.glow} />
        </filter>
      </defs>
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={rx}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={2}
        filter={`url(#${filterId})`}
      />
      {node.type === 'function' && (
        <>
          <line
            x1={x - w / 2 + 14}
            y1={y - h / 2 + 2}
            x2={x - w / 2 + 14}
            y2={y + h / 2 - 2}
            stroke={style.stroke}
            strokeWidth={2}
          />
          <line
            x1={x + w / 2 - 14}
            y1={y - h / 2 + 2}
            x2={x + w / 2 - 14}
            y2={y + h / 2 - 2}
            stroke={style.stroke}
            strokeWidth={2}
          />
        </>
      )}
      {node.type === 'numpy' && (
        <text
          x={x - w / 2 + 10}
          y={y - h / 2 + 16}
          fill={style.stroke}
          fontSize={9}
          fontWeight={700}
          fontFamily="Inter, sans-serif"
          opacity={0.8}
        >
          NumPy
        </text>
      )}
      {lines.map((line, i) => (
        <text
          key={i}
          x={x}
          y={textStartY + i * lineHeight + (node.type === 'numpy' ? 4 : 5)}
          textAnchor="middle"
          fill={style.text}
          fontSize={12}
          fontFamily="'JetBrains Mono', monospace"
        >
          {line}
        </text>
      ))}
    </g>
  )
}

export default function FlowchartView({ graph, isLoading }: FlowchartViewProps) {
  const diagramRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 40 })
  const [dragging, setDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [nodeOffsets, setNodeOffsets] = useState<Record<string, { x: number; y: number }>>({})
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null)
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const nodeDragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 })

  const displayGraph = selectedFunction ? graph?.functions?.[selectedFunction] ?? graph : graph

  const layout = useMemo(() => {
    if (!displayGraph) return null
    const basePositions = layoutGraph(displayGraph)
    const positions = new Map<string, { x: number; y: number }>()
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity

    for (const node of displayGraph.nodes) {
      const basePos = basePositions.get(node.id)
      if (!basePos) continue
      const offset = nodeOffsets[node.id] ?? { x: 0, y: 0 }
      const pos = { x: basePos.x + offset.x, y: basePos.y + offset.y }
      positions.set(node.id, pos)
      if (!pos) continue
      const { w, h } = getNodeDimensions(node.type)
      minX = Math.min(minX, pos.x - w / 2)
      maxX = Math.max(maxX, pos.x + w / 2)
      minY = Math.min(minY, pos.y - h / 2)
      maxY = Math.max(maxY, pos.y + h / 2)
    }

    return { positions, bounds: { minX, maxX, minY, maxY } }
  }, [displayGraph, nodeOffsets])

  useEffect(() => {
    setNodeOffsets({})
  }, [graph, selectedFunction])

  useEffect(() => {
    setSelectedFunction(null)
  }, [graph])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    })
  }

  const handleMouseUp = () => setDragging(false)

  const handleNodeMouseDown = (event: React.MouseEvent<SVGGElement>, nodeId: string) => {
    event.preventDefault()
    event.stopPropagation()
    const offset = nodeOffsets[nodeId] ?? { x: 0, y: 0 }
    nodeDragStart.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    }
    setDraggedNodeId(nodeId)
  }

  useEffect(() => {
    if (!draggedNodeId) return
    const moveNode = (event: MouseEvent) => {
      const scale = zoom || 1
      setNodeOffsets((offsets) => ({
        ...offsets,
        [draggedNodeId]: {
          x: nodeDragStart.current.offsetX + (event.clientX - nodeDragStart.current.x) / scale,
          y: nodeDragStart.current.offsetY + (event.clientY - nodeDragStart.current.y) / scale,
        },
      }))
    }
    const stopDraggingNode = () => setDraggedNodeId(null)
    window.addEventListener('mousemove', moveNode)
    window.addEventListener('mouseup', stopDraggingNode)
    return () => {
      window.removeEventListener('mousemove', moveNode)
      window.removeEventListener('mouseup', stopDraggingNode)
    }
  }, [draggedNodeId, zoom])

  const fitView = () => {
    if (!layout || !containerRef.current) return
    const { bounds } = layout
    const cw = containerRef.current.clientWidth
    const ch = containerRef.current.clientHeight
    const gw = bounds.maxX - bounds.minX + 80
    const gh = bounds.maxY - bounds.minY + 80
    const scale = Math.min(cw / gw, ch / gh, 1.2)
    setZoom(scale)
    setPan({
      x: cw / 2 - ((bounds.minX + bounds.maxX) / 2) * scale,
      y: ch / 2 - ((bounds.minY + bounds.maxY) / 2) * scale + 20,
    })
  }

  useEffect(() => {
    if (!layout || !containerRef.current) return
    const container = containerRef.current
    const observer = new ResizeObserver(() => fitView())
    observer.observe(container)
    fitView()
    return () => observer.disconnect()
  // Do not refit when a user moves a node: that would undo their current zoom
  // and viewport. A new graph still starts fitted automatically.
  }, [displayGraph])

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(document.fullscreenElement === diagramRef.current)
    document.addEventListener('fullscreenchange', syncFullscreenState)
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await diagramRef.current?.requestFullscreen()
      }
    } catch {
      // Fullscreen can be disabled by a browser or embedded preview.
    }
  }

  return (
    <div
      ref={diagramRef}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900"
    >
      <div className="flex items-center gap-2 border-b border-slate-700/60 px-4 py-2.5">
        <GitBranch className="h-4 w-4 text-violet-400" />
        {selectedFunction && (
          <button
            onClick={() => setSelectedFunction(null)}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-violet-300 transition hover:bg-slate-800 hover:text-white"
            title="Volver al programa principal"
          >
            <ChevronLeft className="h-4 w-4" />
            Principal
          </button>
        )}
        <span className="text-sm font-medium text-slate-300">
          {selectedFunction ? `Función: ${selectedFunction}` : 'Diagrama de flujo'}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2.5))}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title="Acercar"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.3))}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title="Alejar"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => setNodeOffsets({})}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title="Restablecer posiciones"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          backgroundImage:
            'radial-gradient(circle, #1e293b 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <p className="animate-pulse-soft text-sm text-slate-400">Generando diagrama...</p>
          </div>
        )}

        {!displayGraph && !isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-xs text-center">
              <GitBranch className="mx-auto mb-3 h-10 w-10 text-slate-700" />
              <p className="text-sm text-slate-500">
                El diagrama aparecerá aquí cuando ejecutes tu código.
              </p>
            </div>
          </div>
        )}

        {displayGraph && layout && (
          <svg className="h-full w-full">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
              </marker>
            </defs>

            <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
              {displayGraph.edges.map((edge, i) => {
                const fromPos = layout.positions.get(edge.from)
                const toPos = layout.positions.get(edge.to)
                if (!fromPos || !toPos) return null

                const fromNode = displayGraph.nodes.find((n) => n.id === edge.from)
                const toNode = displayGraph.nodes.find((n) => n.id === edge.to)
                const fromDim = getNodeDimensions(fromNode?.type ?? 'process')
                const toDim = getNodeDimensions(toNode?.type ?? 'process')

                const x1 = fromPos.x
                const y1 = fromPos.y + fromDim.h / 2
              const x2 = toPos.x
              const y2 = toPos.y - toDim.h / 2
              const midY = (y1 + y2) / 2
              const isLoopBack = toPos.y <= fromPos.y
              const side = fromPos.x <= toPos.x ? -1 : 1
              const routeX = side < 0
                ? Math.min(x1 - fromDim.w / 2, x2 - toDim.w / 2) - 100
                : Math.max(x1 + fromDim.w / 2, x2 + toDim.w / 2) + 100
              const edgePath = isLoopBack
                ? `M ${x1} ${y1} C ${routeX} ${y1}, ${routeX} ${toPos.y}, ${x2 + side * toDim.w / 2} ${toPos.y}`
                : `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`

                return (
                  <g key={i}>
                    <path
                      d={edgePath}
                      fill="none"
                      stroke="#475569"
                      strokeWidth={2}
                      markerEnd="url(#arrowhead)"
                    />
                    {edge.label && (
                      <text
                        x={(x1 + x2) / 2 + 8}
                        y={midY}
                        fill="#94a3b8"
                        fontSize={11}
                        fontFamily="Inter, sans-serif"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                )
              })}

              {displayGraph.nodes.map((node) => {
                const pos = layout.positions.get(node.id)
                if (!pos) return null
                return (
                  <FlowNodeShape
                    key={node.id}
                    node={node}
                    x={pos.x}
                    y={pos.y}
                    onMouseDown={(event) => handleNodeMouseDown(event, node.id)}
                    onClick={() => {
                      if (node.functionName && graph?.functions?.[node.functionName]) {
                        setSelectedFunction(node.functionName)
                      }
                    }}
                  />
                )
              })}
            </g>
          </svg>
        )}
      </div>

      {displayGraph && (
        <div className="flex flex-wrap gap-3 border-t border-slate-700/60 px-4 py-2">
          {(
            [
              ['start', 'Inicio/Fin'],
              ['process', 'Proceso'],
              ['decision', 'Decisión'],
              ['loop', 'Bucle'],
              ['numpy', 'NumPy'],
              ['io', 'Entrada/Salida'],
            ] as const
          ).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: NODE_STYLES[type].stroke }}
              />
              <span className="text-[10px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
