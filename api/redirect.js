const ipCache = {};
export default function handler(req, res) {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const maxIps = parseInt(process.env.MAX_ALLOWED_IPS || "2");
  const fileUrl = process.env.M3U_URL;
  console.log("📦 M3U_URL içindəki link:", fileUrl);
  if (!fileUrl) return res.status(500).send("Link tapılmadı.");
  const ipKey = "global";
  ipCache[ipKey] = ipCache[ipKey] || new Set();
  ipCache[ipKey].add(clientIp);
  if (ipCache[ipKey].size > maxIps) {
    return res.status(403).send("Limit keçildi. Link artıq başqa cihazda istifadə olunub.");
  }
  res.redirect(fileUrl);
}
