import { useEffect, useMemo, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { Decoration, EditorView, hoverTooltip } from '@codemirror/view'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  activeLine?: number
  debugVariables?: Record<string, string>
  errorLine?: number
}

export default function CodeEditor({
  value,
  onChange,
  readOnly,
  activeLine,
  debugVariables = {},
  errorLine,
}: CodeEditorProps) {
  const editorRef = useRef<EditorView | null>(null)

  const variableTooltip = useMemo(
    () =>
      hoverTooltip((view, position) => {
        const line = view.state.doc.lineAt(position)
        const offset = position - line.from
        const before = line.text.slice(0, offset).match(/[A-Za-z_][A-Za-z0-9_]*$/)?.[0] ?? ''
        const after = line.text.slice(offset).match(/^[A-Za-z0-9_]*/)?.[0] ?? ''
        const name = before + after
        const value = debugVariables[name]
        if (!name || value === undefined) return null

        return {
          pos: position - before.length,
          end: position + after.length,
          above: true,
          create: () => {
            const dom = document.createElement('div')
            dom.className = 'rounded-md border border-sky-400/40 bg-slate-950 px-2 py-1 font-mono text-xs text-sky-200 shadow-xl'
            dom.textContent = `${name} = ${value}`
            return { dom }
          },
        }
      }),
    [debugVariables]
  )

  const errorHighlight = useMemo(() => {
    if (!errorLine) return []
    return [
      EditorView.theme({
        '.cm-syntax-error-line': { backgroundColor: 'rgba(244, 63, 94, 0.18)' },
      }),
      EditorView.decorations.of((view) => {
        if (errorLine > view.state.doc.lines) return Decoration.none
        return Decoration.set([
          Decoration.line({ attributes: { class: 'cm-syntax-error-line' } }).range(
            view.state.doc.line(errorLine).from
          ),
        ])
      }),
    ]
  }, [errorLine])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || !activeLine || activeLine > editor.state.doc.lines) return
    const position = editor.state.doc.line(activeLine).from
    editor.dispatch({
      selection: { anchor: position },
      effects: EditorView.scrollIntoView(position, { y: 'center' }),
    })
  }, [activeLine])

  return (
    <div className="h-full overflow-hidden rounded-xl border border-slate-700/60 bg-[#1e1e2e]">
      <CodeMirror
        value={value}
        height="100%"
        theme={oneDark}
        extensions={[python(), variableTooltip, ...errorHighlight]}
        onChange={onChange}
        onCreateEditor={(editor) => {
          editorRef.current = editor
        }}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          autocompletion: true,
          indentOnInput: true,
          tabSize: 4,
        }}
        className="h-full text-sm [&_.cm-editor]:h-full [&_.cm-scroller]:font-mono"
      />
    </div>
  )
}
