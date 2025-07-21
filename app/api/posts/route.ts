let posts: any[] = []; // Temporary in-memory storage (resets on server restart)

export async function GET() {
  return new Response(JSON.stringify(posts), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newPost = {
      id: Date.now(),
      ...body,
    };
    posts.push(newPost);

    return new Response(JSON.stringify(newPost), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid data" }), {
      status: 400,
    });
  }
}
