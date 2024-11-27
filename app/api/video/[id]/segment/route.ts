import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getChunk, saveChunk } from "../../../../../lib/datastore_api";
import { getDatastores, markServerInactive } from "../../../../../lib/datastore_manager";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(req.url);
  const segment = url.searchParams.get("segment");

  const dataDir = path.join(process.cwd(), "data", params.id);
  const chunkServersPath = path.join(dataDir, "chunk_servers.json");

  if (!fs.existsSync(chunkServersPath)) {
    return NextResponse.json(
      { error: "Chunk server mapping not found" },
      { status: 404 }
    );
  }

  const chunkServers = JSON.parse(fs.readFileSync(chunkServersPath, "utf-8"));

  if (!chunkServers[segment]) {
    return NextResponse.json({ error: "Segment not found" }, { status: 404 });
  }

  for (const datastore_url of chunkServers[segment]) {
    const [protocol, ipWithPort] = datastore_url.split("://");
    const [ip, port] = ipWithPort.split(":");

    try {
      const file = await getChunk(datastore_url, params.id, segment);
      return new NextResponse(file, {
        headers: { "Content-Type": "video/MP2T" },
      });
    } catch (error) {
      console.warn(`Failed to fetch chunk from ${datastore_url}, trying next...`);

      // Mark the server as inactive using the lock-enabled function
      await markServerInactive(ip, port);

      // Re-upload the chunk to an active server
      // const activeDatastores = (await getDatastores()).filter(
      //   (server) => server.status === "active"
      // );

      // if (activeDatastores.length > 0) {
      //   const fallbackDatastore = activeDatastores[0];
      //   const fallbackUrl = `http://${fallbackDatastore.ip}:${fallbackDatastore.port}`;
      //   const filepath = path.join(dataDir, segment);

      //   if (fs.existsSync(filepath)) {
      //     console.log(
      //       `Re-uploading segment ${segment} to active datastore: ${fallbackUrl}`
      //     );
      //     await saveChunk(fallbackUrl, params.id, segment, filepath);

      //     // Update the chunk server mapping
      //     chunkServers[segment].push(fallbackUrl);
      //     fs.writeFileSync(
      //       chunkServersPath,
      //       JSON.stringify(chunkServers, null, 2)
      //     );
      //     console.log(
      //       `Segment ${segment} successfully re-uploaded to ${fallbackUrl}`
      //     );
      //   } else {
      //     console.error(
      //       `Local file for segment ${segment} not found for re-upload`
      //     );
      //   }
      // } else {
      //   console.error("No active datastores available for fallback");
      // }
    }
  }

  return NextResponse.json({ error: "Segment not found on any server" }, { status: 404 });
}
