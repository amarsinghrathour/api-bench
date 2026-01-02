#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { executeRequests, calculateStatistics, runChecks, RequestConfig, RunOptions } from '@apibench/core';
import { outputResults, OutputData } from './output';
import chalk from 'chalk';

const program = new Command();

program
  .name('apibench')
  .description('A tool to check the speed and resilience of your API endpoints')
  .version('1.0.0');

program
  .command('run')
  .description('Run API endpoint tests')
  .requiredOption('--url <url>', 'API endpoint URL')
  .option('--method <method>', 'HTTP method (GET, POST, PUT, etc.)', 'GET')
  .option('--iterations <number>', 'Number of iterations', '10')
  .option('--parallel', 'Run requests in parallel', false)
  .option('--headersPath <path>', 'Path to JSON file with headers')
  .option('--dataPath <path>', 'Path to JSON file with request data')
  .option(
    '--outputFormat <format>',
    'Output format (table, json, yaml, csv)',
    'table'
  )
  .option('--outputFile', 'Write output to file', false)
  .option('--table <format>', 'Table format (full, compact)', 'full')
  .option('--no-chart', 'Disable ASCII chart visualization')
  .option('--checks <checks...>', 'Checks to run (e.g., mean=200,median=200)')
  .action(async (options: RunOptions & { chart?: boolean }) => {
    try {
      const config: RequestConfig = {
        url: options.url,
        method: options.method?.toUpperCase() || 'GET',
      };

      // Load headers if provided
      if (options.headersPath) {
        const headersPath = path.resolve(options.headersPath);
        if (!fs.existsSync(headersPath)) {
          console.error(chalk.red(`Error: Headers file not found: ${headersPath}`));
          process.exit(1);
        }
        config.headers = JSON.parse(fs.readFileSync(headersPath, 'utf-8'));
      }

      // Load data if provided
      if (options.dataPath) {
        const dataPath = path.resolve(options.dataPath);
        if (!fs.existsSync(dataPath)) {
          console.error(chalk.red(`Error: Data file not found: ${dataPath}`));
          process.exit(1);
        }
        config.data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      }

      const iterations = parseInt(String(options.iterations || '10'), 10);
      if (isNaN(iterations) || iterations < 1) {
        console.error(chalk.red('Error: Iterations must be a positive number'));
        process.exit(1);
      }

      console.log(chalk.blue(`\n🚀 Running ${iterations} ${options.parallel ? 'parallel' : 'sequential'} requests to ${options.url}...\n`));

      const results = await executeRequests(
        config,
        iterations,
        options.parallel
      );

      const statistics = calculateStatistics(results);

      let checks;
      if (options.checks && options.checks.length > 0) {
        checks = runChecks(statistics, options.checks);
      }

      const outputData: OutputData = {
        results,
        statistics,
        checks,
      };

      const outputFormat = (options.outputFormat || 'table') as
        | 'table'
        | 'json'
        | 'yaml'
        | 'csv';
      const tableFormat = (options.table || 'full') as 'full' | 'compact';
      // Commander.js sets chart to false when --no-chart is used, undefined otherwise
      const showChart = (options as any).chart !== false;

      const output = await outputResults(
        outputData,
        outputFormat,
        tableFormat,
        options.outputFile,
        showChart
      );

      console.log(output);

      // Exit with error code if checks failed
      if (checks && checks.some((c) => !c.passed)) {
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

program.parse();

