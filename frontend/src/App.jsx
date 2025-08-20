import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [processedJson, setProcessedJson] = useState('');
  const [originalQrCodes, setOriginalQrCodes] = useState([]); 
  const [filterAcPlant, setFilterAcPlant] = useState(''); 
  const [isDragging, setIsDragging] = useState(false); // New state for drag-and-drop

  // Effect to handle filtering
  useEffect(() => {
    if (filterAcPlant === '') {
      setProcessedJson(JSON.stringify(originalQrCodes, null, 2));
    } else {
      const filtered = originalQrCodes.filter(qrCode =>
        qrCode.acPlant.toLowerCase().includes(filterAcPlant.toLowerCase())
      );
      setProcessedJson(JSON.stringify(filtered, null, 2));
    }
  }, [filterAcPlant, originalQrCodes]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setMessage('');
    } else {
      setFile(null);
      setMessage('Please select a valid CSV file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setMessage('');
    } else {
      setFile(null);
      setMessage('Please drop a valid CSV file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', file);
    setLoading(true);
    setMessage('');
    setProcessedJson(''); // Clear previous JSON on new upload
    setOriginalQrCodes([]); // Clear original data on new upload
    setFilterAcPlant(''); // Clear filter on new upload

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(res.data.message);
    } catch (error) {
      setMessage('Error uploading file');
      console.error('Error uploading file', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckQrCodes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/qrcodes');
      setOriginalQrCodes(res.data); // Store original data
      setProcessedJson(JSON.stringify(res.data, null, 2));
      setMessage('QR Codes fetched successfully.');
    } catch (error) {
      setMessage('Error fetching QR codes.');
      console.error('Error fetching QR codes', error);
    }
  };

  const copyJsonToClipboard = () => {
    if (processedJson) {
      navigator.clipboard.writeText(processedJson);
      setMessage('JSON copied to clipboard!');
    } else {
      setMessage('No JSON to copy.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setMessage('');
    setProcessedJson('');
    setOriginalQrCodes([]);
    setFilterAcPlant('');
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>QR Code Parser</h1>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }} // Hide the default input
              id="csvFile"
            />
            <label htmlFor="csvFile" className="file-input-label">
              {file ? file.name : 'Drag & Drop CSV here or Click to Upload'}
            </label>
          </div>
          <button type="submit" disabled={loading || !file}>
            {loading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </form>
        {message && <p>{message}</p>}
      </div>

      <div className="button-container">
        <button onClick={handleCheckQrCodes} disabled={loading}>
          Check QR Codes
        </button>
        <button onClick={copyJsonToClipboard} disabled={!processedJson}>
          Copy JSON
        </button>
        <button onClick={handleReset}>
          Reset
        </button>
      </div>

      {originalQrCodes.length > 0 && (
        <div className="filter-container">
          <input
            type="text"
            placeholder="Filter by acPlant (e.g., MC1)"
            value={filterAcPlant}
            onChange={(e) => setFilterAcPlant(e.target.value)}
          />
        </div>
      )}

      {processedJson && (
        <div className="json-output">
          <h2>Processed QR Codes (JSON)</h2>
          <pre>{processedJson}</pre>
        </div>
      )}
    </div>
  );
}

export default App;