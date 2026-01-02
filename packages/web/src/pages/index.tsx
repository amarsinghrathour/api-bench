import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

interface RequestResult {
  iteration: number;
  statusCode?: number;
  responseTime: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

interface Statistics {
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
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [iterations, setIterations] = useState(10);
  const [parallel, setParallel] = useState(false);
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RequestResult[] | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  const calculateStats = (results: RequestResult[]): Statistics => {
    const successful = results.filter((r) => r.success);
    const responseTimes = successful.map((r) => r.responseTime).sort((a, b) => a - b);
    const total = results.length;
    const pctOfSuccess = total > 0 ? (successful.length / total) * 100 : 0;

    if (responseTimes.length === 0) {
      return {
        total,
        successful: 0,
        failed: results.filter((r) => !r.success).length,
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
      };
    }

    const mean = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const median = responseTimes[Math.floor(responseTimes.length / 2)];
    const min = responseTimes[0];
    const max = responseTimes[responseTimes.length - 1];

    const variance =
      responseTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) /
      responseTimes.length;
    const stdDev = Math.sqrt(variance);

    const getPercentile = (arr: number[], p: number) => {
      const index = Math.ceil((p / 100) * arr.length) - 1;
      return arr[Math.max(0, index)];
    };

    return {
      total,
      successful: successful.length,
      failed: results.filter((r) => !r.success).length,
      pctOfSuccess: Math.round(pctOfSuccess * 100) / 100,
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      min,
      max,
      stdDev: Math.round(stdDev * 100) / 100,
      q5: getPercentile(responseTimes, 5),
      q50: median,
      q95: getPercentile(responseTimes, 95),
      q99: getPercentile(responseTimes, 99),
    };
  };

  const handleRun = async () => {
    if (!url) {
      alert('Please enter a URL');
      return;
    }

    // Parse headers
    let parsedHeaders: Record<string, string> = {};
    try {
      parsedHeaders = JSON.parse(headers || '{}');
    } catch (e) {
      alert('Invalid JSON in headers field');
      return;
    }

    // Parse body
    let parsedBody: any = null;
    if (body.trim()) {
      try {
        parsedBody = JSON.parse(body);
      } catch (e) {
        alert('Invalid JSON in body field');
        return;
      }
    }

    // Only add Content-Type if we have a body and it's not already set
    const requestHeaders: Record<string, string> = { ...parsedHeaders };
    if (parsedBody && !requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    setLoading(true);
    setResults(null);
    setStatistics(null);

    try {
      const requestResults: RequestResult[] = [];

      const makeRequest = async (iteration: number): Promise<RequestResult> => {
        const startTime = Date.now();
        try {
          const fetchOptions: RequestInit = {
            method,
            headers: requestHeaders,
          };

          if (parsedBody && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            fetchOptions.body = JSON.stringify(parsedBody);
          }

          const response = await fetch(url, fetchOptions);
          const responseTime = Date.now() - startTime;
          return {
            iteration,
            statusCode: response.status,
            responseTime,
            success: response.ok,
            timestamp: startTime,
          };
        } catch (error) {
          const responseTime = Date.now() - startTime;
          return {
            iteration,
            responseTime,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: startTime,
          };
        }
      };

      if (parallel) {
        const promises = Array.from({ length: iterations }, (_, i) =>
          makeRequest(i + 1)
        );
        const parallelResults = await Promise.all(promises);
        requestResults.push(...parallelResults);
      } else {
        for (let i = 0; i < iterations; i++) {
          const result = await makeRequest(i + 1);
          requestResults.push(result);
        }
      }

      setResults(requestResults);
      setStatistics(calculateStats(requestResults));
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>ApiBench - API Performance Testing</title>
        <meta name="description" content="Test your API endpoint performance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>ApiBench</h1>
        <p className={styles.description}>
          Test the speed and resilience of your API endpoints
        </p>

        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="url">URL</label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.github.com/zen"
              disabled={loading}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="method">Method</label>
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                disabled={loading}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="iterations">Iterations</label>
              <input
                id="iterations"
                type="number"
                value={iterations}
                onChange={(e) => setIterations(parseInt(e.target.value) || 10)}
                min="1"
                max="1000"
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={parallel}
                onChange={(e) => setParallel(e.target.checked)}
                disabled={loading}
              />
              Run requests in parallel
            </label>
          </div>

          <div className={styles.formGroup}>
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={loading}
            >
              {showAdvanced ? '▼' : '▶'} Advanced Options
            </button>
          </div>

          {showAdvanced && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="headers">Headers (JSON)</label>
                <textarea
                  id="headers"
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder='{"Authorization": "Bearer token", "User-Agent": "MyApp"}'
                  rows={4}
                  disabled={loading}
                  className={styles.textarea}
                />
                <small className={styles.helpText}>
                  Enter headers as JSON object. Example: {"{"}"Authorization": "Bearer token"{"}"}
                </small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="body">Request Body (JSON)</label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={6}
                  disabled={loading}
                  className={styles.textarea}
                />
                <small className={styles.helpText}>
                  Enter request body as JSON. Only used for POST, PUT, PATCH requests.
                </small>
              </div>
            </>
          )}

          <button
            className={styles.button}
            onClick={handleRun}
            disabled={loading || !url}
          >
            {loading ? 'Running...' : 'Run Tests'}
          </button>
        </div>

        {statistics && (
          <div className={styles.results}>
            <h2>Statistics</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Requests</div>
                <div className={styles.statValue}>{statistics.total}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Successful</div>
                <div className={styles.statValue}>{statistics.successful}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Failed</div>
                <div className={styles.statValue}>{statistics.failed}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Success Rate</div>
                <div className={styles.statValue}>
                  {statistics.pctOfSuccess.toFixed(2)}%
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Mean (ms)</div>
                <div className={styles.statValue}>{statistics.mean.toFixed(2)}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Median (ms)</div>
                <div className={styles.statValue}>{statistics.median.toFixed(2)}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Min (ms)</div>
                <div className={styles.statValue}>{statistics.min}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Max (ms)</div>
                <div className={styles.statValue}>{statistics.max}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Std Dev (ms)</div>
                <div className={styles.statValue}>{statistics.stdDev.toFixed(2)}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>95th Percentile (ms)</div>
                <div className={styles.statValue}>{statistics.q95}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>99th Percentile (ms)</div>
                <div className={styles.statValue}>{statistics.q99}</div>
              </div>
            </div>
          </div>
        )}

        {results && results.length > 0 && (
          <div className={styles.results}>
            <h2>Results</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Iteration</th>
                    <th>Status</th>
                    <th>Response Time (ms)</th>
                    <th>Success</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.iteration}>
                      <td>{result.iteration}</td>
                      <td>{result.statusCode || 'N/A'}</td>
                      <td>{result.responseTime}</td>
                      <td>
                        {result.success ? (
                          <span className={styles.success}>✓</span>
                        ) : (
                          <span className={styles.error}>✗</span>
                        )}
                      </td>
                      <td className={styles.errorCell}>
                        {result.error ? (
                          <span className={styles.error} title={result.error}>
                            {result.error.length > 50 
                              ? result.error.substring(0, 50) + '...' 
                              : result.error}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

