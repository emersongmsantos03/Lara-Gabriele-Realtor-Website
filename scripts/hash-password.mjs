#!/usr/bin/env node
// Creates one ADMIN_USERS entry for the /admin login.
//
//   node scripts/hash-password.mjs lara@pacificfriendlyrealty.com "Lara"
//
// It asks for the password (typing is hidden) and prints a line like
//   email|Name|salt|hash
// Join several entries with commas and save them as the ADMIN_USERS environment
// variable in Vercel (Settings → Environment Variables) and in .env.local.
import { randomBytes, scryptSync } from "crypto";
import { createInterface } from "readline";

const [email, name = email?.split("@")[0]] = process.argv.slice(2);
if (!email || !email.includes("@")) {
  console.error('Usage: node scripts/hash-password.mjs <email> "<Display name>"');
  process.exit(1);
}

async function readPassword() {
  if (!process.stdin.isTTY) {
    let data = "";
    for await (const chunk of process.stdin) data += chunk;
    return data.replace(/\r?\n$/, "");
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  rl._writeToOutput = (s) => {
    if (s.startsWith("Password")) process.stdout.write(s);
  };
  const pw = await new Promise((resolve) => rl.question("Password: ", resolve));
  rl.close();
  process.stdout.write("\n");
  return pw;
}

const password = await readPassword();
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log(`${email.toLowerCase()}|${name.replace(/[|,]/g, " ")}|${salt.toString("hex")}|${hash.toString("hex")}`);
