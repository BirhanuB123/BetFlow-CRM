const path = require('path');
const fs = require('fs');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[key] = value.trim();
    }
  });
  return env;
}

const rootEnv = loadEnv(path.join(__dirname, '..', '..', '.env'));
const apiEnv = loadEnv(path.join(__dirname, '..', '.env'));

const apiKey = apiEnv.AFRO_TOKEN || apiEnv.AFROMESSAGE_API_KEY || rootEnv.AFROMESSAGE_API_KEY || rootEnv.AFRO_TOKEN;
const senderId = apiEnv.AFRO_SENDER || apiEnv.AFROMESSAGE_SENDER_ID || rootEnv.AFROMESSAGE_SENDER_ID || rootEnv.AFRO_SENDER;
const identifier = apiEnv.AFRO_IDENTIFIER || apiEnv.AFROMESSAGE_IDENTIFIER || rootEnv.AFROMESSAGE_IDENTIFIER || rootEnv.AFRO_IDENTIFIER;

console.log("Resolved AfroMessage Config:");
console.log("API Key (first 25 chars):", apiKey ? apiKey.substring(0, 25) + "..." : "NONE");
console.log("Sender ID:", senderId || "NONE");
console.log("Identifier:", identifier || "NONE");

async function testAfroLive() {
  console.log("\n=== 1. Checking Balance Endpoint ===");
  try {
    const res = await fetch("https://api.afromessage.com/api/balance", {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    console.log("Balance HTTP Status:", res.status);
    const data = await res.json();
    console.log("Balance Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Balance Error:", err.message);
  }

  console.log("\n=== 2. Test Send with sender = '" + senderId + "' & identifier = '" + identifier + "' ===");
  try {
    const p1 = new URLSearchParams({ to: "251941909521", message: "BetFlow Live Test 1 " + new Date().toLocaleTimeString() });
    if (senderId) p1.set('sender', senderId);
    if (identifier) p1.set('from', identifier);

    const res1 = await fetch(`https://api.afromessage.com/api/send?${p1.toString()}`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    console.log("Send 1 Status:", res1.status);
    console.log("Send 1 Response:", JSON.stringify(await res1.json(), null, 2));
  } catch (err) {
    console.error("Send 1 Error:", err.message);
  }

  console.log("\n=== 3. Test Send with sender = '" + senderId + "' ONLY (No identifier) ===");
  try {
    const p2 = new URLSearchParams({ to: "251941909521", message: "BetFlow Live Test 2 " + new Date().toLocaleTimeString() });
    if (senderId) p2.set('sender', senderId);

    const res2 = await fetch(`https://api.afromessage.com/api/send?${p2.toString()}`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    console.log("Send 2 Status:", res2.status);
    console.log("Send 2 Response:", JSON.stringify(await res2.json(), null, 2));
  } catch (err) {
    console.error("Send 2 Error:", err.message);
  }

  console.log("\n=== 4. Test Send WITHOUT sender and WITHOUT identifier ===");
  try {
    const p3 = new URLSearchParams({ to: "251941909521", message: "BetFlow Live Test 3 " + new Date().toLocaleTimeString() });

    const res3 = await fetch(`https://api.afromessage.com/api/send?${p3.toString()}`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    console.log("Send 3 Status:", res3.status);
    console.log("Send 3 Response:", JSON.stringify(await res3.json(), null, 2));
  } catch (err) {
    console.error("Send 3 Error:", err.message);
  }
}

testAfroLive();
