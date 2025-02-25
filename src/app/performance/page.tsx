'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import FileUpload from '../../../components/FileUpload';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '../../../components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion';
import { Button } from '../../../components/ui/button';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Import querying libraries
import JSONPath from 'jsonpath-plus';
// @ts-ignore
import jsonpath from 'jsonpath';
// @ts-ignore
import jsonQuery from 'json-query';

// Create type definitions
interface JsonData {
  users: Array<{
    id: number;
    name: string;
    age: number;
    roles: string[];
    contact: {
      email: string;
      phone: string;
    };
    metadata?: {
      created: string;
      lastLogin: string;
      preferences: {
        theme: string;
        fontSize: number;
        language: string;
      };
    };
  }>;
  settings?: {
    darkMode: boolean;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

// Sample JSON data
const SAMPLE_SMALL_JSON: JsonData = {
  users: [
    { id: 1, name: 'Alice', age: 25, roles: ['admin', 'user'], contact: { email: 'alice@example.com', phone: '123-456-7890' } },
    { id: 2, name: 'Bob', age: 30, roles: ['user'], contact: { email: 'bob@example.com', phone: '123-456-7891' } },
    { id: 3, name: 'Charlie', age: 35, roles: ['moderator', 'user'], contact: { email: 'charlie@example.com', phone: '123-456-7892' } },
    { id: 4, name: 'Diana', age: 28, roles: ['user'], contact: { email: 'diana@example.com', phone: '123-456-7893' } },
    { id: 5, name: 'Evan', age: 40, roles: ['admin', 'moderator'], contact: { email: 'evan@example.com', phone: '123-456-7894' } }
  ],
  settings: {
    darkMode: true,
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  }
};

// Function to generate larger JSON data for testing
const generateLargeJson = (size: number): JsonData => {
  const result: JsonData = { users: [] };
  
  for (let i = 0; i < size; i++) {
    result.users.push({
      id: i + 1,
      name: `User ${i + 1}`,
      age: 20 + (i % 50),
      roles: i % 5 === 0 ? ['admin', 'user'] : ['user'],
      contact: {
        email: `user${i + 1}@example.com`,
        phone: `123-456-${7890 + i}`
      },
      metadata: {
        created: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferences: {
          theme: i % 2 === 0 ? 'light' : 'dark',
          fontSize: i % 3 + 14,
          language: i % 4 === 0 ? 'en' : i % 4 === 1 ? 'fr' : i % 4 === 2 ? 'es' : 'de'
        }
      }
    });
  }
  
  return result;
};

// Test queries
const TEST_QUERIES = {
  shallow: {
    description: 'Get all users',
    jsonpathPlus: '$.users[*]',
    jsonpath: '$.users[*]',
    jsonQuery: 'users[*]',
  },
  deep: {
    description: 'Get all user emails',
    jsonpathPlus: '$.users[*].contact.email',
    jsonpath: '$.users[*].contact.email',
    jsonQuery: 'users[*].contact.email',
  },
  conditional: {
    description: 'Get all admin users',
    jsonpathPlus: '$.users[?(@.roles.indexOf("admin") !== -1)]',
    jsonpath: '$.users[?(@.roles.indexOf("admin") !== -1)]',
    jsonQuery: 'users[*:has(roles[*=admin])]',
  },
  complex: {
    description: 'Get users with dark theme preferences',
    jsonpathPlus: '$.users[?(@.metadata && @.metadata.preferences.theme === "dark")]',
    jsonpath: '$.users[?(@.metadata && @.metadata.preferences.theme === "dark")]',
    jsonQuery: 'users[*:is(metadata.preferences.theme=dark)]',
  },
  recursiveDescent: {
    description: 'Find all emails anywhere in the structure',
    jsonpathPlus: '$..email',
    jsonpath: '$..email',
    jsonQuery: '*..email',
  }
};

interface TestResults {
  [queryType: string]: {
    [library: string]: number;
  };
}

const PerformancePage = () => {
  const [jsonData, setJsonData] = useState<JsonData>(SAMPLE_SMALL_JSON);
  const [dataSize, setDataSize] = useState<'small' | 'medium' | 'large' | 'custom'>('small');
  const [testResults, setTestResults] = useState<TestResults>({});
  const [isLoading, setIsLoading] = useState(false);
  const [iterations, setIterations] = useState<number>(3);
  const [selectedTests, setSelectedTests] = useState<{[key: string]: boolean}>({
    shallow: true,
    deep: true,
    conditional: true,
    complex: true,
    recursiveDescent: true
  });

  // Convert results to Chart.js format
  const chartData = {
    labels: Object.keys(testResults).length > 0 
      ? Object.keys(testResults[Object.keys(testResults)[0]] || {}) 
      : [],
    datasets: Object.keys(testResults).map((queryType, index) => ({
      label: queryType,
      data: Object.values(testResults[queryType] || {}),
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(75, 192, 192, 0.6)',
      ][index % 3],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(75, 192, 192, 1)',
      ][index % 3],
      borderWidth: 1,
    })),
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Execution Time (ms)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Library'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'JSON Query Performance Comparison'
      },
    },
  };

  // Replace onFileUpload with a new version that works with the File object
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (e.target?.result) {
          const data = JSON.parse(e.target.result as string);
          setJsonData(data as JsonData);
          setDataSize('custom');
        }
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Invalid JSON file. Please upload a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Handle data size change
  const handleDataSizeChange = (size: 'small' | 'medium' | 'large') => {
    setDataSize(size);
    
    switch (size) {
      case 'small':
        setJsonData(SAMPLE_SMALL_JSON);
        break;
      case 'medium':
        setJsonData(generateLargeJson(1000));
        break;
      case 'large':
        setJsonData(generateLargeJson(10000));
        break;
    }
  };

  // Run performance tests
  const runPerformanceTests = async () => {
    setIsLoading(true);
    const results: TestResults = {};

    // Add small delay to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Run tests for each selected query type
    for (const [queryType, queries] of Object.entries(TEST_QUERIES)) {
      // Skip tests that aren't selected
      if (!selectedTests[queryType]) continue;
      
      results[queryType] = {};
      
      // Run multiple iterations for more accurate results
      const iterationResults: {[lib: string]: number[]} = {
        'JSONPath-Plus': [],
        'JSONPath': [],
        'json-query': []
      };
      
      for (let i = 0; i < iterations; i++) {
        // JSONPath-Plus
        const jsonpathPlusStart = performance.now();
        try {
          JSONPath.JSONPath({ path: queries.jsonpathPlus, json: jsonData });
          iterationResults['JSONPath-Plus'].push(performance.now() - jsonpathPlusStart);
        } catch (error) {
          console.error(`Error with JSONPath-Plus (${queryType}):`, error);
          iterationResults['JSONPath-Plus'].push(-1); // Error indicator
        }
        
        // JSONPath
        const jsonpathStart = performance.now();
        try {
          jsonpath.query(jsonData, queries.jsonpath);
          iterationResults['JSONPath'].push(performance.now() - jsonpathStart);
        } catch (error) {
          console.error(`Error with JSONPath (${queryType}):`, error);
          iterationResults['JSONPath'].push(-1); // Error indicator
        }
        
        // json-query
        const jsonQueryStart = performance.now();
        try {
          jsonQuery(queries.jsonQuery, { data: jsonData });
          iterationResults['json-query'].push(performance.now() - jsonQueryStart);
        } catch (error) {
          console.error(`Error with json-query (${queryType}):`, error);
          iterationResults['json-query'].push(-1); // Error indicator
        }
      }
      
      // Calculate average times
      for (const lib of Object.keys(iterationResults)) {
        const times = iterationResults[lib].filter(t => t !== -1);
        if (times.length > 0) {
          results[queryType][lib] = times.reduce((a, b) => a + b, 0) / times.length;
        } else {
          results[queryType][lib] = -1;
        }
      }
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <DashboardLayout activePath="/performance">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          JSON Query Performance Testing
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Data Source</CardTitle>
              <CardDescription>Select or upload JSON data for testing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium">Predefined Data Size:</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant={dataSize === 'small' ? 'default' : 'outline'} 
                      onClick={() => handleDataSizeChange('small')}
                    >
                      Small
                    </Button>
                    <Button 
                      variant={dataSize === 'medium' ? 'default' : 'outline'} 
                      onClick={() => handleDataSizeChange('medium')}
                    >
                      Medium
                    </Button>
                    <Button 
                      variant={dataSize === 'large' ? 'default' : 'outline'} 
                      onClick={() => handleDataSizeChange('large')}
                    >
                      Large
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium">Or Upload Your Own:</span>
                  <FileUpload 
                    onFileUpload={handleFileUpload}
                    acceptedFileTypes={{ 'application/json': ['.json'] }}
                    title="Upload JSON File"
                    description="Drag & drop your JSON file here, or click to browse"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Configure which tests to run and how</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Select Query Types</h3>
                  <div className="space-y-2">
                    {Object.entries(TEST_QUERIES).map(([key, query]) => (
                      <div key={key} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`query-${key}`} 
                          checked={selectedTests[key]} 
                          onChange={() => setSelectedTests(prev => ({...prev, [key]: !prev[key]}))}
                          className="mr-2"
                        />
                        <label htmlFor={`query-${key}`} className="text-sm">
                          {key.charAt(0).toUpperCase() + key.slice(1)}: {query.description}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Test Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="iterations" className="block text-sm mb-1">
                        Number of iterations (for more accurate results):
                      </label>
                      <select 
                        id="iterations" 
                        value={iterations} 
                        onChange={(e) => setIterations(Number(e.target.value))}
                        className="w-full p-2 border rounded"
                      >
                        <option value="1">1 (Fastest)</option>
                        <option value="3">3 (Default)</option>
                        <option value="5">5 (More Accurate)</option>
                        <option value="10">10 (Most Accurate)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2">Query Syntax</h3>
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(TEST_QUERIES).map(([key, query]) => (
                    <AccordionItem key={key} value={key}>
                      <AccordionTrigger className="text-md font-medium">
                        {key.charAt(0).toUpperCase() + key.slice(1)}: {query.description}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-semibold">JSONPath-Plus:</span> <code className="bg-gray-100 px-1 py-0.5 rounded">{query.jsonpathPlus}</code>
                          </div>
                          <div>
                            <span className="font-semibold">JSONPath:</span> <code className="bg-gray-100 px-1 py-0.5 rounded">{query.jsonpath}</code>
                          </div>
                          <div>
                            <span className="font-semibold">json-query:</span> <code className="bg-gray-100 px-1 py-0.5 rounded">{query.jsonQuery}</code>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <Button 
            onClick={runPerformanceTests} 
            disabled={isLoading}
            className="w-full py-6 text-lg"
          >
            {isLoading ? `Running Tests... ${Object.values(selectedTests).filter(Boolean).length * iterations} operations` : 'Run Performance Tests'}
          </Button>
        </div>
        
        {Object.keys(testResults).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Performance comparison across different libraries (lower is better)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar data={chartData} options={chartOptions} />
              </div>
              
              <div className="mt-8 overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Query Type</th>
                      {Object.keys(testResults[Object.keys(testResults)[0]] || {}).map(lib => (
                        <th key={lib} className="py-2 px-4 border-b text-left">{lib}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(testResults).map(([queryType, results]) => (
                      <tr key={queryType}>
                        <td className="py-2 px-4 border-b font-medium">
                          {queryType.charAt(0).toUpperCase() + queryType.slice(1)}
                        </td>
                        {Object.entries(results).map(([lib, time]) => (
                          <td key={lib} className="py-2 px-4 border-b">
                            {time === -1 ? 
                              <span className="text-red-500">Error</span> : 
                              `${time.toFixed(2)} ms`
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PerformancePage; 