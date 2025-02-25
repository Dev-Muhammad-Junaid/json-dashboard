# JSON Dashboard

A modern, interactive JSON data processing application built with Next.js that makes it easy to explore and transform JSON data using JSONPath-Plus expressions.

## Features

- **JSON Visualization**: Interactive tree view and formatted preview panels
- **JSONPath Filtering**: Filter JSON data using JSONPath-Plus expressions
- **Query Suggestions**: Smart suggestions based on your data structure
- **Test Suite**: Built-in filter tester to validate JSONPath expressions
- **Export Functionality**: Export filtered results as JSON files

## Technology Stack

- Next.js 15.1.7 with Turbopack
- React 18
- TypeScript
- Tailwind CSS
- JSONPath-Plus for advanced JSON querying

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/json-dashboard.git
cd json-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000/json](http://localhost:3000/json) in your browser to see the application

## Usage

1. **Upload JSON Data**: Upload a JSON file or use the sample data
2. **Query Data**: Enter JSONPath expressions or use the suggested filters
3. **Preview Results**: See the filtered results in the JSON Preview panel
4. **Export Results**: Export the filtered data for further processing

## JSONPath-Plus Features

This application leverages [JSONPath-Plus](https://jsonpath-plus.github.io/JSONPath/docs/ts/) to provide advanced JSON querying capabilities:

- Recursive descent with `$..`
- Property name access with `~` operator
- Type selectors: `@string()`, `@number()`, etc.
- Parent selectors with `^`
- Root references with `@root`
- And many more advanced filtering options

## License

MIT License
