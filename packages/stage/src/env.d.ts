/* The art ships as Vite `?raw` imports; this keeps the package checkable
   on its own, without pulling vite/client in as a dependency. */
declare module '*.svg?raw' {
  const src: string;
  export default src;
}
