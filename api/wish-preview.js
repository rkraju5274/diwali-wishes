export default async function handler(req, res) {
  const { code } = req.query;

  const SUPABASE_URL = "https://uaoveseiyzftqornhgpt.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_CkjwInj9XCsmhkRq3sdMlQ_2Fi6gMYh";

  if (!code) {
    return res.redirect(302, '/');
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/diwali_wishes?wish_code=eq.${encodeURIComponent(code)}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    const data = await response.json();
    const wish = data && data.length > 0 ? data[0] : null;

    const userAgent = req.headers['user-agent'] || '';
    const isBot = /WhatsApp|facebookexternalhit|Twitterbot|LinkedInBot|TelegramBot/i.test(userAgent);

    // Agar wish na mile ya regular user browser me khole to direct website par redirect karo
    if (!wish || !isBot) {
      return res.redirect(302, `/?w=${code}`);
    }

    const title = `🪔 शुभ दीपावली - ${wish.user_name} की तरफ से 🪔`;
    const desc = wish.greeting_message || 'आपको और आपके परिवार को दीपावली की हार्दिक शुभकामनाएं!';
    const image = wish.photo_url;
    const url = `https://${req.headers.host}/wish/${code}`;

    // WhatsApp Bot ke liye Dynamic HTML with User Image
    const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="600">
  <meta property="og:image:height" content="600">
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${image}">
  <meta http-equiv="refresh" content="0;url=/?w=${code}">
</head>
<body style="background:#050b1a; color:#f6c343; text-align:center; padding:50px; font-family:sans-serif;">
  <h2>🪔 शुभ दीपावली 🪔</h2>
  <p>Loading greeting...</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).send(html);
  } catch (err) {
    return res.redirect(302, `/?w=${code}`);
  }
}
