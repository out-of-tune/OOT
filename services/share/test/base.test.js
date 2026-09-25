const { describe, test } = require('node:test')
const assert = require('node:assert/strict')
const BaseAPI = require('../datasources/arangodb/base')
const { increment } = require('../datasources/arangodb/share')

describe('BaseAPI.reducer', () => {
    const base = new BaseAPI(null)

    test('converts _id', () => {
        assert.deepStrictEqual(base.reducer({ _id: '1234' }), { id: '1234' })
    })

    test('removes _key', () => {
        assert.deepStrictEqual(base.reducer({ _key: '1234', _id: '' }), { id: '' })
    })

    test('keeps other fields', () => {
        assert.deepStrictEqual(base.reducer({ name: '1234', _id: '' }), { name: '1234', id: '' })
    })
})

describe('share id', () => {
    test('increments base58 ids', () => {
        assert.equal(increment('abcd'), 'abce')
        assert.notEqual(increment('abcz'), 'abcz')
    })
})
