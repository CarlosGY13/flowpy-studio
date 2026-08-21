export type FlowNodeType =
  | 'start'
  | 'end'
  | 'process'
  | 'decision'
  | 'io'
  | 'numpy'
  | 'loop'
  | 'function'

export interface FlowNode {
  id: string
  type: FlowNodeType
  label: string
  functionName?: string
}

export interface FlowEdge {
  from: string
  to: string
  label?: string
}

export interface FlowGraph {
  nodes: FlowNode[]
  edges: FlowEdge[]
  functions?: Record<string, FlowGraph>
}

export interface TerminalLine {
  type: 'stdout' | 'stderr' | 'info' | 'error'
  text: string
}

export interface RunResult {
  output: TerminalLine[]
  graph: FlowGraph | null
  error: string | null
}
