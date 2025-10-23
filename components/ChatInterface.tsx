
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isRefining: boolean;
  disabled: boolean;
}

const AIMessage: React.FC<{ text: string }> = ({ text }) => {
    const renderTextWithLinks = (inputText: string) => {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(inputText)) !== null) {
            if (match.index > lastIndex) {
                parts.push(inputText.substring(lastIndex, match.index));
            }
            const linkText = match[1];
            const linkUrl = match[2];
            parts.push(
                <a
                    key={match.index}
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300 transition"
                >
                    {linkText}
                </a>
            );
            lastIndex = linkRegex.lastIndex;
        }

        if (lastIndex < inputText.length) {
            parts.push(inputText.substring(lastIndex));
        }

        return parts;
    };
    return <div className="prose prose-invert max-w-none text-gray-300">{renderTextWithLinks(text)}</div>;
}


export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isRefining, disabled }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isRefining && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="w-full bg-gray-800 rounded-lg shadow-inner flex flex-col h-full max-h-[50vh]">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500">
                {disabled ? "Select a style to begin designing" : "Refine your design here (e.g., 'make the rug blue')"}
            </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                {msg.sender === 'ai' ? <AIMessage text={msg.text} /> : <p>{msg.text}</p>}
            </div>
          </div>
        ))}
        {isRefining && (
            <div className="flex justify-start">
                <div className="max-w-md lg:max-w-lg px-4 py-2 rounded-lg bg-gray-700 text-gray-200 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={disabled ? "Select a style first..." : "Change one thing..."}
          disabled={isRefining || disabled}
          className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isRefining || disabled || !input.trim()}
          className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </button>
      </form>
    </div>
  );
};
