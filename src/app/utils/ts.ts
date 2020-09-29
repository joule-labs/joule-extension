// This includes helper functions / types for Typescript
export function typedKeys<T extends object>(e: T): (keyof T)[] {
  return Object.keys(e).map(k => k as keyof T);
}
