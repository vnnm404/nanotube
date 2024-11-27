// Import necessary modules
import fs from 'fs';
import path from 'path';
import { lock } from 'proper-lockfile';

// Define the path to datastore.json
const dataPath = path.join(process.cwd(), 'data', 'datastore.json');


export async function POST(request: Request) {
    // Parse JSON body to extract ip and port
    const { ip, port } = await request.json();

    // Validate input
    if (!ip || !port) {
        return new Response(JSON.stringify({ error: 'Invalid data' }), { status: 400 });
    }

    // Ensure the directory for dataPath exists
    const dirPath = path.dirname(dataPath);
    if (!fs.existsSync(dirPath)) {
        console.log(`Creating directory: ${dirPath}`);
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
    }

    // Use proper-lockfile to ensure exclusive access to the file
    let release: () => Promise<void> | null = null;
    try {
        // Acquire a lock on the file
        release = await lock(dataPath, { retries: { retries: 5, factor: 2, minTimeout: 100, maxTimeout: 200 } });

        // Initialize datastoreList
        let datastoreList: Array<{ ip: string; port: number; status: string }> = [];
        
        const data = fs.readFileSync(dataPath, 'utf-8');
        datastoreList = JSON.parse(data);

        // Check for duplicate datastore entries
        if (datastoreList.some((store) => store.ip === ip && store.port === port)) {
            return new Response(JSON.stringify({ message: 'Datastore already registered' }), { status: 409 });
        }

        // Add the new datastore with status "active"
        const newDatastore = { ip, port, status: "active" };
        datastoreList.push(newDatastore);

        // Write the updated datastore list back to datastore.json
        fs.writeFileSync(dataPath, JSON.stringify(datastoreList, null, 2));

        console.log(`Registered new datastore: ${ip}:${port}`);

        return new Response(JSON.stringify({ message: 'Datastore registered successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error handling datastore file:', error);
        return new Response(JSON.stringify({ error: 'Failed to register datastore' }), { status: 500 });
    } finally {
        // Release the lock if it was acquired
        if (release) {
            try {
                await release();
                console.log('Released file lock.');
            } catch (releaseError) {
                console.error('Error releasing file lock:', releaseError);
            }
        }
    }
}
