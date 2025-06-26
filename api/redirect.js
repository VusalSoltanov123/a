const centralUrl = process.env.M3U_URL;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Sadəcə icazəli istifadəçilər
const allowedUsers = ["vusal", "ilqar"];

export default async function handler(req, res) {
  const user = req.query.u;
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress;

  if (!user || !allowedUsers.includes(user)) {
    return res.status(403).send("❌ İstifadəçi tapılmadı və ya icazəsizdir.");
  }

  if (!centralUrl) {
    return res.status(500).send("❌ M3U linki təyin edilməyib.");
  }

  const redisKey = `iptv_user_${user}`;

  // Redis-dən IP-ni oxu
  const response = await fetch(`${redisUrl}/get/${redisKey}`, {
    headers: { Authorization: `Bearer ${redisToken}` }
  });

  const existingIp = await response.text();

  // IP yoxdursa → yaz və yönləndir
  if (!existingIp) {
    await fetch(`${redisUrl}/set/${redisKey}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ value: clientIp, EX: 31536000 }) // 365 gün
    });

    return res.redirect(centralUrl);
  }

  // Əgər IP eynidirsə → keç
  if (existingIp === clientIp) {
    return res.redirect(centralUrl);
  }

  // Başqa IP-dirsə → blok
  return res.status(403).send("❌ Limit keçildi. Link artıq başqa cihazda istifadə olunub.");
}
