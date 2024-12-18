import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import { spawn } from "child_process";
import { saveChunk, saveChunksFromFolder } from "../../../lib/datastore_api";
import { pickRandomDatastores } from "../../../lib/datastore_manager";

function generateRandomId() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export const POST = async (req: Request) => {
  const ffmpegPath = "node_modules/ffmpeg-static/ffmpeg";

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;

    if (!title || !/^[a-z ]+$/.test(title)) {
      return NextResponse.json(
        {
          error:
            "Invalid title. Title can only contain lowercase letters and spaces.",
        },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log("Processing file:", file.name);

    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    const fileType = await fileTypeFromBuffer(fileBuffer);

    if (!fileType || !fileType.mime.startsWith("video/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only video files are allowed." },
        { status: 400 }
      );
    }

    const id = generateRandomId();

    const dataDir = path.join(process.cwd(), "data", id);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const ext = path.extname(file.name) || `.${fileType.ext}`;
    const originalFilePath = path.join(dataDir, `original${ext}`);
    fs.writeFileSync(originalFilePath, fileBuffer);

    console.log("Fine so far:", file.name);

    let duration = 0;
    try {
      duration = await new Promise((resolve, reject) => {
        const ffmpeg = spawn(ffmpegPath, ["-i", originalFilePath]);

        let stderr = "";
        ffmpeg.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        ffmpeg.on("close", (code) => {
          if (code !== 0 && code !== 1) {
            return reject(new Error(`ffmpeg exited with code ${code}`));
          }

          const durationRegex = /Duration:\s*([0-9:.]+)/;
          const match = durationRegex.exec(stderr);
          if (match && match[1]) {
            const durationString = match[1];
            const parts = durationString.split(":");
            const hours = parseFloat(parts[0]);
            const minutes = parseFloat(parts[1]);
            const seconds = parseFloat(parts[2]);
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            resolve(totalSeconds);
          } else {
            reject(new Error("Could not parse duration"));
          }
        });

        ffmpeg.on("error", (err) => {
          reject(err);
        });
      });
    } catch (err) {
      console.error("Error getting video metadata:", err);

      return NextResponse.json(
        { error: "Error getting video metadata." },
        { status: 500 }
      );
    }

    const metadataJson = {
      title: title,
      duration: duration,
    };
    fs.writeFileSync(
      path.join(dataDir, "metadata.json"),
      JSON.stringify(metadataJson, null, 2)
    );

    const m3u8Output = path.join(dataDir, "output.m3u8");

    const ffmpegArgs = [
      "-i",
      originalFilePath,
      "-codec:",
      "copy",
      "-start_number",
      "0",
      "-hls_time",
      "10",
      "-hls_list_size",
      "0",
      "-hls_base_url",
      "./segment?segment=",
      "-f",
      "hls",
      m3u8Output,
    ];

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn(ffmpegPath, ffmpegArgs);

      ffmpeg.stdout.on("data", (data) => {
        console.log(`ffmpeg stdout: ${data}`);
      });

      ffmpeg.stderr.on("data", (data) => {
        console.error(`ffmpeg stderr: ${data}`);
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          fs.unlinkSync(originalFilePath);
          resolve(null);
        } else {
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });
    });

    const chunkServers: Record<string, string[]> = {};

    const files = fs.readdirSync(dataDir).filter((file) => file.endsWith(".ts"));
    for (const file of files) {
      const filepath = path.join(dataDir, file);
      
      const datastores = await pickRandomDatastores();
      for (let i = 0; i < datastores.length; i++) {
        const { ip, port } = datastores[i];
        const datastore_url = `http://${ip}:${port}`;
        console.log(`Uploading ${file} to datastore ${datastore_url}`);
        await saveChunk(datastore_url, id, file, filepath);

        // Keep track of where each chunk is saved
        if (!chunkServers[file]) {
          chunkServers[file] = [];
        }
        chunkServers[file].push(datastore_url);
      }

      fs.unlinkSync(filepath);
      console.log(`Deleted local chunk file: ${file}`);
    }

    // Save the chunk-server mapping
    fs.writeFileSync(
      path.join(dataDir, "chunk_servers.json"),
      JSON.stringify(chunkServers, null, 2)
    );

    return NextResponse.json(
      { message: `File processed successfully`, id: id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
};
