const fs = require("fs-extra");
const path = require("path");
const https = require("https");

exports.config = {
  name: "cutereply",
  version: "2.1.0",
  author: "AKASH x RAHAT",
  countDown: 0,
  role: 0,
  shortDescription: "Reply with text + image on trigger",
  longDescription: "Trigger মেসেজে reply দিয়ে text + image পাঠাবে",
  category: "fun"
};

const cooldown = 10000; // 10 sec
const last = {};

// =======================
// ✨ EASY ADD SECTION ✨
// =======================
const TRIGGERS = [
  {
    words: ["জানু"],
    text: "Jan ami Onek Horny Hoye achi 🫦🥺",
    images: [
      "https://i.imgur.com/SC2bxJP.jpeg"
    ]
  },
  {
    words: ["দুধ", "milk", "dudh", "dud"],
    text: "Khaiba Jan 👄🫦🥵",
    images: [
      "https://i.imgur.com/pvg96iq.jpeg",
      "https://i.imgur.com/QwhSzK6.jpeg",
      "https://i.imgur.com/7nVvlGN.jpeg",
      "https://i.imgur.com/jxoA0io.jpeg",
      "https://i.imgur.com/38kl8ph.jpeg"
    ]
  },
  {
    words: ["ভুদা", "গুদ", "vuda"],
    text: "চুষে দিবা জান 🫦🥵",
    images: [
      "https://i.imgur.com/aqjnjR3.jpeg",
      "https://i.imgur.com/knSzeOj.jpeg",
      "https://i.imgur.com/pupjXKH.jpeg"
    ]
  }
];
// =======================

exports.onStart = async function () {};

exports.onChat = async function ({ event, api }) {
  try {
    const { threadID, senderID, messageID } = event;
    const body = (event.body || "").toLowerCase().trim();
    if (!body) return;

    // bot নিজের মেসেজ ignore
    if (senderID === api.getCurrentUserID()) return;

    // cooldown
    const now = Date.now();
    if (last[threadID] && now - last[threadID] < cooldown) return;

    let matched = null;
    for (const t of TRIGGERS) {
      if (t.words.some(w => body.includes(w))) {
        matched = t;
        break;
      }
    }
    if (!matched) return;

    last[threadID] = now;

    const imgUrl = matched.images[Math.floor(Math.random() * matched.images.length)];
    const imgName = path.basename(imgUrl);
    const imgPath = path.join(__dirname, imgName);

    if (!fs.existsSync(imgPath)) {
      await download(imgUrl, imgPath);
    }

    api.sendMessage(
      {
        body: matched.text,
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      messageID // reply
    );

  } catch (e) {
    console.log(e);
  }
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(dest, () => {});
        return reject();
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", () => {
      fs.unlink(dest, () => {});
      reject();
    });
  });
}
