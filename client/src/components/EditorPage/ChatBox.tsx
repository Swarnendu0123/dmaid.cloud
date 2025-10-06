import { X, Sparkles, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Markdown from "./Markdown";
import React, { useRef, useState, useEffect } from "react";
import { ChatMessage } from "../../types";

interface ModelOption {
  name: string;
  description: string;
  model: string;
}

interface DiagramTypeOption {
  name: string;
  value: string;
  description: string;
}

interface ChatBoxProps {
  messages: ChatMessage[];
  prompt: string;
  setPrompt: (v: string) => void;
  model: string;
  setModel: (v: string) => void;
  diagramType: string;
  setDiagramType: (v: string) => void;
  isAIGeneratingDiagram: boolean;
  onGenerate: () => void;
  onEnhance: () => void;
  isChatOpen: boolean;
  setIsChatOpen: (v: boolean) => void;
  models: ModelOption[];
  diagramTypes: DiagramTypeOption[];
  onClearChat: () => void;
  hasExistingDiagram: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  prompt,
  setPrompt,
  model,
  setModel,
  diagramType,
  setDiagramType,
  isAIGeneratingDiagram,
  onGenerate,
  onEnhance,
  isChatOpen,
  setIsChatOpen,
  models,
  diagramTypes,
  onClearChat,
  hasExistingDiagram,
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<"conversation" | "enhancement">("conversation");

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    const box = boxRef.current;
    if (box) {
      const rect = box.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    document.body.style.userSelect = "none";
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };

  const onMouseUp = () => {
    setDragging(false);
    document.body.style.userSelect = "";
  };

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  // Touch support
  const onTouchStart = (e: React.TouchEvent) => {
    setDragging(true);
    const box = boxRef.current;
    if (box) {
      const rect = box.getBoundingClientRect();
      const touch = e.touches[0];
      dragOffset.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    document.body.style.userSelect = "none";
  };
  const onTouchMove = (e: TouchEvent) => {
    if (!dragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragOffset.current.x,
      y: touch.clientY - dragOffset.current.y,
    });
  };
  const onTouchEnd = () => {
    setDragging(false);
    document.body.style.userSelect = "";
  };
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);
    } else {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    }
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [dragging]);

  if (!isChatOpen) return null;

  const handleSubmit = () => {
    if (!prompt.trim() || isAIGeneratingDiagram) return;
    
    if (mode === "conversation") {
      onGenerate();
    } else {
      onEnhance();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      ref={boxRef}
      style={{
        position: "fixed",
        left: position.x || undefined,
        top: position.y || undefined,
        right: position.x === 0 ? 16 : undefined,
        bottom: position.y === 0 ? 40 : undefined,
        zIndex: 40,
        touchAction: "none",
      }}
      className="glass-card flex flex-col h-[600px] w-[400px] sm:w-[450px] md:w-[500px] overflow-hidden scale-in"
    >
      {/* Header */}
      <div
        className="drag-handle cursor-move px-5 py-4 flex justify-between items-center border-b border-white/10 dark:border-white/5 bg-gradient-to-r from-primary-500/10 to-purple-500/10 select-none"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-blue flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-primary m-0 gradient-text">
              Dmaid AI
            </p>
            <p className="text-xs text-secondary m-0">Professional Diagram Assistant</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-modern btn-ghost p-2"
            onClick={onClearChat}
            title="Clear Chat History"
          >
            <Trash2 size={18} />
          </button>
          <button
            className="btn-modern btn-ghost p-2"
            onClick={() => setShowSettings(!showSettings)}
            title="Toggle Settings"
          >
            {showSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            className="btn-modern btn-ghost p-2"
            onClick={() => setIsChatOpen(false)}
            title="Close Chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Settings Panel (Collapsible) */}
      {showSettings && (
        <div className="px-5 py-4 border-b border-white/10 dark:border-white/5 bg-white/20 dark:bg-black/20 slide-down">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-primary mb-2 block">
                AI Model
              </label>
              <select
                name="model"
                className="input-modern w-full"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                {models.map((modelOption) => (
                  <option key={modelOption.name} value={modelOption.model}>
                    {modelOption.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-primary mb-2 block">
                Diagram Type
              </label>
              <select
                name="diagramType"
                className="input-modern w-full"
                value={diagramType}
                onChange={(e) => setDiagramType(e.target.value)}
                title="Select diagram type"
              >
                {diagramTypes.map((typeOption) => (
                  <option
                    key={typeOption.value}
                    value={typeOption.value}
                    title={typeOption.description}
                  >
                    {typeOption.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-[#232326] text-gray-900 dark:text-[#e5e7eb]"
              }`}
            >
              {message.role === "user" ? (
                <p className="text-sm whitespace-pre-wrap m-0 leading-relaxed">
                  {message.content}
                </p>
              ) : (
                <div className="text-sm">
                  <Markdown markdownString={message.content} />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Claude-like */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b]">
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode("conversation")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "conversation"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-[#232326] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            💬 Conversation
          </button>
          <button
            onClick={() => setMode("enhancement")}
            disabled={!hasExistingDiagram}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "enhancement"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-[#232326] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
            title={!hasExistingDiagram ? "Create a diagram first to enable enhancement mode" : ""}
          >
            ✨ Enhancement
          </button>
        </div>

        {/* Input Container */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "conversation"
                ? "Describe the diagram you want to create..."
                : "Describe how to enhance the existing diagram..."
            }
            rows={3}
            maxLength={1000}
            className="w-full bg-gray-50 dark:bg-[#232326] text-gray-900 dark:text-[#e5e7eb] p-3 pr-12 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 border border-gray-200 dark:border-gray-700 text-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={isAIGeneratingDiagram || !prompt.trim()}
            className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all ${
              isAIGeneratingDiagram || !prompt.trim()
                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50"
                : mode === "conversation"
                ? "bg-blue-600 hover:bg-blue-700 shadow-sm"
                : "bg-purple-600 hover:bg-purple-700 shadow-sm"
            }`}
            title={
              !prompt.trim()
                ? "Enter a prompt first"
                : mode === "conversation"
                ? "Generate new diagram"
                : "Enhance existing diagram"
            }
          >
            {isAIGeneratingDiagram ? (
              <span className="animate-spin text-white">⏳</span>
            ) : (
              <Sparkles size={18} className="text-white" />
            )}
          </button>
        </div>

        {/* Hint Text */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          {mode === "conversation" ? (
            <>Press Enter to send • Shift+Enter for new line</>
          ) : (
            <>Enhancement mode: Modify the current diagram • Press Enter to send</>
          )}
        </p>
      </div>
    </div>
  );
};

export default ChatBox;