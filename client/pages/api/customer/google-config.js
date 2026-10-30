export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const isConfigured = Boolean(clientId && clientId.length > 10 && !clientId.includes('your_google'));

  return res.status(200).json({
    success: true,
    configured: isConfigured,
    clientId: isConfigured ? clientId : ''
  });
}
