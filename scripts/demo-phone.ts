/**
 * `pnpm demo:phone` — serve the built demo on this Wi-Fi so phones in the same network can open it.
 * Prints the phone link and a QR code in the terminal, then starts `next start` on all interfaces.
 * Nothing leaves the local network. Stop with Ctrl+C.
 */
import { spawn } from "node:child_process";
import { networkInterfaces } from "node:os";
import QRCode from "qrcode";

const PORT = 3000;

function lanAddress(): string | undefined {
  for (const list of Object.values(networkInterfaces())) {
    for (const net of list ?? []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return undefined;
}

async function main() {
  const ip = lanAddress();
  if (!ip) {
    console.log("No Wi-Fi/LAN address found. Connect the laptop to a network first.");
  } else {
    const url = `http://${ip}:${PORT}/de`;
    console.log("\n  Mivora demo on this Wi-Fi\n");
    console.log(`  Phone link:  ${url}\n`);
    console.log(await QRCode.toString(url, { type: "terminal", small: true }));
    console.log("  Phone and laptop must be on the same Wi-Fi (guest networks often block this;");
    console.log("  then use your phone's hotspot for both).\n");
  }
  const child = spawn("next", ["start", "-p", String(PORT), "-H", "0.0.0.0"], {
    stdio: "inherit",
    env: { ...process.env, PRESENTATION_MODE: "1" },
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}

void main();
