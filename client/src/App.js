// client/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [file, setFile] = useState(null);
    const [algorithm, setAlgorithm] = useState('huffman'); // Default to Huffman
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
        setError('');
    };

    const handleProcess = async (action) => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setIsLoading(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('algorithm', algorithm);
        formData.append('action', action);

        try {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const response = await axios.post(`${apiUrl}/process`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadFile = () => {
        if (!result || !result.processedData) return;
        
        const byteCharacters = atob(result.processedData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/octet-stream' });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const action = result.ratio === 'N/A' ? 'decompressed' : 'compressed';
        const fileExtension = result.fileName.split('.').pop();
        const baseName = result.fileName.replace(`.${fileExtension}`, '');
        const newFileName = `${baseName}_${action}_${algorithm}.${fileExtension}`;

        link.setAttribute('download', newFileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Data Compression & Decompression Portal</h1>
            </header>
            <main>
                <div className="card">
                    <h2>Upload Your File</h2>
                    <input type="file" onChange={handleFileChange} />
                    <div className="controls">
                        <label htmlFor="algorithm">Choose an algorithm:</label>
                        <select id="algorithm" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                            <option value="huffman">Huffman Coding</option>
                            <option value="rle">Run-Length Encoding (RLE)</option>
                        </select>
                    </div>
                    <div className="actions">
                        <button onClick={() => handleProcess('compress')} disabled={isLoading || !file}>
                            {isLoading ? 'Compressing...' : 'Compress'}
                        </button>
                        <button onClick={() => handleProcess('decompress')} disabled={isLoading || !file}>
                            {isLoading ? 'Decompressing...' : 'Decompress'}
                        </button>
                    </div>
                </div>

                {error && <div className="card error-card"><p>{error}</p></div>}
                
                {result && (
                    <div className="card result-card">
                        <h2>Processing Results</h2>
                        <div className="stats">
                            <p><strong>Original File:</strong> {result.fileName}</p>
                            <p><strong>Original Size:</strong> {(result.originalSize / 1024).toFixed(2)} KB</p>
                            <p><strong>Processed Size:</strong> {(result.processedSize / 1024).toFixed(2)} KB</p>
                            <p><strong>Processing Time:</strong> {result.processingTime} ms</p>
                            {result.ratio !== 'N/A' && <p><strong>Compression Ratio:</strong> {result.ratio}% reduction</p>}
                        </div>
                        <button onClick={downloadFile}>Download Processed File</button>
                    </div>
                )}

                <div className="card explanation-card">
                    <h2>About the Algorithms</h2>
                    <div className="algo-info">
                        <h3>Huffman Coding</h3>
                        <p>A lossless data compression algorithm that assigns variable-length codes to input characters based on their frequencies. More frequent characters get shorter codes, leading to efficient compression, especially for text files.</p>
                    </div>
                    <div className="algo-info">
                        <h3>Run-Length Encoding (RLE)</h3>
                        <p>A simple form of lossless data compression where sequences of the same data value are stored as a single value and count. RLE is most effective on files containing many long runs of identical characters.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
