export async function onRequest(context) {
  const { request, env } = context;
  
  // Get Gmail API credentials from environment
  const clientId = env.GMAIL_CLIENT_ID;
  const clientSecret = env.GMAIL_CLIENT_SECRET;
  const refreshToken = env.GMAIL_REFRESH_TOKEN;
  
  if (!clientId || !clientSecret || !refreshToken) {
    return new Response(
      JSON.stringify({ error: 'Gmail API credentials not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Get access token using refresh token
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  
  const tokenResp = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  
  if (!tokenResp.ok) {
    const err = await tokenResp.text();
    return new Response(
      JSON.stringify({ error: 'Failed to get access token: ' + err }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const tokenData = await tokenResp.json();
  const accessToken = tokenData.access_token;
  
  // Fetch emails from Gmail API
  const gmailResp = await fetch(
    'https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=5',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  
  if (!gmailResp.ok) {
    const err = await gmailResp.text();
    return new Response(
      JSON.stringify({ error: 'Failed to fetch emails: ' + err }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const gmailData = await gmailResp.json();
  
  return new Response(
    JSON.stringify({ messages: gmailData.messages || [] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}