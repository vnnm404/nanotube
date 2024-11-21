// /lib/metadata.ts
import fs from 'fs';
import path from 'path';

export async function getMetadata() {
  try {
    const dataDirectory = path.join(process.cwd(), 'data');

    const folders = fs
      .readdirSync(dataDirectory, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    const videos = [];

    for (const folder of folders) {
      const metadataPath = path.join(dataDirectory, folder, 'metadata.json');

      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

        videos.push({
          id: folder,
          title: metadata.title,
          duration: metadata.duration,
        });
      }
    }

    return videos;
  } catch (error) {
    console.error('Error reading video metadata:', error);
    throw new Error('Failed to load metadata');
  }
}
