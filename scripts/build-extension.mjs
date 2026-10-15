import { build } from "vite";
import {
  mkdirSync,
  mkdtempSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { crc32, deflateRawSync } from "node:zlib";
import { join, resolve } from "node:path";
const out = mkdtempSync("/tmp/vocab-extension-");
try {
  for (const [entry, format] of [
    ["popup", "es"],
    ["overlay", "iife"],
  ])
    await build({
      configFile: false,
      logLevel: "warn",
      publicDir: false,
      build: {
        outDir: out,
        emptyOutDir: false,
        lib: {
          entry: resolve(`extension/${entry}.js`),
          name: "VocabDrawerOverlay",
          formats: [format],
          fileName: () => entry + ".js",
        },
      },
    });
  for (const file of ["manifest.json", "popup.html", "popup.css", "README.md"])
    copyFileSync(join("extension", file), join(out, file));
  mkdirSync("public/extensions", { recursive: true });
  const target = resolve("public/extensions/vocab-drawer-browser.zip");
  const local = [],
    central = [];
  let offset = 0;
  const files = [
    "popup.js",
    "overlay.js",
    "manifest.json",
    "popup.html",
    "popup.css",
    "README.md",
  ];
  for (const file of files) {
    const name = Buffer.from(file),
      raw = readFileSync(join(out, file)),
      packed = deflateRawSync(raw);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(8, 8); // Deflate compression; fixed DOS date makes builds reproducible.
    header.writeUInt16LE(33, 12);
    header.writeUInt32LE(crc32(raw), 14);
    header.writeUInt32LE(packed.length, 18);
    header.writeUInt32LE(raw.length, 22);
    header.writeUInt16LE(name.length, 26);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50, 0);
    directory.writeUInt16LE(20, 4);
    header.copy(directory, 6, 4, 30);
    directory.writeUInt32LE(offset, 42);
    local.push(header, name, packed);
    central.push(directory, name);
    offset += header.length + name.length + packed.length;
  }
  const end = Buffer.alloc(22),
    directoryBytes = Buffer.concat(central);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directoryBytes.length, 12);
  end.writeUInt32LE(offset, 16);
  writeFileSync(target, Buffer.concat([...local, directoryBytes, end]));
  console.log(
    "Browser extension built: public/extensions/vocab-drawer-browser.zip",
  );
} finally {
  rmSync(out, { recursive: true, force: true });
}
