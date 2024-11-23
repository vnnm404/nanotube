import * as fs from 'fs';
import * as path from 'path';
import { lock } from 'proper-lockfile';

// Path to the datastore registry file
const DATASTORE_REGISTRY_PATH = path.join(process.cwd(), 'data', 'datastore.json');

// Ensure the directory exists for the registry file
if (!fs.existsSync(path.dirname(DATASTORE_REGISTRY_PATH))) {
    fs.mkdirSync(path.dirname(DATASTORE_REGISTRY_PATH), { recursive: true });
}

/**
 * Reads the datastore.json file and returns the list of servers.
 * Uses proper-lockfile to ensure safe concurrent access.
 */
export async function getDatastores(): Promise<Array<{ ip: string; port: string; status: string }>> {
    let release: (() => Promise<void>) | null = null;

    try {
        // Acquire a lock on the datastore.json file
        release = await lock(DATASTORE_REGISTRY_PATH);

        if (!fs.existsSync(DATASTORE_REGISTRY_PATH)) {
            // Return an empty list if the file does not exist
            return [];
        }

        const data = fs.readFileSync(DATASTORE_REGISTRY_PATH, 'utf-8');
        return JSON.parse(data) as Array<{ ip: string; port: string; status: string }>;
    } catch (error) {
        console.error('Error reading datastores:', error);
        throw new Error('Failed to read datastore list');
    } finally {
        if (release) {
            await release(); // Release the lock
        }
    }
}

/**
 * Adds a new datastore to the list and saves it to the datastore.json file.
 * Ensures that duplicates are not added.
 */
export async function addDatastore(ip: string, port: string): Promise<void> {
    let release: (() => Promise<void>) | null = null;

    try {
        release = await lock(DATASTORE_REGISTRY_PATH);

        let datastores: Array<{ ip: string; port: string; status: string }> = [];
        if (fs.existsSync(DATASTORE_REGISTRY_PATH)) {
            const data = fs.readFileSync(DATASTORE_REGISTRY_PATH, 'utf-8');
            datastores = JSON.parse(data);
        }

        // Check for duplicates
        if (datastores.some((store) => store.ip === ip && store.port === port)) {
            console.log('Datastore already exists:', { ip, port });
            return;
        }

        // Add the new datastore and save the file
        let status = 'active';
        datastores.push({ ip, port, status });
        fs.writeFileSync(DATASTORE_REGISTRY_PATH, JSON.stringify(datastores, null, 2));
        console.log('Datastore added:', { ip, port, status });
    } catch (error) {
        console.error('Error adding datastore:', error);
        throw new Error('Failed to add datastore');
    } finally {
        if (release) {
            await release(); // Release the lock
        }
    }
}

/**
 * Removes a datastore from the list by its IP and port.
 */
export async function removeDatastore(ip: string, port: string): Promise<void> {
    let release: (() => Promise<void>) | null = null;

    try {
        release = await lock(DATASTORE_REGISTRY_PATH);

        if (!fs.existsSync(DATASTORE_REGISTRY_PATH)) {
            console.log('Datastore file does not exist, nothing to remove.');
            return;
        }

        let datastores = JSON.parse(fs.readFileSync(DATASTORE_REGISTRY_PATH, 'utf-8'));

        // Filter out the datastore to be removed
        const updatedDatastores = datastores.filter(
            (store: { ip: string; port: string; status: string }) => store.ip !== ip || store.port !== port
        );

        fs.writeFileSync(DATASTORE_REGISTRY_PATH, JSON.stringify(updatedDatastores, null, 2));
        console.log('Datastore removed:', { ip, port });
    } catch (error) {
        console.error('Error removing datastore:', error);
        throw new Error('Failed to remove datastore');
    } finally {
        if (release) {
            await release(); // Release the lock
        }
    }
}

/**
 * Picks two random datastores from the list.
 */
export async function pickRandomDatastores(): Promise<Array<{ ip: string; port: string; status: string }>> {
    const datastores = await getDatastores();

    if (datastores.length < 2) {
        throw new Error('Not enough datastores registered to select two.');
    }

    // Shuffle the datastores array and pick the first two
    const shuffled = datastores.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
}

export async function markServerInactive(ip: string, port: string) {
    const dataPath = path.join(process.cwd(), "data", "datastore.json");

    let release: (() => Promise<void>) | null = null;

    try {
        // Acquire a lock on the datastore.json file
        release = await lock(dataPath);

        if (!fs.existsSync(dataPath)) {
            throw new Error("Datastore file does not exist");
        }

        const datastores = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

        // Update the status of the server to inactive
        const updatedDatastores = datastores.map((datastore: { ip: string; port: string; status: string }) => {
            if (datastore.ip === ip && datastore.port === port) {
                return { ...datastore, status: "inactive" };
            }
            return datastore;
        });

        // Save updated datastore list back to datastore.json
        fs.writeFileSync(dataPath, JSON.stringify(updatedDatastores, null, 2));
        console.log(`Marked server ${ip}:${port} as inactive`);
    } catch (err) {
        console.error("Error marking server inactive:", err);
    } finally {
        if (release) {
            await release(); // Release the lock
        }
    }
}
