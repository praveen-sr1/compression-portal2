// server/index.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { performance } = require('perf_hooks');
const { compressRLE, decompressRLE } = require('./rle');
const { compressHuffman, decompressHuffman } = require('./huffman'); // Import Huffman functions

const app = express();
const port = process.env.PORT || 5000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

app.post('/process', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
      const fileBuffer = req.file.buffer;
    const { algorithm, action } = req.body;
   
    const originalSize = fileBuffer.length;
    let processedData;
    let processingTime;

    try {
        const startTime = performance.now();

        if (action === 'compress') {
            switch (algorithm) {
                case 'rle':
                   
                    processedData = compressRLE(fileBuffer); 
                    break;
                case 'huffman':
                    
                    processedData = compressHuffman(fileBuffer); 
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid algorithm selected.' });
            }
        } else if (action === 'decompress') {
            switch (algorithm) {
                case 'rle':
                   
                    processedData = decompressRLE(fileBuffer); 
                    break;
                case 'huffman':
                   
                    processedData = decompressHuffman(fileBuffer);
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid algorithm selected.' });
            }
        } else {
            return res.status(400).json({ error: 'Invalid action selected.' });
        }
        
       
        const endTime = performance.now();
        processingTime = (endTime - startTime).toFixed(2);

        const compressedSize = processedData.length;
        const ratio = action === 'compress' ? ((1 - (compressedSize / originalSize)) * 100).toFixed(2) : 'N/A';

        res.json({
            fileName: req.file.originalname,
            originalSize,
            processedSize: compressedSize,
            processingTime,
            ratio,
            processedData: processedData.toString('base64'),
        });

    } catch (error) {
        console.error('Processing error:', error);
        res.status(500).json({ error: 'An error occurred during file processing. Ensure the correct algorithm is used for decompression.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});