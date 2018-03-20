# Context

  Koa Context는 노드의 `request` 및 `response` 객체를 단일 객체로 캡슐화하여 웹 응용 프로그램 및 API를 작성하는 데 유용한 방법을 제공합니다. 
  상위 단계의 프레임워크 대신에 이 단계에 추가하게 되는 작업은 HTTP 서버 개발을 하다보면 아주 빈번하게 일어나는 일입니다. 그러다보니 미들웨어에서 공통의 기능들을 자꾸 재구현하는 일들이 발생하죠.

  `Context`는 요청 당 하나씩 만들어지며, 미들웨어에서 수신자로써 참조되거나, `ctx` 라는 식별자로 참조됩니다. 다음의 코드를 확인하세요.

```js
app.use(async ctx => {
  ctx; // is the Context
  ctx.request; // is a Koa Request
  ctx.response; // is a Koa Response
});
```
  Context의 접근자 및 메서드 중 많은 부분이 편의상 간단하게 `ctx.request` 또는 `ctx.response` 로 위임합니다. 그리고 그외의 다른 것들은 동일합니다. 
  예를 들어 `ctx.type`과 `ctx.length`는 `response` 객체를 위임하고 `ctx.path`와 `ctx.method`는 `request` 객체를 위임합니다.

## API

  `Context` 의 메소드와 접근자

### ctx.req

  Node's `request` object.

### ctx.res

  Node's `response` object.

  Koa가 수행하는 응답 처리를 우회하는 것은 지원되지 않습니다. 다음 node.js 속성을 사용하지 마십시오.

- `res.statusCode`
- `res.writeHead()`
- `res.write()`
- `res.end()`

### ctx.request

  A Koa `Request` object.

### ctx.response

  A Koa `Response` object.

### ctx.state
  다른 미들웨어나 view 레이어에 정보를 전달하기 위해 권장되는 네임스페이스입니다.

```js
ctx.state.user = await User.find(id);
```

### ctx.app

  애플리케이션 인스턴스의 레퍼런스.

### ctx.cookies.get(name, [options])

  쿠키에서 `name` 에 해당하는 값을 `options` 를 활용해 가져온다.

 - `signed` the cookie requested should be signed

Koa uses the [cookies](https://github.com/jed/cookies) module where options are simply passed.

### ctx.cookies.set(name, value, [options])

  Set cookie `name` to `value` with `options`:

 - `maxAge` a number representing the milliseconds from Date.now() for expiry
 - `signed` sign the cookie value
 - `expires` a `Date` for cookie expiration
 - `path` cookie path, `/'` by default
 - `domain` cookie domain
 - `secure` secure cookie
 - `httpOnly` server-accessible cookie, __true__ by default
 - `overwrite` a boolean indicating whether to overwrite previously set cookies of the same name (__false__ by default). If this is true, all cookies set during the same request with the same name (regardless of path or domain) are filtered out of the Set-Cookie header when setting this cookie.

Koa uses the [cookies](https://github.com/jed/cookies) module where options are simply passed.

### ctx.throw([status], [msg], [properties])
  
  에러 발생 상황에서 Koa가 적절하게 응답 할 수 있게 해주는 헬퍼 메서드 입니다. `.status` 에 값을 지정할수 있으며 기본값은 `500`입니다.
  다음 조합으로 사용 할 수 있습니다.

```js
ctx.throw(400);
ctx.throw(400, 'name required');
ctx.throw(400, 'name required', { user: user });
```

  예를들어 `ctx.throw(400, 'name required')` 는 다음의 코드를 실행한 것과 동일합니다.

```js
const err = new Error('name required');
err.status = 400;
err.expose = true;
throw err;
```
  이는 사용자 수준의 오류이며 `err.expose`라는 플래그값으로 메시지가 클라이언트 응답으로 전달되는 것을 허용할지 여부를 지정합니다. 
  일반적으로 오류 세부 사항을 유출하지 않기 때문에 오류 메시지의 경우는 일반적으로 `true`로 지정하지 않습니다.

  `properties` 객체를 전달하게 되면 `error` 에 병합되어, 호출자에 보고될수 있습니다. 
  에러에 대한 처리를 좀더 자동화 하는데 유용하게 쓰일수 있습니다.


```js
ctx.throw(401, 'access_denied', { user: user });
```

Koa는 error 를 생성하는데 [http-errors](https://github.com/jshttp/http-errors) 를 사용합니다.

### ctx.assert(value, [status], [msg], [properties])

  `.throw()` 와 유사하게 에러를 던지는 헬퍼 메소드 입니다. 전달되는 value 의 `!value` 연산 결과가 true 인경우 에러를 던집니다.
  nodejs 의 [assert()](http://nodejs.org/api/assert.html) 메소드와 유사합니다. 

```js
ctx.assert(ctx.state.user, 401, 'User not found. Please login!');
```

Koa 는 assertions 으로 [http-assert](https://github.com/jshttp/http-assert) 를 사용합니다.

### ctx.respond

  Koa의 기본 응답 처리를 우회하려면 `ctx.respond = false;`를 명시적으로 설정할 수 있습니다. 
  Koa가 응답을 처리하는 대신 원시 nodejs의 `res` 객체에 사용하고 싶을 때 이것을 사용하십시오.

  이것을 사용하는 것은 Koa에서 지원되지 않습니다. 
  이것은 Koa 미들웨어 및 Koa 자체의 의도 된 기능을 손상시킬 수 있습니다. 
  이 속성을 사용하는 것은 해킹으로 간주되며 Koa 내에서 기존에 사용하던 `fn(req, res)` 함수 및 미들웨어를 사용하려는 사람들에게 편의를 제공합니다.

## Request aliases

  The following accessors and alias [Request](request.md) equivalents:

  - `ctx.header`
  - `ctx.headers`
  - `ctx.method`
  - `ctx.method=`
  - `ctx.url`
  - `ctx.url=`
  - `ctx.originalUrl`
  - `ctx.origin`
  - `ctx.href`
  - `ctx.path`
  - `ctx.path=`
  - `ctx.query`
  - `ctx.query=`
  - `ctx.querystring`
  - `ctx.querystring=`
  - `ctx.host`
  - `ctx.hostname`
  - `ctx.fresh`
  - `ctx.stale`
  - `ctx.socket`
  - `ctx.protocol`
  - `ctx.secure`
  - `ctx.ip`
  - `ctx.ips`
  - `ctx.subdomains`
  - `ctx.is()`
  - `ctx.accepts()`
  - `ctx.acceptsEncodings()`
  - `ctx.acceptsCharsets()`
  - `ctx.acceptsLanguages()`
  - `ctx.get()`

## Response aliases

  The following accessors and alias [Response](response.md) equivalents:

  - `ctx.body`
  - `ctx.body=`
  - `ctx.status`
  - `ctx.status=`
  - `ctx.message`
  - `ctx.message=`
  - `ctx.length=`
  - `ctx.length`
  - `ctx.type=`
  - `ctx.type`
  - `ctx.headerSent`
  - `ctx.redirect()`
  - `ctx.attachment()`
  - `ctx.set()`
  - `ctx.append()`
  - `ctx.remove()`
  - `ctx.lastModified=`
  - `ctx.etag=`
