// pages/api/delete.ts

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { deleteChunk } from "../../../lib/datastore_api";

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;

    console.log("Deleting file with id:", id);

    if (!id || !/^[a-z]{8}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid or missing id. ID must be an 8-letter lowercase string." },
        { status: 400 }
      );
    }

    const dataDir = path.join(process.cwd(), "data", id);
    const chunkServersPath = path.join(dataDir, "chunk_servers.json");

    if (!fs.existsSync(chunkServersPath)) {
      return NextResponse.json(
        { error: "File with the provided id does not exist." },
        { status: 404 }
      );
    }

    const chunkServers = JSON.parse(fs.readFileSync(chunkServersPath, "utf-8")) as Record<string, string[]>;

    // Iterate over each chunk and delete from all associated datastores
    for (const [chunk, datastores] of Object.entries(chunkServers)) {
      for (const datastore_url of datastores) {
        try {
          await deleteChunk(datastore_url, id, chunk);
          console.log(`Deleted chunk ${chunk} from datastore ${datastore_url}`);
        } catch (err) {
          console.error(`Failed to delete chunk ${chunk} from datastore ${datastore_url}:`, err);
          // Optionally, you can decide whether to continue deleting other chunks or abort
          // For this implementation, we'll continue
        }
      }
    }

    // Optionally, delete other related files and the data directory
    fs.rmSync(dataDir, { recursive: true, force: true });
    console.log(`Deleted local data directory for id ${id}`);

    return NextResponse.json(
      { message: `File with id ${id} deleted successfully.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file." },
      { status: 500 }
    );
  }
};
