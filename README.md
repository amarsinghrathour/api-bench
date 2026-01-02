# ApiBench

A tool to check the speed and resilience of your API endpoints against multiple parallel or sequence requests.

[![npm version](https://img.shields.io/npm/v/apibench.svg)](https://www.npmjs.com/package/apibench)
[![npm downloads](https://img.shields.io/npm/dm/apibench.svg)](https://www.npmjs.com/package/apibench)

## Installation

```bash
npm install -g apibench
```

Or use with npx:

```bash
npx apibench run --url "https://api.github.com/zen"
```

## Quick Start

After installation, use the CLI:

```bash
apibench run --url "https://api.github.com/zen" --iterations 10
```

## Features

- ✅ Test API endpoints with multiple iterations
- ✅ Run requests in parallel or sequence
- ✅ Display results in various formats (table, JSON, YAML, CSV)
- ✅ **ASCII chart visualization** for response time distribution
- ✅ Support custom headers, request methods, and data
- ✅ Calculate statistics (mean, median, percentiles, standard deviation)
- ✅ Run checks against results
- ✅ Output to files

## Usage Examples

> **Note:** These examples assume you've installed `apibench` globally (`npm install -g apibench`) or are using `npx apibench`.

### Basic Usage

```bash
apibench run --url "https://api.github.com/zen" --iterations 30
```

### Parallel Requests

```bash
apibench run --url "https://api.github.com/zen" --iterations 30 --parallel
```

### Display Summary Table with ASCII Chart

The ASCII chart is shown by default when using table output format. It visualizes the distribution of response times with color coding:
- 🟢 Green: Response times up to the 50th percentile (median)
- 🟡 Yellow: Response times between 50th and 95th percentile
- 🔴 Red: Response times above the 95th percentile

```bash
apibench run \
  --url "https://api.github.com/zen" \
  --iterations 30 \
  --table "full"
```

To disable the chart:

```bash
apibench run \
  --url "https://api.github.com/zen" \
  --iterations 30 \
  --table "full" \
  --no-chart
```

### Compact Table

```bash
apibench run \
  --url "https://api.github.com/zen" \
  --iterations 30 \
  --table "compact"
```

### Custom Method and Headers

```bash
apibench run \
  --url "https://api.github.com/zen" \
  --method POST \
  --headersPath "examples/headers.json" \
  --dataPath "examples/data.json"
```

### Output to File (JSON)

```bash
apibench run \
  --url "https://api.github.com/zen" \
  --iterations 20 \
  --outputFormat json \
  --outputFile
```

### Output to File (YAML)

```bash
apibench run \
  --url "https://api.github.com/zen" \
  --iterations 20 \
  --outputFormat yaml \
  --outputFile
```

### Output to CSV

```bash
apibench run \
  --url "https://api.github.com/zen" \
  --iterations 20 \
  --outputFormat csv \
  --outputFile
```

### Run Checks Against Results

```bash
apibench run \
  --url "https://api.github.com/zen" \
  --iterations 50 \
  --checks mean=200 median=200 stdDev=50 q5=150 q50=200 q95=250 q99=300 pctOfSuccess=95
```

### Kitchen Sink Example

```bash
apibench run \
  --url "https://api.github.com/zen" \
  --method GET \
  --iterations 50 \
  --parallel \
  --checks mean=200 median=200 stdDev=50 q5=150 q50=200 q95=250 q99=300 pctOfSuccess=95 \
  --headersPath "examples/headers.json" \
  --dataPath "examples/data.json" \
  --outputFile \
  --outputFormat yaml \
  --table "compact"
```

## Available Options

- `--url <url>` - API endpoint URL (required)
- `--method <method>` - HTTP method (GET, POST, PUT, etc.) - default: GET
- `--iterations <number>` - Number of iterations - default: 10
- `--parallel` - Run requests in parallel instead of sequentially
- `--headersPath <path>` - Path to JSON file with request headers
- `--dataPath <path>` - Path to JSON file with request data
- `--outputFormat <format>` - Output format (table, json, yaml, csv) - default: table
- `--outputFile` - Write output to file
- `--table <format>` - Table format (full, compact) - default: full
- `--no-chart` - Disable ASCII chart visualization (chart shown by default)
- `--checks <checks...>` - Checks to run (e.g., mean=200,median=200,pctOfSuccess=95)

## Statistics Calculated

- Total requests
- Successful/Failed requests
- Success percentage
- Mean response time
- Median response time
- Min/Max response times
- Standard deviation
- Percentiles (5th, 50th, 95th, 99th)

## Project Structure

```
apibench/
├── packages/
│   ├── core/                   # Shared core utilities and types
│   │   ├── src/
│   │   │   ├── types.ts        # Shared TypeScript types
│   │   │   ├── request.ts      # HTTP request execution
│   │   │   ├── statistics.ts   # Statistics calculation
│   │   │   ├── checks.ts       # Result validation
│   │   │   └── index.ts        # Package exports
│   │   └── package.json
│   ├── cli/                    # CLI package
│   │   ├── src/
│   │   │   ├── cli.ts          # CLI entry point
│   │   │   ├── output.ts       # Output formatting
│   │   │   └── index.ts        # Package exports
│   │   └── package.json
│   ├── api/                    # API server package
│   │   ├── src/
│   │   │   └── index.ts        # Express API server
│   │   └── package.json
│   └── web/                    # Web application (Next.js)
│       ├── src/
│       │   ├── pages/          # Next.js pages
│       │   └── styles/         # CSS styles
│       └── package.json
├── examples/
│   ├── headers.json            # Example headers file
│   └── data.json               # Example data file
└── README.md
```

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/amarsinghrathour/api-bench.git
cd api-bench

# Install dependencies
npm install

# Build all packages
npm run build

# Link CLI for local development
cd packages/cli
npm link
apibench run --url "https://api.github.com/zen"
```

### Running the Web UI

**Development mode (recommended for development):**
```bash
cd packages/web
npm run dev
```
Open **http://localhost:3000** in your browser.

**Production mode (after build):**
```bash
cd packages/web
npm run build  # Build the Next.js app
npm start      # Start the production server
```
Open **http://localhost:3000** in your browser.

**Note:** The web application provides a user-friendly interface where you can:
- Enter API endpoint URLs
- Configure HTTP methods (GET, POST, PUT, etc.)
- Set number of iterations
- Toggle between parallel and sequential requests
- View detailed statistics and response time distribution
- See results in a table format
- Configure custom headers and request body

### Running the API Server

```bash
cd packages/api
npm run dev
```
The API server will run on **http://localhost:3000** (or the port specified in the PORT environment variable).

**Note:** If running both the web app and API server simultaneously, you'll need to configure different ports.

## Packages

### Published on npm

- **apibench** - CLI tool (install with `npm install -g apibench`)
- **@amarsinghrathour/core** - Core utilities package

### Development Packages

- **@amarsinghrathour/api** - REST API server for running tests programmatically
- **@amarsinghrathour/web** - Next.js web application with a user-friendly interface

**Web UI Usage:**
- Development: `cd packages/web && npm run dev` → http://localhost:3000
- Production: `cd packages/web && npm run build && npm start` → http://localhost:3000

**Web UI Features:**
- Interactive form to configure API tests
- Real-time statistics display
- Response time visualization
- Results table with detailed information
- Support for custom headers and request body

## Links

- **npm Package**: https://www.npmjs.com/package/apibench
- **GitHub Repository**: https://github.com/amarsinghrathour/api-bench
- **Core Package**: https://www.npmjs.com/package/@amarsinghrathour/core

## License

MIT

