THIS DOCUMENT IS IN PROGRESS. THIS PARAGRAPH SHALL BE REMOVED WHEN THIS DOCUMENT IS DONE.

# Koa vs Express

  철학적으로 Koa는 "Node.JS의 수정 및 교체"를 목표로하고 있지만 Express는 "Node.JS를 확대"합니다. 
  Koa는 Promise 패턴과 Async 함수를 사용하여 콜백 헬 을 제거하고 에러 핸들링을 단순화합니다. 
  노드의 `req` 및 `res` 객체 대신 `ctx.request` 및 `ctx.response` 객체를 사용합니다.

  한편, Express는 Node.JS 의 `req` 및 `res` 객체를 추가 속성 및 메서드로 보완하며 라우팅 및 템플릿과 같은 많은 "프레임 워크" 기능까지 포함합니다. 반면에 Koa 는 그렇지 않습니다.

  따라서 Koa는 node.js의 http 모듈을 추상화 한 것으로 볼 수 있습니다. 반면에 Express는 node.js의 응용 프로그램 프레임 워크입니다.

| Feature           | Koa | Express | Connect |
|------------------:|-----|---------|---------|
| Middleware Kernel | ✓   | ✓       | ✓       |
| Routing           |     | ✓       |         |
| Templating        |     | ✓       |         |
| Sending Files     |     | ✓       |         |
| JSONP             |     | ✓       |         |

  따라서 node.js와 전통적인 node.js 스타일 코딩에 더 가까워지기를 원하면 Connect / Express 또는 유사한 프레임 워크를 계속 사용하고 싶을 것입니다. 
  콜백을 제거하려면 Koa를 사용하십시오.

  이 다른 철학의 결과로 전통적인 node.js "미들웨어", 즉 형태의 함수 `(req, res, next)`,는 Koa와 호환되지 않습니다. Express 로 구현된 미들웨어 코드는 기본적으로 다시 작성해야합니다.

## Does Koa replace Express?

  Connect와 더 비슷하지만 Koa에서는 수많은 Express 기능이 미들웨어 수준으로 옮겨져 강력한 기반을 형성했습니다. 
  따라서 최종 응용 프로그램 코드뿐만 아니라 전체 스택에 대해 미들웨어를보다 즐겁게 작성하고 오류 처리 관련 코드량을 줄여줍니다.

  일반적으로 많은 미들웨어가 비슷한 기능을 또 다시 구현하거나, 심지어는 잘못된 구현을 하기도합니다.
  다른 기능들 가운데 Signed 쿠키 기능 같은 경우 일반적으로 미들웨어에 특정하지 않고 전체 애플리케이션에 특정한 기능의 경우에 그렇습니다.

## Does Koa replace Connect?

  아닙니다.
  비슷한 기능을 구현할때 generator 덕분에 콜백 코드량이 줄어든 코드를 작성 할 수 있게되었습니다. 
  Connect는 동등하게 수용가능하며, 몇몇은  여전히 그것을 선호 할 수도 있습니다.
  무엇을 선호하냐의 차이입니다.

## Why isn't Koa just Express 4.0?

  Koa 는 사람들이 Express에 대해 익히 알고있는 것과는 상당한 거리가 있습니다. 
  설계가 근본적으로 매우 다르기 때문에 Express 3.0에서 Express 4.0으로의 마이그레이션을 하는 것은 전체 응용 프로그램을 다시 작성하는 것과 다를 바가 없습니다.
  실제로 아예 새로운 라이브러리를 만들었다 라고 보는것이 더 적절할 것이라고 생각합니다.

## How is Koa different than Connect/Express?

### Promises-based control flow

  콜백 헬이 없습니다.

  try/catch 구문을 통한 에러 핸들링이 개선되었습니다. 

  도메인이 필요하지 않습니다.

### Koa is barebones

  Connect와 Express와는 달리 Koa에는 미들웨어가 포함되어 있지 않습니다.

  Express와 달리 라우팅은 제공되지 않습니다.
  
  Express와는 달리 많은 편의 유틸리티가 제공되지 않습니다. 예 : 파일 전송.
  
  Koa는 모듈 방식에 가깝습니다.

### Koa relies less on middleware

  예를 들어, "body parsing" 미들웨어 대신 body parsing 함수를 사용합니다.

### Koa abstracts node's request/response

  Less hackery.

  사용자 환경을 개선했습니다.

  적절한 스트림 처리를 제공합니다.
  
### Koa routing (third party libraries support)

  Express는 자체 라우팅 기능을 제공하지만, Koa에는 내장 라우팅 기능이 없습니다. 
  하지만 라우팅 기능은 koa-router 및 koa-route 와같은 외부 라이브러리가 제공하고 있습니다. 
  마찬가지로 Express에서 보안 용 helmet 을 사용하는 것과 마찬가지로 Koa는 Koa-Helmet이나 또 다른 Koa 외부 라이브러리들이 있습니다.
