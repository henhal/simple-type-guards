type Primitives = {
  string: string;
  number: number;
  boolean: boolean;
  bigint: bigint;
  function: (...args: any[]) => any;
  symbol: symbol;
  object: object;
  undefined: undefined;
}

type ValueOf<T, V> = {
  [P in keyof T]: T[P] extends V ? P : never
}[keyof T];

type Flatten<T> = T extends Array<infer E> ? E : T;

type Matcher<T extends PrimitiveName = PrimitiveName, U = any> = T | T[] | TypeGuard<U>;
type MatchedType<T extends Matcher> = T extends TypeGuard<infer E> ? E : Primitive<Extract<Flatten<T>, PrimitiveName>>;

export type Primitive<K extends keyof Primitives = keyof Primitives> = Primitives[K];
export type PrimitiveName<V extends Primitive = Primitive> = ValueOf<Primitives, V>;
export type TypeGuard<T> = (x: any) => x is T;

export function guard<T>(f: (x: any) => boolean) {
  return f as TypeGuard<T>;
}

function matchType<T extends PrimitiveName>(types: T | T[]): TypeGuard<Primitive<T>> {
  return guard(x => {
    const type = typeof x;

    return Array.isArray(types) ?
        types.some(t => t === type) :
        types === type;
  });
}

export function isIn<T>(values: T[]): TypeGuard<T> {
  return guard(x => values.includes(x));
}

export function is<T extends PrimitiveName, U extends Primitives[T]>(types: Matcher<T, U>): TypeGuard<U> {
  return guard(typeof types === 'function' ? types : matchType(types));
}

export function isArray<T extends PrimitiveName, U extends Primitives[T]>(types: Matcher<T, U>): TypeGuard<U[]> {
  return guard(x => Array.isArray(x) && x.every(is(types)));
}

export function isObject<T extends Record<any, Matcher>>(obj: T): TypeGuard<{
  [P in keyof T]: MatchedType<T[P]>
}> {
  return guard(x => x != null &&
      typeof x === 'object' &&
      Object.entries(obj).every(([k ,v]) => is(v)(x[k])));
}


// TODO turn generic parameter types around, isObject<Foo> should return TypeGuard<Foo> and derive the input object
//  from T instead of the other way around