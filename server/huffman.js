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

function compressHuffman(text) {
    if (!text) {
        return Buffer.from([]);
    }

    const freqMap = getFrequencyMap(text);
    const tree = buildHuffmanTree(freqMap);
    const codes = generateCodes(tree);

    let encodedText = '';
    for (const char of text) {
        encodedText += codes[char];
    }

    const paddingLength = (8 - (encodedText.length % 8)) % 8;
    const paddedEncodedText = encodedText + '0'.repeat(paddingLength);

    const compressedBytes = new Uint8Array(paddedEncodedText.length / 8);
    for (let i = 0; i < paddedEncodedText.length; i += 8) {
        const byte = paddedEncodedText.substr(i, 8);
        compressedBytes[i / 8] = parseInt(byte, 2);
    }
    
    // The frequency map is needed for decompression. We serialize it as JSON.
    const treeData = JSON.stringify(Array.from(freqMap.entries()));
    const treeBuffer = Buffer.from(treeData, 'utf-8');
    
    // Create a header: [1 byte for padding length][4 bytes for JSON length]
    const headerBuffer = Buffer.alloc(5);
    headerBuffer.writeUInt8(paddingLength, 0);
    headerBuffer.writeUInt32BE(treeBuffer.length, 1);

    // Combine header, tree data, and compressed data into a single buffer
    return Buffer.concat([headerBuffer, treeBuffer, Buffer.from(compressedBytes)]);
}

function decompressHuffman(compressedBuffer) {
    if (compressedBuffer.length < 5) {
        return ''; // Not a valid compressed file
    }
    
    // Read header to extract metadata
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
    
    // Handle single-character files
    if (!tree.left && !tree.right) {
        return tree.char.repeat(freqMap.get(tree.char));
    }

    let decodedText = '';
    let currentNode = tree;
    for (const bit of encodedText) {
        currentNode = (bit === '0') ? currentNode.left : currentNode.right;
        if (currentNode.char !== null) {
            decodedText += currentNode.char;
            currentNode = tree;
        }
    }
    
    return decodedText;
}

module.exports = { compressHuffman, decompressHuffman };
