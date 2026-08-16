import React, { useState, useEffect } from 'react';

export const ApiKeyInput: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) {
      setApiKey(stored);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setStatus('idle');
  };

  const handleTest = async () => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
      });
      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="api-key-input">
      <h3>Gemini API Key</h3>
      <p>
        Get your key from{' '}
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
          Google AI Studio
        </a>
      </p>
      <input
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter your Gemini API key"
        className="dark-input"
      />
      <div className="button-group">
        <button onClick={handleSave} className="btn primary">Save</button>
        <button onClick={handleTest} className="btn secondary">Test Connection</button>
        <button onClick={handleClear} className="btn danger">Clear</button>
      </div>
      {status === 'success' && <span className="status-success">✅ Connection working</span>}
      {status === 'error' && <span className="status-error">❌ Connection failed</span>}
    </div>
  );
};
