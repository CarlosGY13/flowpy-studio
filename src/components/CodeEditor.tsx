import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}

export default function CodeEditor({ value, onChange, readOnly }: CodeEditorProps) {
  return (
    <div className="h-full overflow-hidden rounded-xl border border-slate-700/60 bg-[#1e1e2e]">
      <CodeMirror
        value={value}
        height="100%"
        theme={oneDark}
        extensions={[python()]}
        onChange={onChange}
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
