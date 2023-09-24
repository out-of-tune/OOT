import BaseAPI from './base'

describe('BaseAPI.reducer', () => {
    test('BaseAPI reducer converts _id', () => {
        const base = new BaseAPI(null)
        expect(base.reducer({_id:"1234"}))
            .toStrictEqual({id:"1234"})
    })
    
    test('BaseAPI reducer removes _key', () => {
        const base = new BaseAPI(null)
        expect(base.reducer({_key:"1234", _id:''}))
            .toStrictEqual({id:''})
    })
    
    test('BaseAPI reducer keeps others', () => {
        const base = new BaseAPI(null)
        expect(base.reducer({name:"1234", _id:''}))
            .toStrictEqual({name:"1234", id:''})
    })
})
