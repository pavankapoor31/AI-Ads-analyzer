import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { SectionAnalysis } from '../types';

interface ScoreCardProps {
  title: string;
  analysis?: SectionAnalysis;
  isLoading?: boolean;
}

export function ScoreCard({ title, analysis, isLoading = false }: ScoreCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6"></div>
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0 mt-1"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0 mt-1"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const score = parseInt(analysis.score.split('/')[0]);
  const percentage = (score / 50) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <span className="text-lg font-bold text-indigo-600">{analysis.score}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${
            percentage >= 80 ? 'bg-green-500' :
            percentage >= 60 ? 'bg-blue-500' :
            percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {analysis.whatWorks && (
        <div className="mb-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
            <p className="text-gray-700">{analysis.whatWorks}</p>
          </div>
        </div>
      )}

      {analysis.whatNeedsImprovement && (
        <div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
            <p className="text-gray-700">{analysis.whatNeedsImprovement}</p>
          </div>
        </div>
      )}
    </div>
  );
}