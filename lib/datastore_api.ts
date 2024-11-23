import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';


// const BASE_URL = 'http://localhost:3001';

// Function to save a chunk
export async function saveChunk(datastore_url: string, foldername: string, filename: string, filepath: string): Promise<void> {
  try {
    const fileBuffer = new Blob([fs.readFileSync(filepath)]);
    const formData = new FormData();
    formData.append('file', fileBuffer, filename);
    formData.append('foldername', foldername);
    formData.append('filename', filename);

    const response = await axios.post(`${datastore_url}/save-chunk`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log('Save Chunk Response:', response.data);
  } catch (err) {
    console.error('Error saving chunk:', err);
    throw err;
  }
}

// Function to get a chunk
export async function getChunk(datastore_url: string, foldername: string, filename: string): Promise<Blob> {
  try {
    const response = await axios.get(`${datastore_url}/get-chunk`, {
      params: { foldername, filename },
      responseType: 'arraybuffer',
    });

    return response.data;
  } catch (err) {
    console.error('Error retrieving chunk:', err);
    throw err;
  }
}

// Function to delete a chunk
export async function deleteChunk(datastore_url: string, foldername: string, filename: string): Promise<void> {
  try {
    const response = await axios.delete(`${datastore_url}/delete-chunk`, {
      data: { foldername, filename },
    });

    console.log('Delete Chunk Response:', response.data);
  } catch (err) {
    console.error('Error deleting chunk:', err);
    throw err;
  }
}

// Function to check if a chunk is present
export async function isChunkPresent(datastore_url: string, foldername: string, filename: string): Promise<boolean> {
  try {
    const response = await axios.get(`${datastore_url}/is-chunk-present`, {
      params: { foldername, filename },
    });

    console.log('Is Chunk Present Response:', response.data);
    return response.data.present;
  } catch (err) {
    console.error('Error checking chunk presence:', err);
    throw err;
  }
}


// Function to loop over files in a folder and save chunks
export async function saveChunksFromFolder(datastore_url: string, foldername: string, folderPath: string): Promise<void> {
    try {
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        if (file.startsWith('output')) {
          const filepath = path.join(folderPath, file);
          console.log(`Saving chunk for file: ${file}`);
          await saveChunk(datastore_url, foldername, file, filepath);
        }
      }
    } catch (err) {
      console.error('Error processing folder contents:', err);
      throw err;
    }
  }