// types/window.d.ts
export {}; // make this a module

declare global {
  interface Window {
    mina?: {
      requestAccounts: () => Promise<string[]>;
      // add other methods if you use them
    };
  }
}