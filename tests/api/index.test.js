// Configs
require('dotenv').config()

// List of endpoints
const endpoints = require('../../endpoints.json')

// Export helpful test utils
const { TestEndpoints, TestErrorEndpoints } = require('../TestEndpoints')

describe('Endpoints common test', () => {

    let url;

    beforeEach(() => {

        url = `${process.env.API_IP}:${process.env.API_PORT}`

    })

    endpoints.forEach(endpoint => {

        // Implement classes for testing endpoints
        let testEndpoints = new TestEndpoints(url, endpoint)
        let testErrorEndpoints = new TestErrorEndpoints(url, endpoint)

        // Tests for URLS and Endpoints
        test('.env & url tests', () => {
            testEndpoints.urlTests()
            testEndpoints.endpointTests()
        })

        // Tests for endpoint
        test('Common endpoint tests', async () => {

            // Check behavior in correct scenario
            if (endpoint.url !== '/chat/interface') {
                await testEndpoints.commonTests()
            }

            // Test if method is wrong
            await testErrorEndpoints.wrongMethodError()
        })
    })

})