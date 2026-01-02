import { Statistics, CheckResult } from './types';

export function runChecks(
  statistics: Statistics,
  checkStrings: string[]
): CheckResult[] {
  const checks: CheckResult[] = [];

  for (const checkString of checkStrings) {
    const [key, value] = checkString.split('=');
    if (!key || !value) continue;

    const expected = parseFloat(value);
    if (isNaN(expected)) continue;

    let actual: number;
    let passed: boolean;

    switch (key.toLowerCase()) {
      case 'mean':
        actual = statistics.mean;
        passed = actual <= expected;
        break;
      case 'median':
        actual = statistics.median;
        passed = actual <= expected;
        break;
      case 'stddev':
        actual = statistics.stdDev;
        passed = actual <= expected;
        break;
      case 'q5':
        actual = statistics.q5;
        passed = actual <= expected;
        break;
      case 'q50':
        actual = statistics.q50;
        passed = actual <= expected;
        break;
      case 'q95':
        actual = statistics.q95;
        passed = actual <= expected;
        break;
      case 'q99':
        actual = statistics.q99;
        passed = actual <= expected;
        break;
      case 'pctofsuccess':
        actual = statistics.pctOfSuccess;
        passed = actual >= expected;
        break;
      default:
        continue;
    }

    checks.push({
      check: key,
      expected,
      actual,
      passed,
    });
  }

  return checks;
}

