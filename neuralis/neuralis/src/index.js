import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// Configure Monaco Editor for Python syntax highlighting
if (window.monaco) {
  window.monaco.languages.register({ id: 'python' });
  window.monaco.editor.defineTheme('pythonTheme', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
      { token: 'string', foreground: 'A31515' },
      { token: 'comment', foreground: '008000' },
      { token: 'number', foreground: '098658' },
      { token: 'operator', foreground: 'AF00DB' },
      { token: 'delimiter', foreground: '000000' },
      { token: 'type', foreground: '267F99' },
      { token: 'identifier', foreground: '001080' },
      { token: 'function', foreground: '795E26' }
    ],
    colors: {
      'editor.foreground': '#000000',
      'editor.background': '#FFFFFF',
      'editor.selectionBackground': '#ADD6FF',
      'editor.lineHighlightBackground': '#F7F7F7',
      'editorCursor.foreground': '#000000',
      'editorWhitespace.foreground': '#BFBFBF'
    }
  });
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
