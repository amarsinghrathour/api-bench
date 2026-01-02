# ApiBench CLI

A powerful CLI tool to test API endpoint performance with parallel or sequential requests.

## Installation

```bash
npm install -g apibench
```

Or use with npx:

```bash
npx apibench run --url "https://api.github.com/zen"
```

## Quick Start

```bash
apibench run --url "https://api.github.com/zen" --iterations 30
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

### Basic Usage

```bash
apibench run --url "https://api.github.com/zen" --iterations 30
```

### Parallel Requests

```bash
apibench run --url "https://api.github.com/zen" --iterations 30 --parallel
```

### Display Summary Table with ASCII Chart

```bash
apibench run --url "https://api.github.com/zen" --iterations 30 --table "full"
```

### Custom Method and Headers

```bash
apibench run \
  --url "https://api.github.com/zen" \
  --method POST \
  --headersPath "headers.json" \
  --dataPath "data.json"
```

### Output to File

```bash
apibench run \
  --url "https://api.github.com/zen" \
  --iterations 20 \
  --outputFormat json \
  --outputFile
```

### Run Checks Against Results

```bash
apibench run \
  --url "https://api.github.com/zen" \
  --iterations 50 \
  --checks mean=200 median=200 stdDev=50 pctOfSuccess=95
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

## License

MIT

