export async function onRequest(context) {
  const { request, env } = context;
  const adminPassword = env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return new Response(
      JSON.stringify({ message: 'Server not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const { password } = await request.json();
  if (password === adminPassword) {
    return new Response(
      JSON.stringify({ success: true, redirect: '/dashboard' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return new Response(
    JSON.stringify({ success: false, message: 'Invalid credentials' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}