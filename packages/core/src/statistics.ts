import { RequestResult, Statistics } from './types';

export function calculateStatistics(results: RequestResult[]): Statistics {
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const responseTimes = successful.map((r) => r.responseTime).sort((a, b) => a - b);

  const total = results.length;
  const pctOfSuccess = total > 0 ? (successful.length / total) * 100 : 0;

  if (responseTimes.length === 0) {
    return {
      total,
      successful: 0,
      failed: failed.length,
      pctOfSuccess: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      q5: 0,
      q50: 0,
      q95: 0,
      q99: 0,
      responseTimes: [],
    };
  }

  const mean = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  const median = calculatePercentile(responseTimes, 50);
  const min = responseTimes[0];
  const max = responseTimes[responseTimes.length - 1];

  const variance =
    responseTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) /
    responseTimes.length;
  const stdDev = Math.sqrt(variance);

  return {
    total,
    successful: successful.length,
    failed: failed.length,
    pctOfSuccess,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    min,
    max,
    stdDev: Math.round(stdDev * 100) / 100,
    q5: calculatePercentile(responseTimes, 5),
    q50: median,
    q95: calculatePercentile(responseTimes, 95),
    q99: calculatePercentile(responseTimes, 99),
    responseTimes,
  };
}

function calculatePercentile(sortedArray: number[], percentile: number): number {
  if (sortedArray.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, index)];
}

