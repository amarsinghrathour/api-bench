import { RequestConfig, RequestResult } from './types';
import fetch from 'node-fetch';
import { RequestInit } from 'node-fetch';

export async function executeRequest(
  config: RequestConfig,
  iteration: number
): Promise<RequestResult> {
  const startTime = Date.now();
  const timestamp = startTime;

  try {
    const fetchOptions: RequestInit = {
      method: config.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    };

    if (config.data && (config.method === 'POST' || config.method === 'PUT' || config.method === 'PATCH')) {
      fetchOptions.body = typeof config.data === 'string' 
        ? config.data 
        : JSON.stringify(config.data);
    }

    const response = await fetch(config.url, fetchOptions);
    const responseTime = Date.now() - startTime;

    return {
      iteration,
      statusCode: response.status,
      responseTime,
      success: response.ok,
      timestamp,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      iteration,
      responseTime,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    };
  }
}

export async function executeRequests(
  config: RequestConfig,
  iterations: number,
  parallel: boolean = false
): Promise<RequestResult[]> {
  if (parallel) {
    const promises = Array.from({ length: iterations }, (_, i) =>
      executeRequest(config, i + 1)
    );
    return Promise.all(promises);
  } else {
    const results: RequestResult[] = [];
    for (let i = 0; i < iterations; i++) {
      const result = await executeRequest(config, i + 1);
      results.push(result);
    }
    return results;
  }
}

