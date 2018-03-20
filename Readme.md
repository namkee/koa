<img src="/docs/logo.png" alt="Koa middleware framework for nodejs"/>

  [![gitter][gitter-image]][gitter-url]
  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]
  [![OpenCollective Backers][backers-image]](#backers)
  [![OpenCollective Sponsors][sponsors-image]](#sponsors)

## Introduction

  Koa는 웹 애플리케이션 및 API를 위한 작고 표현력이 뛰어나며 견고한 기반을 목표로하는 Express 팀의 새로운 웹 프레임 워크입니다. 
  generator의 활용을 통해 Koa는 콜백을 제거하고 오류 처리를 크게 향상시켜 제공합니다. 
  Koa는 core 안에 어떤 미들웨어도 번들로 제공하지 않으며, 그래서 서버를 좀더 빠르고 재미있게 작성할 수 있는 우아한 일련의 메소드를 제공합니다.

  거의 모든 HTTP 서버들에서 공통적인 메소드들만 Koa와( ~570 SLOC) 직접 통합됩니다.
  공통적인 메소드들에는 내용 협상, 노드 불일치의 표준화, 리디렉션 및 몇 가지 다른 것들이 포함됩니다.

  Koa는 어떠한 미들웨어도 번들링 하지 않습니다.

## Installation

Koa requires __node v7.6.0__ or higher for ES2015 and async function support.

```
$ npm install koa
```

## Hello Koa

```js
const Koa = require('koa');
const app = new Koa();

// response
app.use(ctx => {
  ctx.body = 'Hello Koa';
});

app.listen(3000);
```

## Getting started

 - [Kick-Off-Koa](https://github.com/koajs/kick-off-koa) - An intro to Koa via a set of self-guided workshops.
 - [Workshop](https://github.com/koajs/workshop) - A workshop to learn the basics of Koa, Express' spiritual successor.
 - [Introduction Screencast](http://knowthen.com/episode-3-koajs-quickstart-guide/) - An introduction to installing and getting started with Koa


## Middleware
Koa는 미들웨어로써 같은 두 가지 다른 종류의 기능을 수행 할 수있는 미들웨어 프레임 워크입니다.

  * 비동기 function
  * 일반적인 function

Here is an example of logger middleware with each of the different functions:

### ___async___ functions (node v7.6+)

```js
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});
```

### Common function

```js
// Middleware normally takes two parameters (ctx, next), ctx is the context for one request,
// next is a function that is invoked to execute the downstream middleware. It returns a Promise with a then function for running code after completion.

app.use((ctx, next) => {
  const start = Date.now();
  return next().then(() => {
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  });
});
```

### Koa v1.x Middleware Signature

미들웨어 형상이 v1.x와 v2.x간에 변경되었습니다. 이전 형상은 더 이상 사용되지 않습니다.

**이전 형상의 미들웨어 사용 지원은 v3에서 제거됩니다.**

Please see the [Migration Guide](docs/migration.md) for more information on upgrading from v1.x and
using v1.x middleware with v2.x.

## Context, Request and Response

각 미들웨어는 http 메시지와 해당 메시지에 대한 응답을 캡슐화하는 Koa `Context` 객체를 수신합니다. `ctx` 는 종종 Context 갹체의 매개 변수 이름으로 사용됩니다.

```js
app.use(async (ctx, next) => { await next(); });
```

 


Koa는 `Context`의 `request` 속성으로 `Request` 객체를 제공합니다.
Koa의 `Request` 객체는 nodejs의 `http` 모듈로부터 [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage) 에 위임한 
http request를 처리하는 데 유용한 메소드를 제공합니다.

다음은 요청 클라이언트가 xml을 지원하는지 확인하는 예제입니다.

```js
app.use(async (ctx, next) => {
  ctx.assert(ctx.request.accepts('xml'), 406);
  // equivalent to:
  // if (!ctx.request.accepts('xml')) ctx.throw(406);
  await next();
});
```

Koa는 `Context`의 `response` 속성으로 `Response` 객체를 제공합니다.
Koa의 `Response` 객체는 [ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse) 에 위임한 
http response를 처리하는 데 유용한 메소드를 제공합니다.

Koa가 nodejs 의 요청 및 응답 객체를 확장하는 대신 위임하는 패턴은 보다 깨끗한 인터페이스를 제공하고 
다른 미들웨어와 nodejs 자체 간의 충돌을 줄이면서 스트림 처리를보다 잘 지원합니다. 

`IncomingMessage` 는 `Context`의 `req` 속성으로 직접 접근 할수  있으며, `ServerResponse` 또한 `Context`의 `res` 속성으로의 직접 접근 할 수 있습니다.

다음은 Koa의 `Response` 객체를 사용하여 파일을 응답 body로 스트리밍하는 예제입니다.

```js
app.use(async (ctx, next) => {
  await next();
  ctx.response.type = 'xml';
  ctx.response.body = fs.createReadStream('really_large.xml');
});
```

`Context` 객체는 `request` 및 `response` 에서 메서드에 대한 바로 가기도 제공합니다. 

위 코드 예제에서는 `ctx.request.type` 대신 `ctx.type` 을 사용할 수 있으며 `ctx.request.accepts` 대신 `ctx.accepts` 를 사용할 수 있습니다.

`Request`,  `Response` 및 `Context`에 대한 자세한 내용은 [Request API Reference](docs/api/request.md),
[Response API Reference](docs/api/response.md) 및 [Context API Reference](docs/api/context.md) 를 참조하십시오.


## Koa Application

`new Koa()` 를 실행할 때 생성 된 객체는 Koa 애플리케이션 객체로 알려져 있습니다.

애플리케이션 객체는 nodejs의 http 서버와의 Koa 인터페이스이며 미들웨어 등록, http에서 미들웨어로 전달, 기본 에러 핸들링, 
컨텍스트, 요청, 응답 객체의 설정을 처리합니다.

Application Object Reference에 대한 자세한 내용은 [Application API Reference](docs/api/index.md). 를 참조하십시오.

## Documentation

 - [Usage Guide](docs/guide.md)
 - [Error Handling](docs/error-handling.md)
 - [Koa for Express Users](docs/koa-vs-express.md)
 - [FAQ](docs/faq.md)
 - [API documentation](docs/api/index.md)

## Babel setup

If you're not using `node v7.6+`, we recommend setting up `babel` with [`babel-preset-env`](https://github.com/babel/babel-preset-env):

```bash
$ npm install babel-register babel-preset-env --save
```

Setup `babel-register` in your entry file:

```js
require('babel-register');
```

And have your `.babelrc` setup:

```json
{
  "presets": [
    ["env", {
      "targets": {
        "node": true
      }
    }]
  ]
}
```

## Troubleshooting

Check the [Troubleshooting Guide](docs/troubleshooting.md) or [Debugging Koa](docs/guide.md#debugging-koa) in
the general Koa guide.

## Running tests

```
$ npm test
```

## Authors

See [AUTHORS](AUTHORS).

## Community

 - [Badgeboard](https://koajs.github.io/badgeboard) and list of official modules
 - [Examples](https://github.com/koajs/examples)
 - [Middleware](https://github.com/koajs/koa/wiki) list
 - [Wiki](https://github.com/koajs/koa/wiki)
 - [G+ Community](https://plus.google.com/communities/101845768320796750641)
 - [Reddit Community](https://www.reddit.com/r/koajs)
 - [Mailing list](https://groups.google.com/forum/#!forum/koajs)
 - [中文文档 v1.x](https://github.com/guo-yu/koa-guide)
 - [中文文档 v2.x](https://github.com/demopark/koa-docs-Zh-CN)
 - __[#koajs]__ on freenode

## Job Board

Looking for a career upgrade?

<a href="https://astro.netlify.com/automattic"><img src="https://astro.netlify.com/static/automattic.png"></a>
<a href="https://astro.netlify.com/segment"><img src="https://astro.netlify.com/static/segment.png"></a>
<a href="https://astro.netlify.com/auth0"><img src="https://astro.netlify.com/static/auth0.png"/></a>

## Backers

Support us with a monthly donation and help us continue our activities.

<a href="https://opencollective.com/koajs/backer/0/website" target="_blank"><img src="https://opencollective.com/koajs/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/1/website" target="_blank"><img src="https://opencollective.com/koajs/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/2/website" target="_blank"><img src="https://opencollective.com/koajs/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/3/website" target="_blank"><img src="https://opencollective.com/koajs/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/4/website" target="_blank"><img src="https://opencollective.com/koajs/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/5/website" target="_blank"><img src="https://opencollective.com/koajs/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/6/website" target="_blank"><img src="https://opencollective.com/koajs/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/7/website" target="_blank"><img src="https://opencollective.com/koajs/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/8/website" target="_blank"><img src="https://opencollective.com/koajs/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/9/website" target="_blank"><img src="https://opencollective.com/koajs/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/10/website" target="_blank"><img src="https://opencollective.com/koajs/backer/10/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/11/website" target="_blank"><img src="https://opencollective.com/koajs/backer/11/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/12/website" target="_blank"><img src="https://opencollective.com/koajs/backer/12/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/13/website" target="_blank"><img src="https://opencollective.com/koajs/backer/13/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/14/website" target="_blank"><img src="https://opencollective.com/koajs/backer/14/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/15/website" target="_blank"><img src="https://opencollective.com/koajs/backer/15/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/16/website" target="_blank"><img src="https://opencollective.com/koajs/backer/16/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/17/website" target="_blank"><img src="https://opencollective.com/koajs/backer/17/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/18/website" target="_blank"><img src="https://opencollective.com/koajs/backer/18/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/19/website" target="_blank"><img src="https://opencollective.com/koajs/backer/19/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/20/website" target="_blank"><img src="https://opencollective.com/koajs/backer/20/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/21/website" target="_blank"><img src="https://opencollective.com/koajs/backer/21/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/22/website" target="_blank"><img src="https://opencollective.com/koajs/backer/22/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/23/website" target="_blank"><img src="https://opencollective.com/koajs/backer/23/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/24/website" target="_blank"><img src="https://opencollective.com/koajs/backer/24/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/25/website" target="_blank"><img src="https://opencollective.com/koajs/backer/25/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/26/website" target="_blank"><img src="https://opencollective.com/koajs/backer/26/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/27/website" target="_blank"><img src="https://opencollective.com/koajs/backer/27/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/28/website" target="_blank"><img src="https://opencollective.com/koajs/backer/28/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/29/website" target="_blank"><img src="https://opencollective.com/koajs/backer/29/avatar.svg"></a>


## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

<a href="https://opencollective.com/koajs/sponsor/0/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/1/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/2/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/3/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/4/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/5/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/6/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/7/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/8/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/9/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/10/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/11/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/12/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/13/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/14/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/15/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/15/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/16/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/17/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/18/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/19/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/20/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/21/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/22/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/23/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/24/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/25/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/26/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/27/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/28/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/29/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/29/avatar.svg"></a>

# License

  MIT

[npm-image]: https://img.shields.io/npm/v/koa.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/koa
[travis-image]: https://img.shields.io/travis/koajs/koa/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/koajs/koa
[coveralls-image]: https://img.shields.io/codecov/c/github/koajs/koa.svg?style=flat-square
[coveralls-url]: https://codecov.io/github/koajs/koa?branch=master
[backers-image]: https://opencollective.com/koajs/backers/badge.svg?style=flat-square
[sponsors-image]: https://opencollective.com/koajs/sponsors/badge.svg?style=flat-square
[gitter-image]: https://img.shields.io/gitter/room/koajs/koa.svg?style=flat-square
[gitter-url]: https://gitter.im/koajs/koa?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[#koajs]: https://webchat.freenode.net/?channels=#koajs
