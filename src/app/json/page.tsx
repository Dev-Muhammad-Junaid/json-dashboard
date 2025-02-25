'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import FileUpload from '../../../components/FileUpload';
import JsonViewer from '../../../components/JsonViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Download, Search, Tag, ArrowRightLeft } from 'lucide-react';
import { JSONPathJS } from 'jsonpath-js';

// Memoized content components to prevent unnecessary re-renders
const JsonTreePanel = React.memo(({ data }: { data: any }) => (
  <div className="p-4 h-full">
    <h3 className="text-lg font-medium mb-2">JSON Tree</h3>
    <div className="border-b pb-2 mb-3"></div>
    <div className="overflow-auto h-[calc(100%-40px)]">
      <div className="bg-blue-50/30 border border-blue-100/50 rounded-lg">
        <div className="enhanced-json-tree [&_.text-green-600]:text-emerald-600 [&_.text-blue-600]:text-blue-600 [&_.text-purple-600]:text-indigo-600 [&_.bg-gray-50]:bg-blue-50/30 [&_.border]:border-blue-100">
          <JsonViewer 
            data={data} 
            expandDepth={2} 
          />
        </div>
      </div>
    </div>
  </div>
));
JsonTreePanel.displayName = 'JsonTreePanel';

const JsonPreviewPanel = React.memo(({ data, currentQuery }: { data: any, currentQuery?: string }) => {
  // Calculate match count
  const matchCount = data ? (Array.isArray(data) ? data.length : 1) : 0;
  
  return (
    <div className="p-4 h-full">
      <h3 className="text-lg font-medium mb-2">JSON Preview</h3>
      <div className="border-b pb-2 mb-3"></div>
      {currentQuery && (
        <div className="mb-3 bg-blue-50/70 rounded-lg p-2 text-xs border border-blue-100 flex justify-between items-center">
          <div>
            <span className="font-medium text-blue-700">Current Filter: </span>
            <code className="font-mono text-blue-800 bg-blue-100/70 px-1 rounded">{currentQuery}</code>
          </div>
          <div className="text-blue-700 font-medium px-2 py-0.5 bg-blue-100/70 rounded">
            {matchCount === 0 
              ? "No matches" 
              : `${matchCount} ${matchCount === 1 ? 'match' : 'matches'} found`}
          </div>
        </div>
      )}
      <div className="bg-blue-50/30 rounded-lg p-4 h-[calc(100%-60px)] overflow-auto border border-blue-100/50">
        <pre className="text-xs font-mono text-blue-900">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
});
JsonPreviewPanel.displayName = 'JsonPreviewPanel';

// Filter Test Runner component
const FilterTester = React.memo(({ data }: { data: any }) => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedTests, setExpandedTests] = useState<Record<string, boolean>>({});

  // Toggle expanded state for a test
  const toggleExpanded = (testId: string) => {
    setExpandedTests(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  // Create a test case
  const createTest = (name: string, expression: string, category: string, expectedCount: number) => ({
    id: `${category}-${name}-${expression}`,
    name,
    expression,
    category,
    expectedCount
  });

  // Run all filter tests
  const runAllTests = useCallback(() => {
    if (!data) return;
    setIsRunning(true);
    setTestResults([]);

    // Generate test cases based on the sample data
    const generateTestCases = () => {
      const testCases = [
        // Basic selectors
        createTest('Root selector', '$', 'Basic', 1),
        createTest('All properties', '$..*', 'Advanced', 40), // Approx count based on sample
        
        // Property selectors
        createTest('All property names', '$..~', 'Advanced', 25), // Approx count
        
        // Numeric filters
        createTest('Id > 0', '$..[?(@.id > 0)]', 'Numeric', 1),
        createTest('Id = 1', '$..[?(@.id === 1)]', 'Numeric', 1),
        
        // Text filters
        createTest('Name equals', '$..[?(@.name === "Calcium Chloride")]', 'Text', 1),
        createTest('Name contains', '$..[?(@.name && @.name.indexOf("Calcium") > -1)]', 'Text', 1),
        createTest('Name starts with', '$..[?(@.name && @.name.indexOf("Calcium") === 0)]', 'Text', 1),
        createTest('Name ends with', '$..[?(@.name && @.name.slice(-8) === "Chloride")]', 'Text', 1),
        createTest('Name regex', '$..[?(@.name && @.name.match(/Calcium/i))]', 'Text', 1),

        // Using alternative syntax (JSONPath filter expressions)
        createTest('Alt: Name equals', '$..[?(@.name == "Calcium Chloride")]', 'Text-Alt', 1),
        createTest('Alt: Contains', '$..sources[?(@.label =~ /.*Calcium.*/i)]', 'Text-Alt', 2),
        
        // Null/existence filters
        createTest('legal_limit is null', '$..[?(@.legal_limit === null)]', 'Existence', 1),
        createTest('Has name property', '$..[?(@.name)]', 'Existence', 1),
        
        // Array filters
        createTest('All sources', '$..sources[*]', 'Array', 3),
        createTest('First source', '$..sources[0]', 'Array', 1),
        
        // Complex filters
        createTest('Deep property search', '$..url', 'Complex', 3),
        createTest('Recursive descent', '$..[*]', 'Complex', 35), // Approx count
        
        // Advanced JSONPath-Plus extensions
        createTest('Type selector (string)', '$..[?(@string())]', 'Advanced', 15), // Approx count
        createTest('Type selector (number)', '$..[?(@number())]', 'Advanced', 1),
        createTest('Type selector (null)', '$..[?(@null())]', 'Advanced', 7), // Approx count
        createTest('Parent selector', '$..sources[0]^', 'Advanced', 1),
        createTest('Property filter', '$..*[?(@property === "name")]', 'Advanced', 1)
      ];
      
      return testCases;
    };

    const testCases = generateTestCases();
    
    // Run tests sequentially with a small delay to avoid UI freezing
    let currentIndex = 0;
    
    const runNextTest = () => {
      if (currentIndex >= testCases.length) {
        setIsRunning(false);
        return;
      }
      
      const test = testCases[currentIndex];
      currentIndex++;
      
      try {
        const query = new JSONPathJS(test.expression);
        const startTime = performance.now();
        const result = query.find(data);
        const endTime = performance.now();
        
        const actualCount = Array.isArray(result) ? result.length : (result === null ? 0 : 1);
        const success = actualCount === test.expectedCount || 
                        (test.expectedCount === -1 && actualCount > 0);
        
        setTestResults(prev => [...prev, {
          ...test,
          success,
          actualCount,
          result: result,
          error: null,
          executionTime: (endTime - startTime).toFixed(2)
        }]);
      } catch (err: any) {
        setTestResults(prev => [...prev, {
          ...test,
          success: false,
          actualCount: 0,
          result: null,
          error: err.message,
          executionTime: 0
        }]);
      }
      
      // Schedule next test with a small delay
      setTimeout(runNextTest, 10);
    };
    
    // Start running tests
    runNextTest();
  }, [data]);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">JSONPath Filter Test Results</h3>
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? 'Running Tests...' : 'Run Filter Tests'}
        </Button>
      </div>
      
      {testResults.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filter Name</th>
                <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expression</th>
                <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected/Actual</th>
                <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time (ms)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testResults.map((test) => (
                <React.Fragment key={test.id}>
                  <tr 
                    className={`hover:bg-gray-50 cursor-pointer ${test.success ? '' : 'bg-red-50'}`}
                    onClick={() => toggleExpanded(test.id)}
                  >
                    <td className="p-2">
                      {test.success 
                        ? <span className="text-green-600">✓</span> 
                        : <span className="text-red-600">✕</span>}
                    </td>
                    <td className="p-2 text-xs">{test.category}</td>
                    <td className="p-2 font-medium">{test.name}</td>
                    <td className="p-2 font-mono text-xs">{test.expression}</td>
                    <td className="p-2">
                      {test.expectedCount === -1 ? '>' : test.expectedCount}/{test.actualCount}
                    </td>
                    <td className="p-2 text-xs">{test.executionTime}</td>
                  </tr>
                  {expandedTests[test.id] && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="p-2">
                        <div className="text-sm">
                          {test.error ? (
                            <div className="text-red-600 font-mono text-xs p-2 bg-red-50 rounded">
                              Error: {test.error}
                            </div>
                          ) : (
                            <div className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
                              <pre className="text-xs font-mono">
                                {JSON.stringify(test.result, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {testResults.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg text-sm">
          <h4 className="font-medium text-blue-800 mb-1">Test Summary</h4>
          <p>
            {testResults.filter(t => t.success).length} of {testResults.length} tests passed
            ({Math.round((testResults.filter(t => t.success).length / testResults.length) * 100)}%)
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-blue-700">Click on any test row to view the detailed results.</p>
            {testResults.filter(t => !t.success).length > 0 && (
              <p className="text-xs text-red-600 font-medium">
                Failed filters are highlighted in red.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
FilterTester.displayName = 'FilterTester';

// Types for query suggestions
type SuggestionType = 'value' | 'comparison' | 'array' | 'text' | 'existence' | 'complex' | 'advanced';

interface QuerySuggestion {
  type: SuggestionType;
  label: string;
  path: string;
  description: string;
  category: string;
}

// New component for displaying tooltips
const Tooltip = React.memo(({ text }: { text: string }) => (
  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64 z-10">
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
    {text}
  </div>
));
Tooltip.displayName = 'Tooltip';

// Enhanced button component with tooltip
const QueryButton = React.memo(({ suggestion, onClick }: { 
  suggestion: QuerySuggestion, 
  onClick: (path: string) => void 
}) => (
  <button
    onClick={() => onClick(suggestion.path)}
    className="relative px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200 flex items-center gap-1 transition-colors group"
  >
    {suggestion.type === 'comparison' && <ArrowRightLeft size={10} className="text-blue-500" />}
    {suggestion.type === 'value' && <Tag size={10} className="text-green-500" />}
    {suggestion.type === 'text' && <Search size={10} className="text-purple-500" />}
    {suggestion.type === 'advanced' && <span className="text-amber-500 font-bold">⚡</span>}
    <span className="max-w-[150px] truncate">{suggestion.label}</span>
    <Tooltip text={suggestion.description} />
  </button>
));
QueryButton.displayName = 'QueryButton';

// Helper function to escape strings for JSONPath
const escapeStringForJSONPath = (str: string) => {
  return str.replace(/"/g, '\\"');
};

// Helper function to escape regex special characters
const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default function JsonPage() {
  const [jsonData, setJsonData] = useState<any>(null);
  const [jsonPath, setJsonPath] = useState<string>('$');
  const [filteredData, setFilteredData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<QuerySuggestion[]>([]);
  const [sampleData, setSampleData] = useState<any>(null);
  
  // Cache for efficient JSONPath queries
  const queryCache = useMemo(() => new Map<string, JSONPathJS>(), []);
  
  // Function to get or create a JSONPath query
  const getQuery = useCallback((path: string): JSONPathJS | null => {
    if (!queryCache.has(path)) {
      try {
        queryCache.set(path, new JSONPathJS(path));
      } catch (err) {
        console.error(`Failed to create query for path: ${path}`, err);
        return null;
      }
    }
    return queryCache.get(path) || null;
  }, [queryCache]);
  
  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const parsedData = JSON.parse(result);
        setJsonData(parsedData);
        setFilteredData(parsedData);
        
        // Generate query suggestions based on the data
        generateQuerySuggestions(parsedData);
        setError(null);
      } catch (err) {
        setError('Invalid JSON file. Please check the file format.');
        console.error('Error parsing JSON:', err);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
  }, []);
  
  // Generate query suggestions based on the JSON data
  const generateQuerySuggestions = useCallback((data: any) => {
    const suggestions: QuerySuggestion[] = [];
    
    // Basic suggestions
    suggestions.push({
      type: 'value',
      label: 'Get Root',
      path: '$',
      description: 'Get the entire JSON document',
      category: 'Basic'
    });
    
    // Add advanced selectors from JSONPath-Plus
    suggestions.push({
      type: 'advanced',
      label: 'All Properties',
      path: '$..*',
      description: 'Get all properties at any level (recursive descent)',
      category: 'Advanced'
    });
    
    suggestions.push({
      type: 'advanced',
      label: 'All Property Names',
      path: '$..~',
      description: 'Get all property names at any level as an array (uses JSONPath-Plus extension)',
      category: 'Advanced'
    });
    
    // Function to analyze JSON and extract field paths with types
    const analyzeJson = (obj: any, currentPath = '$', isArray = false) => {
      if (!obj || typeof obj !== 'object') return;
      
      // Handle arrays
      if (Array.isArray(obj)) {
        if (obj.length > 0) {
          // Array with items
          suggestions.push({
            type: 'array',
            label: `${currentPath}[*]`,
            path: `${currentPath}[*]`,
            description: `Get all items in the array (${obj.length} items)`,
            category: 'Arrays'
          });
          
          // Add parent selector (JSONPath-Plus extension)
          suggestions.push({
            type: 'advanced',
            label: `${currentPath}[*]^`,
            path: `${currentPath}[*]^`,
            description: 'Get parent of array items (uses JSONPath-Plus extension)',
            category: 'Advanced'
          });
          
          // Process first item to understand array structure
          if (typeof obj[0] === 'object' && obj[0] !== null) {
            analyzeJson(obj[0], `${currentPath}[0]`, false);
          }
        }
        return;
      }
      
      // Handle objects
      Object.entries(obj).forEach(([key, value]) => {
        const fieldPath = currentPath === '$' ? `$.${key}` : `${currentPath}.${key}`;
        
        // Add simple path suggestion
        suggestions.push({
          type: 'value',
          label: fieldPath,
          path: fieldPath,
          description: `Get value of ${key}`,
          category: 'Fields'
        });
        
        // Type-specific suggestions
        if (typeof value === 'number') {
          // Numeric field suggestions
          suggestions.push({
            type: 'comparison',
            label: `${key} > value`,
            path: `$..[?(@.${key} > 0)]`,
            description: `Find objects where ${key} is greater than a value`,
            category: 'Numeric'
          });
          
          suggestions.push({
            type: 'comparison',
            label: `${key} < value`,
            path: `$..[?(@.${key} < 100)]`,
            description: `Find objects where ${key} is less than a value`,
            category: 'Numeric'
          });
          
          // Advanced numeric filters
          suggestions.push({
            type: 'advanced',
            label: `${key} type check`,
            path: `$..[?(@.${key} && @number())]`,
            description: 'Find objects with numeric fields using type selector (JSONPath-Plus extension)',
            category: 'Advanced'
          });
        } 
        else if (typeof value === 'string') {
          // Check if it looks like a date
          if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
            suggestions.push({
              type: 'comparison',
              label: `${key} date comparison`,
              path: `$..[?(@.${key} > "2023-01-01")]`,
              description: `Find objects where ${key} date is after a specific date`,
              category: 'Dates'
            });
          } else {
            // Regular string suggestions
            suggestions.push({
              type: 'text',
              label: `${key} equals`,
              path: `$..[?(@.${key} === "${escapeStringForJSONPath(value.substring(0, 15))}"${value.length > 15 ? '...' : ''})]`,
              description: `Find objects where ${key} equals a specific value`,
              category: 'Text'
            });
            
            suggestions.push({
              type: 'text',
              label: `${key} contains`,
              path: `$..[?(@.${key} && @.${key}.indexOf("${escapeStringForJSONPath(value.substring(0, 10))}") > -1)]`,
              description: `Find objects where ${key} contains specific text`,
              category: 'Text'
            });
            
            suggestions.push({
              type: 'text',
              label: `${key} starts with`,
              path: `$..[?(@.${key} && @.${key}.indexOf("${escapeStringForJSONPath(value.substring(0, 10))}") === 0)]`,
              description: `Find objects where ${key} starts with specific text`,
              category: 'Text'
            });

            suggestions.push({
              type: 'text',
              label: `${key} ends with`,
              path: `$..[?(@.${key} && @.${key}.slice(-${Math.min(value.length, 10)}) === "${escapeStringForJSONPath(value.substring(Math.max(0, value.length - 10)))}")]`,
              description: `Find objects where ${key} ends with specific text`,
              category: 'Text'
            });
            
            // Advanced regex (JSONPath-Plus extension)
            suggestions.push({
              type: 'advanced',
              label: `${key} regex`,
              path: `$..[?(@.${key} && @.${key}.match(/${escapeRegExp(value.substring(0, 5))}/i))]`,
              description: 'Find objects where field matches regex pattern (case insensitive)',
              category: 'Advanced'
            });
          }
        }
        else if (value === null) {
          // Null value suggestions
          suggestions.push({
            type: 'existence',
            label: `${key} is null`,
            path: `$..[?(@.${key} === null)]`,
            description: `Find objects where ${key} is null`,
            category: 'Existence'
          });
          
          suggestions.push({
            type: 'existence',
            label: `${key} exists`,
            path: `$..[?(@.${key} !== null)]`,
            description: `Find objects where ${key} is not null`,
            category: 'Existence'
          });
          
          // JSONPath-Plus null type selector
          suggestions.push({
            type: 'advanced',
            label: `${key} null check`,
            path: `$..[?(@.${key} === null || @null())]`,
            description: 'Find objects with null values using type selector (JSONPath-Plus extension)',
            category: 'Advanced'
          });
        }
        else if (typeof value === 'boolean') {
          // Boolean suggestions
          suggestions.push({
            type: 'existence',
            label: `${key} is ${value}`,
            path: `$..[?(@.${key} === ${value})]`,
            description: `Find objects where ${key} is ${value}`,
            category: 'Boolean'
          });
        }
        else if (typeof value === 'object' && value !== null) {
          // For nested objects, add a suggestion to get property names
          suggestions.push({
            type: 'advanced',
            label: `${key} property names`,
            path: `${fieldPath}~`,
            description: 'Get all property names of this object as an array (uses JSONPath-Plus extension)',
            category: 'Advanced'
          });
          
          // Recurse into nested objects
          analyzeJson(value, fieldPath, Array.isArray(value));
        }
      });
    };
    
    analyzeJson(data);
    
    // Add complex suggestions
    if (suggestions.length > 5) {
      suggestions.push({
        type: 'complex',
        label: 'Deep Search',
        path: '$..name',
        description: 'Find all name properties at any level',
        category: 'Complex'
      });
      
      suggestions.push({
        type: 'complex',
        label: 'Recursive Descent',
        path: '$..[*]',
        description: 'Get all values in the document',
        category: 'Complex'
      });
      
      // Add comparison with root reference (JSONPath-Plus extension)
      suggestions.push({
        type: 'advanced',
        label: 'Compare with Root',
        path: '$..[?(@.id === @root[0].id)]',
        description: 'Find objects where id equals the id of the first item in the root array (uses @root reference)',
        category: 'Advanced'
      });
      
      // Add object filter
      suggestions.push({
        type: 'advanced',
        label: 'Object Type Only',
        path: '$..[?(@object())]',
        description: 'Find all non-array objects (uses JSONPath-Plus type selector)',
        category: 'Advanced'
      });
    }
    
    // Add more advanced suggestions from JSONPath-Plus documentation
    suggestions.push({
      type: 'advanced',
      label: 'Type Selectors',
      path: `$..[?(@number())]`,
      description: 'Find all numeric values using type selector (@number(), @string(), @boolean(), etc.)',
      category: 'Advanced'
    });

    suggestions.push({
      type: 'advanced',
      label: 'Parent Selector',
      path: `$..[?(@.price > 10)]^`,
      description: 'Get parent objects of items with price > 10 (using the ^ parent operator)',
      category: 'Advanced'
    });

    suggestions.push({
      type: 'advanced',
      label: 'Property Names',
      path: `$..*~`,
      description: 'Get all property names at any level (using ~ operator)',
      category: 'Advanced'
    });

    suggestions.push({
      type: 'advanced',
      label: 'Root Reference',
      path: `$..[?(@.id === @root[0].id)]`,
      description: 'Compare with root object using @root reference',
      category: 'Advanced'
    });

    suggestions.push({
      type: 'advanced',
      label: 'Property Filter',
      path: `$..*[?(@property === "name")]`,
      description: 'Get all values where the property name equals "name"',
      category: 'Advanced'
    });

    suggestions.push({
      type: 'advanced',
      label: 'Parent Property',
      path: `$..*[?(@parentProperty === "items")]`,
      description: 'Get all objects whose parent property is named "items"',
      category: 'Advanced'
    });
    
    // Deduplicate suggestions by path
    const uniqueSuggestions = Array.from(
      new Map(suggestions.map(item => [item.path, item])).values()
    );
    
    setSuggestions(uniqueSuggestions);
  }, []);
  
  // Load sample data if requested
  const loadSampleData = useCallback(() => {
    const sampleJson = [
      {
        "id": 1,
        "name": "Calcium Chloride",
        "description": "Calcium chloride (CaCl2), commonly found in water, dissociates into calcium and chloride ions when consumed. These ions are independently regulated in the body and contribute to various physiological functions. It's essential to understand the impact of calcium chloride on human health in the context of drinking water consumption",
        "legal_limit": null,
        "health_guideline": null,
        "sources": [
          {
            "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9827598/",
            "label": "PubMed: Calcium Chloride in Drinking Water"
          },
          {
            "url": "https://www.ewg.org/guides/substances/895-CALCIUMCHLORIDE/",
            "label": "EWG: Calcium Chloride"
          },
          {
            "url": "https://www.industrialchemicals.gov.au/sites/default/files/Calcium%20chloride%20%28CaCl2%29_Human%20health%20tier%20II%20assessment.pdf",
            "label": "Calcium Chloride Human Health Assessment"
          }
        ],
        "updated_at": "2023-11-25T21:48:47.600535+00:00",
        "measure": null,
        "risks": "Gastrointestinal irritation, severe eye and skin irritation, and slight respiratory irritation in certain conditions.",
        "benefits": "Bone and teeth formation, helps with blood coagulation, neuromuscular activity, enzyme activity, and acid-base balance and maintains osmotic and acid-base balance in the body.",
        "is_contaminant": null,
        "image": "https://inruqrymqosbfeygykdx.supabase.co/storage/v1/object/public/website/ingredients/1/calcium-chloride.webp",
        "severity_score": null,
        "is_common": null,
        "category": "Minerals",
        "bonus_score": null
      }
    ];
    
    setJsonData(sampleJson);
    setFilteredData(sampleJson);
    generateQuerySuggestions(sampleJson);
    setSampleData(sampleJson);
    setError(null);
  }, [generateQuerySuggestions]);
  
  // Real-time JSONPath search handler
  useEffect(() => {
    if (jsonData && jsonPath) {
      const handler = setTimeout(() => {
        try {
          const query = getQuery(jsonPath);
          if (query) {
            const result = query.find(jsonData);
            setFilteredData(result);
            setError(null);
          }
        } catch (err) {
          setError('Invalid JSONPath expression. Please check the syntax.');
          console.error('Error applying JSONPath:', err);
        }
      }, 300); // Debounce JSONPath queries
      
      return () => clearTimeout(handler);
    }
  }, [jsonData, jsonPath, getQuery]);
  
  const applySuggestion = useCallback((path: string) => {
    setJsonPath(path);
  }, []);
  
  const exportJson = useCallback((data: any) => {
    if (!data) return;
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);
  
  // Group suggestions by category
  const groupedSuggestions = useMemo(() => {
    const groups: { [key: string]: QuerySuggestion[] } = {};
    
    suggestions.forEach(suggestion => {
      if (!groups[suggestion.category]) {
        groups[suggestion.category] = [];
      }
      groups[suggestion.category].push(suggestion);
    });
    
    return groups;
  }, [suggestions]);
  
  // Memoize the query suggestions UI to avoid re-renders
  const querySuggestionsUI = useMemo(() => (
    <div className="max-h-[300px] overflow-y-auto pr-1 border rounded-lg p-3 mb-2 text-xs">
      <div className="space-y-3">
        {Object.entries(groupedSuggestions).map(([category, categoryItems]) => (
          <div key={category} className="space-y-1.5">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">{category}</h4>
            <div className="flex flex-wrap gap-1.5">
              {categoryItems.slice(0, 6).map((suggestion, index) => (
                <QueryButton key={index} suggestion={suggestion} onClick={applySuggestion} />
              ))}
              {categoryItems.length > 6 && (
                <button 
                  className="text-xs text-blue-600 hover:underline self-center"
                  onClick={() => {
                    // Create a temporary array with all items
                    const temp = [...categoryItems.slice(0, 6)];
                    // Rotate items: move the first 6 to the end
                    groupedSuggestions[category] = [...categoryItems.slice(6), ...temp];
                    // Force re-render
                    setSuggestions([...suggestions]);
                  }}
                >
                  +{categoryItems.length - 6}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  ), [groupedSuggestions, applySuggestion, suggestions]);
  
  // Replace SplitPane with a simple grid layout
  const jsonViewer = useMemo(() => {
    if (!jsonData) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[600px] bg-white border rounded-lg">
        <div className="h-full overflow-auto border-r">
          <JsonTreePanel data={jsonData} />
        </div>
        <div className="h-full overflow-auto">
          <JsonPreviewPanel data={filteredData} currentQuery={jsonPath} />
        </div>
      </div>
    );
  }, [jsonData, filteredData, jsonPath]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">JSON Data Processing</h1>
          <p className="text-gray-500">Upload, visualize, and transform JSON data</p>
        </div>
        
        {jsonData && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => exportJson(filteredData)}
          >
            <Download size={16} />
            Export JSON
          </Button>
        )}
      </div>
      
      {!jsonData ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload JSON File</CardTitle>
            <CardDescription>
              Upload a JSON file to start processing. Max file size is 10MB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUpload
              onFileUpload={handleFileUpload}
              acceptedFileTypes={{ 'application/json': ['.json'] }}
              title="Upload JSON File"
              description="Drag & drop your JSON file here, or click to browse"
            />
            
            <div className="text-center">
              <span className="text-sm text-gray-500">or</span>
              <Button
                variant="link"
                onClick={loadSampleData}
                className="text-sm px-2"
              >
                Use Sample Data
              </Button>
            </div>
            
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Search with Query Suggestions Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>JSONPath Query</CardTitle>
              <CardDescription>Filter data using JSONPath expressions or use the suggestions below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-6">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      value={jsonPath}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJsonPath(e.target.value)}
                      placeholder="Enter JSONPath expression (e.g. $.store.book[*].author)"
                      className="pl-10 h-9 text-sm"
                    />
                  </div>
                  
                  {/* Add the query results preview section */}
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-700 text-xs">Query Results:</span>
                      <span className="text-xs text-gray-500">
                        {filteredData && Array.isArray(filteredData) 
                          ? `${filteredData.length} matches found` 
                          : filteredData !== null 
                            ? '1 match found' 
                            : 'No matches'}
                      </span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded p-2 max-h-[80px] overflow-auto text-xs">
                      {filteredData ? (
                        Array.isArray(filteredData) ? (
                          filteredData.length > 0 ? (
                            <div>
                              <div className="text-green-600 font-semibold mb-1 text-xs">Query successful ✓</div>
                              <span className="font-mono text-xs">
                                {JSON.stringify(
                                  Array.isArray(filteredData) 
                                    ? filteredData.slice(0, 2) 
                                    : filteredData, 
                                  null, 
                                  1
                                )}
                                {Array.isArray(filteredData) && filteredData.length > 2 && '...'}
                              </span>
                            </div>
                          ) : (
                            <div className="text-amber-600 text-xs">
                              Query returned empty array (no matches)
                            </div>
                          )
                        ) : (
                          <div>
                            <div className="text-green-600 font-semibold mb-1 text-xs">Query successful ✓</div>
                            <span className="font-mono text-xs">
                              {typeof filteredData === 'object' 
                                ? JSON.stringify(filteredData, null, 1) 
                                : String(filteredData)}
                            </span>
                          </div>
                        )
                      ) : (
                        <div className="text-red-500 text-xs">
                          No results - Query may be invalid or no matches found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-span-12 sm:col-span-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Query Suggestions</span>
                    <button 
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => window.open("https://jsonpath-plus.github.io/JSONPath/docs/ts/", "_blank")}
                    >
                      JSONPath Docs
                    </button>
                  </div>
                  {querySuggestionsUI}
                  {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* JSON Tree and Preview using simple grid layout instead of SplitPane */}
          {jsonViewer}
          
          {/* Add FilterTester component when sample data is loaded */}
          {sampleData && <FilterTester data={sampleData} />}
          
          {/* Export Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => exportJson(filteredData)}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Export Filtered JSON
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 