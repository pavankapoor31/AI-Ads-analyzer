import React, { useState, useEffect, useRef } from 'react';
import { Upload, RefreshCw, Copy, Play } from 'lucide-react';
import { ScoreCard } from './components/ScoreCard';
import type { AdAnalysis } from './types';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function App() {
  const [data, setData] = useState<AdAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBlob, setFileBlob] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveFile = (file: File) => {
    setSelectedFile(file);
    setFileBlob(URL.createObjectURL(file));
  }
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size exceeds 100MB limit');
        return;
      }
      if (!['jpeg', 'png', 'gif', 'jpg', 'image/png'].includes(file.type)) {
        setError(`Please upload an image file; uploaded file type:${file.type}`);
        return;
      }
      handleSaveFile(file)
      setError(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError('File size exceeds 100MB limit');
        return;
      }
      if (!['video/mp4', 'video/quicktime'].includes(file.type)) {
        setError('Please upload an MP4 or MOV file');
        return;
      }
      handleSaveFile(file)
      // setSelectedFile(file);
      setError(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    const formData = new FormData();
    formData.append("adImage", selectedFile); // Match the backend's field name

    try {
      const response = await fetch(API_BASE_URL+"/analyze-ad", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }
      const result = await response.json();
      setData(result.analysis);
    } catch {
      // setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!data) return;

    const report = `Ad Performance Analysis Report\n\n` +
      Object.entries(data).map(([key, value]) => {
        if (key === 'summary') return `Summary: ${value}`;
        const section = value as any;
        return `${key.toUpperCase()}\nScore: ${section.score}\n` +
          (section.whatWorks ? `What Works: ${section.whatWorks}\n` : '') +
          (section.whatNeedsImprovement ? `Needs Improvement: ${section.whatNeedsImprovement}\n` : '');
      }).join('\n\n');

    navigator.clipboard.writeText(report);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
            Ad Performance Analysis
          </h1>
          <div className="flex gap-4">
            <button
              onClick={analyzeImage}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={isLoading || !selectedFile}
            >
              <Play className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Analyze
            </button>
            <button
              onClick={handleCopyReport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={!data}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Report
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Grid */}
        <div className="grid grid-cols-[40%_60%] gap-6 h-full">
        <div className="h-full relative overflow-hidden">
        <div className="mb-8">
          <div
            className={`flex justify-center px-6 pt-5 pb-6 border-2 ${selectedFile ? 'border-indigo-500' : 'border-gray-300 border-dashed'
              } rounded-lg hover:border-indigo-500 transition-colors duration-200`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="space-y-1 text-center">
            <label
                htmlFor="file-upload"
                className="cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <Upload className="mx-auto h-12 w-12" />
              </label>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="jpeg,jpg,png"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              {selectedFile ? (
                <p className="text-sm text-indigo-600">{selectedFile.name}</p>
              ) : (
                <p className="text-xs text-gray-500">Jpeg, Jpg, Png up to 10MB</p>
              )}
            </div>
          </div>
        </div>
          {fileBlob && (
            <img className="h-auto max-w-full object-contain mb-2" src={fileBlob} alt="Scanned Image" />
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan"></div>
          )}
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <ScoreCard title="Hook" analysis={data?.hook} isLoading={isLoading} />
            <ScoreCard title="Script" analysis={data?.script} isLoading={isLoading} />
            <ScoreCard title="Visuals" analysis={data?.visuals} isLoading={isLoading} />
            <ScoreCard title="Captions" analysis={data?.captions} isLoading={isLoading} />
          </div>
        </div>

        {/* Summary Section */}
        {isLoading ? (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg animate-pulse">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 bg-blue-200 rounded-full"></div>
              </div>
              <div className="ml-3 space-y-2">
                <div className="h-4 bg-blue-200 rounded w-24"></div>
                <div className="h-4 bg-blue-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ) : data?.summary ? (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mt-2">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 mt-2">
                <h3 className="text-sm font-medium text-blue-800">Summary</h3>
                <div className="mt-3 text-sm text-blue-700">
                  <p>{data.summary}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;