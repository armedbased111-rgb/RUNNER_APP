import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const darkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'transparent',
      color: '#e8e8e8',
      fontFamily: '"Share Tech Mono", monospace',
      fontSize: '13px',
    },
    '.cm-content': {
      caretColor: '#aaff00',
      fontFamily: '"Share Tech Mono", monospace',
      padding: '8px 0',
    },
    '.cm-cursor': {
      borderLeftColor: '#aaff00',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#aaff00',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: '#2a2a2a',
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      color: '#444444',
      border: 'none',
      borderRight: '1px solid #2e2e2e',
      fontFamily: '"Share Tech Mono", monospace',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(42, 42, 42, 0.3)',
    },
    '.cm-line': {
      color: '#e8e8e8',
    },
    '.cm-placeholder': {
      color: '#888888',
      textTransform: 'uppercase',
    },
    '.cm-scroller': {
      fontFamily: '"Share Tech Mono", monospace',
      overflow: 'visible !important',
    },
  },
  { dark: true }
);

export function MarkdownEditor({ value, onChange, placeholder, minHeight = '120px' }: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  // Keep refs updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Init editor
  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = [
      basicSetup,
      markdown(),
      darkTheme,
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString();
          valueRef.current = newValue;
          onChangeRef.current(newValue);
        }
      }),
      EditorView.lineWrapping,
    ];

    if (placeholder) {
      extensions.push(EditorView.contentAttributes.of({ 'data-placeholder': placeholder }));
    }

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
      editorViewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes
  useEffect(() => {
    const view = editorViewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value && value !== valueRef.current) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
      valueRef.current = value;
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight,
        border: '1px solid #2e2e2e',
        backgroundColor: '#1a1a1a',
      }}
    />
  );
}
