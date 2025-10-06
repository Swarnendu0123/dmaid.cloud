import { X, Sparkles } from "lucide-react";
import Markdown from "./Markdown";
import React, { useRef, useState } from "react";

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
  chat: string;
  prompt: string;
  setPrompt: (v: string) => void;
  model: string;
  setModel: (v: string) => void;
  mode: string;
  setMode: (v: string) => void;
  diagramType: string;
  setDiagramType: (v: string) => void;
  isAIGeneratingDiagram: boolean;
  editOrGenerateWithAI: () => void;
  isChatOpen: boolean;
  setIsChatOpen: (v: boolean) => void;
  models: ModelOption[];
  diagramTypes: DiagramTypeOption[];
}

const ChatBox: React.FC<ChatBoxProps> = ({
  chat,
  prompt,
  setPrompt,
  model,
  setModel,
  mode,
  setMode,
  diagramType,
  setDiagramType,
  isAIGeneratingDiagram,
  editOrGenerateWithAI,
  isChatOpen,
  setIsChatOpen,
  models,
  diagramTypes,
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

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
      className="flex flex-col items-center h-[560px] w-[370px] sm:w-[420px] md:w-[480px] bg-white/20 dark:bg-gray-900/20 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-2xl p-0 shadow-glossy-lg"
    >
      <div
        className="z-10 drag-handle cursor-move w-full px-6 pt-6 pb-2 flex justify-between items-center select-none bg-green-500/20 backdrop-blur-sm rounded-t-2xl"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <p className="text-lg font-black flex items-center gap-2 text-green-700 dark:text-green-400 m-0">
          Dmaid AI ✨
        </p>
        <button
          className="glass-button rounded-lg px-3 py-1.5 hover:shadow-glow-green transition-all duration-300"
          onClick={() => setIsChatOpen(false)}
          title="Close Chat"
        >
          <X size={20} color="#fff" />
        </button>
      </div>
      <div className="flex-1 w-full flex flex-col gap-2 px-6 pb-6">
        {chat && (
          <div className="max-w-full max-h-[260px] overflow-y-auto p-4 rounded-xl bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm text-gray-900 dark:text-[#e5e7eb] border border-white/20 dark:border-gray-700/30 mb-2 shadow-inner-glow">
            <Markdown markdownString={chat} />
          </div>
        )}
        {/* Prompt input */}
        <textarea
          value={prompt}
          className="glossy-input text-gray-900 dark:text-[#e5e7eb] p-3 rounded-xl w-full resize-none focus:outline-none mb-2"
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Create a client-server architecture with database and middlewares"
          rows={3}
          maxLength={1000}
        />
        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <select
            name="diagramType"
            className="glossy-input text-black dark:text-[#e5e7eb] rounded-full font-semibold flex-1 min-w-[140px] p-2 text-sm"
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
          <select
            name="model"
            className="glossy-input text-black dark:text-[#e5e7eb] rounded-full font-semibold flex-1 min-w-[120px] p-2 text-sm"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {models.map((modelOption) => (
              <option
                key={modelOption.name}
                value={modelOption.model}
              >
                {modelOption.name}
              </option>
            ))}
          </select>
          <select
            name="edit/new"
            className="glossy-input text-black dark:text-[#e5e7eb] rounded-lg font-semibold p-2 text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="new">New</option>
            <option value="edit">Edit</option>
          </select>
          <button
            className={`glass-button px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center shadow-lg transition-all duration-300 ${
              isAIGeneratingDiagram || !prompt.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-glow-green hover:scale-105"
            }`}
            onClick={editOrGenerateWithAI}
            disabled={isAIGeneratingDiagram || !prompt.trim()}
            title={
              !prompt.trim()
                ? "Please enter a prompt"
                : "Generate diagram"
            }
          >
            {isAIGeneratingDiagram ? (
              <div className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Generating...
              </div>
            ) : (
              <>
                Generate
                <Sparkles
                  size={16}
                  color="#ffffff"
                  className="ml-2"
                />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;