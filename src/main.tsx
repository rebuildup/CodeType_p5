import "./style.css";
import { EditorManager } from "./001_Editors/001_EditorManager";
import { setupAnimationRenderer } from "./001_Editors/002_AnimationRenderer";
import "./config";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize p5 logic
const editorManager = new EditorManager();
setupAnimationRenderer(editorManager);
(window as any).editorManager = editorManager;

// Render React App
const rootElement = document.getElementById('root');
if (!rootElement) {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App editorManager={editorManager} />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App editorManager={editorManager} />
    </React.StrictMode>
  );
}
