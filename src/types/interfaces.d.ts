/*
TODO: read this
https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html

if you use a type/interface in more than one place it goes into
the ~shared/lib/types.ts file

if you extend a type/interface, it can be declared locally,
as long as it doesn't get used more than once
*/
interface TestInterface {
    number: string;
}
