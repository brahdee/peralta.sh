import { minify } from "minify";

import { writeFileSync } from "node:fs";
import path from "node:path";

const files = [
  "assets/main/main.css",
  "assets/gallery/main.css",
  "assets/main/main.js",
  "assets/gallery/main.js",
];

const options = {
  js: {
    type: "esbuild",
  },
};

// Minify files -> *.js/*.css to *.min.js/*.min.css
for (const file of files) {
  const parsed = path.parse(file);
  const outputFile = path.join(parsed.dir, `${parsed.name}.min${parsed.ext}`);

  try {
    const output = await minify(file, options);
    writeFileSync(outputFile, output);
  } catch (error) {
    console.error(`Failed to minify ${file}:`, error);
    process.exitCode = 1;
  }
}
