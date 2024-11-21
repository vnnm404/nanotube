import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const filePath = path.join(process.cwd(), "data", params.id, "output.m3u8");

  if (fs.existsSync(filePath)) {
    const file = fs.readFileSync(filePath);
    return new NextResponse(file, {
      headers: { "Content-Type": "application/vnd.apple.mpegurl" },
    });
  }
  return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
}
