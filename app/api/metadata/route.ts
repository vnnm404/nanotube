import { getMetadata } from '../../../lib/metadata';

export async function GET(req: Request) {
  try {
    const videos = await getMetadata();

    return new Response(JSON.stringify(videos), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error reading video metadata:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to load metadata' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
