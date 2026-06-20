import fs from "fs";
import zlib from "zlib";

const path = process.argv[2];
const buf = fs.readFileSync(path);
for (let i = 0; i < buf.length - 4; ) {
  if (buf[i] === 0x50 && buf[i + 1] === 0x4b && buf[i + 2] === 0x03) {
    const nl = buf.readUInt16LE(i + 26);
    const el = buf.readUInt16LE(i + 28);
    const cs = buf.readUInt32LE(i + 18);
    const name = buf.slice(i + 30, i + 30 + nl).toString();
    const ds = i + 30 + nl + el;
    if (name === "word/document.xml") {
      let data = buf.slice(ds, ds + cs);
      try {
        data = zlib.inflateRawSync(data);
      } catch {
        /* stored */
      }
      console.log(data.toString("utf8").replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
      process.exit(0);
    }
    i = ds + cs;
  } else i++;
}
