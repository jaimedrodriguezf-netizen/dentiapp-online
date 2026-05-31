/**
 * NEXT.JS 16 COMPATIBILITY WRAPPER FOR HTML2CANVAS-PRO
 * 
 * This wrapper acts as an ESM bridge for html2canvas-pro to resolve CJS/ESM interop 
 * bugs under Turbopack and Webpack bundler configs in Next.js 16.
 * 
 * Since html2canvas-pro accesses browser-only APIs (Canvas, window, document), this wrapper 
 * is configured via module aliases in next.config.ts and must only be consumed by 
 * Client Components during runtime client-side execution.
 */
import html2canvasPro from 'html2canvas-pro'

export const getHtml2Canvas = () => html2canvasPro

export default html2canvasPro
