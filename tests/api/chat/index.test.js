// Configs
require('dotenv').config()

// Database SQLite
const sqlite3 = require("sqlite3");

// Connect to SQLite
const db = new sqlite3.Database(
    "./conversations.db",
    sqlite3.OPEN_READWRITE,
    (error) => {
        if (error) logging.error(error.message);
    },
);

function error_received(data) {

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

describe('Endpoint \"/chat/create\" tests', () => {

    let url;
    let endpoint;

    beforeEach(() => {

        url = `${process.env.API_IP}:${process.env.API_PORT}`
        endpoint = `/chat/create`
        full_url = url + endpoint

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

    let url;
    let endpoint;

    beforeEach(() => {

        url = `${process.env.API_IP}:${process.env.API_PORT}`
        endpoint = `/chat/delete`
        full_url = url + endpoint

    })

    test('received ID tests', async () => {
        // Create new ID
        const { id } = await fetch(`${url}/chat/create`).then(res => res.json())

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

        // Test of the endpoint itself
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

        error_received(data_err)
    })

})

describe('Endpoint \"/chat/get-history\" tests', () => {
    
})