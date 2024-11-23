import fs from 'fs';
import path from 'path';
import { lock } from 'proper-lockfile';

const dataPath = path.join(process.cwd(), 'data', 'datastore.json');

export async function POST(request: Request) {
    const { ip, port } = await request.json();

    if (!ip || !port) {
        return new Response(JSON.stringify({ error: 'Invalid data' }), { status: 400 });
    }

    // Ensure the directory for dataPath exists
    const dirPath = path.dirname(dataPath);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    // Use proper-lockfile to ensure exclusive access to the file
    let release: () => Promise<void> | null = null;
    try {
        release = await lock(dataPath); // Acquire a lock on the file

        // Read current data store list
        let datastoreList = [];
        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf-8');
            datastoreList = JSON.parse(data);
        }

        // Check for duplicates
        if (datastoreList.some((store) => store.ip === ip && store.port === port)) {
            return new Response(JSON.stringify({ message: 'Datastore already registered' }), { status: 409 });
        }

        // Add the new datastore
        let status = "active";
        datastoreList.push({ ip, port, status });
        fs.writeFileSync(dataPath, JSON.stringify(datastoreList, null, 2));

        return new Response(JSON.stringify({ message: 'Datastore registered successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error handling datastore file:', error);
        return new Response(JSON.stringify({ error: 'Failed to register datastore' }), { status: 500 });
    } finally {
        if (release) {
            await release(); // Release the lock
        }
    }
}
