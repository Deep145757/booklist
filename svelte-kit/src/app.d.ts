// See https://kit.svelte.dev/docs/types#app for information about these interfaces and what to do when importing types

//import { DefaultSession } from "@auth/core";

declare module "@auth/core/types" {
  interface Session {
    userId: string;
    //user: DefaultSession["user"] & { permissions: string[] };
  }
}

declare namespace App {
  // interface Locals {}
  // interface PageData {}
  // interface Error {}
  // interface Platform {}
}
