const users = {
  ilqar: {
    url: "https://drive.google.com/uc?export=download&id=ILQAR_FILE_ID",
    ipSet: new Set()
  },
  rahim: {
    url: "https://drive.google.com/uc?export=download&id=RAHIM_FILE_ID",
    ipSet: new Set()
  },
  gunel: {
    url: "https://drive.google.com/uc?export=download&id=GUNEL_FILE_ID",
    ipSet: new Set()
  }
};

// 💥 IP limiti burdadır
const maxIps = 1;

export default function handler(req, res) {
  const user = req.query.u;
  const clientIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!user || !users[user]) {
    return res.status(403).send("❌ İstifadəçi tapılmadı.");
  }

  const ipSet = users[user].ipSet;
  ipSet.add(clientIp);

  if (ipSet.size > maxIps) {
    return res.status(403).send("❌ Limit keçildi. Link artıq başqa cihazda istifadə olunub.");
  }

  res.redirect(users[user].url);
}
