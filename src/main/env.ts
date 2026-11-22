/**
 * Debug tooling (electron-debug, devtools, the inspect-element menu) is on in
 * `npm start` and in production builds run with DEBUG_PROD=true.
 */
export const isDebug = import.meta.env.DEV || process.env.DEBUG_PROD === 'true';
