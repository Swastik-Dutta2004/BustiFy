import stops from "../all-stops.json";
import fs from "fs";


function normalize(stop: string) {
  return stop
    .toLowerCase()
    .replace(/[.,()&/-]/g, " ")
    .replace(/\bmore\b/g, "")
    .replace(/\bstation\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const groups = new Map<string, string[]>();

for (const stop of stops) {
  const key = normalize(stop);

  if (!groups.has(key)) {
    groups.set(key, []);
  }

  groups.get(key)!.push(stop);
}

for (const [key, values] of groups) {
  if (values.length > 1) {
    console.log("\n" + key);
    console.log(values);
  }
}


let output = "";

for (const [key, values] of groups) {
  if (values.length > 1) {
    output += `\n${key}\n`;
    output += JSON.stringify(values) + "\n";
  }
}

fs.writeFileSync("duplicate-stops.txt", output);

console.log("Saved duplicates to duplicate-stops.txt");