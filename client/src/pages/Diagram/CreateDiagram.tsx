import { useState, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import mermaid from "mermaid";
import Panzoom from "@panzoom/panzoom";
import { ArrowDownToLine, Image, Redo, Undo, Users, X } from "lucide-react";
import { default_code } from "./default_mermaid_code";

const MermaidEditor = () => {
  const [code, setCode] = useState(default_code);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([default_code]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const panzoomRef = useRef<any>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCodeChange = (value: string) => {
    setCode(value);
    setHistory((prev) => [...prev, value]);
    setRedoStack([]); // Clear redo stack on new change
  };

  const handleUndo = () => {
    if (history.length > 1) {
      setRedoStack((prevRedo) => [history[history.length - 1], ...prevRedo]);
      setHistory((prevHistory) => {
        const newHistory = prevHistory.slice(0, -1);
        setCode(newHistory[newHistory.length - 1]);
        return newHistory;
      });
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      setHistory((prevHistory) => {
        const newHistory = [...prevHistory, redoStack[0]];
        setCode(redoStack[0]);
        return newHistory;
      });
      setRedoStack((prevRedo) => prevRedo.slice(1));
    }
  };

  const handleDownloadSVG = () => {
    if (diagramRef.current) {
      const svgContent = diagramRef.current.innerHTML;
      if (!svgContent.includes("<svg")) {
        alert("No valid diagram to download!");
        return;
      }

      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "diagram.svg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });

    if (containerRef.current && !panzoomRef.current) {
      panzoomRef.current = Panzoom(containerRef.current, {
        maxScale: 5,
        minScale: 0.5,
        contain: "outside",
      });
      containerRef.current.addEventListener(
        "wheel",
        panzoomRef.current.zoomWithWheel
      );
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setLoading(true);
    timerRef.current = setTimeout(() => {
      renderDiagram();
    }, 1000);

    return () => clearTimeout(timerRef.current as NodeJS.Timeout);
  }, [code]);

  const renderDiagram = async () => {
    if (diagramRef.current) {
      try {
        // Store zoom and pan state
        const currentZoom = panzoomRef.current?.getScale() || 1;
        const currentPan = panzoomRef.current?.getPan() || { x: 0, y: 0 };

        const { svg } = await mermaid.render("generatedDiagram", code);
        diagramRef.current.innerHTML = svg;

        setTimeout(() => {
          if (panzoomRef.current) {
            panzoomRef.current.zoom(currentZoom); // Restore zoom
            panzoomRef.current.pan(currentPan.x, currentPan.y); // Restore pan
          }
        }, 100);
      } catch (error) {
        diagramRef.current.innerHTML = `<p style="color: red;">Error rendering diagram</p>`;
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex gap-4 p-4 items-start relative">
      <div>
        <div className="rounded-lg bg-slate-100 p-2 flex flex-col items-center my-5">
          <p className=" font-black my-2">{"</>"}</p>
          <button className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1">
            <Undo size={16} color="#ffffff" onClick={handleUndo} />
          </button>
          <button className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1">
            <Redo size={16} color="#ffffff" onClick={handleRedo} />
          </button>
          <button className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1">
            <Users size={16} color="#ffffff" />
          </button>
        </div>

        <div className="rounded-lg bg-slate-100 p-2 flex flex-col items-center my-5">
          <p className=" font-black my-2">
            <Image size={16} color="#000" />
          </p>

          <button className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1">
            <ArrowDownToLine
              size={16}
              color="#ffffff"
              onClick={() => setIsDownloadModalOpen(true)}
            />
          </button>
        </div>
      </div>
      <div className="w-full max-w-2xl p-2 bg-gray-900 rounded-lg">
        <CodeMirror
          value={code}
          height="615px"
          extensions={[markdown()]}
          theme="dark"
          onChange={handleCodeChange}
        />
      </div>
      <div className="w-full max-w-2xl p-4 rounded-lg bg-slate-100 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="animate-spin text-gray-600 text-4xl">⟳</div>
          </div>
        )}
        <div
          ref={containerRef}
          className="p-4 cursor-grab h-[600px] flex justify-center items-center relative"
        >
          <div ref={diagramRef} className="transform scale-75"></div>
        </div>
        {/* Zoom & Pan Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col items-center space-y-2  p-2 rounded-lg">
          <div className="flex space-x-2">
            <button
              className="bg-gray-700 text-white px-3 py-1 rounded"
              onClick={() => panzoomRef.current.zoomIn()}
            >
              +
            </button>
            <button
              className="bg-gray-700 text-white px-3 py-1 rounded"
              onClick={() => panzoomRef.current.zoomOut()}
            >
              -
            </button>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 bg-black rounded"
              onClick={() => setIsDownloadModalOpen(false)}
            >
              <X size={20} color="#fff" />
            </button>
            <h2 className="text-xl mb-4 font-black">Download Dmaid</h2>
            <div className="flex flex-col gap-2">
              {/* Render SVG in modal */}
              <div className="border p-4 mt-4 rounded-lg overflow-auto max-h-80 w-full">
                <div
                  className="overflow-auto max-h-72"
                  style={{ whiteSpace: "nowrap" }} // Prevents SVG from wrapping and ensures horizontal scrolling if needed
                  dangerouslySetInnerHTML={{
                    __html:
                      diagramRef.current?.innerHTML ||
                      "<p>No diagram available</p>",
                  }}
                />
              </div>

              {/* Download text and button */}
              <div className="flex items-center">
                <p>Download Dmaid (in SVG)</p>
                <button className="bg-black text-white px-4 py-2 rounded font-black text-sm m-0.5 my-1 mx-4 flex items-center">
                  Download
                  <ArrowDownToLine
                    size={16}
                    color="#ffffff"
                    onClick={handleDownloadSVG}
                    className="ml-2"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MermaidEditor;
