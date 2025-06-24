// server/rle.js

function compressRLE(buffer) {
    if (!buffer || buffer.length === 0) {
        return Buffer.from([]);
    }

    const compressedBytes = [];
    let i = 0;
    while (i < buffer.length) {
        let currentByte = buffer[i];
        let count = 1;
        // Find runs of the current byte, up to 255
        while (i + 1 < buffer.length && buffer[i] === buffer[i + 1] && count < 255) {
            count++;
            i++;
        }
        compressedBytes.push(count);
        compressedBytes.push(currentByte);
        i++;
    }
    return Buffer.from(compressedBytes);
}

function decompressRLE(buffer) {
    if (!buffer || buffer.length === 0) {
        return Buffer.from([]);
    }

    const decompressedBytes = [];
    for (let i = 0; i < buffer.length; i += 2) {
        const count = buffer[i];
        const byte = buffer[i + 1];
        for (let j = 0; j < count; j++) {
            decompressedBytes.push(byte);
        }
    }
    return Buffer.from(decompressedBytes);
}

module.exports = { compressRLE, decompressRLE };
