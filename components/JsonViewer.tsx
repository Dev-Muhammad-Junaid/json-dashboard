'use client';

import React, { useState, useCallback, ReactElement, memo, useMemo } from 'react';
import { Plus, Minus } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  title?: string;
  expandDepth?: number;
}

// Main component
export default function JsonViewer({
  data,
  title,
  expandDepth = 1
}: JsonViewerProps) {
  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No data to display</p>
      </div>
    );
  }

  // For large arrays, use a warning
  const isLargeDataset = useMemo(() => {
    if (Array.isArray(data)) {
      return data.length > 1000;
    }
    return false;
  }, [data]);

  return (
    <div className="json-tree-viewer">
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <div className="font-mono text-sm rounded-lg p-4 bg-gray-50/70 backdrop-blur-sm overflow-auto max-h-[500px]">
        {isLargeDataset && (
          <div className="mb-2 p-2 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-200">
            Large dataset detected ({Array.isArray(data) ? data.length : 'many'} items). 
            Some items may be virtualized for performance.
          </div>
        )}
        <MemoizedJsonNode 
          data={data} 
          name="root" 
          isRoot 
          expandedDepth={expandDepth} 
          currentDepth={0} 
          path="$"
        />
      </div>
    </div>
  );
}

interface JsonNodeProps {
  data: any;
  name: string;
  isRoot?: boolean;
  expandedDepth: number;
  currentDepth: number;
  path: string;
}

// Memoized node rendering component
const JsonNode = memo(function JsonNode({ 
  data, 
  name, 
  isRoot = false, 
  expandedDepth, 
  currentDepth,
  path
}: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(currentDepth < expandedDepth);
  
  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  // Cached type determination
  const dataInfo = useMemo(() => {
    const getType = (value: any): string => {
      if (value === null) return 'null';
      if (Array.isArray(value)) return 'array';
      return typeof value;
    };
    
    const type = getType(data);
    const isExpandable = type === 'object' || type === 'array';
    const itemCount = isExpandable ? Object.keys(data).length : 0;
    const hasChildren = isExpandable && itemCount > 0;
    
    return { type, isExpandable, itemCount, hasChildren };
  }, [data]);
  
  // Optimized children rendering with virtualization for large arrays
  const renderChildren = useMemo(() => {
    if (!isExpanded || !dataInfo.isExpandable) return null;
    
    if (dataInfo.type === 'array') {
      // Virtualize large arrays - only render first 100 items
      const MAX_VISIBLE_ITEMS = 100;
      const arrayItems = [];
      const totalLength = data.length;
      const visibleLength = Math.min(totalLength, MAX_VISIBLE_ITEMS);
      
      for (let i = 0; i < visibleLength; i++) {
        arrayItems.push(
          <MemoizedJsonNode
            key={`${path}[${i}]`}
            data={data[i]}
            name={i.toString()}
            expandedDepth={expandedDepth}
            currentDepth={currentDepth + 1}
            path={`${path}[${i}]`}
          />
        );
      }
      
      if (totalLength > MAX_VISIBLE_ITEMS) {
        arrayItems.push(
          <div key="more" className="py-1 text-gray-500 italic">
            {totalLength - MAX_VISIBLE_ITEMS} more items (not shown for performance)
          </div>
        );
      }
      
      return (
        <div className="ml-6 relative border-l border-blue-100/50 pl-2">
          {arrayItems}
          <div className="py-1 text-gray-600">]</div>
        </div>
      );
    } else {
      // For objects, display all keys but limit to first 100 for very large objects
      const keys = Object.keys(data);
      const MAX_VISIBLE_KEYS = 100;
      const totalKeys = keys.length;
      const visibleKeys = keys.slice(0, MAX_VISIBLE_KEYS);
      
      return (
        <div className="ml-6 relative border-l border-blue-100/50 pl-2">
          {visibleKeys.map(key => (
            <MemoizedJsonNode
              key={`${path}.${key}`}
              data={data[key]}
              name={key}
              expandedDepth={expandedDepth}
              currentDepth={currentDepth + 1}
              path={`${path}.${key}`}
            />
          ))}
          {totalKeys > MAX_VISIBLE_KEYS && (
            <div className="py-1 text-gray-500 italic">
              {totalKeys - MAX_VISIBLE_KEYS} more properties (not shown for performance)
            </div>
          )}
          <div className="py-1 text-gray-600">{'}'}</div>
        </div>
      );
    }
  }, [isExpanded, dataInfo, data, path, expandedDepth, currentDepth]);
  
  // Memoized value formatting
  const formattedValue = useMemo(() => {
    if (dataInfo.isExpandable) return null;
    
    switch (dataInfo.type) {
      case 'string':
        return <span className="text-green-600">"{data}"</span>;
      case 'number':
        return <span className="text-blue-600">{data}</span>;
      case 'boolean':
        return <span className="text-purple-600">{String(data)}</span>;
      case 'null':
        return <span className="text-gray-500">null</span>;
      default:
        return <span>{String(data)}</span>;
    }
  }, [data, dataInfo]);
  
  return (
    <div className={`${isRoot ? '' : 'ml-4 group'}`}>
      <div className="flex items-center py-1 hover:bg-blue-50/50 rounded px-1 -ml-1 transition-colors">
        {dataInfo.isExpandable ? (
          <button
            onClick={handleToggle}
            className="mr-1 p-1 hover:bg-blue-100/70 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? 
              <Minus size={14} className="text-blue-500" /> : 
              <Plus size={14} className="text-blue-500" />
            }
          </button>
        ) : (
          <span className="w-6"></span>
        )}
        
        <span className={`${isRoot ? 'font-bold' : 'text-blue-700 font-medium'}`}>
          {isRoot ? '' : name}
        </span>
        
        {!isRoot && <span className="mx-1">:</span>}
        
        {dataInfo.isExpandable ? (
          <span className="text-gray-600">
            {dataInfo.type === 'array' ? '[' : '{'}
            {!isExpanded && dataInfo.itemCount > 0 && (
              <span className="text-gray-500 bg-blue-50/50 px-1 rounded-sm text-xs ml-1"> {dataInfo.itemCount} items </span>
            )}
            {!isExpanded && (dataInfo.type === 'array' ? ']' : '}')}
          </span>
        ) : (
          formattedValue
        )}
      </div>
      
      {renderChildren}
    </div>
  );
});

// Memoized version to prevent unnecessary re-renders
const MemoizedJsonNode = memo(JsonNode); 