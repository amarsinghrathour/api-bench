export interface RequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  data?: any;
}

export interface RequestResult {
  iteration: number;
  statusCode?: number;
  responseTime: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

export interface Statistics {
  total: number;
  successful: number;
  failed: number;
  pctOfSuccess: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  q5: number;
  q50: number;
  q95: number;
  q99: number;
  responseTimes: number[];
}

export interface CheckResult {
  check: string;
  expected: number;
  actual: number;
  passed: boolean;
}

export interface RunOptions {
  url: string;
  method?: string;
  iterations?: number;
  parallel?: boolean;
  headersPath?: string;
  dataPath?: string;
  outputFormat?: 'table' | 'json' | 'yaml' | 'csv';
  outputFile?: boolean;
  table?: 'full' | 'compact';
  checks?: string[];
}

