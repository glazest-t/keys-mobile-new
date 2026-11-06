import { cp, readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const snapshot = new URL('versions/full/site/', root);

export async function verifyFullSnapshot() {
 const manifest = JSON.parse(await readFile(new URL('versions/full/manifest.json', root), 'utf8'));
 for (const [path, expected] of Object.entries(manifest.files)) {
  const content = await readFile(new URL(path, snapshot));
  if (createHash('sha256').update(content).digest('hex') !== expected) {
   throw new Error(`Frozen Full version was modified: ${path}`);
  }
 }
 return manifest;
}

export async function buildVersions() {
 await verifyFullSnapshot();
 const output = new URL('dist/', root);
 const full = new URL('versions/full/', output);
 await mkdir(full, {recursive: true});
 await cp(snapshot, full, {recursive: true});
 await cp(new URL('src/preview-versions/', root), new URL('preview-versions/', output), {recursive: true});
 // Runtime deployment configuration is shared, but never saved in the snapshot.
 await cp(new URL('maps/config.js', output), new URL('maps/config.js', full));
 const script = await readFile(new URL('preview-versions/version-switch.js', output));
 const stamp = createHash('sha256').update(script).digest('hex').slice(0, 12);
 for (const [directory, prefix] of [[output, './'], [full, '../../']]) {
  for (const name of ['index.html', 'home-calendar.html']) {
   const file = new URL(name, directory);
   const html = await readFile(file, 'utf8');
   await writeFile(file, html.replace('</body>', `<script src="${prefix}preview-versions/version-switch.js?v=${stamp}"></script>\n</body>`));
  }
 }
}
