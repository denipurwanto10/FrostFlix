/* FrostFlix — environment type declarations */
/* No API keys required. iCheckMovies is accessed directly from the browser. */

declare module '*.css';
declare module '*.less';
declare module '*.sass';
declare module '*.scss';

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  [key: string]: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}