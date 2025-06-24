// server/huffman.js

// Node for building the Huffman Tree
class HuffmanNode {
    constructor(char, freq, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
    }
}

// Builds a frequency map from the input text
function getFrequencyMap(text) {
    const freqMap = new Map();
    for (const char of text) {
        freqMap.set(char, (freqMap.get(char) || 0) + 1);
    }
    return freqMap;
}

// Builds the Huffman tree from the frequency map
function buildHuffmanTree(freqMap) {
    const priorityQueue = [];
    for (const [char, freq] of freqMap.entries()) {
        priorityQueue.push(new HuffmanNode(char, freq));
    }

    // A simple priority queue implementation using array sort
    priorityQueue.sort((a, b) => a.freq - b.freq);

    while (priorityQueue.length > 1) {
        const left = priorityQueue.shift();
        const right = priorityQueue.shift();
        const mergedNode = new HuffmanNode(null, left.freq + right.freq, left, right);
        priorityQueue.push(mergedNode);
        priorityQueue.sort((a, b) => a.freq - b.freq);
    }

    return priorityQueue[0];
}

// Generates the Huffman codes by traversing the tree
function generateCodes(node, prefix = '', codeMap = {}) {
    if (!node) return codeMap;
    if (node.char !== null) {
        codeMap[node.char] = prefix || '0'; // Handles single-character files
        return codeMap;
    }
    generateCodes(node.left, prefix + '0', codeMap);
    generateCodes(node.right, prefix + '1', codeMap);
    return codeMap;
}

// --- EXPORTED FUNCTIONS ---

function compressHuffman(buffer) {
    if (!buffer || buffer.length === 0) {
        return Buffer.from([]);
    }

    const freqMap = getFrequencyMap(buffer);
    const tree = buildHuffmanTree(freqMap);
    const codes = generateCodes(tree);

    let encodedText = '';
    // Iterate over the buffer to encode
    for (const byte of buffer) {
        encodedText += codes[byte];
    }

    const paddingLength = (8 - (encodedText.length % 8)) % 8;
    const paddedEncodedText = encodedText + '0'.repeat(paddingLength);

    const compressedBytes = new Uint8Array(paddedEncodedText.length / 8);
    for (let i = 0; i < paddedEncodedText.length; i += 8) {
        const byte = paddedEncodedText.substr(i, 8);
        compressedBytes[i / 8] = parseInt(byte, 2);
    }
    
    const treeData = JSON.stringify(Array.from(freqMap.entries()));
    const treeBuffer = Buffer.from(treeData, 'utf-8');
    
    const headerBuffer = Buffer.alloc(5);
    headerBuffer.writeUInt8(paddingLength, 0);
    headerBuffer.writeUInt32BE(treeBuffer.length, 1);

    return Buffer.concat([headerBuffer, treeBuffer, Buffer.from(compressedBytes)]);
}

function decompressHuffman(compressedBuffer) {
    if (compressedBuffer.length < 5) {
        return Buffer.from([]);
    }
    
    const paddingLength = compressedBuffer.readUInt8(0);
    const treeJsonLength = compressedBuffer.readUInt32BE(1);
    
    const treeBuffer = compressedBuffer.slice(5, 5 + treeJsonLength);
    const dataBuffer = compressedBuffer.slice(5 + treeJsonLength);

    const freqMap = new Map(JSON.parse(treeBuffer.toString('utf-8')));
    const tree = buildHuffmanTree(freqMap);

    let encodedText = '';
    for (const byte of dataBuffer) {
        encodedText += byte.toString(2).padStart(8, '0');
    }

    encodedText = encodedText.slice(0, encodedText.length - paddingLength);
    
    const decodedBytes = [];
    let currentNode = tree;

    // Handle single-byte files
    if (!tree.left && !tree.right) {
        const byte = tree.char;
        const count = freqMap.get(byte);
        for (let i = 0; i < count; i++) {
            decodedBytes.push(byte);
        }
        return Buffer.from(decodedBytes);
    }

    for (const bit of encodedText) {
        currentNode = (bit === '0') ? currentNode.left : currentNode.right;
        if (currentNode.char !== null) {
            decodedBytes.push(currentNode.char);
            currentNode = tree;
        }
    }
    
    return Buffer.from(decodedBytes);
}

module.exports = { compressHuffman, decompressHuffman };
