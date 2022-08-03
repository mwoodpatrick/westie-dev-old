export * from './lib/hello-tsc';
// file: packages/tsapp/src/index.ts

// importing from hello-tsc
import { helloTsc } from '@happynrwl/hello-tsc';

// use the function
helloTsc();

console.log(`Running ${tsapp()}`);
