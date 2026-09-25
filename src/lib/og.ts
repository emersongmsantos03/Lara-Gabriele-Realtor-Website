import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const ogColors = {
  navy: "#0e2b40",
  sunset: "#f4a259",
  sea: "#7fd1d9",
  cream: "#f8f4ec",
};

export async function lightLogoDataUri() {
  const buf = await readFile(join(process.cwd(), "public/images/logo-light.png"));
  return `data:image/png;base64,${buf.toString("base64")}`;
}
