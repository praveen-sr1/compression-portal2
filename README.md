# Data Compression & Decompression Portal

This project is a web application that allows users to upload files, apply various data compression algorithms to reduce file size, and decompress previously compressed files. The system demonstrates the efficiency of different algorithms by providing key statistics like compression ratio and processing time.

## Features

-   **File Upload**: Upload any file (text, image, binary) for processing.
-   **Multiple Compression Algorithms**: Supports both Huffman and Run-Length Encoding (RLE).
-   **Compression & Decompression**: Perform both compress and decompress operations.
-   **Compression Statistics**: Displays original size, processed size, compression ratio, and processing time.
-   **Download Processed Files**: Allows users to download the resulting compressed or decompressed file.
-   **Algorithm Explanations**: Provides brief descriptions of the available compression algorithms.


## Tech Stack

-   **Frontend**:
    -   Framework: **React.js**
    -   HTTP Client: **axios**
    -   Styling: **CSS**
-   **Backend**:
    -   Runtime: **Node.js**
    -   Framework: **Express.js**
    -   File Handling: **multer**
    -   Compression: **Huffman** ,  **RLE** 

## Local Setup Instructions

### Prerequisites

-   Node.js and npm installed on your machine.

### 1. Clone the Repository

```
git clone <your-repo-url>
cd compression-portal2
```

### 2. Setup the Backend

```
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Start the backend server
node index.js
```

The server will be running on `http://localhost:5000`.

### 3. Setup the Frontend

Open a new terminal window for the frontend.

```
# Navigate to the client directory from the root
cd client

# Install dependencies
npm install

# Start the React development server
npm start
```

The application will open automatically in your browser at `http://localhost:3000`.
```


Deployed link :-https://compression-portal2.vercel.app/
