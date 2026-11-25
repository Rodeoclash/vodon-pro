/**
 * List the tests that failed and then passed on retry, from Playwright's
 * JSON report: a GitHub warning annotation for each, plus the job summary.
 * They pass the run (CI allows one retry) but shouldn't go unnoticed.
 *
 * Usage: node e2e/report-flaky.mts [playwright-report/results.json]
 */
import fs from 'node:fs';

type Test = { status: string; projectName: string };
type Spec = { title: string; file: string; line: number; tests: Test[] };
type Suite = { title: string; specs?: Spec[]; suites?: Suite[] };

const reportPath = process.argv[2] ?? 'playwright-report/results.json';
if (!fs.existsSync(reportPath)) {
  console.log(`No report at ${reportPath}`);
  process.exit(0);
}
const report: { suites: Suite[] } = JSON.parse(
  fs.readFileSync(reportPath, 'utf8'),
);

type Flaky = { location: string; name: string };

/** Flaky specs in a suite; `describes` are the enclosing describe titles. */
function flakySpecs(suite: Suite, describes: string[]): Flaky[] {
  const own = (suite.specs ?? [])
    .filter((spec) => spec.tests.some((test) => test.status === 'flaky'))
    .map((spec) => ({
      location: `${spec.file}:${spec.line}`,
      name: [...describes, spec.title].join(' › '),
    }));
  const nested = (suite.suites ?? []).flatMap((child) =>
    flakySpecs(child, [...describes, child.title]),
  );
  return [...own, ...nested];
}

// Top-level suites are files, whose names are already in each location
const names = report.suites.flatMap((file) => flakySpecs(file, []));

if (names.length === 0) {
  console.log('No flaky tests.');
  process.exit(0);
}

for (const { location, name } of names) {
  const [file, line] = location.split(':');
  console.log(
    `::warning file=e2e/${file},line=${line},title=Flaky test::${name} passed only on retry`,
  );
}

const summary = process.env.GITHUB_STEP_SUMMARY;
if (summary) {
  fs.appendFileSync(
    summary,
    [
      `### ${names.length} flaky e2e test${names.length === 1 ? '' : 's'}`,
      '',
      'Passed only on retry:',
      '',
      ...names.map(({ location, name }) => `- \`e2e/${location}\` ${name}`),
      '',
    ].join('\n'),
  );
}
