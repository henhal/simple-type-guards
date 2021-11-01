type Primitives = {
  string: string;
  number: number;
  boolean: boolean;
  bigint: bigint;
  function: Function;
  symbol: symbol;
  object: object | null;
  undefined: undefined;
}

export type TypeGuard<T> = (x: any) => x is T;

/**
 * A matcher for a type, which is either a single primitive name, a list of primitive names, or a type guard function
 */
export type Matcher<P extends PrimitiveName = PrimitiveName, T = any> = P | P[] | TypeGuard<T>;

type Flatten<T> = T extends Array<infer E> ? E : T;
type MatchedType<T extends Matcher> = T extends TypeGuard<infer E> ? E : Primitive<Extract<Flatten<T>, PrimitiveName>>;

export type Primitive<K extends keyof Primitives = keyof Primitives> = Primitives[K];

export type PrimitiveName<V extends Primitive = Primitive> =
    V extends string ? 'string' :
        V extends number ? 'number' :
            V extends boolean ? 'boolean' :
                V extends bigint ? 'bigint' :
                    V extends Function ? 'function' :
                        V extends symbol ? 'symbol' :
                            V extends object | null ? 'object' :
                                V extends undefined ? 'undefined' :
                                    never;

export function guard<T>(f: (x: any) => boolean) {
  return f as TypeGuard<T>;
}


/**
 * Return a type guard function checking whether a value is the type defined by the matcher
 * @param matcher
 */
export function is<P extends PrimitiveName, T extends Primitives[P]>(matcher: Matcher<P, T>): TypeGuard<T> {
  return typeof matcher === 'function' ?
      matcher :
      Array.isArray(matcher) ?
          guard(x => matcher.some(t => t === typeof x)) :
          guard(x => matcher === typeof x);
}


/**
 * Return a type guard function checking whether a value is an array where each element matches the matcher
 * @param matcher
 */
export function isArray<P extends PrimitiveName, T extends Primitives[P]>(matcher: Matcher<P, T>): TypeGuard<T[]> {
  return guard(x => Array.isArray(x) && x.every(is(matcher)));
}

/**
 * Return a type guard function checking whether a value is an object with the entries defined by the given map of property names to matchers
 * @param matchObj
 */
export function isObject<M extends Record<any, Matcher>>(matchObj: M): TypeGuard<{
  [K in keyof M]: MatchedType<M[K]>
}> {
  return guard(x => x != null &&
      typeof x === 'object' &&
      Object.entries(matchObj).every(([k, v]) => is(v)(x[k])));
}

/**
 * Return a type guard function checking whether a value equals one of the given values
 * @param values
 */
export function isIn<T>(values: T[]): TypeGuard<T> {
  return guard(x => values.includes(x));
}
