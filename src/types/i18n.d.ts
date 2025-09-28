export type Path<T, P extends string = ''> = T extends object
  ? {
      [K in keyof T & string]:
        | (P extends '' ? K : `${P}.${K}`)
        | Path<T[K], P extends '' ? K : `${P}.${K}`>;
    }[keyof T & string]
  : never;

export type PathValue<
  T,
  K extends string,
> = K extends `${infer Head}.${infer Tail}`
  ? Head extends keyof T
    ? PathValue<T[Head], Tail>
    : never
  : K extends keyof T
    ? T[K]
    : never;
