import { ManPage } from '../components/ManPage';

export default function NotFound() {
  return (
    <ManPage title="ERROR">
      <strong>NAME</strong>
{`
    404 - Page Not Found

`}<strong>DESCRIPTION</strong>{`
    The requested resource could not be found on this server.

`}<strong>SEE ALSO</strong>{`
    nanotube(1), home(1)`}
    </ManPage>
  );
}