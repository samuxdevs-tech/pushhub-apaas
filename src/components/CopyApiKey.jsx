"use client";

import { useState } from 'react';

export default function CopyApiKey({ apiKey }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={handleCopy}
      className="bg-[#0f0f11] p-5 rounded-2xl flex justify-between items-center border border-gray-800 shadow-inner group cursor-pointer hover:border-indigo-500/30 transition-all duration-300 relative"
    >
      <code className="text-indigo-400 font-mono text-sm md:text-base break-all">{apiKey}</code>
      <button 
        className={`ml-4 p-2 rounded-xl transition-all duration-300 flex-shrink-0 ${copied ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 hover:bg-gray-700 text-gray-300 opacity-0 group-hover:opacity-100'}`}
        title="Copiar"
      >
        {copied ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        )}
      </button>
      
      {copied && (
        <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg animate-bounce">
          ¡Copiado!
        </span>
      )}
    </div>
  );
}
