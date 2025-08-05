import React, { useRef, useState } from "react";
import { X } from "lucide-react";
import ExampleList from "../../pages/Diagram/ExampleList";

interface MovableExampleSectionProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const MovableExampleSection: React.FC<MovableExampleSectionProps> = ({ isOpen, setIsOpen }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 200, y: 400 });
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
        width: 600,
        height: 320,
      }}
      className="rounded-lg bg-white dark:bg-[#232326] shadow-lg border border-gray-300 dark:border-gray-700 overflow-y-auto"
    >
      <div
        className="drag-handle cursor-move w-full flex justify-between items-center px-4 py-2 select-none"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <span className="font-bold text-gray-900 dark:text-[#e5e7eb]">Examples</span>
        <button
          className="bg-black rounded px-4 py-2 hover:bg-gray-800 transition-colors"
          onClick={() => setIsOpen(false)}
          title="Close Examples"
        >
          <X size={20} color="#fff" />
        </button>
      </div>
      <div className="p-2 h-[260px] overflow-y-auto">
        <ExampleList />
      </div>
    </div>
  );
};

export default MovableExampleSection;