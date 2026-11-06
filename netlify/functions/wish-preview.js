// Netlify Serverless Function: Dynamically generates Open Graph tags for WhatsApp
// Uses native fetch to avoid dependency installation issues on Netlify

const SUPABASE_URL = process.env.SUPABASE_URL || "https://uaoveseiyzftqornhgpt.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_CkjwInj9XCsmhkRq3sdMlQ_2Fi6gMYh";

exports.handler = async (event) => {
  // Extract wish code from URL path or query string
  let wishCode = event.queryStringParameters?.w || null;

  if (!wishCode) {
    const pathParts = event.path.split('/').filter(Boolean);
    wishCode = pathParts[pathParts.length - 1];
  }

  let userName = "शुभचिंतक";
  let message = "आपको और आपके पूरे परिवार को दीपावली की हार्दिक शुभकामनाएं!";
  let photoUrl = "https://images.unsplash.com/photo-1605629921711-2f6b00c6bbf4?auto=format&fit=crop&w=1200&q=80";
  const siteUrl = process.env.URL || `https://${event.headers.host}`;

  if (wishCode && wishCode !== 'wish-preview') {
    try {
      // Direct REST API call (no npm install required on Netlify)
      const res = await fetch(`${SUPABASE_URL}/rest/v1/diwali_wishes?wish_code=eq.${encodeURIComponent(wishCode)}&select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          userName = item.user_name || userName;
          message = item.greeting_message || message;
          if (item.photo_url) photoUrl = item.photo_url;
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  const title = `🪔 शुभ दीपावली - ${userName} की तरफ से खास शुभकामना`;

  // Server-rendered HTML specifically for WhatsApp's Crawler
  const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${message}">
  
  <!-- WhatsApp & Facebook Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${message}">
  <meta property="og:image" content="${photoUrl}">
  <meta property="og:image:width" content="600">
  <meta property="og:image:height" content="600">
  <meta property="og:url" content="${siteUrl}/?w=${wishCode}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${message}">
  <meta name="twitter:image" content="${photoUrl}">

  <!-- Instant Browser Redirect to the actual animated page if clicked -->
  <meta http-equiv="refresh" content="0;url=/?w=${wishCode}">
  <script>
    window.location.replace("/?w=${wishCode}");
  </script>
</head>
<body style="background:#050b1a; color:#fff; font-family:sans-serif; text-align:center; padding-top:50px;">
  <p>लोड हो रहा है... कृपया प्रतीक्षा करें</p>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=120"
    },
    body: html
  };
};
