# Error Handling

## Try-Catch

  async 함수를 사용면, `next` 를 try-catch 할 수 있습니다. 
  아래 예제는 모든 err 객체에 `.status` 를 추가합니다.

  ```js
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      err.status = err.statusCode || err.status || 500;
      throw err;
    }
  });
  ```

### Default Error Handler

  기본 에러 핸들러는 미들웨어체인의 맨처음 미들웨어의 try-catch 입니다. 
  다른 에러 핸들러를 사용하려면 미들웨어체인 시작 부분에 또 다른 try-catch 를 코딩해서 에러를 처리하십시오. 
  그러나 대부분의 사용 사례에서는 기본 오류 처리기로 충분합니다. 
  `err.status` 에 지정된 상태 코드를 사용하며 지정되지 않았다면, 기본값 500을 사용합니다. 
  `err.expose` 의 값이 true이면 `err.message`의 값이 응답이 됩니다. 
  그렇지 않으면 에러 코드에서 생성 된 메시지가 사용됩니다(예 : 코드 500의 경우 "Internal Server Error" 메시지가 사용됨). 
  모든 request 의 모든 헤더가 지워지지만, `err.headers` 로 지정한 헤더는 설정 됩니다. 
  위에서 이야기한 대로 try-catch 를 사용하여 이 목록에 헤더를 추가 할 수 있습니다.

  에러 핸들러를 구현하는 예제는 다음과 같습니다.

```js
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // will only respond with JSON
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      message: err.message
    };
  }
})
```

## The Error Event

  에러 이벤트 리스너는 `app.on('error')` 와 같이 코드를 추가해주면 사용 할 수 있습니다. 
  에러 리스너를 지정하지 않으면 기본 에러 리스터가 사용됩니다. 
  에러 리스너는 미들웨어 체인을 통해 되돌아 오는 모든 오류를 수신합니다. 
  에러를 catch 하여 다시 throw 하지 않는다면 에러 리스너로 전달되지 않습니다. 
  에러 이벤트 리스너가 지정되지 않은 경우 단순하게 에러를 로깅하기 위한 목적으로 `app.onerror` 가 사용됩니다. 
  에러 로깅은 `error.expose`가 true 이고 `app.silent`가 false 인 경우에만 동작합니다.
