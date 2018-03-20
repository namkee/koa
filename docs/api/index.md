# Installation

  Koa는 ES2015 및 async 함수 지원을 위해 __node v7.6.0__ 이상이 필요합니다.

  원하는 버전 관리자를 사용하여 지원되는 노드 버전을 신속하게 설치할 수 있습니다.

```bash
$ nvm install 7
$ npm i koa
$ node my-koa-app.js
```

## Async Functions with Babel

노드 <7.6의 버전에서 Koa에서 `async` 함수를 사용하려면 babel의 [babel's require hook](http://babeljs.io/docs/usage/babel-register/) 을 사용하는 것이 좋습니다.

```js
require('babel-register');
// require the rest of the app that needs to be transpiled after the hook
const app = require('./app');
```

async 함수를 구문 분석하고 변환하려면 최소한 [transform-async-to-generator](http://babeljs.io/docs/plugins/transform-async-to-generator/) 또는 
[transform-async-to-module-method](http://babeljs.io/docs/plugins/transform-async-to-module-method/) 플러그인이 있어야합니다. 
예를 들어, `.babelrc` 파일에 다음이 있어야합니다.

```json
{
  "plugins": ["transform-async-to-generator"]
}
```
[env preset](http://babeljs.io/docs/plugins/preset-env/) 을 대상 옵션 `"node": "current"`  로 대신 사용할 수도 있습니다.

# Application

  Koa 애플리케이션은 미들웨어 함수들의 배열을 가진 객체입니다. 각 미들웨어 함수는 Requset 당 스택 방식으로 구성되고 실행됩니다.
  
  Koa는 Ruby의 Rack, Connect 등과 같은 다른 많은 미들웨어 시스템과 유사하지만,
  저수준의 미들웨어 계층에서 에서 높은 수준의 "슈가"를 제공하기위한 것이 핵심 설계 입니다.
  이것은 상호 운용성, 견고성을 향상시키고 미들웨어 작성을 훨씬 즐겁게 만듭니다.

  여기에는 콘텐츠 협상, 캐시 최신성, 프록시 지원 및 리디렉션과 같은 일반적인 작업을위한 방법이 포함됩니다. 
  Koa는 합리적으로 많은 수의 유용한 메소드를 제공 함에도 불구하고, 미들웨어가 기본 제공되지 않으므로 작은 규모를 유지합니다.
  
  Hello World 애플리케이션은 다음과 같습니다.

```js
const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

## Cascading

  코아 미들웨어는 비슷한 도구를 사용했던 방식처럼 전통적인 방식으로 계단식으로 연결됩니다. 
  이전에는 노드의 콜백 방식의 사용때문에 사용자 친화적인 방법을 사용하기가 어려웠습니다. 
  그러나 비동기 함수를 사용하면 "진정한" 미들웨어를 구현할 수 있습니다. 
  하나의 함수가 반환 될 때까지 일련의 함수를 통해 제어를 전달하는 Connect의 구현과 대조적으로 
  Koa는 "downstream"을 호출 한 다음 흐름을 "업스트림"으로 되돌립니다.

  다음 예는 "Hello World"로 응답하지만 요청이 시작되면 `x-response-time` 및 `logging` 미들웨어를 통해 먼저 요청이 전달 된 다음 응답 미들웨어를 통해 제어가 계속됩니다. 
  미들웨어가 `next()`를 호출하면 함수는 일시 중단하고 정의 된 다음 미들웨어로 제어를 전달합니다. 
  다운 스트림을 실행할 더 이상의 미들웨어가 없으면 스택이 풀리고 각 미들웨어가 재개되어 업스트림 동작을 수행합니다.


```js
const Koa = require('koa');
const app = new Koa();

// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// logger

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

// response

app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

## Settings

  애플리케이션 세팅은 `app` 인스턴스의 속성값입니다. 현재 다음과 같이 제공됩니다.

  - `app.env` __NODE_ENV__ 에 값을 설정하며 기본값은 "development"
  - `app.proxy` true 로 설정되면 proxy header 필드를 신뢰하여 사용하게됩니다. 
  - `app.subdomainOffset` offset of `.subdomains` to ignore [2]

## app.listen(...)

  Koa 응용 프로그램은 HTTP 서버의 1 대 1 표현이 아닙니다.
  하나의 HTTP 서버에 하나 이상의 Koa 응용 프로그램을 함께 탑재하여 더 큰 응용 프로그램을 형성 할 수 있습니다.

  `Server#listen()` 에 주어진 인자를 전달하여 HTTP 서버를 생성하고 반환합니다. 
  이 인자는 [nodejs.org](http://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback) 문서에 정리되어 있습니다.

  다음 코드는 `3000` 포트로 열려있는 아무것도 하지않는 Koa 애플리케이션 입니다.

```js
const Koa = require('koa');
const app = new Koa();
app.listen(3000);
```

  `app.listen(...)` 메소드는 아래 코드를 간략하게 사용하게 해주는 좋은.. 슈가..

```js
const http = require('http');
const Koa = require('koa');
const app = new Koa();
http.createServer(app.callback()).listen(3000);
```

  즉, HTTP 및 HTTPS 또는 여러 주소에서 동일한 애플리케이션을 시작할 수 있습니다.

```js
const http = require('http');
const https = require('https');
const Koa = require('koa');
const app = new Koa();
http.createServer(app.callback()).listen(3000);
https.createServer(app.callback()).listen(3001);
```

## app.callback()

  `http.createServer()` 메서드가 요청을 처리하기 위해 적합한 콜백 함수를 반환합니다. 
  이 콜백 함수를 사용하여 Connect / Express애플리케이션에 탑재해서 Koa 애플리케이션을 사용하게 할 수도 있습니다. 

## app.use(function)
  이 미들웨어 함수를 애플리케이션에 추가하십시오. 자세한 정보는 [Middleware](https://github.com/koajs/koa/wiki#middleware) 를 참조하십시오.

## app.keys=

  Signed 쿠키 의 키를 세팅합니다. 

  이 값은 [KeyGrip](https://github.com/jed/keygrip) 에 전달됩니다. 
  `KeyGrip` 인스턴스를 별도로 만들어 전달 할 수도 있습니다. 예를들어 다음의 코드가 가능합니다. 

```js
app.keys = ['im a newer secret', 'i like turtle'];
app.keys = new KeyGrip(['im a newer secret', 'i like turtle'], 'sha256');
```

  이 키들은 `{ signed: true }` 옵션 이라면, 쿠키들을 서명처리 할때 순차적으로 사용됩니다. 

```js
ctx.cookies.set('name', 'tobi', { signed: true });
```

## app.context

  `app.context` 는 `ctx` 가 생성되는 prototype 타입입니다. `app.context` 를 수정해서 `ctx` 에 추가 속성을 추가 할 수 있습니다. 
  이 방법이 전체 앱에서 사용할 속성 또는 메서드를 추가하는 방법으로 유용한 방법입니다.
  `ctx`에 좀더 의존하는 것은 안티패턴 이긴 하지만, 성능면에서 더 낫고(미들웨어를 사용하지 않으므로), 비용면에서 더 편리합니다(require()` 코드 사용 빈도가 적으므로).

  예를 들어 `ctx` 에서 db에 대한 참조를 추가하는 방법은 다음과 같습니다. 

```js
app.context.db = db();

app.use(async ctx => {
  console.log(ctx.db);
});
```

Note:
- `ctx` 의 많은 속성은 getters, setters 및 `Object.defineProperty()` 를 사용하여 정의할 수 있습니다. `app.context` 에서 `Object.defineProperty()` 를 사용해야만 이러한 속성 편집 할 수 있습니다.(권장되지 않음) See . https://github.com/koajs/koa/issues/652.
- 마운트 된 앱은 현재 부모의 `ctx` 및 설정을 사용합니다. 따라서 마운트 된 앱들은 그저 미들웨어 그룹들 이라고 할수 있습니다.

## Error Handling
  기본적으로 `app.silent` 값이 `true`가 아닌 경우 모든 오류를 stderr로 출력합니다. 
  `err.status`가 `404`이거나 `err.expose`가 `true` 일 때 기본 에러 핸들러는 오류를 출력하지 않습니다. 
  중앙 집중식 로깅과 같은 에러 핸들링 커스터마이징 로직을 수행하려면 "error" event listener 를 추가 할 수 있습니다.

```js
app.on('error', err => {
  log.error('server error', err)
});
```
  req/res 처리과정에서 오류가 발생 했고, 클라이언트에 전달 할 수 없으면 `Context` 인스턴스도 그냥 통과 합니다. 

```js
app.on('error', (err, ctx) => {
  log.error('server error', err, ctx)
});
```
  오류가 발생하고 여전히 클라이언트에 응답 할 수 있으면 소켓에 데이터가 기록되지 않은 상태에서 Koa는 500 "Internal Server Error"로 적절하게 응답합니다. 
  두 경우 모두 로깅 목적으로 앱 수준의 "error"가 발생합니다.
