// Ensure `.next/` is a symlink to `~/Library/Caches/onguide-next`.
// Project lives in iCloud Drive which corrupts Next.js HMR caches.
const fs = require("fs");
const os = require("os");
const path = require("path");

const target = path.join(os.homedir(), "Library/Caches/onguide-next");
const link = path.join(process.cwd(), ".next");

fs.mkdirSync(target, { recursive: true });

let needsSymlink = true;
try {
  const stat = fs.lstatSync(link);
  if (stat.isSymbolicLink()) {
    const current = fs.readlinkSync(link);
    if (current === target) {
      needsSymlink = false;
    } else {
      fs.unlinkSync(link);
    }
  } else if (stat.isDirectory()) {
    fs.rmSync(link, { recursive: true, force: true });
  }
} catch (e) {
  // .next doesn't exist yet
}

if (needsSymlink) {
  fs.symlinkSync(target, link);
  console.log(`[setup-cache] .next -> ${target}`);
}
