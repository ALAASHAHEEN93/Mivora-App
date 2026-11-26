/**
 * `pnpm demo:phone` — serve the built demo on this Wi-Fi so phones in the same network can open it.
 * 1. Stops an older Mivora demo still running on port 3000 (only a Next.js server started from this
 *    project folder; anything else on the port is left alone and the script explains what to do).
 * 2. Builds the app, prints the phone link and a QR code, then starts `next start` on all interfaces.
 * Nothing leaves the local network. Stop with Ctrl+C.
 */
import { execFileSync, spawn } from "node:child_process";
import { realpathSync } from "node:fs";
import { networkInterfaces } from "node:os";
import QRCode from "qrcode";

const PORT = 3000;
const PROJECT = realpathSync(process.cwd());

function lanAddress(): string | undefined {
  for (const list of Object.values(networkInterfaces())) {
    for (const net of list ?? []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return undefined;
}

/** Output of a command, or "" when it fails or isn't installed (e.g. no lsof). */
function run(cmd: string, args: string[]): string {
  try {
    return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function listeners(): number[] {
  return run("lsof", ["-nP", `-iTCP:${PORT}`, "-sTCP:LISTEN", "-t"])
    .split("\n")
    .map(Number)
    .filter((pid) => Number.isInteger(pid) && pid > 0);
}

/** True when the process is a Next.js server whose working folder is this project. */
function isOurDemo(pid: number): boolean {
  const command = run("ps", ["-o", "command=", "-p", String(pid)]);
  const cwd = run("lsof", ["-a", "-p", String(pid), "-d", "cwd", "-Fn"])
    .split("\n")
    .find((line) => line.startsWith("n"))
    ?.slice(1);
  if (!/next-server|next start/.test(command) || !cwd) return false;
  try {
    return realpathSync(cwd) === PROJECT;
  } catch {
    return false;
  }
}

async function freePort(): Promise<boolean> {
  const pids = listeners();
  if (pids.length === 0) return true;
  const others = pids.filter((pid) => !isOurDemo(pid));
  if (others.length > 0) {
    console.log(`\n  Port ${PORT} is used by another program (process ${others.join(", ")}), not an older Mivora demo.`);
    console.log("  Close that program, or stop it with Ctrl+C in its terminal, then run `pnpm demo:phone` again.\n");
    return false;
  }
  console.log(`\n  Stopping the older Mivora demo on port ${PORT}…`);
  for (const pid of pids) process.kill(pid, "SIGTERM");
  for (let i = 0; i < 50 && listeners().length > 0; i++) await new Promise((r) => setTimeout(r, 100));
  if (listeners().length > 0) {
    console.log(`  It did not stop. Press Ctrl+C in the terminal where it runs, then try again.\n`);
    return false;
  }
  return true;
}

function build(): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn("next", ["build"], { stdio: "inherit", env: { ...process.env, PRESENTATION_MODE: "1" } });
    child.on("exit", (code) => resolve(code === 0));
  });
}

async function main() {
  if (!(await freePort())) process.exit(1);
  if (!(await build())) process.exit(1);

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
