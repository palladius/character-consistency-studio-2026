import React, { useState, useEffect } from 'react';
import { View } from '@/App';

interface FooterProps {
    onSetView: (view: View) => void;
}

const Footer: React.FC<FooterProps> = ({ onSetView }) => {
    const [appVersion, setAppVersion] = useState('');

    useEffect(() => {
        fetch('./metadata.json')
            .then(response => response.json())
            .then(data => setAppVersion(data.version))
            .catch(error => console.error('Error fetching app metadata:', error));
    }, []);

    return (
        <footer className="w-full bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 p-2 text-xs text-slate-500 flex-shrink-0 flex justify-center items-center gap-4">
            {appVersion && (
                <span>
                    Character Studio v<strong className="font-bold text-slate-400">{appVersion}</strong>
                </span>
            )}
            {appVersion && <span className="text-slate-700">|</span>}

            <a 
                href="https://github.com/palladius/character-consistency-studio-2026" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-yellow-400 transition-colors font-medium"
            >
                GitHub Repository
            </a>
            <span className="text-slate-700">|</span>
            <span>
                Character Consistency Studio 2026 💛
            </span>
        </footer>
    );
};

export default Footer;
