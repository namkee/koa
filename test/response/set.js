
'use strict';

const assert = require('assert');
const context = require('../helpers/context');

describe('ctx.set(name, val)', () => {
  it('should set a field value', () => {
    const ctx = context();
    ctx.set('x-foo', 'bar');
    assert.equal(ctx.response.header['x-foo'], 'bar');
  });

  it('should coerce to a string', () => {
    const ctx = context();
    ctx.set('x-foo', 5);
    assert.equal(ctx.response.header['x-foo'], '5');
  });

  it('should set a field value of array', () => {
    const ctx = context();
    ctx.set('x-foo', ['foo', 'bar']);
    assert.deepEqual(ctx.response.header['x-foo'], [ 'foo', 'bar' ]);
  });
});

describe('ctx.set(object)', () => {
  it('should set multiple fields', () => {
    const ctx = context();

    ctx.set({
      foo: '1',
      bar: '2'
    });

    assert.equal(ctx.response.header.foo, '1');
    assert.equal(ctx.response.header.bar, '2');
  });
});
