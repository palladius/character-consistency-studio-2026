import React, { useState, useEffect } from 'react';
import { MODELS } from '@/config';

interface ApiKeyInputProps {
  onKeyChange?: () => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) {
      setApiKey(stored);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setStatus('success');
    setStatusMessage('Key saved');
    setTimeout(() => {
      setStatus('idle');
      setStatusMessage('');
    }, 3000);
    onKeyChange?.();
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setStatus('idle');
    setStatusMessage('');
    onKeyChange?.();
  };

  const handleTest = async () => {
    setStatus('loading');
    setStatusMessage('Testing...');
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELS.TEST_CONNECTION}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
      });
      if (response.ok) {
        setStatus('success');
        setStatusMessage('Connection working');
      } else {
        setStatus('error');
        setStatusMessage('Connection failed');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Connection failed');
    }
  };

  return (
    <div className="api-key-input flex flex-col gap-4">
      <p className="text-slate-300 text-sm">
        Get your key from{' '}
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
          Google AI Studio
        </a>
      </p>
      <div className="flex relative">
        <input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API key"
          aria-label="Gemini API Key"
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors pr-12 text-slate-100"
        />
        <button
          onClick={() => setShowKey(!showKey)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        >
          {showKey ? 'Hide' : 'Show'}
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-4 rounded-md transition-colors text-sm">Save</button>
        <button onClick={handleTest} disabled={status === 'loading'} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm disabled:opacity-50">Test</button>
        <button onClick={handleClear} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Clear</button>
      </div>
      {status === 'success' && <span className="text-green-400 text-sm">✅ {statusMessage}</span>}
      {status === 'error' && <span className="text-red-400 text-sm">❌ {statusMessage}</span>}
      {status === 'loading' && <span className="text-slate-400 text-sm">⏳ {statusMessage}</span>}
    </div>
  );
};
