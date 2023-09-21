const dotenv = require('dotenv').config()

describe('Endpoint \"/chat/create\" works properly', () => {

    let url;
    let endpoint;

    beforeEach(() => {

        url = `${process.env.API_IP}:${process.env.API_PORT}`
        endpoint = '/chat/create'

    })

    // Tests for URLS
    test('Should be defined in .env', () => {
        expect(url).toBeDefined()

        expect(typeof url).toBe('string')
        expect(url).toBe('http://localhost:3000')
        expect(url).toStrictEqual('http://localhost:3000')
        
        url += endpoint

        expect(url).toBe('http://localhost:3000/chat/create')
        expect(url).toStrictEqual('http://localhost:3000/chat/create')
    })

    // Tests for endpoint
    test('Different Methods', async () => {
        url += endpoint

        // Wrong Method Fails
        const postResponse = await fetch(url, {
            method: 'POST'
        })
            .then(res => res.json())
        
        expect(postResponse).toBeDefined()
        expect(postResponse).toEqual({
            code: 404,
            display: 'Failed to find such endpoint!'
        })

        const getResponse = await fetch(url, {
            method: 'GET'
        })
            .then(res => res.json())

        expect(getResponse).toBeDefined()
        expect(typeof getResponse).toBe('object')

        expect(getResponse.id).toBeDefined()
        expect(typeof getResponse.id).toBe('string')
        expect(getResponse.id.length).toBe(36)
    })

})