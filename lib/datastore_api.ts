// datastore_api.ts
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import Metrics from './metrics'; // Adjust the import path as needed

const metrics = new Metrics('logs'); // Initialize Metrics with 'logs' directory

// Function to save a chunk
export async function saveChunk(
  datastore_url: string,
  foldername: string,
  filename: string,
  filepath: string
): Promise<void> {
  const operation = 'saveChunk';
  const startTime = Date.now();
  try {
    const fileBuffer = new Blob([fs.readFileSync(filepath)]);
    const formData = new FormData();
    formData.append('file', fileBuffer, filename);
    formData.append('foldername', foldername);
    formData.append('filename', filename);

    const response = await axios.post(`${datastore_url}/save-chunk`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 10000, // 10 seconds timeout
    });

    console.log('Save Chunk Response:', response.data);
    const duration = Date.now() - startTime;
    metrics.logOperation(operation, duration, true);
  } catch (err: any) {
    console.error('Error saving chunk:', err);
    const duration = Date.now() - startTime;
    metrics.logOperation(operation, duration, false, err.message);
    throw err;
  }
}

// Function to get a chunk
export async function getChunk(
  datastore_url: string,
  foldername: string,
  filename: string
): Promise<Blob> {
  const operation = 'getChunk';
  const startTime = Date.now();
  try {
    const response = await axios.get(`${datastore_url}/get-chunk`, {
      params: { foldername, filename },
      responseType: 'arraybuffer',
      timeout: 10000, // 10 seconds timeout
    });

    console.log('Is Chunk Present Response:', response.data);
    const duration = Date.now() - startTime;
    metrics.logOperation(operation, duration, true);
    return response.data;
  } catch (err: any) {
    console.error('Error retrieving chunk:', err);
    const duration = Date.now() - startTime;
    metrics.logOperation(operation, duration, false, err.message);
    throw err;
  }
}

// Function to delete a chunk
export async function deleteChunk(
  datastore_url: string,
  foldername: string,
  filename: string
): Promise<void> {
  const operation = 'deleteChunk';
  const startTime = Date.now();
  try {
    const response = await axios.delete(`${datastore_url}/delete-chunk`, {
      data: { foldername, filename },
      timeout: 10000, // 10 seconds timeout
    });

    console.log('Delete Chunk Response:', response.data);
    const duration = Date.now() - startTime;
    metrics.logOperation(operation, duration, true);
  } catch (err: any) {
    console.error('Error deleting chunk:', err);
    const duration = Date.now() - startTime;
    metrics.logOperation(operation, duration, false, err.message);
    throw err;
  }
}

// Function to check if a chunk is present
export async function isChunkPresent(
  datastore_url: string,
  foldername: string,
  filename: string
): Promise<boolean> {
  const operation = 'isChunkPresent';
  const startTime = Date.now();
  try {
    const response = await axios.get(`${datastore_url}/is-chunk-present`, {
      params: { foldername, filename },
      timeout: 5000, // 5 seconds timeout
    });

    console.log('Is Chunk Present Response:', response.data);
    const duration = Date.now() - startTime;
    metrics.logOperation(operation, duration, true);
    return response.data.present;
  } catch (err: any) {
    console.error('Error checking chunk presence:', err);
    const duration = Date.now() - startTime;
    metrics.logOperation(operation, duration, false, err.message);
    throw err;
  }
}

// Function to loop over files in a folder and save chunks
export async function saveChunksFromFolder(
  datastore_url: string,
  foldername: string,
  folderPath: string
): Promise<void> {
  const operation = 'saveChunksFromFolder';
  const startTime = Date.now();
  try {
    const files = fs.readdirSync(folderPath);
    let uploadCount = 0;
    for (const file of files) {
      if (file.startsWith('output')) {
        const filepath = path.join(folderPath, file);
        console.log(`Saving chunk for file: ${file}`);
        await saveChunk(datastore_url, foldername, file, filepath);
        uploadCount++;
      }
    }
    const duration = Date.now() - startTime;
    metrics.logOperation(operation, duration, true);
    // Optionally, log additional metrics like uploadCount
    metrics.logOperation('uploadCount', uploadCount, true);
  } catch (err: any) {
    console.error('Error processing folder contents:', err);
    const duration = Date.now() - startTime;
    metrics.logOperation(operation, duration, false, err.message);
    throw err;
  }
}
