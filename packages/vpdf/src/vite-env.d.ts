/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "*?worker" {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}

declare module "*?url" {
  const url: string;
  export default url;
}

declare module "*?worker&url" {
  const workerUrl: string;
  export default workerUrl;
}

declare module "pdfjs-dist/build/pdf" {
  export * from "pdfjs-dist";
}

declare module "pdfjs-dist/types" {
  export * from "pdfjs-dist/types";
}
