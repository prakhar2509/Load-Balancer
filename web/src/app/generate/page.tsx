"use client";

import { useState, useEffect, useRef } from "react";

type Message = {
  text: string;
  isUser: boolean;
  isFinal?: boolean;
};

type FinalResponse = {
  algorithm: string;
  reason: string;
  priority: string;
};

type ErrorResponse = {
  error: string;
};

export default function GeneratePage() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Please briefly describe your use case", isUser: false },
  ]);
  const [input, setInput] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const sendToAI = async (userInput: string) => {
    try {
      const response = await fetch("http://localhost:5000/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userInput }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      return { error: "Network error. Please try again." };
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isDisabled) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const response = await sendToAI(input);
    if (response) {
      if (typeof response === "string") {
        setMessages((prev) => [...prev, { text: response, isUser: false }]);
      } else if ("error" in response) {
        setMessages((prev) => [
          ...prev,
          { text: (response as ErrorResponse).error, isUser: false },
        ]);
      } else if ("algorithm" in response) {
        const finalResponse = response as FinalResponse;
        const finalText = `Algorithm: ${finalResponse.algorithm}\nReason: ${finalResponse.reason}\nPriority: ${finalResponse.priority}`;
        setMessages((prev) => [
          ...prev,
          { text: finalText, isUser: false, isFinal: true },
        ]);
        setIsDisabled(true);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isDisabled) handleSend();
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Load Balancer AI</h1>
          <span className="text-sm opacity-75">Powered by GeminiAI</span>
        </div>

        {/* Chat Body */}
        <div
          ref={chatBodyRef}
          className="flex-1 p-6 bg-gray-100 overflow-y-auto max-h-[70vh] space-y-4"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-lg shadow-md ${
                  msg.isUser
                    ? "bg-blue-600 text-white"
                    : msg.isFinal
                    ? "bg-green-500 text-white text-center mx-auto"
                    : "bg-white text-gray-800"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              disabled={isDisabled}
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm transition-all"
            />
            <button
              onClick={handleSend}
              disabled={isDisabled}
              className="px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
