import { useState, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import mermaid from "mermaid";
import Panzoom from "@panzoom/panzoom";
import {
  ArrowDownToLine,
  Brain,
  Copy,
  Image,
  Lock,
  Redo,
  Undo,
  User,
  Users,
  X,
} from "lucide-react";
import { default_code } from "./default_mermaid_code";
import { v4 as uuidv4 } from "uuid";
import { BACKEND_URL } from "../../config";

const MermaidEditor = () => {
  const [code, setCode] = useState(default_code);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([default_code]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [exportSVGName, setExportSVGName] = useState("Dmaid_" + uuidv4());
  const [owner, setOwner] = useState("swarno@admin.dmaid.cloud");
  const [prompt, setPrompt] = useState("");

  // Modals
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isGenerateWithAIModalOpen, setIsGenerateWithAIModalOpen] =
    useState(false);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const panzoomRef = useRef<any>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    const savedCode = localStorage.getItem("mermaid_code");
    if (savedCode) {
      setCode(savedCode);
      setHistory([savedCode]);
    }
  }, []);

  // function to render the diagram
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

  // Code change Handeler
  const handleCodeChange = (value: string) => {
    setCode(value);
    localStorage.setItem("mermaid_code", value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setHistory((prev) => [...prev, value]);
      setRedoStack([]); // Clear redo stack on new change
    }, 500);
  };

  // function to handel undo
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

  // function to handel redo
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

  // function to download the image in SVG format
  const handleDownloadSVG = () => {
    if (diagramRef.current) {
      const svgElement = diagramRef.current.querySelector("svg");
      if (!svgElement) {
        alert("No valid diagram to download!");
        return;
      }

      setIsDownloading(true); // Disable button & show loading

      const svgContent = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportSVGName + ".svg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setIsDownloading(false); // Re-enable button after download
      }, 3000);
    }
  };

  // function to generate the code using AI
  const generateAIDiagram = async () => {
    try {
      setLoading(true);
      setIsAIGenerating(true);
      console.log(BACKEND_URL + "/diagram/generate");

      const response = await fetch(BACKEND_URL + "/diagram/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI diagram");
      }

      const data = await response.json();
      if (data.diagram) {
        setCode(data.diagram); // Update the editor with the AI-generated code
        setExportSVGName(data.title);
        setHistory((prev) => [...prev, data.diagram]); // Add to history
        setRedoStack([]); // Clear redo stack
      } else {
        alert("No diagram code was generated.");
      }
    } catch (error) {
      console.error("Error generating AI diagram:", error);
      alert("An error occurred while generating the diagram.");
    } finally {
      setLoading(false); // Hide loading indicator
      setIsAIGenerating(false);
    }
  };

  return (
    <div className="flex gap-4 p-4 items-start relative">
      <div>
        {/* Side bar */}
        <div className="rounded-lg bg-slate-100 p-2 flex flex-col items-center my-5">
          <p className=" font-black my-2">{"</>"}</p>
          <button
            disabled={history.length <= 1}
            className={`bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1 ${
              history.length > 1 ? "" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={handleUndo}
          >
            <Undo size={16} color="#ffffff" />
          </button>

          <button
            disabled={redoStack.length === 0}
            className={`bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1 ${
              redoStack.length > 0 ? "" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={handleRedo}
          >
            <Redo size={16} color="#ffffff" />
          </button>

          <button
            className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1"
            onClick={() => setIsSettingsModalOpen(true)}
          >
            <Users size={16} color="#ffffff" />
          </button>
          <button
            className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1"
            onClick={() => setIsGenerateWithAIModalOpen(true)}
          >
            <Brain size={16} color="#ffffff" />
          </button>
        </div>

        <div className="rounded-lg bg-slate-100 p-2 flex flex-col items-center my-5">
          <p className=" font-black my-2">
            <Image size={16} color="#000" />
          </p>

          <button
            className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1"
            onClick={() => setIsDownloadModalOpen(true)}
          >
            <ArrowDownToLine size={16} color="#ffffff" />
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
            <h2 className="text-xl mb-4 font-black">Export Dmaid</h2>

            <div className="flex flex-col gap-2">
              {/* Input */}
              <div className="rounded-lg overflow-auto w-full flex  items-center ">
                <p className="pr-2  font-black text-sm">Name</p>
                <input
                  type="text"
                  name=""
                  id=""
                  onChange={(e) => setExportSVGName(e.target.value)}
                  className="p-1 w-full border rounded"
                  value={exportSVGName}
                />
              </div>

              {/* Render Modal */}
              <div className="border mt-4 rounded-lg overflow-auto  max-h-60 w-full">
                <div
                  className="overflow-auto max-h-60"
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
                <p>Export Dmaid (in SVG)</p>
                <button
                  className={`bg-black text-white px-4 py-2 rounded font-black text-sm m-0.5 my-1 mx-4 flex items-center ${
                    isDownloading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleDownloadSVG}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <div className="flex items-center">
                      <span className="animate-spin mr-2">⏳</span>{" "}
                      Processing...
                    </div>
                  ) : (
                    <>
                      Download
                      <ArrowDownToLine
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
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 bg-black rounded"
              onClick={() => setIsSettingsModalOpen(false)}
            >
              <X size={20} color="#fff" />
            </button>
            <h2 className="text-xl mb-4 font-black">Access Control Settings</h2>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <div className="text-sm p-2 m-1 font-bold w-72">
                    Access Type
                  </div>
                  <div className="bg-black opacity-50 rounded text-white text-sm p-2 m-1 flex justify-center items-center w-full">
                    Private <Lock size={16} color="#ffffff" className="ml-1" />
                  </div>
                  <div className="bg-black rounded text-white text-sm p-2 m-1 flex justify-center items-center w-full">
                    Public <User size={16} color="#ffffff" className="ml-1" />
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="text-sm p-2 m-1 font-bold">Owner</div>
                  <input
                    type="email"
                    name=""
                    id=""
                    value={owner}
                    className="border p-2 m-1 rounded w-full"
                    onChange={(e) => setOwner(e.target.value)}
                  />
                  <button className="bg-black text-white rounded text-sm p-2 m-1 flex justify-center items-center">
                    Save
                  </button>
                </div>

                <div className="flex">
                  <div className="bg-black rounded text-slate-200 text-sm p-2 m-1 w-full">
                    https://chatgpt.com/?model=auto
                  </div>
                  <div className="bg-black rounded text-sm p-2 m-1 flex justify-center items-center">
                    <Copy size={16} color="#ffffff" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* generate with AI Modal */}
      {isGenerateWithAIModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 bg-black rounded"
              onClick={() => setIsGenerateWithAIModalOpen(false)}
            >
              <X size={20} color="#fff" />
            </button>
            <h2 className="text-xl mb-4 font-black">
              Generate Diagrams with AI
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <textarea
                    name=""
                    id=""
                    value={prompt}
                    className="border p-2 m-1 rounded w-96"
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Create a client Server Architecture with Database and Middlewares"
                  />
                </div>

                <button
                  className={`bg-black text-white px-4 py-2 rounded font-black text-sm m-0.5 my-1 mx-4 flex items-center justify-center ${
                    isAIGenerating ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={generateAIDiagram}
                  disabled={isAIGenerating}
                >
                  {isAIGenerating ? (
                    <div className="flex items-center justify-center">
                      <span className="animate-spin mr-2">⏳</span>{" "}
                      Generating...
                    </div>
                  ) : (
                    <>Generate With AI</>
                  )}
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
