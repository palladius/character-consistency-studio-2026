import React, { useState, useEffect } from 'react';
import { Character } from '@/types';
import { ICONS } from '@/constants';
import { QUICK_GEN_CHARACTER_ID } from '@/hooks/useCharacterManager';
import { View } from '@/App';

interface SidebarProps {
  characters: Character[];
  selectedCharacterId: string | null;
  onSelectCharacter: (id: string) => void;
  onAddCharacter: (name: string) => void;
  onDeleteCharacter: (id: string) => void;
  totalImages: number;
  totalTokens: number;
  estimatedCost: number;
  onSetView: (view: View) => void;
  hasApiKey?: boolean;
  onOpenApiKeySettings?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ characters, selectedCharacterId, onSelectCharacter, onAddCharacter, onDeleteCharacter, totalImages, totalTokens, estimatedCost, onSetView, hasApiKey, onOpenApiKeySettings }) => {
  const [newCharName, setNewCharName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    fetch('./metadata.json')
      .then(response => response.json())
      .then(data => setAppVersion(data.version))
      .catch(error => console.error('Error fetching app metadata:', error));
  }, []);

  const handleAddCharacter = () => {
    if (newCharName.trim()) {
      onAddCharacter(newCharName.trim());
      setNewCharName('');
      setIsAdding(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleAddCharacter();
    } else if (e.key === 'Escape') {
        setIsAdding(false);
        setNewCharName('');
    }
  };

  const quickGenChar = characters.find(c => c.id === QUICK_GEN_CHARACTER_ID);
  const userCharacters = characters.filter(c => c.id !== QUICK_GEN_CHARACTER_ID);

  return (
    <aside className="w-full md:w-96 flex-shrink-0 bg-slate-900/70 backdrop-blur-sm border-r border-slate-800 flex flex-col p-4 h-full">
      <div className="flex items-center justify-between gap-3 mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          {ICONS.sparkles}
          <h1 className="text-2xl font-bold text-white">
            Character Studio
            {appVersion && <span className="text-sm font-normal text-slate-400 ml-2">v{appVersion}</span>}
          </h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onOpenApiKeySettings} className="flex items-center gap-1 text-sm px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">
              {hasApiKey ? '🟢 API Key' : '🔴 No API Key'}
            </button>
            <button onClick={() => onSetView('about')} title="About this App" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
              <div className="w-5 h-5">{ICONS.info}</div>
            </button>
            <button onClick={() => onSetView('docs')} title="Documentation" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
              <div className="w-5 h-5">{ICONS.book}</div>
            </button>
        </div>
      </div>
      
      <nav className="flex-grow overflow-y-auto -mr-2 pr-2">
        {quickGenChar && (
            <div className="mb-4">
                <div
                    onClick={() => onSelectCharacter(quickGenChar.id)}
                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                    selectedCharacterId === quickGenChar.id ? 'bg-yellow-400/20 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                >
                    <div className="w-5 h-5">{ICONS.image}</div>
                    <span>{quickGenChar.name}</span>
                </div>
            </div>
        )}

        <hr className="border-slate-800 mb-4"/>

        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">{ICONS.users} Characters</h2>
            <button 
            onClick={() => setIsAdding(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
            >
            {ICONS.add}
            </button>
        </div>
        
        {isAdding && (
            <div className="mb-4">
            <input
                type="text"
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="New character name..."
                autoFocus
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
            />
            <div className="flex gap-2 mt-2">
                <button onClick={handleAddCharacter} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-1 px-2 rounded-md transition-colors text-sm">Save</button>
                <button onClick={() => setIsAdding(false)} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-1 px-2 rounded-md transition-colors text-sm">Cancel</button>
            </div>
            </div>
        )}

        <ul>
          {userCharacters.map(char => (
            <li key={char.id} className="group">
              <div
                onClick={() => onSelectCharacter(char.id)}
                className={`flex justify-between items-center p-3 rounded-md cursor-pointer transition-colors mb-1 ${
                  selectedCharacterId === char.id ? 'bg-yellow-400/20 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>{char.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCharacter(char.id);
                  }}
                  className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-4 h-4">{ICONS.trash}</div>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex-shrink-0 pt-4 mt-4 border-t border-slate-800 hidden md:block">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Session Stats</h3>
          <div className="text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                  <span>Images Generated:</span>
                  <strong className="font-bold text-slate-200">{totalImages}</strong>
              </div>
              <div className="flex justify-between">
                  <span>Tokens Used:</span>
                  <strong className="font-bold text-slate-200">{totalTokens.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                  <span>Estimated Cost:</span>
                  <strong className="font-bold text-slate-200">${estimatedCost.toFixed(2)}</strong>
              </div>
          </div>
      </div>
    </aside>
  );
};

export default Sidebar;