import { readFileSync, writeFileSync } from "node:fs";
import { buildFamilies, crossLingual } from "../../src/lib/etymology.js";
const chains = Object.values(JSON.parse(readFileSync("scripts/etym/chains.json", "utf8")));
const withChain = chains.filter((c) => c.chain && c.chain.length);
const fams = buildFamilies(withChain);
const cross = crossLingual(fams);
console.log(`words harvested: ${chains.length}, with a chain: ${withChain.length}`);
console.log(`families (2+ members): ${fams.length}`);
console.log(`families spanning French AND German: ${cross.length}`);
console.log("\ntop cross-language families:");
for (const f of cross.slice(0, 18)) {
  console.log(`  ${f.layer.padEnd(4)} ${f.form.padEnd(16)} ${f.members.map((m) => `${m.lang}:${m.t}`).join(", ")}`);
}
writeFileSync("scripts/etym/families.json", JSON.stringify({ all: fams, cross }, null, 0));
