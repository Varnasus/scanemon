import React, { useState } from 'react';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const APITest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>('');

  const testHealthCheck = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.healthCheck();
      setHealthStatus(`✅ Backend is healthy! Version: ${result.version}`);
      toast.success('Backend connection successful!');
    } catch (error) {
      setHealthStatus('❌ Backend connection failed');
      toast.error('Backend connection failed. Check if the server is running.');
      console.error('Health check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testScanEndpoint = async () => {
    // Create a dummy file for testing
    const dummyFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    
    setIsLoading(true);
    try {
      const result = await apiService.scanCard(dummyFile);
      toast.success(`Scan test successful! Detected: ${result.name}`);
      console.log('Scan result:', result);
    } catch (error) {
      toast.error('Scan endpoint test failed');
      console.error('Scan test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        API Connection Test
      </h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Test your backend connection and scan endpoint
          </p>
          {healthStatus && (
            <p className="text-sm font-medium">{healthStatus}</p>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={testHealthCheck}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Testing...' : 'Test Health Check'}
          </button>
          
          <button
            onClick={testScanEndpoint}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Testing...' : 'Test Scan Endpoint'}
          </button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Backend URL: {process.env.REACT_APP_API_URL || 'http://localhost:8000'}</p>
          <p>Make sure your FastAPI server is running on the correct port.</p>
        </div>
      </div>
    </div>
  );
};

export default APITest; 