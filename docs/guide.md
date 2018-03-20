
# Guide

  이 가이드는 미들웨어 작성 및 응용 프로그램 구조 제안과 같은 모범 사례 등 API와 직접적인 관련이없는 Koa 의 항목들을 다룹니다. 
  예제들 에서는 비동기 함수를 미들웨어로 사용합니다. commonFunction 또는 generatorFunction을 사용하는 것과는 약간 다를 수 있습니다.

## Writing Middleware

  Koa 미들웨어는 파라미터(ctx, next)를 가진 `MiddlewareFunction` 을 반환하는 간단한 function 입니다. 
  미들웨어가 실행되면 `next()` 를 호출하는 코드를 작성해서 이어서 실행되어야할 "downstream" 미들웨어를 실행하도록 해야합니다.

  예를 들어 `X-Response-Time` 헤더 필드를 추가하여 요청이 Koa를 통해 전파되는 데 걸리는 시간을 추적하려는 경우 미들웨어는 다음과 같이 구현 할수 있습니다.

```js
async function responseTime(ctx, next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
}

app.use(responseTime);
```

  만일 프론트 엔드 개발자라면 `next();` 앞부분 에는 "capture" 단계로서 올수 있는 코드를 생각할 수 있습니다. 반면에 뒷부분에는 "bubble" 단계 코드 있을 수 있습니다.
  밑에 보이는 gif는 비동기 함수를 사용하여 스택 흐름을 적절하게 활용하여 request 및 response 흐름을 구현하는 방법을 보여줍니다.

![Koa middleware](/docs/middleware.gif)

   1. 응답 시간을 추적할 Date 객체 생성
   2. 다음 미들웨어의 종료까지 대기하도록 Await
   3. 또다른 시간을 추적하기 위해 Date 객체 생성
   4. 다음 미들웨어의 종료까지 대기하도록 Await
   5. 응답 body 에 "Hello World" 문자열을 세팅 
   6. 구간 시간값 계산
   7. 콘솔 로그 출력
   8. 응답 시간 계산
   9. `X-Response-Time` 헤더 필드에 값 세팅
   10. 응답을 처리를 Koa 로 넘김

 다음은 Koa 미들웨어를 생성하는 최적의 예제를 보겠습니다.

## Middleware Best Practices

  이 섹션에서는 미들웨어 옵션 값 확인, 디버깅을 위한 미들웨어 이름붙이기 등과 같은 미들웨어 제작 모범 사례에 대해 다룹니다.

### Middleware options


  공개될 미들웨어를 만들 때는 사용자가 기능을 확장을 용이하게 할 수 있도록
  미들웨어를 옵션을 사용하는 함수로 래핑해서 작성하는 컨벤션을 지키는것이 유용합니다. 
  개발하려는 미들웨어에서 옵션을 사용하지 않더라도, 이는 여전히 일관성을 유지하는 좋은 아이디어입니다.

  여기에서 고안된 `logger` 미들웨어는 커스터마이징을 위한 `format` 문자열을 파라미터로 받고 미들웨어 자체를 반환합니다.

```js
function logger(format) {
  format = format || ':method ":url"';

  return async function (ctx, next) {
    const str = format
      .replace(':method', ctx.method)
      .replace(':url', ctx.url);

    console.log(str);

    await next();
  };
}

app.use(logger());
app.use(logger(':method :url'));
```

### Named middleware

  미들웨어에 이름을 지정하는 것은 선택 사항이지만 디버깅 하는데 유용합니다.

```js
function logger(format) {
  return async function logger(ctx, next) {

  };
}
```

### Combining multiple middleware with koa-compose

  때로는 여러 미들웨어를 "구성"해서 하나의 미들웨어로 쉽게 재사용하거나 내보낼 수 있습니다. [koa-compose](https://github.com/koajs/compose) 를 사용할 수 있습니다.

```js
const compose = require('koa-compose');

async function random(ctx, next) {
  if ('/random' == ctx.path) {
    ctx.body = Math.floor(Math.random() * 10);
  } else {
    await next();
  }
};

async function backwards(ctx, next) {
  if ('/backwards' == ctx.path) {
    ctx.body = 'sdrawkcab';
  } else {
    await next();
  }
}

async function pi(ctx, next) {
  if ('/pi' == ctx.path) {
    ctx.body = String(Math.PI);
  } else {
    await next();
  }
}

const all = compose([random, backwards, pi]);

app.use(all);
```

  

### Response Middleware

  미들웨어가 request 에 응답하기로 결정하거나, 이어지는 다운스트림 미들웨어를 그냥 통과 시키려 한다면 `next()` 를 생략하면 됩니다. 
  일반적으로 이것은 라우팅 미들웨어에 있지만 이것은 어느곳이든 처리 할 수 있습니다. 
  예를 들어 다음은 "two" 로 응답하기는 하지만, 세 가지 미들웨어가 모두가 실행되기 때문에 마지막 "three" 미들웨어에서 응답을 변경 할 수 있는 기회가 제공됩니다.

```js
app.use(async function (ctx, next) {
  console.log('>> one');
  await next();
  console.log('<< one');
});

app.use(async function (ctx, next) {
  console.log('>> two');
  ctx.body = 'two';
  await next();
  console.log('<< two');
});

app.use(async function (ctx, next) {
  console.log('>> three');
  await next();
  console.log('<< three');
});
```

  The following configuration omits `next()` in the second middleware, and will still respond
  with "two", however the third (and any other downstream middleware) will be ignored:
  아래와 같은 경우에는 두 번째 미들웨어에서 `next()` 를 생략하여, 응답은 똑같이 "two" 이지만, 세 번째 (및 다른 다운 스트림 미들웨어)는 실행 되지 않습니다.

```js
app.use(async function (ctx, next) {
  console.log('>> one');
  await next();
  console.log('<< one');
});

app.use(async function (ctx, next) {
  console.log('>> two');
  ctx.body = 'two';
  console.log('<< two');
});

app.use(async function (ctx, next) {
  console.log('>> three');
  await next();
  console.log('<< three');
});
```

  가장 마지막 미들웨어가 `next();` 를 실행하면, 그때는 바로 noop 함수로 돌아갑니다. 그렇기 때문에 미들웨어는 스택안에 어느 위치에 있더라도 문제없이 동작하게 됩니다.

## Async operations

  Async 함수와 Promise 형식은 Koa의 기반을 형성하여 non-blocking sequential 코드를 작성할 수 있습니다. 
  예를 들어 아래 미들웨어는 `./docs` 에서 파일 이름을 읽은 다음, 
  응답 body 에 결과를 세팅하기 전에 병렬로 각 마크 다운 파일의 내용을 읽습니다.

```js
const fs = require('fs-promise');

app.use(async function (ctx, next) {
  const paths = await fs.readdir('docs');
  const files = await Promise.all(paths.map(path => fs.readFile(`docs/${path}`, 'utf8')));

  ctx.type = 'markdown';
  ctx.body = files.join('');
});
```

## Debugging Koa

  Koa와 함께 구축 된 많은 라이브러리는 간단한 조건부 로깅을 제공하는 [debug](https://github.com/visionmedia/debug) 환경 변수 __DEBUG__ 를 지원합니다.

  예를 들어 모든 Koa로 특정하는 디버깅 정보를 보려면 `DEBUG=koa*` 를 입력하고 부팅 하면, 사용되는 미들웨어 목록을 볼 수 있습니다.

```
$ DEBUG=koa* node --harmony examples/simple
  koa:application use responseTime +0ms
  koa:application use logger +4ms
  koa:application use contentLength +0ms
  koa:application use notfound +0ms
  koa:application use response +0ms
  koa:application listen +0ms
```
  JavaScript는 런타임에 function의 이름을 정의 할 수 없지만, 미들웨어는 런타임에 이름을 `._name`로 설정할 수도 있습니다. 
  이것은 미들웨어 이름을 제어 할 수없는 경우에 유용합니다. 

```js
const path = require('path');
const serve = require('koa-static');

const publicFiles = serve(path.join(__dirname, 'public'));
publicFiles._name = 'static /public';

app.use(publicFiles);
```

  Now, instead of just seeing "serve" when debugging, you will see:

```
  koa:application use static /public +0ms
```
