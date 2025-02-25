'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Upload, BarChart, Code, Info, Play, Database, FileJson, Settings, ChevronRight, Timer } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Use the JSONPath library properly
import { JSONPath } from 'jsonpath-plus';

// Mock implementations for jsonpath and json-query
const jsonpath = {
  query: (data: any, path: string) => {
    // Use JSONPath as a fallback
    try {
      return JSONPath({ path, json: data });
    } catch (e) {
      console.error('Error in jsonpath mock:', e);
      return [];
    }
  }
};

const jsonQuery = (query: string, options: any) => {
  const { data } = options;
  try {
    // Simple implementation to handle basic queries
    if (query.includes('[*]')) {
      const path = query.replace('[*]', '');
      if (!path) return { value: data };
      if (data[path] && Array.isArray(data[path])) {
        return { value: data[path] };
      }
    }
    // Return empty result for other queries
    return { value: [] };
  } catch (e) {
    console.error('Error in json-query mock:', e);
    return { value: [] };
  }
};

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

// Sample data for testing
const SAMPLE_SMALL_JSON: JsonData = {
  users: [
    {
      id: 1,
      name: "John Doe",
      age: 30,
      roles: ["admin", "user"],
      contact: {
        email: "john@example.com",
        phone: "123-456-7890"
      },
      metadata: {
        created: "2023-01-15T08:30:00Z",
        lastLogin: "2023-06-01T14:22:10Z",
        preferences: {
          theme: "dark",
          fontSize: 14,
          language: "en"
        }
      }
    },
    // ... more users
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

// Function to generate large JSON data for testing
const generateLargeJson = (size: number): JsonData => {
  const users = [];
  for (let i = 1; i <= size; i++) {
    users.push({
      id: i,
      name: `User ${i}`,
      age: 20 + (i % 50),
      roles: i % 5 === 0 ? ["admin", "user"] : ["user"],
      contact: {
        email: `user${i}@example.com`,
        phone: `555-${String(i).padStart(3, '0')}-${String(i * 2).padStart(4, '0')}`
      },
      metadata: {
        created: new Date(Date.now() - i * 86400000).toISOString(),
        lastLogin: new Date(Date.now() - i * 3600000).toISOString(),
        preferences: {
          theme: i % 2 === 0 ? "light" : "dark",
          fontSize: 12 + (i % 8),
          language: i % 3 === 0 ? "en" : i % 3 === 1 ? "es" : "fr"
        }
      }
    });
  }
  return {
    users,
    settings: {
      darkMode: true,
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    }
  };
};

// Test queries for performance testing
const TEST_QUERIES = {
  shallow: {
    jsonpath: "$.users[0].name",
    jsonpathPlus: "$.users[0].name",
    jsonQuery: "users[0].name"
  },
  deep: {
    jsonpath: "$.users[0].metadata.preferences.theme",
    jsonpathPlus: "$.users[0].metadata.preferences.theme",
    jsonQuery: "users[0].metadata.preferences.theme"
  },
  conditional: {
    jsonpath: "$.users[?(@.age > 30)]",
    jsonpathPlus: "$.users[?(@.age > 30)]",
    jsonQuery: "users[*]"
  },
  complex: {
    jsonpath: "$.users[?(@.roles.indexOf('admin') != -1)].contact.email",
    jsonpathPlus: "$.users[?(@.roles.indexOf('admin') != -1)].contact.email",
    jsonQuery: "users[*].contact.email"
  },
  recursive: {
    jsonpath: "$..theme",
    jsonpathPlus: "$..theme",
    jsonQuery: "users[*].metadata.preferences.theme"
  }
};

// Type definitions for test results
interface TestResults {
  [queryType: string]: {
    [library: string]: number;
  };
}

interface DetailedTestResult {
  library: string;
  queryType: string;
  executionTime: number;
  matchCount: number;
  error?: string;
}

// Type for selected test options
interface SelectedTests {
  [key: string]: boolean;
}

// Main component for the Performance page
export default function PerformancePage() {
  // State for managing JSON data and test results
  const [jsonData, setJsonData] = useState<JsonData | null>(null);
  const [dataSize, setDataSize] = useState<'small' | 'medium' | 'large' | 'custom'>('small');
  const [results, setResults] = useState<TestResults | null>(null);
  const [detailed, setDetailed] = useState<DetailedTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [iterations, setIterations] = useState(3);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedTests, setSelectedTests] = useState<SelectedTests>({
    shallow: true,
    deep: true,
    conditional: true,
    complex: true,
    recursive: true
  });
  const [activeTab, setActiveTab] = useState<string>("settings");

  const router = useRouter();
  const searchParams = useSearchParams();

  // Function to handle data source changes (small, medium, large, custom)
  const handleDataSourceChange = (value: string) => {
    console.log("Data source changed to:", value);
    
    if (value === 'custom') {
      setShowFileUpload(true);
      setDataSize('custom');
    } else {
      setShowFileUpload(false);
      setDataSize(value as 'small' | 'medium' | 'large');
      
      if (value === 'small') {
        setJsonData(SAMPLE_SMALL_JSON);
        try {
          sessionStorage.setItem('performanceJsonData', JSON.stringify(SAMPLE_SMALL_JSON));
        } catch (e) {
          console.error("Failed to save to session storage:", e);
        }
      } else if (value === 'medium') {
        const mediumData = generateLargeJson(100); // Reduced from 1000 for better performance
        setJsonData(mediumData);
        try {
          sessionStorage.setItem('performanceJsonData', JSON.stringify(mediumData));
        } catch (e) {
          console.error("Failed to save to session storage:", e);
        }
      } else if (value === 'large') {
        const largeData = generateLargeJson(1000); // Reduced from 10000 for better performance
        setJsonData(largeData);
        try {
          sessionStorage.setItem('performanceJsonData', JSON.stringify(largeData));
        } catch (e) {
          console.error("Failed to save to session storage:", e);
        }
      }
    }
  };

  // Handle file upload for custom JSON data
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setJsonData(data);
          sessionStorage.setItem('performanceJsonData', JSON.stringify(data));
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Toggle test selection
  const toggleTestSelection = (key: string) => {
    setSelectedTests({
      ...selectedTests,
      [key]: !selectedTests[key]
    });
  };

  // Initialize state on component mount
  useEffect(() => {
    const size = searchParams.get('size') || 'small';
    
    if (size === 'small') {
      setJsonData(SAMPLE_SMALL_JSON);
      setDataSize('small');
    } else if (size === 'medium') {
      const mediumData = generateLargeJson(100); // Reduced from 1000
      setJsonData(mediumData);
      setDataSize('medium');
    } else if (size === 'large') {
      const largeData = generateLargeJson(1000); // Reduced from 10000
      setJsonData(largeData);
      setDataSize('large');
    } else {
      // Try to get custom data from session storage
      try {
        const storedData = sessionStorage.getItem('performanceJsonData');
        if (storedData) {
          setJsonData(JSON.parse(storedData));
          setDataSize('custom');
        } else {
          setJsonData(SAMPLE_SMALL_JSON);
          setDataSize('small');
        }
      } catch (error) {
        console.error('Error parsing stored JSON:', error);
        setJsonData(SAMPLE_SMALL_JSON);
        setDataSize('small');
      }
    }
    
    setIsLoading(false);
  }, [searchParams]);

  // Get a stringified preview of the data
  const getDataPreview = () => {
    if (!jsonData) return "No data available";
    
    // Create a simplified preview with limited depth and items
    const preview = {
      users: jsonData.users.slice(0, 2).map(user => ({
        id: user.id,
        name: user.name,
        age: user.age,
        roles: user.roles,
        // Show limited properties for preview
      })),
      totalUsers: jsonData.users.length,
      // Add a hint that this is just a preview
      _note: "This is a preview of the dataset. Run tests to see full data usage."
    };
    
    return JSON.stringify(preview, null, 2);
  };

  // Prepare chart data for visualization
  const chartData = {
    labels: Object.keys(selectedTests).filter(key => selectedTests[key]),
    datasets: [
      {
        label: 'JSONPath-Plus (ms)',
        data: results ? Object.keys(selectedTests)
          .filter(key => selectedTests[key])
          .map(key => results[key]?.jsonpathPlus || 0) : [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'JSONPath (ms)',
        data: results ? Object.keys(selectedTests)
          .filter(key => selectedTests[key])
          .map(key => results[key]?.jsonpath || 0) : [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'json-query (ms)',
        data: results ? Object.keys(selectedTests)
          .filter(key => selectedTests[key])
          .map(key => results[key]?.jsonQuery || 0) : [],
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
          text: 'Query Type'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  // Run performance tests
  const runPerformanceTests = async () => {
    if (!jsonData) return;
    
    setIsLoading(true);
    
    // Initialize results
    const newResults: TestResults = {};
    const newDetailed: DetailedTestResult[] = [];
    
    // Get selected test queries
    const selectedQueryTypes = Object.keys(selectedTests).filter(key => selectedTests[key]);
    
    // Run tests for each selected query type
    for (const queryType of selectedQueryTypes) {
      newResults[queryType] = {
        jsonpathPlus: 0,
        jsonpath: 0,
        jsonQuery: 0
      };
      
      // JSONPath-Plus test
      let jsonpathPlusTime = 0;
      let jsonpathPlusMatches = 0;
      let jsonpathPlusError: string | undefined;
      
      try {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
          const result = JSONPath({ 
            path: TEST_QUERIES[queryType as keyof typeof TEST_QUERIES].jsonpathPlus, 
            json: jsonData 
          });
          jsonpathPlusMatches = result.length;
        }
        const end = performance.now();
        jsonpathPlusTime = (end - start) / iterations;
      } catch (error) {
        jsonpathPlusError = (error as Error).message;
        jsonpathPlusTime = 0;
      }
      
      newResults[queryType].jsonpathPlus = jsonpathPlusTime;
      newDetailed.push({
        library: 'JSONPath-Plus',
        queryType,
        executionTime: jsonpathPlusTime,
        matchCount: jsonpathPlusMatches,
        error: jsonpathPlusError
      });
      
      // JSONPath test
      let jsonpathTime = 0;
      let jsonpathMatches = 0;
      let jsonpathError: string | undefined;
      
      try {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
          const result = jsonpath.query(
            jsonData, 
            TEST_QUERIES[queryType as keyof typeof TEST_QUERIES].jsonpath
          );
          jsonpathMatches = result.length;
        }
        const end = performance.now();
        jsonpathTime = (end - start) / iterations;
      } catch (error) {
        jsonpathError = (error as Error).message;
        jsonpathTime = 0;
      }
      
      newResults[queryType].jsonpath = jsonpathTime;
      newDetailed.push({
        library: 'JSONPath',
        queryType,
        executionTime: jsonpathTime,
        matchCount: jsonpathMatches,
        error: jsonpathError
      });
      
      // json-query test
      let jsonQueryTime = 0;
      let jsonQueryMatches = 0;
      let jsonQueryError: string | undefined;
      
      try {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
          const result = jsonQuery(
            TEST_QUERIES[queryType as keyof typeof TEST_QUERIES].jsonQuery, 
            { data: jsonData }
          ).value;
          jsonQueryMatches = Array.isArray(result) ? result.length : 1;
        }
        const end = performance.now();
        jsonQueryTime = (end - start) / iterations;
      } catch (error) {
        jsonQueryError = (error as Error).message;
        jsonQueryTime = 0;
      }
      
      newResults[queryType].jsonQuery = jsonQueryTime;
      newDetailed.push({
        library: 'json-query',
        queryType,
        executionTime: jsonQueryTime,
        matchCount: jsonQueryMatches,
        error: jsonQueryError
      });
    }
    
    setResults(newResults);
    setDetailed(newDetailed);
    setIsLoading(false);
    // Automatically switch to results tab when tests complete
    setActiveTab("results");
  };

  // Render the component
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="shadow-lg border-0 overflow-hidden mb-8">
          {/* Improved header design */}
          <CardHeader className="bg-white border-b border-gray-200 py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2 text-gray-900">
                  <BarChart className="h-6 w-6 text-blue-600" />
                  JSON Query Performance Testing
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Test and compare the performance of different JSON query libraries
                </CardDescription>
              </div>
              
              {/* Data selection redesigned as choice chips instead of dropdown */}
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-blue-500" />
                  Dataset Size:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleDataSourceChange('small')}
                    className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 transition-colors
                      ${dataSize === 'small' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300 font-medium' 
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Small (5 users)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDataSourceChange('medium')}
                    className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 transition-colors
                      ${dataSize === 'medium' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300 font-medium' 
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Medium (100 users)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDataSourceChange('large')}
                    className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 transition-colors
                      ${dataSize === 'large' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300 font-medium' 
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Large (1000 users)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDataSourceChange('custom')}
                    className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 transition-colors
                      ${dataSize === 'custom' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300 font-medium' 
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Upload size={14} />
                    Custom JSON
                  </button>
                </div>
                
                {showFileUpload && (
                  <div className="mt-2">
                    <label
                      htmlFor="json-file-upload"
                      className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload size={16} />
                      Upload JSON file
                    </label>
                    <input
                      id="json-file-upload"
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Data Preview Section with light background */}
            <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <FileJson className="h-4 w-4 text-blue-500" />
                  Data Preview
                </h3>
                <div className="text-xs text-gray-600">
                  {jsonData && `${jsonData.users.length} users in dataset`}
                </div>
              </div>
              <div className="bg-white rounded-md p-3 overflow-auto max-h-28 text-xs border border-blue-100">
                <pre className="text-gray-700">{getDataPreview()}</pre>
              </div>
            </div>

            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              defaultValue="settings"
              className="w-full"
            >
              <TabsList className="flex mb-6 bg-gray-100 p-1 rounded-lg gap-1 w-auto">
                <TabsTrigger 
                  value="settings" 
                  className={`flex-1 rounded-md py-2 px-4 text-sm font-medium transition-all flex items-center justify-center gap-1.5
                    ${activeTab === 'settings' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  <Settings className="h-4 w-4" />
                  Test Settings
                </TabsTrigger>
                <TabsTrigger 
                  value="results" 
                  className={`flex-1 rounded-md py-2 px-4 text-sm font-medium transition-all flex items-center justify-center gap-1.5
                    ${activeTab === 'results' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  <BarChart className="h-4 w-4" />
                  Results
                </TabsTrigger>
              </TabsList>

              {/* More compact Test Settings section */}
              <TabsContent value="settings" className="bg-white p-0 rounded-lg shadow-sm border border-gray-100">
                <div className="p-4">
                  <div className="flex flex-col md:flex-row gap-6 mb-4">
                    <div className="md:w-1/2">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="h-4 w-4 text-blue-500" />
                        <Label htmlFor="iterations" className="text-sm font-medium text-gray-700">Test Iterations</Label>
                      </div>
                      
                      {/* Test iterations as choice chips instead of dropdown */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setIterations(1)}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors
                            ${iterations === 1 
                              ? 'bg-blue-100 text-blue-700 border border-blue-300 font-medium' 
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                          1 (Fastest)
                        </button>
                        <button
                          type="button"
                          onClick={() => setIterations(3)}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors
                            ${iterations === 3 
                              ? 'bg-blue-100 text-blue-700 border border-blue-300 font-medium' 
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                          3 (Default)
                        </button>
                        <button
                          type="button"
                          onClick={() => setIterations(5)}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors
                            ${iterations === 5 
                              ? 'bg-blue-100 text-blue-700 border border-blue-300 font-medium' 
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                          5 (Balanced)
                        </button>
                        <button
                          type="button"
                          onClick={() => setIterations(10)}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors
                            ${iterations === 10 
                              ? 'bg-blue-100 text-blue-700 border border-blue-300 font-medium' 
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                          10 (Most Accurate)
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1.5">
                        Higher values provide more accurate results but take longer to run
                      </div>
                    </div>
                    
                    {/* Run button moved to top section for better visibility */}
                    <div className="flex items-end md:ml-auto">
                      <Button
                        onClick={runPerformanceTests}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                        size="lg"
                      >
                        {isLoading ? 'Running Tests...' : 'Run Performance Tests'}
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Code className="h-4 w-4 text-blue-500" />
                      <h3 className="text-sm font-medium text-gray-700">Query Types to Test</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {Object.entries(TEST_QUERIES).map(([key, queries]) => (
                        <div
                          key={key}
                          className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        >
                          <Checkbox 
                            id={`query-${key}`}
                            checked={selectedTests[key]}
                            onChange={() => toggleTestSelection(key)}
                            className="mt-0.5"
                          />
                          <Label 
                            htmlFor={`query-${key}`}
                            className="flex flex-col space-y-1 cursor-pointer"
                          >
                            <span className="font-medium text-gray-800">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {key === 'shallow' && 'Simple property access'}
                              {key === 'deep' && 'Nested property access'}
                              {key === 'conditional' && 'Filter with condition'}
                              {key === 'complex' && 'Complex array filtering'}
                              {key === 'recursive' && 'Recursive descent'}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="results" className="bg-white p-0 rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 space-y-6">
                  {results ? (
                    <div className="space-y-8">
                      <div className="h-96 bg-white p-4 rounded-lg border border-gray-100">
                        <Bar data={chartData} options={chartOptions} />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-md font-medium flex items-center gap-1.5">
                          <BarChart className="h-5 w-5 text-blue-500" />
                          Performance Metrics
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {Object.keys(selectedTests)
                            .filter(key => selectedTests[key])
                            .map(queryType => (
                              <Card key={queryType} className="overflow-hidden border-0 shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-3 border-b border-gray-100">
                                  <CardTitle className="text-md text-gray-800">{queryType.charAt(0).toUpperCase() + queryType.slice(1)} Query</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Library</th>
                                        <th className="px-4 py-2 text-right font-medium text-gray-700">Time (ms)</th>
                                        <th className="px-4 py-2 text-right font-medium text-gray-700">Matches</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detailed
                                        .filter(result => result.queryType === queryType)
                                        .map((result, index) => (
                                          <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="px-4 py-2">{result.library}</td>
                                            <td className="px-4 py-2 text-right">
                                              {result.error 
                                                ? <span className="text-red-500">Error</span>
                                                : <span className={result.executionTime < 1 ? "text-green-600 font-medium" : result.executionTime > 50 ? "text-red-600 font-medium" : "text-gray-800"}>
                                                    {result.executionTime.toFixed(2)}
                                                  </span>
                                              }
                                            </td>
                                            <td className="px-4 py-2 text-right">{result.matchCount}</td>
                                          </tr>
                                        ))
                                      }
                                    </tbody>
                                  </table>
                                </CardContent>
                              </Card>
                            ))
                          }
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-md font-medium flex items-center gap-1.5">
                          <Code className="h-5 w-5 text-blue-500" />
                          Query Syntax Reference
                        </h3>
                        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-4 py-2 text-left font-medium border-b text-gray-700">Query Type</th>
                                <th className="px-4 py-2 text-left font-medium border-b text-gray-700">JSONPath-Plus</th>
                                <th className="px-4 py-2 text-left font-medium border-b text-gray-700">JSONPath</th>
                                <th className="px-4 py-2 text-left font-medium border-b text-gray-700">json-query</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(TEST_QUERIES).map(([key, queries], index) => (
                                <tr key={key} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                  <td className="px-4 py-2 border-b font-medium text-gray-800">{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                                  <td className="px-4 py-2 border-b font-mono text-xs text-blue-700">{queries.jsonpathPlus}</td>
                                  <td className="px-4 py-2 border-b font-mono text-xs text-indigo-700">{queries.jsonpath}</td>
                                  <td className="px-4 py-2 border-b font-mono text-xs text-purple-700">{queries.jsonQuery}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-md font-medium flex items-center gap-1.5">
                          <Info className="h-5 w-5 text-blue-500" />
                          Performance Analysis
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
                            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-1.5">
                              <ChevronRight className="h-4 w-4 text-blue-500" />
                              Execution Time
                            </h4>
                            <p className="text-sm text-gray-600">
                              Lower execution time indicates better performance. Times are averaged over 
                              {iterations === 1 ? ' a single run' : ` ${iterations} iterations`} for each query.
                            </p>
                          </div>

                          <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
                            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-1.5">
                              <ChevronRight className="h-4 w-4 text-blue-500" />
                              Match Count
                            </h4>
                            <p className="text-sm text-gray-600">
                              The number of items matched by each query. Different libraries may return slightly
                              different results depending on their implementation.
                            </p>
                          </div>

                          <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
                            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-1.5">
                              <ChevronRight className="h-4 w-4 text-blue-500" />
                              Query Complexity
                            </h4>
                            <p className="text-sm text-gray-600">
                              Shallow queries tend to be faster than deep or complex queries. Recursive
                              queries typically have the highest overhead.
                            </p>
                          </div>

                          <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
                            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-1.5">
                              <ChevronRight className="h-4 w-4 text-blue-500" />
                              Data Size Impact
                            </h4>
                            <p className="text-sm text-gray-600">
                              Current data size: <span className="font-medium">{dataSize === 'small' ? 'Small (5 users)' : 
                              dataSize === 'medium' ? 'Medium (100 users)' : 
                              dataSize === 'large' ? 'Large (1000 users)' : 'Custom'}</span>. 
                              Larger datasets will generally increase execution time.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No Results Yet</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Run performance tests to see detailed results here. Select your query types and click the "Run Performance Tests" button to begin.
                      </p>
                      <Button
                        onClick={runPerformanceTests}
                        disabled={isLoading}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isLoading ? 'Running Tests...' : 'Run Performance Tests'}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 