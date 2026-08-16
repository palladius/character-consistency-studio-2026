
import React from 'react';

interface LoaderProps {
  text: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 bg-slate-800/50 rounded-lg">
      <div className="w-16 h-16 border-4 border-t-yellow-400 border-slate-600 rounded-full animate-spin"></div>
      <p className="text-slate-300 font-medium">{text}</p>
    </div>
  );
};

export default Loader;