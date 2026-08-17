import React, { useState, useEffect, useRef } from 'react';
import { MODELS, KNOWN_IMAGE_MODELS, LS_SELECTED_MODEL } from '@/config';
import { getSelectedModel } from '@/services/geminiService';

interface ApiKeyInputProps {
  onKeyChange?: () => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Model selector state
  const [selectedModel, setSelectedModel] = useState<string>(MODELS.IMAGE_GENERATION);
  const [modelInput, setModelInput] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [modelSaved, setModelSaved] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) setApiKey(stored);

    const storedModel = getSelectedModel();
    setSelectedModel(storedModel);
    setModelInput(storedModel);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setStatus('success');
    setStatusMessage('Key saved');
    setTimeout(() => { setStatus('idle'); setStatusMessage(''); }, 3000);
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

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setModelInput(modelId);
    localStorage.setItem(LS_SELECTED_MODEL, modelId);
    setShowModelDropdown(false);
    setModelSaved(true);
    setTimeout(() => setModelSaved(false), 2000);
  };

  const handleModelInputChange = (value: string) => {
    setModelInput(value);
    setShowModelDropdown(true);
  };

  const handleModelInputBlur = () => {
    // Small delay so click on dropdown option registers first
    setTimeout(() => {
      if (modelInput.trim() && modelInput !== selectedModel) {
        handleModelSelect(modelInput.trim());
      }
    }, 200);
  };

  const handleModelInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && modelInput.trim()) {
      handleModelSelect(modelInput.trim());
    }
    if (e.key === 'Escape') {
      setShowModelDropdown(false);
      setModelInput(selectedModel);
    }
  };

  // Filter suggestions based on current input
  const filteredModels = KNOWN_IMAGE_MODELS.filter(m =>
    m.id.toLowerCase().includes(modelInput.toLowerCase()) ||
    m.label.toLowerCase().includes(modelInput.toLowerCase())
  );

  const knownModel = KNOWN_IMAGE_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="flex flex-col gap-5">
      {/* API Key Section */}
      <div className="api-key-input flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">API Key</h3>
        <p className="text-slate-400 text-xs">
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
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors pr-12 text-slate-100 text-sm"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
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

      {/* Model Selector Section */}
      <div className="flex flex-col gap-3" ref={dropdownRef}>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Image Model</h3>
        <div className="relative">
          <input
            type="text"
            value={modelInput}
            onChange={(e) => handleModelInputChange(e.target.value)}
            onFocus={() => setShowModelDropdown(true)}
            onBlur={handleModelInputBlur}
            onKeyDown={handleModelInputKeyDown}
            placeholder="Type or select a model..."
            aria-label="Image generation model"
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors text-slate-100 text-sm font-mono"
          />

          {/* Dropdown suggestions */}
          {showModelDropdown && filteredModels.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-slate-700 border border-slate-600 rounded-md shadow-lg overflow-hidden">
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  onMouseDown={(e) => { e.preventDefault(); handleModelSelect(model.id); }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-slate-600 transition-colors border-b border-slate-600/50 last:border-b-0 ${
                    model.id === selectedModel ? 'bg-slate-600/70' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-100">{model.label}</span>
                    {model.id === selectedModel && <span className="text-yellow-400 text-xs">active</span>}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">{model.id}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{model.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current model info badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
            knownModel ? 'bg-green-900/40 text-green-400 border border-green-800/50' : 'bg-amber-900/40 text-amber-400 border border-amber-800/50'
          }`}>
            {knownModel ? '✓ Known model' : '⚠ Custom model'}
          </span>
          {modelSaved && (
            <span className="text-green-400 text-xs animate-pulse">Saved!</span>
          )}
        </div>
      </div>
    </div>
  );
};
