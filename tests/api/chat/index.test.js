// Configs
require('dotenv').config()

// Database SQLite
const sqlite3 = require("sqlite3");

// Export helpful test utils
const { TestErrorEndpoints } = require('../../TestEndpoints')

// Connect to SQLite
const db = new sqlite3.Database(
    "./conversations.db",
    sqlite3.OPEN_READWRITE,
    (error) => {
        if (error) logging.error(error.message);
    },
);

describe('Endpoint \"/chat/create\" tests', () => {

    // Define variables globally
    let url;
    let endpoint;

    beforeEach(() => {

        // Define Endpoint vairables
        url = `${process.env.API_IP}:${process.env.API_PORT}`
        endpoint = {
            method: 'GET',
            url: `/chat/create`
        }
        full_url = url + endpoint.url

    })

    test('received ID tests', async () => {
        const response = await fetch(full_url)
        const data = await response.json()

        expect(data).toBeDefined()
        expect(data.id).toBeDefined()

        expect(typeof data).toBe("object")
        expect(typeof data.id).toBe("string")

        expect(data.id.length).toBe(36)

        const row = await new Promise((resolve) => {
            db.all('SELECT * FROM conversations WHERE id = ?', [data.id], (error, row) => {
                expect(error).toBeNull();
                resolve(row);
            });
        });

        expect(row).toBeDefined();
        expect(row.length).toEqual(1);

    }, 10000)

})

describe('Endpoint \"/chat/delete\" tests', () => {

    // Define variables globally
    let url;
    let endpoint;
    let id;

    beforeEach(async () => {

        // Define Endpoint vairables
        url = `${process.env.API_IP}:${process.env.API_PORT}`
        endpoint = endpoint = {
            method: 'GET',
            url: `/chat/delete`
        }
        full_url = url + endpoint.url

        // Create new ID
        let result = await fetch(`${url}/chat/create`).then(res => res.json())
        id = result.id

    })

    test('received ID tests', async () => {

        const testErrorEndpoints = new TestErrorEndpoints()

        // Request to DB
        const row = await new Promise((resolve) => {
            db.all('SELECT * FROM conversations WHERE id = ?', [id], (error, row) => {
                expect(error).toBeNull();
                resolve(row);
            });
        });

        // Check if it's saved to DB
        expect(row).toBeDefined();
        expect(row.length).toEqual(1);

        // Test of the endpoint itself
        const response = await fetch(full_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id
            })
        })
        const data = await response.json()

        expect(data).toBeDefined()
        expect(data.message).toBeDefined()

        expect(typeof data).toBe('object')
        expect(typeof data.message).toBe('string')

        expect(data.message).toBe('Row successfully deleted')

        // New Request to DB to define either row is deleted
        const new_row = await new Promise((resolve) => {
            db.all('SELECT * FROM conversations WHERE id = ?', [id], (error, row) => {
                expect(error).toBeNull();
                resolve(row);
            });
        });

        expect(new_row.length).toBe(0)

        const response_err = await fetch(full_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id
            })
        })
        const data_err = await response_err.json()

        testErrorEndpoints.basicError(data_err)

    })

})

describe('Endpoint \"/chat/get-history\" tests', () => {

    let url;
    let endpoint;

    beforeEach(async () => {

        // Define Endpoint vairables
        url = `${process.env.API_IP}:${process.env.API_PORT}`
        endpoint = endpoint = {
            method: 'GET',
            url: `/chat/get-history`
        }
        full_url = url + endpoint.url

        // Create new ID
        let result = await fetch(`${url}/chat/create`).then(res => res.json())
        id = result.id

    })

    test('All tests to endpoint', async () => {

        let result = await fetch(full_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({

            })
        })

    })

})