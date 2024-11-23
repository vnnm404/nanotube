import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { isChunkPresent, getChunk } from "../../../../../lib/datastore_api";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const url = new URL(req.url);
  const segment = url.searchParams.get("segment");
  const datastore_url = "http://localhost:3001";
  if (await isChunkPresent(datastore_url, params.id, segment)) {
    const file = await getChunk(datastore_url, params.id, segment);
    return new NextResponse(file, {
      headers: { "Content-Type": "video/MP2T" },
    });
  }
  return NextResponse.json({ error: "Segment not found" }, { status: 404 });
}
