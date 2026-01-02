import { Statistics, RequestResult, CheckResult } from '@apibench/core';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { createObjectCsvWriter } from 'csv-writer';
import { table } from 'table';
import chalk from 'chalk';

export interface OutputData {
  results: RequestResult[];
  statistics: Statistics;
  checks?: CheckResult[];
}

export function formatASCIIChart(
  statistics: Statistics,
  width: number = 50
): string {
  if (statistics.responseTimes.length === 0) {
    return chalk.gray('No successful requests to chart');
  }

  const responseTimes = statistics.responseTimes;
  const min = statistics.min;
  const max = statistics.max;
  const range = max - min;

  if (range === 0) {
    return chalk.gray('All response times are identical');
  }

  // Create buckets for histogram
  const numBuckets = Math.min(20, Math.max(10, Math.floor(Math.sqrt(responseTimes.length))));
  const bucketSize = range / numBuckets;
  const buckets: number[] = new Array(numBuckets).fill(0);

  // Count responses in each bucket
  responseTimes.forEach((time) => {
    const bucketIndex = Math.min(
      Math.floor((time - min) / bucketSize),
      numBuckets - 1
    );
    buckets[bucketIndex]++;
  });

  const maxCount = Math.max(...buckets);
  const chartLines: string[] = [];
  chartLines.push(chalk.cyan('Response Time Distribution (ms)'));
  chartLines.push('');

  // Build the chart
  for (let i = 0; i < numBuckets; i++) {
    const bucketStart = min + i * bucketSize;
    const bucketEnd = min + (i + 1) * bucketSize;
    const count = buckets[i];
    const barLength = Math.round((count / maxCount) * width);
    const bar = '█'.repeat(barLength);
    const percentage = ((count / responseTimes.length) * 100).toFixed(1);

    // Color code based on response time
    let coloredBar: string;
    const avgTime = (bucketStart + bucketEnd) / 2;
    if (avgTime <= statistics.q50) {
      coloredBar = chalk.green(bar);
    } else if (avgTime <= statistics.q95) {
      coloredBar = chalk.yellow(bar);
    } else {
      coloredBar = chalk.red(bar);
    }

    const label = `${bucketStart.toFixed(0).padStart(6)}-${bucketEnd.toFixed(0).padEnd(6)}`;
    chartLines.push(
      `${label} │${coloredBar}${' '.repeat(width - barLength)}│ ${count.toString().padStart(3)} (${percentage}%)`
    );
  }

  chartLines.push('');
  chartLines.push(
    chalk.gray(`Min: ${min}ms │ Mean: ${statistics.mean.toFixed(2)}ms │ Median: ${statistics.median.toFixed(2)}ms │ Max: ${max}ms`)
  );

  return chartLines.join('\n');
}

export function formatTable(
  statistics: Statistics,
  checks?: CheckResult[],
  format: 'full' | 'compact' = 'full',
  showChart: boolean = true
): string {
  const data: string[][] = [];

  if (format === 'full') {
    data.push(['Metric', 'Value']);
    data.push(['Total Requests', statistics.total.toString()]);
    data.push(['Successful', statistics.successful.toString()]);
    data.push(['Failed', statistics.failed.toString()]);
    data.push(['Success Rate', `${statistics.pctOfSuccess.toFixed(2)}%`]);
    data.push(['Mean (ms)', statistics.mean.toFixed(2)]);
    data.push(['Median (ms)', statistics.median.toFixed(2)]);
    data.push(['Min (ms)', statistics.min.toString()]);
    data.push(['Max (ms)', statistics.max.toString()]);
    data.push(['Std Dev (ms)', statistics.stdDev.toFixed(2)]);
    data.push(['5th Percentile (ms)', statistics.q5.toString()]);
    data.push(['50th Percentile (ms)', statistics.q50.toString()]);
    data.push(['95th Percentile (ms)', statistics.q95.toString()]);
    data.push(['99th Percentile (ms)', statistics.q99.toString()]);
  } else {
    data.push(['Metric', 'Value']);
    data.push(['Total', statistics.total.toString()]);
    data.push(['Success', `${statistics.successful} (${statistics.pctOfSuccess.toFixed(1)}%)`]);
    data.push(['Failed', statistics.failed.toString()]);
    data.push(['Mean', `${statistics.mean.toFixed(2)}ms`]);
    data.push(['Median', `${statistics.median.toFixed(2)}ms`]);
    data.push(['Min', `${statistics.min}ms`]);
    data.push(['Max', `${statistics.max}ms`]);
    data.push(['Std Dev', `${statistics.stdDev.toFixed(2)}ms`]);
  }

  if (checks && checks.length > 0) {
    data.push([]);
    data.push(['Check', 'Expected', 'Actual', 'Status']);
    checks.forEach((check) => {
      const status = check.passed
        ? chalk.green('✓ PASS')
        : chalk.red('✗ FAIL');
      data.push([
        check.check,
        check.expected.toString(),
        check.actual.toFixed(2),
        status,
      ]);
    });
  }

  const tableOutput = table(data, {
    border: {
      topBody: '─',
      topJoin: '┬',
      topLeft: '┌',
      topRight: '┐',
      bottomBody: '─',
      bottomJoin: '┴',
      bottomLeft: '└',
      bottomRight: '┘',
      bodyLeft: '│',
      bodyRight: '│',
      bodyJoin: '│',
      joinBody: '─',
      joinLeft: '├',
      joinRight: '┤',
      joinJoin: '┼',
    },
  });

  // Add ASCII chart if enabled and we have successful requests
  if (showChart && statistics.responseTimes.length > 0) {
    return `${tableOutput}\n\n${formatASCIIChart(statistics)}`;
  }

  return tableOutput;
}

export function formatJSON(data: OutputData): string {
  return JSON.stringify(data, null, 2);
}

export function formatYAML(data: OutputData): string {
  return yaml.dump(data, { indent: 2 });
}

export async function formatCSV(
  data: OutputData,
  outputPath?: string
): Promise<string> {
  const csvPath = outputPath || path.join(process.cwd(), 'clobbr-results.csv');
  const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: [
      { id: 'iteration', title: 'Iteration' },
      { id: 'statusCode', title: 'Status Code' },
      { id: 'responseTime', title: 'Response Time (ms)' },
      { id: 'success', title: 'Success' },
      { id: 'error', title: 'Error' },
      { id: 'timestamp', title: 'Timestamp' },
    ],
  });

  await csvWriter.writeRecords(data.results);

  const statsPath = csvPath.replace('.csv', '-stats.csv');
  const statsWriter = createObjectCsvWriter({
    path: statsPath,
    header: [
      { id: 'metric', title: 'Metric' },
      { id: 'value', title: 'Value' },
    ],
  });

  await statsWriter.writeRecords([
    { metric: 'Total Requests', value: data.statistics.total },
    { metric: 'Successful', value: data.statistics.successful },
    { metric: 'Failed', value: data.statistics.failed },
    { metric: 'Success Rate (%)', value: data.statistics.pctOfSuccess.toFixed(2) },
    { metric: 'Mean (ms)', value: data.statistics.mean.toFixed(2) },
    { metric: 'Median (ms)', value: data.statistics.median.toFixed(2) },
    { metric: 'Min (ms)', value: data.statistics.min },
    { metric: 'Max (ms)', value: data.statistics.max },
    { metric: 'Std Dev (ms)', value: data.statistics.stdDev.toFixed(2) },
    { metric: '5th Percentile (ms)', value: data.statistics.q5 },
    { metric: '50th Percentile (ms)', value: data.statistics.q50 },
    { metric: '95th Percentile (ms)', value: data.statistics.q95 },
    { metric: '99th Percentile (ms)', value: data.statistics.q99 },
  ]);

  return `CSV files written to:\n  - ${csvPath}\n  - ${statsPath}`;
}

export async function outputResults(
  data: OutputData,
  format: 'table' | 'json' | 'yaml' | 'csv' = 'table',
  tableFormat: 'full' | 'compact' = 'full',
  outputFile: boolean = false,
  showChart: boolean = true
): Promise<string> {
  let output: string;

  switch (format) {
    case 'json':
      output = formatJSON(data);
      break;
    case 'yaml':
      output = formatYAML(data);
      break;
    case 'csv':
      if (outputFile) {
        return await formatCSV(data);
      }
      output = formatJSON(data); // Fallback for console output
      break;
    case 'table':
    default:
      output = formatTable(data.statistics, data.checks, tableFormat, showChart);
      break;
  }

  if (outputFile && format !== 'csv') {
    const ext = format === 'json' ? 'json' : format === 'yaml' ? 'yaml' : 'txt';
    const filename = `clobbr-results.${ext}`;
    const filepath = path.join(process.cwd(), filename);
    fs.writeFileSync(filepath, output);
    return `${output}\n\nResults written to: ${filepath}`;
  }

  return output;
}

