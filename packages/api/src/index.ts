import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  executeRequests,
  calculateStatistics,
  runChecks,
  RequestConfig,
  RunOptions,
} from '@apibench/core';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

interface RunRequest {
  url: string;
  method?: string;
  iterations?: number;
  parallel?: boolean;
  headers?: Record<string, string>;
  data?: any;
  checks?: string[];
}

app.post('/api/run', async (req: Request, res: Response) => {
  try {
    const body: RunRequest = req.body;

    if (!body.url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const config: RequestConfig = {
      url: body.url,
      method: body.method?.toUpperCase() || 'GET',
      headers: body.headers,
      data: body.data,
    };

    const iterations = body.iterations || 10;
    const parallel = body.parallel || false;

    const results = await executeRequests(config, iterations, parallel);
    const statistics = calculateStatistics(results);

    let checks;
    if (body.checks && body.checks.length > 0) {
      checks = runChecks(statistics, body.checks);
    }

    res.json({
      results,
      statistics,
      checks,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 ApiBench API server running on port ${PORT}`);
});

