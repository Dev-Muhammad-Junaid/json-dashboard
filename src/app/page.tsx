'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileJson, Upload, ArrowRight, Clock, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-xl border border-blue-100/50 dark:border-blue-800/30 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">JSON Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
          Process, visualize, and transform JSON data with powerful JSONPath filters and expressions.
        </p>
        <div className="flex gap-3 mt-4">
          <Link href="/json">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Get Started
            </Button>
          </Link>
          <Button 
            variant="outline"
            onClick={() => window.open("https://jsonpath-plus.github.io/JSONPath/docs/ts/", "_blank")}
          >
            JSONPath Docs
          </Button>
        </div>
      </div>
      
      {/* Quick Access Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <Sparkles size={18} className="text-amber-500" />
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card gradient>
            <CardHeader className="pb-2">
              <div className="p-2.5 w-fit rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                <FileJson className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="mt-4">JSON Processing</CardTitle>
              <CardDescription>Transform and analyze JSON data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload, visualize, and transform complex JSON data with JSONPath filtering.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/json" className="w-full">
                <Button className="w-full flex justify-between items-center bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-blue-100 dark:border-blue-900/30">
                  Open JSON Tools
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card gradient>
            <CardHeader className="pb-2">
              <div className="p-2.5 w-fit rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                <FileJson className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="mt-4">Filter Testing</CardTitle>
              <CardDescription>Validate your JSONPath filters</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test and verify complex JSONPath expressions with our built-in filter tester.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/json" className="w-full">
                <Button className="w-full flex justify-between items-center bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-blue-100 dark:border-blue-900/30">
                  Try Filter Tester
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card gradient>
            <CardHeader className="pb-2">
              <div className="p-2.5 w-fit rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                <FileJson className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="mt-4">Advanced Filters</CardTitle>
              <CardDescription>Complex data transformations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use advanced JSONPath-Plus extensions for powerful data filtering and selection.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/json" className="w-full">
                <Button className="w-full flex justify-between items-center bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-blue-100 dark:border-blue-900/30">
                  Explore Advanced Filters
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Upload Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <Upload size={18} className="text-blue-500" />
          Quick Upload
        </h2>
        <Card>
          <CardContent className="p-6">
            <Link href="/json" className="w-full">
              <div className="border border-dashed border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl h-32 flex flex-col items-center justify-center gap-3 transition-all hover:bg-blue-50/50 dark:hover:bg-blue-900/20 group">
                <div className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 transition-colors">
                  <FileJson className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Upload JSON File</span>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <Clock size={18} className="text-indigo-500" />
          Recent Activity
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-10 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No recent activities</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Your processing history will appear here as you work with files. Start by uploading a JSON file.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
