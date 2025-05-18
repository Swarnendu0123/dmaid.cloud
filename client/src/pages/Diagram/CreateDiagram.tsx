import { useState, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import mermaid from "mermaid";
import Panzoom from "@panzoom/panzoom";
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { auth } from "../../components/auth/firebase.config";
import {User as UserType} from "firebase/auth";
import {
  ArrowDownToLine,
  Bug,
  Copy,
  Lock,
  Redo,
  Sparkles,
  Undo,
  User,
  Users,
  X,
} from "lucide-react";
import { default_code } from "./default_mermaid_code";
import { v4 as uuidv4 } from "uuid";
import { BACKEND_URL } from "../../config";
import AccessControlModal from "./accessControl";



const MermaidEditor = () => {
  const { id, access } = useParams();
  console.log(access)
  // if(access!=='private' && access!=='public'){
  //   return 
  // }
  const [user, setUser] = useState<UserType | null>(null);
  const [code, setCode] = useState(default_code);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([default_code]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [exportSVGName, setExportSVGName] = useState("Dmaid_" + uuidv4());
  const [owner, setOwner] = useState("swarno@admin.dmaid.cloud");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [mode, setMode] = useState("new");

  // Modals
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isAIGeneratingDiagram, setIsAIGeneratingDiagram] = useState(false);
  const [isAIGeneratingTitle, setIsAIGeneratingTitle] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const panzoomRef = useRef<any>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const navigate= useNavigate()
  const models = [
    {
      name: "Llama Versatile 3.3 [70B]",
      description: "Strong in coding and reasoning",
      model: "llama-3.3-70b-versatile",
    },
  ];

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
      });
      return () => unsubscribe();
    }, [user]);


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
      setLoading(true);
      setIsAIGeneratingDiagram(true);

      const response = await fetch(BACKEND_URL + "/v1/diagram/generate", {
        credentials: 'include',  
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
      if (data.diagram) {
        handleCodeChange(data.diagram); // Update the editor with the AI-generated code
        setExportSVGName(data.title);
      } else {
        alert("No diagram code was generated.");
      }
    } catch (error) {
      console.error("Error generating AI diagram:", error);
      alert("An error occurred while generating the diagram.");
    } finally {
      setLoading(false); // Hide loading indicator
      setIsAIGeneratingDiagram(false);
    }
  };

  // [AI] function to edit/enhance code using AI
  const enhanceTheDiagram = async () => {
    try {
      setIsAIGeneratingDiagram(true);
      setLoading(true);
      const response = await fetch(BACKEND_URL + "/v1/diagram/enhance", {
         credentials: 'include',  
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diagram: code,
          prompt: prompt,
          model: model,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI diagram");
      }

      const data = await response.json();
      if (data.diagram) {
        handleCodeChange(data.diagram);
      } else {
        alert("No text code was generated.");
      }
    } catch (error) {
      console.error("Error generating AI title:", error);
      alert("An error occurred while generating the title.");
    } finally {
      setIsAIGeneratingDiagram(false);
      setLoading(false);
    }
  };

  // [AI] function to generate title from the diagram
  const generateAItitleWithDiagrams = async () => {
    try {
      setIsAIGeneratingTitle(true);
      const response = await fetch(BACKEND_URL + "/v1/title/generate", {
        credentials: 'include',  
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

  const handleSaveRequest=async(e:any)=>{
     const response = await fetch(`${BACKEND_URL}/diagrams/`, {
    method: 'POST',
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      diagramName: prompt,
      code: localStorage.getItem("mermaid_code"),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to create diagram:', errorData.error);
    return;
  }
  
  const diagram = await response.json();
  console.log('Diagram created:', diagram);
  navigate(`/diagram/create/${diagram._id}/${diagram.mode}`)
}

useEffect(()=>{
  if(access){
   fetchNewDiagramById().then((e)=>{
   })
  }

},[])


const fetchNewDiagramById=async()=>{
  try {
    const response = await fetch(`${BACKEND_URL}/diagrams/${id}/${access}`, {
      method: 'GET',
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch diagram');
    }
    
    const data = await response.json();
    setPrompt(data.diagram.diagramName)
    setCode(data.diagram.code)
    console.log('Fetched diagram:', data);
    setOwner(data.diagram.ownerEmail)
  } catch (err:any) {
    console.error('Error fetching diagram:', err.message);
    navigate("/")
  }
}
  

  // [CORE] function to import a diagram from upload and render over the canvas


  const openConfig=id && owner===user?.email && isSettingsModalOpen

  return (
    <div className="flex gap-4 p-4 items-start relative">
      {/* Side bar */}
      <div>
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
            className={`bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1}`}
            onClick={() => {
              setIsEditorOpen(!isEditorOpen);
            }}
          >
            <Bug size={16} color="#ffffff" />
          </button>

          <button
            className={` text-white px-4 py-2 rounded font-extrabold m-0.5 my-1 bg-black ${(id && owner===user?.email) ? '' : 'opacity-50 cursor-not-allowed'}`}
            onClick={() => setIsSettingsModalOpen(true)}
          >
            <Users size={16} color="#ffffff" />
          </button>
        </div>

        <div className="rounded-lg bg-slate-100 p-2 flex flex-col items-center my-5">
          <button  className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1"
          onClick={handleSaveRequest}
          >
            Save
          </button>

          <button
            className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1"
            onClick={() => setIsDownloadModalOpen(true)}
          >
            <ArrowDownToLine size={16} color="#ffffff" />
          </button>
        </div>
      </div>

      {/* code editor */}
      {isEditorOpen && (
        <div className="w-full max-w-2xl p-2 bg-gray-900 rounded-lg">
          <CodeMirror
            value={code}
            height="615px"
            extensions={[markdown()]}
            theme="dark"
            onChange={handleCodeChange}
          />
        </div>
      )}

      {/* Canvas */}
      <div className="w-full p-4 rounded-lg bg-slate-100 overflow-hidden relative">
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

        <div className="absolute bottom-4 justify-center flex flex-col items-center space-y-2  p-2 rounded-lg">
          <div className="flex space-x-2">
            <div className="bg-white p-6 rounded-lg shadow-lg relative">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col">
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
       <div>
       {openConfig && (
         <AccessControlModal
           setIsSettingsModalOpen={setIsSettingsModalOpen} 
           projectId={id} 
           ownerEmail={owner}
         />
       )}
     </div>
    </div>
  );
};

export default MermaidEditor;

