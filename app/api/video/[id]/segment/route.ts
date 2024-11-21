import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const url = new URL(req.url);
  const segment = url.searchParams.get("segment");
  const filePath = path.join(process.cwd(), "data", params.id, String(segment));

  if (fs.existsSync(filePath)) {
    const file = fs.readFileSync(filePath);
    return new NextResponse(file, {
      headers: { "Content-Type": "video/MP2T" },
    });
  }
  return NextResponse.json({ error: "Segment not found" }, { status: 404 });
}
