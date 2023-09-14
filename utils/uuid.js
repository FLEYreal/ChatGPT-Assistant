// Function to create UUID

export default function createUUID() {
    const table = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
    ];

    let uuid = "";

    let i = 0;

    while (i < 8) {
        uuid += table[Math.ceil(Math.random() * 8192) % table.length];
        i++;
    }

    uuid += "-";
    i = 0;

    while (i < 4) {
        uuid += table[Math.ceil(Math.random() * 8192) % table.length];
        i++;
    }

    uuid += "-";
    i = 0;

    while (i < 4) {
        uuid += table[Math.ceil(Math.random() * 8192) % table.length];
        i++;
    }

    uuid += "-";
    i = 0;

    while (i < 4) {
        uuid += table[Math.ceil(Math.random() * 8192) % table.length];
        i++;
    }

    uuid += "-";
    i = 0;

    while (i < 12) {
        uuid += table[Math.ceil(Math.random() * 8192) % table.length];
        i++;
    }

    localStorage.setItem("uuid", uuid);

    return uuid;
}
