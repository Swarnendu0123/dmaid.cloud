import { useState, useEffect, useRef, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { basicLight } from "@uiw/codemirror-theme-basic";
import { foldByIndent, mermaid as mermaidLang } from "codemirror-lang-mermaid";
import { syntaxHighlighting } from "@codemirror/language";
import ExampleList from "./ExampleList";

import mermaid from "mermaid";
import Panzoom from "@panzoom/panzoom";
import {
  ArrowDownToLine,
  Bot,
  Bug,
  Check,
  Copy,
  Image,
  Lock,
  Redo,
  Sparkles,
  Undo,
  User,
  X,
  AlertCircle,
} from "lucide-react";
import { default_code } from "./default_mermaid_code";
import { v4 as uuidv4 } from "uuid";
import { BACKEND_URL } from "../../config";
import Markdown from "../../components/Markdown";
import { useRecoilState } from "recoil";
import { chatState, codeState } from "../../store/atoms";
import { myHighlightStyle } from "./theme";

// Types for better type safety
interface ApiResponse {
  chat?: string;
  title?: string;
  error?: string;
}

interface ErrorState {
  type: "render" | "api" | "clipboard" | "download" | null;
  message: string;
}

interface Model {
  name: string;
  description: string;
  model: string;
}

const MermaidEditor = () => {
  const [code, setCode] = useRecoilState<string>(codeState);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [chat, setChat] = useRecoilState<string>(chatState);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([default_code]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [exportSVGName, setExportSVGName] = useState("Dmaid_" + uuidv4());
  const [owner, setOwner] = useState("swarno@admin.dmaid.cloud");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(
    "meta-llama/llama-4-maverick-17b-128e-instruct"
  );
  const [mode, setMode] = useState("new");

  // Error state
  const [error, setError] = useState<ErrorState>({ type: null, message: "" });

  // Modals
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Loading states
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAIGeneratingDiagram, setIsAIGeneratingDiagram] = useState(false);
  const [isAIGeneratingTitle, setIsAIGeneratingTitle] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const panzoomRef = useRef<any>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const models: Model[] = [
    {
      name: "Llama 4 [17B]",
      description: "",
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
    },
    {
      name: "DeepSeek R1 [70B]",
      description: "",
      model: "deepseek-r1-distill-llama-70b",
    },
  ];

  // Error handling utility
  const showError = useCallback((type: ErrorState["type"], message: string) => {
    setError({ type, message });
    setTimeout(() => setError({ type: null, message: "" }), 5000);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError({ type: null, message: "" });
  }, []);

  // Initialize mermaid and panzoom
  useEffect(() => {
    try {
      mermaid.initialize({ startOnLoad: false });

      if (containerRef.current && !panzoomRef.current) {
        panzoomRef.current = Panzoom(containerRef.current, {
          maxScale: 10,
          minScale: 0.1,
          contain: "outside",
        });

        const handleWheel = (e: WheelEvent) => {
          try {
            panzoomRef.current?.zoomWithWheel(e);
          } catch (err) {
            console.warn("Zoom error:", err);
          }
        };

        containerRef.current.addEventListener("wheel", handleWheel);

        return () => {
          containerRef.current?.removeEventListener("wheel", handleWheel);
        };
      }
    } catch (err) {
      showError("render", "Failed to initialize diagram editor");
      console.error("Initialization error:", err);
    }
  }, [showError]);

  // Debounced diagram rendering
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setLoading(true);
    timerRef.current = setTimeout(() => {
      renderDiagram();
    }, 300); // Increased debounce time for better performance

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [code]);

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem("mermaid_code");
      if (savedCode) {
        setCode(savedCode);
        setHistory([savedCode]);
      }
    } catch (err) {
      console.warn("Failed to load saved data:", err);
      showError("render", "Failed to load saved data");
    }
  }, [setCode, setChat, showError]);

  // Copy to clipboard with error handling
  const copyToClipboard = useCallback(async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API not supported");
      }

      await navigator.clipboard.writeText(code);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      showError(
        "clipboard",
        "Failed to copy to clipboard. Please try selecting and copying manually."
      );
    }
  }, [code, showError]);

  // Render diagram with proper error handling
  const renderDiagram = useCallback(async () => {
    if (!diagramRef.current) return;

    try {
      // Store zoom and pan state
      const currentZoom = panzoomRef.current?.getScale() || 1;
      const currentPan = panzoomRef.current?.getPan() || { x: 0, y: 0 };

      const { svg } = await mermaid.render("generatedDiagram", code);
      diagramRef.current.innerHTML = svg;

      // Restore zoom and pan with error handling
      setTimeout(() => {
        try {
          if (panzoomRef.current) {
            panzoomRef.current.zoom(currentZoom);
            panzoomRef.current.pan(currentPan.x, currentPan.y);
          }
        } catch (err) {
          console.warn("Failed to restore zoom/pan:", err);
        }
      }, 100);

      clearError();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      diagramRef.current.innerHTML = `
        <div style="color: red; padding: 20px; text-align: center; font-family: monospace;">
          <p><strong>Error rendering diagram:</strong></p>
          <p>${errorMessage}</p>
          <p style="margin-top: 10px; font-size: 0.9em;">Please check your Mermaid syntax</p>
        </div>
      `;
      showError("render", `Diagram rendering failed: ${errorMessage}`);
      console.error("Render error:", error);
    } finally {
      setLoading(false);
    }
  }, [code, showError, clearError]);

  // Code change handler with error handling
  const handleCodeChange = useCallback(
    (value: string) => {
      try {
        setCode(value);
        localStorage.setItem("mermaid_code", value);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
          setHistory((prev) => [...prev, value]);
          setRedoStack([]);
        }, 500);
      } catch (err) {
        console.error("Failed to save code:", err);
        showError("render", "Failed to save changes");
      }
    },
    [setCode, showError]
  );

  // Undo functionality
  const handleUndo = useCallback(() => {
    try {
      if (history.length > 1) {
        setRedoStack((prevRedo) => [history[history.length - 1], ...prevRedo]);
        setHistory((prevHistory) => {
          const newHistory = prevHistory.slice(0, -1);
          const newCode = newHistory[newHistory.length - 1];
          setCode(newCode);
          localStorage.setItem("mermaid_code", newCode);
          return newHistory;
        });
      }
    } catch (err) {
      console.error("Undo failed:", err);
      showError("render", "Undo operation failed");
    }
  }, [history, setCode, showError]);

  // Redo functionality
  const handleRedo = useCallback(() => {
    try {
      if (redoStack.length > 0) {
        const nextCode = redoStack[0];
        setHistory((prevHistory) => [...prevHistory, nextCode]);
        setCode(nextCode);
        localStorage.setItem("mermaid_code", nextCode);
        setRedoStack((prevRedo) => prevRedo.slice(1));
      }
    } catch (err) {
      console.error("Redo failed:", err);
      showError("render", "Redo operation failed");
    }
  }, [redoStack, setCode, showError]);

  // Download SVG with comprehensive error handling
  const handleDownloadSVG = useCallback(async () => {
    try {
      if (!diagramRef.current) {
        throw new Error("No diagram container found");
      }

      const svgElement = diagramRef.current.querySelector("svg");
      if (!svgElement) {
        throw new Error(
          "No valid diagram to download. Please ensure your diagram renders correctly."
        );
      }

      setIsDownloading(true);

      const svgContent = new XMLSerializer().serializeToString(svgElement);
      if (!svgContent || svgContent.length < 100) {
        throw new Error("Generated SVG appears to be invalid or empty");
      }

      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportSVGName || "diagram"}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown download error";
      console.error("Download failed:", err);
      showError("download", errorMessage);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  }, [exportSVGName, showError]);

  // API call wrapper with proper error handling
  const makeApiCall = useCallback(
    async (
      endpoint: string,
      body: object,
      errorContext: string
    ): Promise<ApiResponse> => {
      try {
        if (!BACKEND_URL) {
          throw new Error("Backend URL is not configured");
        }

        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP ${response.status}: ${errorText || response.statusText}`
          );
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown API error";
        console.error(`${errorContext} failed:`, err);
        showError("api", `${errorContext} failed: ${errorMessage}`);
        throw err;
      }
    },
    [showError]
  );

  // Generate AI diagram with error handling
  const generateAIDiagram = useCallback(async () => {
    if (!prompt.trim()) {
      showError("api", "Please enter a prompt to generate a diagram");
      return;
    }

    try {
      setIsAIGeneratingDiagram(true);

      const data = await makeApiCall(
        "/diagram/generate",
        { prompt, model },
        "Diagram generation"
      );

      if (data.chat) {
        setChat(data.chat);

        if (data.title) {
          setExportSVGName(data.title);
        }
      } else {
        throw new Error("No diagram code was generated by the AI");
      }
    } catch (err) {
      // Error already handled in makeApiCall
    } finally {
      setIsAIGeneratingDiagram(false);
    }
  }, [prompt, model, makeApiCall, setChat]);

  // Enhance diagram with error handling
  const enhanceTheDiagram = useCallback(async () => {
    if (!prompt.trim()) {
      showError("api", "Please enter instructions to enhance the diagram");
      return;
    }

    if (!code.trim()) {
      showError("api", "No diagram code found to enhance");
      return;
    }

    try {
      setIsAIGeneratingDiagram(true);

      const data = await makeApiCall(
        "/diagram/enhance",
        { diagram: code, chat, prompt, model },
        "Diagram enhancement"
      );

      if (data.chat) {
        setChat(data.chat);
      } else {
        throw new Error("No enhanced diagram was generated");
      }
    } catch (err) {
      // Error already handled in makeApiCall
    } finally {
      setIsAIGeneratingDiagram(false);
    }
  }, [prompt, code, chat, model, makeApiCall, setChat]);

  // Generate AI title with error handling
  const generateAItitleWithDiagrams = useCallback(async () => {
    if (!code.trim()) {
      showError("api", "No diagram found to generate title from");
      return;
    }

    try {
      setIsAIGeneratingTitle(true);

      const data = await makeApiCall(
        "/title/generate",
        { diagram: code, model },
        "Title generation"
      );

      if (data.title) {
        setExportSVGName(data.title);
      } else {
        throw new Error("No title was generated");
      }
    } catch (err) {
      // Error already handled in makeApiCall
    } finally {
      setIsAIGeneratingTitle(false);
    }
  }, [code, model, makeApiCall]);

  // Combined edit or generate function
  const editOrGenerateWithAI = useCallback(async () => {
    try {
      if (mode === "new") {
        await generateAIDiagram();
      } else {
        await enhanceTheDiagram();
      }
    } catch (err) {
      console.error("AI operation failed:", err);
    }
  }, [mode, generateAIDiagram, enhanceTheDiagram]);

  // Error notification component
  const ErrorNotification = () => {
    if (!error.type) return null;

    return (
      <div className="fixed top-4 right-4 z-50 max-w-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-start">
            <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error.message}</p>
            </div>
            <button
              onClick={clearError}
              className="ml-2 text-red-700 hover:text-red-900"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-4 p-4 items-start relative">
      <ErrorNotification />

      {/* Side bar */}
      <div>
        <div className="rounded-lg bg-slate-100 p-2 flex flex-col items-center my-5">
          <p className="font-black my-2">{"</>"}</p>

          <button
            className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1"
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            title="Toggle Code Editor"
          >
            <Bug size={16} color="#ffffff" />
          </button>

          <button
            className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1"
            onClick={() => setIsChatOpen(!isChatOpen)}
            title="Toggle AI Chat"
          >
            <Bot size={16} color="#ffffff" />
          </button>
        </div>

        <div className="rounded-lg bg-slate-100 p-2 flex flex-col items-center my-5">
          <p className="font-black my-2">
            <Image size={16} color="#000" />
          </p>

          <button
            className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1"
            onClick={() => setIsDownloadModalOpen(true)}
            title="Download Diagram"
          >
            <ArrowDownToLine size={16} color="#ffffff" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full p-4 rounded-lg bg-dot-grid bg-dot-grid-size overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dot-grid bg-dot-grid-size z-10">
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
        <div className="absolute bottom-4 right-4 flex flex-col items-center space-y-2 p-2 rounded-lg">
          <div className="flex space-x-2">
            <button
              className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
              onClick={() => {
                try {
                  panzoomRef.current?.zoomIn();
                } catch (err) {
                  console.warn("Zoom in failed:", err);
                }
              }}
              title="Zoom In"
            >
              +
            </button>
            <button
              className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
              onClick={() => {
                try {
                  panzoomRef.current?.zoomOut();
                } catch (err) {
                  console.warn("Zoom out failed:", err);
                }
              }}
              title="Zoom Out"
            >
              -
            </button>
          </div>
        </div>

        {/* Chat Box */}
        {isChatOpen && (
          <div className="absolute bottom-4 justify-center flex flex-col items-center space-y-2 p-2 rounded-lg right-4">
            <div className="flex space-x-2">
              <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-md">
                <div className="z-10 drag-handle cursor-move">
                  <p className="text-lg font-black mb-2 flex items-center gap-2">
                    Dmaid AI
                  </p>
                  <button
                    className="absolute top-2 right-2 bg-black rounded px-4 py-2 my-1 m-0.5 hover:bg-gray-800 transition-colors"
                    onClick={() => setIsChatOpen(false)}
                    title="Close Chat"
                  >
                    <X size={20} color="#fff" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col">
                    {chat && (
                      <div className="max-w-full sm:max-w-md max-h-[400px] overflow-y-auto p-4 rounded-lg">
                        <Markdown markdownString={chat} />
                      </div>
                    )}

                    {/* Prompt input */}
                    <div className="flex items-center">
                      <textarea
                        value={prompt}
                        className="border p-2 m-1 rounded w-full resize-none"
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Create a client-server architecture with database and middlewares"
                        rows={3}
                        maxLength={1000}
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap gap-1">
                      {/* Model Selection */}
                      <select
                        name="model"
                        className="bg-gradient-to-r from-pink-100 via-blue-100 to-green-100 text-black rounded-full font-bold flex-1 min-w-[150px] p-2 text-sm transition-all duration-300"
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

                      {/* Mode selection */}
                      <select
                        name="edit/new"
                        className="bg-black text-white rounded-md font-bold p-2 text-sm transition-all duration-300"
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                      >
                        <option value="new">New</option>
                        <option value="edit">Edit</option>
                      </select>

                      {/* Generate button */}
                      <button
                        className={`bg-black text-white px-4 py-2 rounded font-black text-sm flex items-center justify-center transition-all duration-200 ${
                          isAIGeneratingDiagram || !prompt.trim()
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-800"
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
                    <div className="text-[10px] text-gray-500 text-center w-full">
                      (Note: Dmaid can do mistakes. Please review and edit as necessary.)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code editor */}
        {isEditorOpen && (
          <div>
            <div className="absolute top-4 justify-center flex flex-col items-center space-y-2 p-2 rounded-lg bg-white h-[400px] w-[460px] shadow-lg">
              <div className="drag-handle cursor-move w-full">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex">
                    <button
                      disabled={history.length <= 1}
                      className={`bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 transition-all duration-200 ${
                        history.length > 1
                          ? "hover:bg-gray-800"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      onClick={handleUndo}
                      title="Undo"
                    >
                      <Undo size={16} color="#ffffff" />
                    </button>

                    <button
                      disabled={redoStack.length === 0}
                      className={`bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 transition-all duration-200 ${
                        redoStack.length > 0
                          ? "hover:bg-gray-800"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      onClick={handleRedo}
                      title="Redo"
                    >
                      <Redo size={16} color="#ffffff" />
                    </button>

                    <button
                      className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 hover:bg-gray-800 transition-all duration-200"
                      onClick={copyToClipboard}
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
                    className="bg-black rounded px-4 py-2 hover:bg-gray-800 transition-colors"
                    onClick={() => setIsEditorOpen(false)}
                    title="Close Editor"
                  >
                    <X size={20} color="#fff" />
                  </button>
                </div>
              </div>

              <CodeMirror
                value={code}
                height="335px"
                width="450px"
                className="rounded-lg border border-gray-300"
                extensions={[
                  mermaidLang(),
                  syntaxHighlighting(myHighlightStyle),
                  foldByIndent(),
                ]}
                theme={basicLight}
                onChange={handleCodeChange}
              />
            </div>

            <div className="absolute bottom-1 border border-gray-300 bg-white w-[600px] h-[200px] p-2 overflow-y-auto rounded-lg">
              <div className="flex flex-wrap gap-2">
                <ExampleList />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-2xl max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 bg-black rounded hover:bg-gray-800 transition-colors"
              onClick={() => setIsDownloadModalOpen(false)}
              title="Close"
            >
              <X size={20} color="#fff" />
            </button>

            <h2 className="text-xl mb-4 font-black">Export Diagram</h2>

            <div className="flex flex-col gap-4">
              {/* File name input */}
              <div className="flex items-center gap-2">
                <label className="font-black text-sm min-w-[50px]">Name:</label>
                <input
                  type="text"
                  onChange={(e) => setExportSVGName(e.target.value)}
                  className="p-2 flex-1 border rounded"
                  value={exportSVGName}
                  placeholder="Enter filename"
                  maxLength={100}
                />
                <button
                  className={`bg-black text-white px-3 py-2 rounded font-black text-sm flex items-center transition-all duration-200 ${
                    isAIGeneratingTitle || !code.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-800"
                  }`}
                  onClick={generateAItitleWithDiagrams}
                  disabled={isAIGeneratingTitle || !code.trim()}
                  title={
                    !code.trim()
                      ? "No diagram to generate title from"
                      : "Generate title with AI"
                  }
                >
                  {isAIGeneratingTitle ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Sparkles size={16} color="#ffffff" />
                  )}
                </button>
              </div>

              {/* Preview */}
              <div className="border mt-4 rounded-lg overflow-auto max-h-60 w-full bg-gray-50">
                <div
                  className="overflow-auto max-h-60 p-4"
                  style={{ whiteSpace: "nowrap" }}
                  dangerouslySetInnerHTML={{
                    __html:
                      diagramRef.current?.innerHTML ||
                      "<p style='color: gray; text-align: center; padding: 40px;'>No diagram available for preview</p>",
                  }}
                />
              </div>

              {/* Download button */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Export as SVG format
                </span>
                <button
                  className={`bg-black text-white px-6 py-2 rounded font-black text-sm flex items-center transition-all duration-200 ${
                    isDownloading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-800"
                  }`}
                  onClick={handleDownloadSVG}
                  disabled={isDownloading}
                  title="Download SVG file"
                >
                  {isDownloading ? (
                    <div className="flex items-center">
                      <span className="animate-spin mr-2">⏳</span>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-md">
            <button
              className="absolute top-2 right-2 bg-black rounded hover:bg-gray-800 transition-colors"
              onClick={() => setIsSettingsModalOpen(false)}
              title="Close"
            >
              <X size={20} color="#fff" />
            </button>

            <h2 className="text-xl mb-4 font-black">Access Control Settings</h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold">Access Type</label>
                <div className="flex gap-2">
                  <button className="bg-black opacity-50 rounded text-white text-sm p-2 flex-1 flex justify-center items-center cursor-not-allowed">
                    Private <Lock size={16} color="#ffffff" className="ml-1" />
                  </button>
                  <button className="bg-black rounded text-white text-sm p-2 flex-1 flex justify-center items-center hover:bg-gray-800 transition-colors">
                    Public <User size={16} color="#ffffff" className="ml-1" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold">Owner Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={owner}
                    className="border p-2 rounded flex-1"
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Enter owner email"
                    maxLength={100}
                  />
                  <button
                    className="bg-black text-white rounded text-sm p-2 hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      try {
                        // Add save logic here
                        console.log("Saving owner:", owner);
                        showError(null, "Settings saved successfully!");
                      } catch (err) {
                        showError("api", "Failed to save settings");
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold">Share URL</label>
                <div className="flex gap-2">
                  <div className="bg-gray-100 rounded text-gray-700 text-sm p-2 flex-1 font-mono break-all">
                    {window.location.href}
                  </div>
                  <button
                    className="bg-black text-white rounded text-sm p-2 hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(window.location.href);
                        // You could add a temporary success state here
                      } catch (err) {
                        showError("clipboard", "Failed to copy URL");
                      }
                    }}
                    title="Copy URL"
                  >
                    <Copy size={16} color="#ffffff" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MermaidEditor;
