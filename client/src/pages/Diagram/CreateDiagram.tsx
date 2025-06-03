import { useState, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { basicLight } from "@uiw/codemirror-theme-basic";
import { foldByIndent, mermaid as mermaidLang } from "codemirror-lang-mermaid";
import { syntaxHighlighting } from "@codemirror/language";
import { examples } from "./examples";

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
  // Users,
  X,
} from "lucide-react";
import { default_code } from "./default_mermaid_code";
import { v4 as uuidv4 } from "uuid";
import { BACKEND_URL } from "../../config";
import Markdown from "../../components/Markdown";
import { useRecoilState } from "recoil";
import { chatState, codeState } from "../../store/atoms";
import { myHighlightStyle } from "./theme";

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

  // Modals
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isAIGeneratingDiagram, setIsAIGeneratingDiagram] = useState(false);
  const [isAIGeneratingTitle, setIsAIGeneratingTitle] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const panzoomRef = useRef<any>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const models = [
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

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });

    if (containerRef.current && !panzoomRef.current) {
      panzoomRef.current = Panzoom(containerRef.current, {
        maxScale: 10,
        minScale: 0.1,
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
    }, 10);

    return () => clearTimeout(timerRef.current as NodeJS.Timeout);
  }, [code]);

  useEffect(() => {
    const savedCode = localStorage.getItem("mermaid_code");
    if (savedCode) {
      setCode(savedCode);
      setHistory([savedCode]);
    }

    const chatCode = localStorage.getItem("chat");
    if (chatCode) {
      setChat(chatCode);
    }
  }, []);

  // [CORE] function to copy code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000); // reset after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy!", err);
      });
  };

  // [CORE] function to render the diagram
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
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  // [CORE] Code change Handeler
  const handleCodeChange = (value: string) => {
    setCode(value);
    localStorage.setItem("mermaid_code", value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setHistory((prev) => [...prev, value]);
      setRedoStack([]); // Clear redo stack on new change
    }, 500);
  };

  // [CORE] function to handel undo
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

  // [CORE] function to handel redo
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

  // [CORE] function to download the image in SVG format
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

  // [AI] function to generate the code using AI
  const generateAIDiagram = async () => {
    try {
      setIsAIGeneratingDiagram(true);

      const response = await fetch(BACKEND_URL + "/diagram/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, model: model }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI diagram");
      }

      const data = await response.json();
      if (data.chat) {
        setChat(data.chat);
        localStorage.setItem("chat", data.chat);
        setExportSVGName(data.title);
      } else {
        alert("No diagram code was generated.");
      }
    } catch (error) {
      console.error("Error generating AI diagram:", error);
      alert("An error occurred while generating the diagram.");
    } finally {
      setIsAIGeneratingDiagram(false);
    }
  };

  // [AI] function to edit/enhance code using AI
  const enhanceTheDiagram = async () => {
    try {
      setIsAIGeneratingDiagram(true);
      const response = await fetch(BACKEND_URL + "/diagram/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diagram: code,
          chat: chat,
          prompt: prompt,
          model: model,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI diagram");
      }

      const data = await response.json();
      if (data.chat) {
        setChat(data.chat);
      } else {
        alert("No text code was generated.");
      }
    } catch (error) {
      console.error("Error generating AI title:", error);
      alert("An error occurred while generating the title.");
    } finally {
      setIsAIGeneratingDiagram(false);
    }
  };

  // [AI] function to generate title from the diagram
  const generateAItitleWithDiagrams = async () => {
    try {
      setIsAIGeneratingTitle(true);
      const response = await fetch(BACKEND_URL + "/title/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ diagram: code, model: model }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI diagram");
      }

      const data = await response.json();
      if (data.title) {
        setExportSVGName(data.title);
      } else {
        alert("No text code was generated.");
      }
    } catch (error) {
      console.error("Error generating AI title:", error);
      alert("An error occurred while generating the title.");
    } finally {
      setIsAIGeneratingTitle(false);
    }
  };

  // [CORE] function to switch b/w edit generate code using AI
  const editOrGenerateWithAI = async () => {
    console.log(mode);

    if (mode == "new") {
      generateAIDiagram();
    } else {
      enhanceTheDiagram();
    }
  };

  // [CORE] function to import a diagram from upload and render over the canvas

  return (
    <div className="flex gap-4 p-4 items-start relative">
      {/* Side bar */}
      <div>
        <div className="rounded-lg bg-slate-100 p-2 flex flex-col items-center my-5">
          <p className=" font-black my-2">{"</>"}</p>

          <button
            className={`bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1}`}
            onClick={() => {
              setIsEditorOpen(!isEditorOpen);
            }}
          >
            <Bug size={16} color="#ffffff" />
          </button>

          <button
            className={`bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1}`}
            onClick={() => {
              setIsChatOpen(!isChatOpen);
            }}
          >
            <Bot size={16} color="#ffffff" />
          </button>

          {/* <button
            className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1"
            onClick={() => setIsSettingsModalOpen(true)}
          >
            <Users size={16} color="#ffffff" />
          </button> */}
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

      {/* Canvas */}
      <div className="w-full p-4 rounded-lg bg-dot-grid bg-dot-grid-size overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dot-grid bg-dot-grid-size">
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

        {/* Chat Box */}
        {isChatOpen && (
          <div className="absolute bottom-4 justify-center flex flex-col items-center space-y-2  p-2 rounded-lg right-4">
            <div className="flex space-x-2">
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <div className="">
                  <button
                    className="absolute top-2 right-2 bg-black rounded px-4 py-2 my-1 m-0.5"
                    onClick={() => setIsChatOpen(false)}
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

                    {/* prompt input */}
                    <div className="flex items-center">
                      <textarea
                        name=""
                        id="prompt_to_generate_with_ai"
                        value={prompt}
                        className="border p-2 m-1 rounded w-full"
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Create a client Server Architecture with Database and Middlewares"
                      />
                    </div>

                    {/* meta data with prompt */}
                    <div className="flex">
                      {/* Model Selection */}
                      <select
                        name="model"
                        className="bg-gradient-to-r from-pink-100 via-blue-100 to-green-100 text-black rounded-full font-bold m-0.5 my-1 flex items-center justify-center border text-sm w-56 p-2 transition-all duration-300"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      >
                        {models.map((model) => (
                          <option key={model.name} value={model.model}>
                            {model.name}
                          </option>
                        ))}
                      </select>

                      {/* Mode selection */}
                      <select
                        name="edit/new"
                        className="bg-black text-white rounded-md font-bold m-0.5 my-1 flex items-center justify-center border text-sm  p-2 transition-all duration-300"
                        onChange={(e) => setMode(e.target.value)}
                      >
                        <option key={"new"} value={"new"}>
                          New
                        </option>
                        <option key={"edit"} value={"edit"}>
                          Editing
                        </option>
                      </select>

                      {/* generate button */}
                      <button
                        className={`bg-black text-white px-4 py-2 rounded font-black text-sm m-0.5 my-1 flex items-center justify-center ${
                          isAIGeneratingDiagram
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={editOrGenerateWithAI}
                        disabled={isAIGeneratingDiagram}
                      >
                        {isAIGeneratingDiagram ? (
                          <div className="flex items-center justify-center">
                            <span className="animate-spin mr-2">⏳</span>{" "}
                            Generating...
                          </div>
                        ) : (
                          <>
                            Generate{" "}
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
              </div>
            </div>
          </div>
        )}

        {/* code editor */}
        {isEditorOpen && (
          <div>
            <div className="absolute top-4 justify-center flex flex-col items-center space-y-2 p-2 rounded-lg  bg-white h-[450px] w-[460px] shadow-lg">
              <div className="drag-handle cursor-move">
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
                  onClick={copyToClipboard}
                >
                  {copiedToClipboard ? (
                    <Check size={16} color="#ffffff" />
                  ) : (
                    <Copy size={16} color="#ffffff" />
                  )}
                </button>

                <button
                  className="absolute top-2 right-2 bg-black rounded px-4 py-2 my-1 m-0.5"
                  onClick={() => setIsEditorOpen(false)}
                >
                  <X size={20} color="#fff" />
                </button>
              </div>
              <CodeMirror
                value={code}
                height="385px"
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
            <div className="absolute bottom-1 border border-gray-300 bg-white w-[460px] h-[150px] p-2 scroll-y overflow-y-auto rounded-lg">
              <h2 className="text-lg font-black mb-2">Quick Examples</h2>

              <div>
                {examples.map((example) => (
                  <button
                    key={example.id}
                    onClick={() => handleCodeChange(example.code)}
                    className="bg-pink-200 text-sm px-4 py-2 rounded m-1 hover:bg-blue-300 transition-colors"
                  >
                    {example.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
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
                <button
                  className={`bg-black text-white px-4 py-2 rounded font-black text-sm ml-1 mr-1 flex items-center ${
                    isAIGeneratingTitle ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={generateAItitleWithDiagrams}
                  disabled={isAIGeneratingTitle}
                >
                  {isAIGeneratingTitle ? (
                    <div className="flex items-center">
                      <span className="animate-spin">⏳</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles size={16} color="#ffffff" className="" />
                    </>
                  )}
                </button>
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
    </div>
  );
};

export default MermaidEditor;
