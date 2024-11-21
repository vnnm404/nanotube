import { Video } from "../../../types";
import { ManPage } from "../../../components/ManPage";
import VideoPlayer from "../../../components/VideoPlayer";
import { notFound } from "next/navigation";
import { getMetadata } from "../../../lib/metadata";


async function getVideo(id: string): Promise<Video | null> {
  const videos = await getMetadata();
  return videos.find((video) => video.id === id) || null;
}

export default async function VideoPage({
  params,
}: {
  params: { id: string };
}) {
  const video = await getVideo(params.id);

  if (!video) {
    notFound();
  }

  return (
    <ManPage title="NANOTUBE-VIDEO">
      <strong>NAME</strong>
      {`
    ${video.title}

`}
      <strong>PLATFORM</strong>
      {`
    NanoTube

`}
      <strong>DURATION</strong>
      {`
    ${video.duration}
`}

      {video.uploadDate && video.views && (
        <>
          <strong>METADATA</strong>
          {`
    Upload Date: ${video.uploadDate}
    Views: ${video.views}
`}
        </>
      )}

      <strong>PLAYER</strong>

      <div
        style={{
          height: "360px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "monospace",
        }}
      >
        <VideoPlayer videoId={video.id} />
      </div>

      <strong>SEE ALSO</strong>
      {`
    nanotube(1), youtube(1)`}
    </ManPage>
  );
}
