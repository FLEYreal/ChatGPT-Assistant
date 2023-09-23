// Configs
require('dotenv').config()

// Endpoints
const endpoints = require('../endpoints.json')

class TestEndpoints {

    constructor(url = `${process.env.API_IP}:${process.env.API_PORT}` || 'http://localhost:3000', endpoint = {}) {
        this.endpoint = endpoint;
        this.url = url;
    }

    // Common tests to endpoints
    async commonTests() {
        const response = await fetch(`${this.url}${this.endpoint.url}`, {
            method: this.endpoint.method
        })
        const data = await response.json()

        // Tests to response of URL
        expect(data).toBeDefined()
        expect(typeof data).toBe('object')
        expect(response.status).toEqual(200)

    }

    // Common tests to URL
    urlTests() {

        // IP and PORT should be defined in .env file
        expect(process.env.API_IP).toBeDefined()
        expect(typeof process.env.API_IP).toBe('string')

        expect(process.env.API_PORT).toBeDefined()
        expect(typeof process.env.API_PORT).toBe('string')

        // Tests to URL
        expect(this.url).toBeDefined()
        expect(typeof this.url).toBe('string')
        expect(this.url).toBe(`${process.env.API_IP}:${process.env.API_PORT}` || 'http://localhost:3000')
        expect(this.url).toStrictEqual(`${process.env.API_IP}:${process.env.API_PORT}` || 'http://localhost:3000')

    }

    // Common tetss to Endpoints
    endpointTests(fit = null, method = null) {

        expect(this.endpoint).toBeDefined()
        expect(typeof this.endpoint).toBe('object')

        expect(this.endpoint).toMatchObject({
            method: expect.any(String),
            url: expect.any(String)
        })

        if (fit) expect(this.endpoint.url).toBe(fit)
        if (method) expect(this.endpoint.method).toBe(method)
    }

}

class TestErrorEndpoints extends TestEndpoints {

    constructor(url = `${process.env.API_IP}:${process.env.API_PORT}` || 'http://localhost:3000', endpoint = {}) {
        super(url, endpoint)
    }

    // Check is basic error fits standards
    basicError(data) {

        expect(data).toBeDefined()
        expect(data.error).toBeDefined()

        expect(typeof data).toBe('object')
        expect(typeof data.error).toBe('object')

        if (data.error.hasOwnProperty('message')) {
            expect(data.error).toMatchObject({
                code: expect.any(Number),
                display: expect.any(String),
                message: expect.anything()
            })
        } else {
            expect(data.error).toMatchObject({
                code: expect.any(Number),
                display: expect.any(String)
            })
        }
    }

    // Check if wrong method is used
    async wrongMethodError() {

        const allMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'CONNECT', 'TRACE', 'PATCH'];
        const allowedMethods = allMethods.filter(method => !endpoints.some(endpoint => endpoint.url === this.endpoint.url && endpoint.method === method));

        if (allowedMethods.length > 0) {
            const response = await fetch(`${this.url}${this.endpoint.url}`, {
                method: allowedMethods[0]
            });
            const data = await response.json();

            // Check response object
            expect(response).toBeDefined();
            expect(typeof response).toBe('object');
            expect(response.status).toEqual(200);

            // Check received data
            expect(data).toBeDefined();
            expect(data.code).toEqual(405);
            expect(data.display).toEqual('Failed to find such endpoint!');
        }
    }

}

module.exports = {
    TestEndpoints,
    TestErrorEndpoints
}