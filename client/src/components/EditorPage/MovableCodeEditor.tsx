import React, { useRef, useState } from "react";
import { Undo, Redo, Copy, Check, X } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { basicLight } from "@uiw/codemirror-theme-basic";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { foldByIndent, mermaid as mermaidLang } from "codemirror-lang-mermaid";
import { syntaxHighlighting } from "@codemirror/language";
import { myHighlightStyle } from "../../pages/Diagram/theme";

interface MovableCodeEditorProps {
  code: string;
  setCode: (v: string) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleCopy: () => void;
  copiedToClipboard: boolean;
  history: string[];
  redoStack: string[];
  isDark: boolean;
}

const MovableCodeEditor: React.FC<MovableCodeEditorProps> = ({
  code,
  setCode,
  isOpen,
  setIsOpen,
  handleUndo,
  handleRedo,
  handleCopy,
  copiedToClipboard,
  history,
  redoStack,
  isDark,
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });
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
  if (!isOpen) return null;
  return (
    <div
      ref={boxRef}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 50,
        touchAction: "none",
      }}
      className="flex flex-col items-center space-y-2 p-3 rounded-2xl glass-card h-[400px] w-[460px] shadow-glossy-lg border border-white/30 dark:border-gray-700/30"
    >
      <div
        className="drag-handle cursor-move w-full flex justify-between items-center mb-2 select-none bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-lg px-3 py-2"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div className="flex gap-1">
          <button
            disabled={history.length <= 1}
            className={`glass-button px-3 py-2 rounded-lg font-bold transition-all duration-300 ${
              history.length > 1
                ? "hover:shadow-glow-purple"
                : "opacity-50 cursor-not-allowed"
            }`}
            onClick={handleUndo}
            title="Undo"
          >
            <Undo size={16} color="#ffffff" />
          </button>
          <button
            disabled={redoStack.length === 0}
            className={`glass-button px-3 py-2 rounded-lg font-bold transition-all duration-300 ${
              redoStack.length > 0
                ? "hover:shadow-glow-purple"
                : "opacity-50 cursor-not-allowed"
            }`}
            onClick={handleRedo}
            title="Redo"
          >
            <Redo size={16} color="#ffffff" />
          </button>
          <button
            className="glass-button px-3 py-2 rounded-lg font-bold hover:shadow-glow-purple transition-all duration-300"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copiedToClipboard ? (
              <Check size={16} color="#ffffff" />
            ) : (
              <Copy size={16} color="#ffffff" />
            )}
          </button>
        </div>
        <button
          className="glass-button rounded-lg px-4 py-2 hover:shadow-glow-purple transition-all duration-300"
          onClick={() => setIsOpen(false)}
          title="Close Editor"
        >
          <X size={20} color="#fff" />
        </button>
      </div>
      <CodeMirror
        value={code}
        height="335px"
        width="450px"
        className="rounded-lg border border-gray-300 dark:border-gray-700"
        extensions={[
          mermaidLang(),
          syntaxHighlighting(myHighlightStyle),
          foldByIndent(),
        ]}
        theme={isDark ? dracula : basicLight}
        onChange={setCode}
      />
    </div>
  );
};

export default MovableCodeEditor;