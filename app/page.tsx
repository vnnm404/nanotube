import { ManPage } from '../components/ManPage';
import VideoList from '../components/VideoList';
import UploadSection from '../components/UploadSection';

export default function Home() {
  return (
    <ManPage title="NANOTUBE">
      <strong>NAME</strong>
      {`
    nanotube - minimal video platform

`}
      <strong>DESCRIPTION</strong>
      {`
    A collection of technical videos hosted on NanoTube platform.

`}
      <UploadSection />

      <strong>AVAILABLE VIDEOS</strong>

      <VideoList />

      <strong>SEE ALSO</strong>
      {`
    youtube(1), vimeo(1)`}
    </ManPage>
  );
}
