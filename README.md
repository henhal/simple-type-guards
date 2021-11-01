# simple-type-guards

Some very simple TypeScript type guard helpers.

## Installation

```
npm install simple-type-guards
```

## Usage

Imagine we have a type `Foo` like this:
```
interface Foo {
  a?: string;
  b: number;
  c: Array<{d: number}>;
}
```

To create a user-defined type guard for `Foo`, we can do this:

```
const isFoo = isObject({
  a: ['string', 'undefined'],
  b: 'number',
  c: isArray(isObject({d: 'number'}))
});
```

Now we can do

```
function someFunc(x: any) {
  if (isFoo(x)) {
    console.log(x.a, x.b, x.c[0].d); // x is properly typed as Foo
  }
}
```

It's also easy to test a variable that could be many types:

```

function someFunc(x: any) {
  if (is('string')(x)) {
    console.log(x.toLowerCase());
  } else if (isArray('number')(x)) {
    x.forEach(e => console.log(e.toExponential()));
  } else if (isIn('foo', 42)(x)) {
    x.forEach(e => console.log(e.toLowerCase()));
  } else if (isObject({foo: 'string', bar: 'number', baz: ['string', 'number']})(x)) {
    console.log(x.foo.toLowerCase(), x.bar.toExponential());
  }
}
```