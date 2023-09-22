// Configs
require('dotenv').config()

// List of endpoints
const endpoints = require('../../endpoints.json')

async function test_wrong_method(endpoint, url) {
    // Check if method used for endpoint is wrong
    try {
        const method = endpoint.method === 'POST' ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method
        });
        const data = await response.json();

        expect(response).toBeDefined();
        expect(typeof response).toBe('object');
        expect(response.status).toEqual(200);

        expect(data).toBeDefined();
        expect(data.code).toEqual(405);
        expect(data.display).toEqual('Failed to find such endpoint!');
    } catch (e) {
        expect(e).toBeNull();
    }
}

async function common_endpoint_tests(endpoint, url) {
    // Check correct version of request
    try {
        const response = await fetch(url, {
            method: endpoint.method
        })
        const data = await response.json()

        expect(data).toBeDefined()
        expect(typeof data).toBe('object')
        expect(response.status).toEqual(200)
    }

    catch (e) {
        expect(e).toBeNull();
    }
}

describe('Endpoints common test', () => {

    let url;

    beforeEach(() => {

        url = `${process.env.API_IP}:${process.env.API_PORT}`

    })

    endpoints.forEach(endpoint => {

        // Tests for URLS
        test('Should be defined in .env', () => {
            expect(url).toBeDefined()

            expect(typeof url).toBe('string')
            expect(url).toBe('http://localhost:3000')
            expect(url).toStrictEqual('http://localhost:3000')

            url += endpoint.url

            expect(url).not.toBe('http://localhost:3000')
            expect(url).not.toStrictEqual('http://localhost:3000')
        })

        // Tests for endpoint
        test('Common endpoint tests', async () => {

            // Check behavior in correct scenario
            await common_endpoint_tests(endpoint, url)

            // Test if method is wrong
            await test_wrong_method(endpoint, url)
        })
    })

})