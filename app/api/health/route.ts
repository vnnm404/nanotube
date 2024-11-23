import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    const dataPath = path.join(process.cwd(), "data", "datastore.json");

    try {
        if (!fs.existsSync(dataPath)) {
            return NextResponse.json(
                { error: "Datastore file not found." },
                { status: 404 }
            );
        }

        const datastores = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

        return NextResponse.json({ servers: datastores });
    } catch (error) {
        console.error("Error reading datastore.json:", error);
        return NextResponse.json(
            { error: "Failed to read datastore file." },
            { status: 500 }
        );
    }
}
