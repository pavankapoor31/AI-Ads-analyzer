import React, { useState, useEffect, useRef } from 'react';
import { Upload, RefreshCw, Copy, Play, ArrowUp, Lightbulb } from 'lucide-react';
import { ScoreCard } from './components/ScoreCard';
import type { AdAnalysis } from './types';
import BenefitCards from './components/BenifitsCard';
import DUMMY_AD from "./static/burgerworld_ad.png"
import logo from "./static/logo.webp";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function App() {
  const [data, setData] = useState<AdAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBlob, setFileBlob] = useState<string | null>(null);
  const [imageSubmitted, setImageSubmitted] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveFile = (file: File) => {
    setSelectedFile(file);
    setFileBlob(URL.createObjectURL(file));
    setImageSubmitted(false);
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size exceeds 10MB limit');
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
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit');
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

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setImageSubmitted(true);
    setIsLoading(true);
    setError(null);
    setData(null);

    const formData = new FormData();
    formData.append("adImage", selectedFile); // Match the backend's field name

    try {
      const response = await fetch(API_BASE_URL + "/analyze-ad", {
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

  const handleUseDummyImage = () => {
    fetch(DUMMY_AD)
      .then(response => response.blob())
      .then(blob => {
        const dummyFile = new File([blob], "dummy_ad.png", { type: "image/png" });
        handleSaveFile(dummyFile);
        setError(null);
      })
      .catch(err => {
        setError("Failed to load dummy image");
        console.error(err);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-col md:flex-row justify-between items-center mb-4">
          <div className="flex items-center mb-4 sm:mb-0">
            <img src={logo} alt="AdWise Logo" className="h-10 w-auto mr-4" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AdWise</h1>
              <p className="text-lg text-blue-600">Advanced AI Analysis for Every Ad Campaign</p>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
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
        <div className={`grid ${(selectedFile && imageSubmitted) ? 'grid-cols-[40%_60%]' : 'grid-cols-[100%]'} gap-8 h-full`}>
          <div className="h-full">
            <div className="mb-8">
              <div
                className={`flex justify-center px-6 pt-5 pb-6 border-2 ${selectedFile ? 'border-indigo-500' : 'border-gray-300 border-dashed hover:border-indigo-500 hover:bg-indigo-50'} rounded-xl transition-colors duration-200`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="space-y-2 text-center">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <Upload className="mx-auto h-16 w-16" />
                  </label>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>Upload Your Ad Image</span>
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
                    <p className="text-sm font-medium text-gray-600">Supports JPEG, PNG, or JPG Files (Up to 10MB)</p>
                  )}
                </div>
              </div>
{              !selectedFile && <div className="text-gray-500 cursor-pointer mt-2 text-sm">
                <button
                  onClick={handleUseDummyImage}
                  className="inline-flex items-center px-3 py-1 text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
                >
                  No Ad Yet? Use a Sample Image
                </button>
              </div>}
            </div>
            <div className='relative h-fit d-flex align-items-center'>
              {fileBlob && (
                <div className="relative overflow-hidden w-full flex justify-center">
                  <img className="h-auto max-w-full object-contain mb-2" src={fileBlob} alt="Scanned Image" />
                  {isLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan"></div>
                  )}
                </div>
              )}
              {!imageSubmitted && selectedFile && <div className="w-full flex items-center justify-center">
                <button
                  onClick={analyzeImage}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-lg animate-pulse font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  disabled={isLoading || !selectedFile}
                >
                  <Play className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Analyze
                </button>
              </div>}
            </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <ScoreCard title="Hook" analysis={data?.hook} isLoading={isLoading} />
              <ScoreCard title="Script" analysis={data?.script} isLoading={isLoading} />
              <ScoreCard title="Visuals" analysis={data?.visuals} isLoading={isLoading} />
              <ScoreCard title="Captions" analysis={data?.captions} isLoading={isLoading} />
            </div>
        </div>
        {
          !selectedFile && <>
            <BenefitCards />
          </>
        }
        {/* Summary Section */}
        {isLoading ? (
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-lg animate-pulse">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 bg-indigo-200 rounded-full"></div>
              </div>
              <div className="ml-3 space-y-2">
                <div className="h-4 bg-indigo-200 rounded w-24"></div>
                <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ) : data?.summary ? (
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-lg mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 mt-2">
                <h3 className="text-base font-medium text-indigo-800">Summary</h3>
                <div className="mt-3 text-base text-indigo-700">
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