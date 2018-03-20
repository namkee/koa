# Migrating from Koa v1.x to v2.x

## New middleware signature 

Koa v2 introduces a new signature for middleware.

**Old signature middleware (v1.x) support will be removed in v3**

The new middleware signature is:

```js
// uses async arrow functions
app.use(async (ctx, next) => {
  try {
    await next() // next is now a function
  } catch (err) {
    ctx.body = { message: err.message }
    ctx.status = err.status || 500
  }
})

app.use(async ctx => {
  const user = await User.getById(this.session.userid) // await instead of yield
  ctx.body = user // ctx instead of this
})
```

반드시 비동기 함수를 사용할 필요는 없습니다. Promise 을 반환하는 함수를 전달하면됩니다. Promise을 반환하는 정규 함수도 작동합니다!

함수 형상이 `this` 대신 위의 코드 처럼 매개 변수 `ctx` 를 통해 `Context`를 전달하도록 변경되었습니다. 
Context 의 전달 방법의 변경은 Koa가 `this`를 확보하고 있는 es6 arrow 함수와 더 호환되도록 만듭니다.

## Using v1.x Middleware in v2.x
Koa v2.x는 [koa-convert](https://github.com/koajs/convert) 를 사용하여 app.use에서 기존의 함수 형상, generator 미들웨어를 변환을 시도합니다. (지원합니다.)
그러나 가능한 한 빨리 모든 v1.x 미들웨어를 마이그레이션하도록 선택하는 것이 좋습니다.

```js
// Koa will convert
app.use(function *(next) {
  const start = Date.now();
  yield next;
  const ms = Date.now() - start;
  console.log(`${this.method} ${this.url} - ${ms}ms`);
});
```

You could do it manually as well, in which case Koa will not convert.

```js
const convert = require('koa-convert');

app.use(convert(function *(next) {
  const start = Date.now();
  yield next;
  const ms = Date.now() - start;
  console.log(`${this.method} ${this.url} - ${ms}ms`);
}));
```

## Upgrading middleware

You will have to convert your generators to async functions with the new middleware signature:

```js
app.use(async (ctx, next) => {
  const user = await Users.getById(this.session.user_id);
  await next();
  ctx.body = { message: 'some message' };
})
```

Upgrading your middleware may require some work. One migration path is to update them one-by-one.

1. Wrap all your current middleware in `koa-convert`
2. Test
3. `npm outdated` to see which Koa middleware is outdated
4. Update one outdated middleware, remove using `koa-convert`
5. Test
6. Repeat steps 3-5 until you're done


## Updating your code

You should start refactoring your code now to ease migrating to Koa v2:

- Return promises everywhere!
- Do not use `yield*`
- Do not use `yield {}` or `yield []`.
  - Convert `yield []` into `yield Promise.all([])`
  - Convert `yield {}` into `yield Bluebird.props({})`

 

Koa 미들웨어 함수의 외부에서 로직을 리팩터링 할 수도 있습니다. 
`function* someLogic(ctx) {}`와 같은 함수를 생성하고 미들웨어에서 `const result = yield someLogic(this)` 와 같이 호출합니다. 
`this` 를 사용하지 않은 미들웨어라면, 새로운 미들웨어 형상으로 마이그레이션하는 데 도움이됩니다.


## Application object constructor requires new 

v1.x에서는 애플리케이션의 인스턴스를 인스턴스화 하는데, 애플리케이션 생성자 함수를 `new` 이 직접 호출 할 수있었습니다.


```js
var koa = require('koa');
var app = module.exports = koa();
```
v2.x는 'new` 키워드가 반드시 필요한 es6 클래스를 사용합니다.

```js
var koa = require('koa');
var app = module.exports = new koa();
```

## ENV specific logging behavior removed

An explicit check for the `test` environment was removed from error handling. 

## Dependency changes

- [co](https://github.com/tj/co) is no longer bundled with Koa.  Require or import it directly.
- [composition](https://github.com/thenables/composition) is no longer used and deprecated.

## v1.x support

The v1.x branch is still supported but should not receive feature updates.  Except for this migration
guide, documentation will target the latest version.

## Help out

If you encounter migration related issues not covered by this migration guide, please consider 
submitting a documentation pull request.
