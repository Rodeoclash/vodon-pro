/**
 * Check what `npm run package` made before it ships:
 *
 * - each electron-updater feed (latest*.yml) is for this version and lists
 *   files that exist, with matching size and sha512, so installed apps
 *   don't fail (or refuse) to update
 * - installers (other than the AppImage, whose block map is embedded) have
 *   the .blockmap that differential updates need
 * - the macOS feed lists a zip (Squirrel.Mac updates from the zip)
 * - each installer is within its size budget
 *
 * Usage: node scripts/check-release.mts [release/build]
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

/**
 * Installer size budgets in MB, by extension: about 15% over the largest
 * of each as of 1.9.13 (AppImage 179, exe 161, dmg 163, zip 158). Raise one
 * deliberately, when a dependency is worth the size.
 */
const BUDGET_MB: Record<string, number> = {
  '.AppImage': 205,
  '.exe': 185,
  '.dmg': 190,
  '.zip': 185,
};

type FeedFile = { url: string; sha512: string; size: number };
type Feed = {
  version: string;
  files: FeedFile[];
  path: string;
  sha512: string;
  releaseDate: string;
};

const ROOT = path.resolve(import.meta.dirname, '..');
const dir = path.resolve(
  process.argv[2] ?? path.join(ROOT, 'release', 'build'),
);
const pkg = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'),
);

const problems: string[] = [];
const fail = (message: string) => problems.push(message);

const sha512 = (file: string) =>
  createHash('sha512').update(fs.readFileSync(file)).digest('base64');

const feeds = fs
  .readdirSync(dir)
  .filter((name) => /^latest(-\w+)?\.yml$/.test(name));
if (feeds.length === 0) fail(`No latest*.yml update feed in ${dir}`);

const listed = new Set<string>();

for (const name of feeds) {
  const feed: Feed = parse(fs.readFileSync(path.join(dir, name), 'utf8'));

  if (feed.version !== pkg.version) {
    fail(`${name}: version ${feed.version}, package.json has ${pkg.version}`);
  }
  if (Number.isNaN(Date.parse(feed.releaseDate))) {
    fail(`${name}: bad releaseDate ${feed.releaseDate}`);
  }
  if (!feed.files?.length) {
    fail(`${name}: no files`);
    continue;
  }
  if (feed.path !== feed.files[0].url || feed.sha512 !== feed.files[0].sha512) {
    fail(`${name}: top-level path/sha512 don't match its first file`);
  }
  if (
    name === 'latest-mac.yml' &&
    !feed.files.some((f) => f.url.endsWith('.zip'))
  ) {
    fail(`${name}: no zip; macOS updates install from the zip`);
  }

  for (const entry of feed.files) {
    const file = path.join(dir, entry.url);
    // A bare file name: the updater resolves it against the release
    if (path.basename(entry.url) !== entry.url || /\s/.test(entry.url)) {
      fail(`${name}: ${entry.url} isn't a plain file name`);
      continue;
    }
    if (!fs.existsSync(file)) {
      fail(`${name}: ${entry.url} is missing`);
      continue;
    }
    listed.add(entry.url);
    const size = fs.statSync(file).size;
    if (size !== entry.size) {
      fail(`${name}: ${entry.url} is ${size} bytes, feed says ${entry.size}`);
    }
    if (sha512(file) !== entry.sha512) {
      fail(`${name}: ${entry.url} sha512 doesn't match the feed`);
    }
    if (
      !entry.url.endsWith('.AppImage') &&
      !fs.existsSync(`${file}.blockmap`)
    ) {
      fail(`${name}: ${entry.url} has no .blockmap for differential updates`);
    }
  }
}

// Installers, whether or not a feed lists them (the dmg isn't always)
const installers = fs
  .readdirSync(dir)
  .filter((name) => /\.(AppImage|exe|dmg|zip)$/.test(name));

for (const name of installers) {
  const mb = fs.statSync(path.join(dir, name)).size / 1024 / 1024;
  const budget = BUDGET_MB[path.extname(name)];
  console.log(`check-release: ${name} ${mb.toFixed(1)} MB (budget ${budget})`);
  if (budget === undefined) fail(`${name} has no size budget`);
  else if (mb > budget) {
    fail(`${name} is ${mb.toFixed(1)} MB, over its ${budget} MB budget`);
  }
}

if (problems.length) {
  for (const problem of problems) console.error(`check-release: ${problem}`);
  process.exit(1);
}
console.log(
  `check-release: ${feeds.join(', ')} match ${listed.size} file(s); sizes within budget`,
);
