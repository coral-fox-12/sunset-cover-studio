// Sunset Cover Studio — entry program (make.fun gta6-cover-art-01).
// Copies the app and its screenshots into the output directory and writes
// the dossier there with the kit's library. Node 22, standard library only.
// The program runs twice and both runs must write the same bytes, so nothing
// here depends on the clock, randomness or the environment beyond the output
// directory override.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoDir = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(name) {
  const from = join(repoDir, name);
  const to = join(outDir, name);
  if (!existsSync(from)) {
    throw new Error(`missing ${name}/ in the repository`);
  }
  rmSync(to, { force: true, recursive: true });
  cpSync(from, to, { recursive: true });
  return to;
}

mkdirSync(outDir, { recursive: true });
copyTree('app');
copyTree('screenshots');

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
const dossierPath = join(outDir, 'dossier.json');
writeFileSync(dossierPath, dossier);

// Verify the handoff: the dossier must parse back, and the output must hold
// the app, 3 or 4 screenshots and the dossier itself — nothing else missing.
const parsed = JSON.parse(readFileSync(dossierPath, 'utf8'));
const shotCount = readdirSync(join(outDir, 'screenshots')).filter((f) => !f.startsWith('.')).length;
if (parsed.schema !== 'makefun/dossier/v1') throw new Error('dossier schema mismatch');
if (shotCount < 3 || shotCount > 4) throw new Error(`expected 3 or 4 screenshots, found ${shotCount}`);

console.log(`sunset-cover-studio: wrote ${outDir} (dossier ${dossier.length} bytes, ${shotCount} screenshots)`);
