// server/rle.js

// Based on the logic from https://javascript.plainenglish.io/run-length-encoding-21241e00fcbb
function compressRLE(text) {
    let result = '';
    let i = 0;
    while (i < text.length) {
        let count = 1;
        let char = text[i];
        while (i + 1 < text.length && text[i] === text[i + 1] && count < 9) {
            count++;
            i++;
        }
        result += count + char;
        i++;
    }
    return result;
}

function decompressRLE(encodedText) {
    let result = '';
    for (let i = 0; i < encodedText.length; i += 2) {
        const count = parseInt(encodedText[i], 10);
        const char = encodedText[i + 1];
        if (!isNaN(count) && char) {
            result += char.repeat(count);
        }
    }
    return result;
}

module.exports = { compressRLE, decompressRLE };
