/// <reference types="vite/client" />
declare module "*.css";
declare global {
  interface Window {
    JSZip: any;
    p5: any;
  }
}
