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
  Redo,
  Sparkles,
  Undo,
  Users,
  X,
  History as HistoryIcon, // Added for history sidebar toggle
} from "lucide-react";
import { default_code } from "./default_mermaid_code";
import { v4 as uuidv4 } from "uuid";
import { BACKEND_URL } from "../../config";
import AccessControlModal from "./accessControl";

type DiagramData={
code:string,
createdAt: Date,
diagramName: string,
edits:string[],
mode:string,
ownerEmail:string,
updatedAt: Date
views: string[]
__v:number,
_id: string
}



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
  const [previousDiagrams,setPreviousDiagrams] = useState<DiagramData[]>();
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [exportSVGName, setExportSVGName] = useState("Dmaid_" + uuidv4());
  const [owner, setOwner] = useState("");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [privellege, setPrivellege] = useState("")
  const [mode, setMode] = useState("new");

  // Modals
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false); // State for history sidebar

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
    }, []); 


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
     // Cleanup event listener on component unmount
    return () => {
        if (containerRef.current && panzoomRef.current) {
            containerRef.current.removeEventListener("wheel", panzoomRef.current.zoomWithWheel);
        }
    };
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
        const currentZoom = panzoomRef.current?.getScale() || 1;
        const currentPan = panzoomRef.current?.getPan() || { x: 0, y: 0 };

        const { svg } = await mermaid.render("generatedDiagram", code);
        diagramRef.current.innerHTML = svg;

        setTimeout(() => {
          if (panzoomRef.current) {
            panzoomRef.current.zoom(currentZoom); 
            panzoomRef.current.pan(currentPan.x, currentPan.y); 
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
      setRedoStack([]); 
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

      setIsDownloading(true); 

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
        setIsDownloading(false); 
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
        handleCodeChange(data.diagram); 
        setExportSVGName(data.title);
      } else {
        alert("No diagram code was generated.");
      }
    } catch (error) {
      console.error("Error generating AI diagram:", error);
      alert("An error occurred while generating the diagram.");
    } finally {
      setLoading(false); 
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
    if(access){
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
    }else{
  try {
        const response = await fetch(`${BACKEND_URL}/diagrams/${id}`, {
          method: 'PUT',
          credentials: 'include', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            diagramName: prompt,
            code: localStorage.getItem("mermaid_code"),
          })
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update diagram');
        }
        const updatedDiagram = await response.json();
        console.log('Updated Diagram:', updatedDiagram);
      } catch (error) {
        console.error('Update failed:', error);
      }
    }
}

useEffect(()=>{
  if(id && access){ // ensure id and access are present
   fetchNewDiagramById().then(()=>{

   })
  }
  fetchPreviousCreatedDiagrams().then(()=>{

  })
},[id, access]) // Add id and access to dependency array


const fetchNewDiagramById=async()=>{
  if (!id || !access) return; // Guard clause
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
    handleCodeChange(data.diagram.code); 
    console.log('Fetched diagram:', data);
      setPrivellege(data.access)
    setOwner(data.diagram.ownerEmail)
  } catch (err:any) {
    console.error('Error fetching diagram:', err.message);
    navigate("/")
  }
}
  
  const handleHistoryItemClick = (id: string,mode:string) => {
    navigate(`/diagram/create/${id}/${mode}`)
  };

  const fetchPreviousCreatedDiagrams=async()=>{
    try {
    const response = await fetch(`${BACKEND_URL}/diagrams/`, {
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
    console.log(data); 
    setPreviousDiagrams(data)
  } catch (err:any) {
    console.error('Error fetching diagram:', err.message);
  }
  }
  

  const openConfig = id && owner === user?.email && isSettingsModalOpen;

  return (
    <div className="flex gap-4 p-4 items-start relative">
      {/* History Sidebar (Collapsible) */}
      {isHistorySidebarOpen && (
        <div className="w-72 bg-slate-100 p-3 rounded-lg my-5 flex flex-col h-[615px]">
          <div className="flex justify-between items-center mb-3 flex-shrink-0">
            <h3 className="font-bold text-lg text-slate-700">Diagram History</h3>
            <button
              onClick={() => setIsHistorySidebarOpen(false)}
              className="p-1 hover:bg-slate-200 rounded-full"
              title="Close History"
            >
              <X size={20} color="#555555" />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto space-y-2 pr-1">
            {previousDiagrams?.slice().reverse().map((data, index) => {
              const originalIndex = history.length - 1 - index;
              return (
                <div
                  key={`hist-${originalIndex}`}
                  className={`p-2.5 bg-white rounded-md shadow cursor-pointer hover:bg-slate-50 border-l-4 ${'border-blue-500' 
                  }`}
                  onClick={() => handleHistoryItemClick(data._id,data.mode)}
                  title={`Load Version ${originalIndex + 1}`}
                >
                  <p className="text-sm font-medium text-slate-800">
                     {data.diagramName}
                  </p>
                </div>
              );
            })}
            {history.length === 0 && ( // Should ideally not happen due to initialization
                 <p className="text-sm text-gray-500 text-center mt-4">No history available.</p>
            )}
          </div>
        </div>
      )}

      {/* Action Side bar */}
      <div>
        <div className="rounded-lg bg-slate-100 p-2 flex flex-col items-center my-5">
          <p className=" font-black my-2">{"</>"}</p>

          <button
            disabled={history.length <= 1}
            className={`bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1 ${
              history.length > 1 ? "" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={handleUndo}
            title="Undo"
          >
            <Undo size={16} color="#ffffff" />
          </button>

          <button
            disabled={redoStack.length === 0}
            className={`bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1 ${
              redoStack.length > 0 ? "" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={handleRedo}
            title="Redo"
          >
            <Redo size={16} color="#ffffff" />
          </button>

          <button // Toggle History Sidebar Button
            className={`bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1`}
            onClick={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
            title={isHistorySidebarOpen ? "Hide History" : "Show History"}
          >
            <HistoryIcon size={16} color="#ffffff" />
          </button>

          <button
            className={`bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1 ${(privellege==="owner" || privellege==="edit" || !access) ? '' : 'opacity-50 cursor-not-allowed'}`}
            onClick={() => {
              setIsEditorOpen(!isEditorOpen);
            }}
            title={isEditorOpen ? "Close Editor" : "Open Editor"}
          >
            <Bug size={16} color="#ffffff" />
          </button>

          <button
            className={` text-white px-4 py-2 rounded font-extrabold m-0.5 my-1 bg-black ${(id && owner===user?.email) ? '' : 'opacity-50 cursor-not-allowed'}`}
            onClick={() => setIsSettingsModalOpen(true)}
            disabled={!(id && owner===user?.email)}
            title="Access Control"
          >
            <Users size={16} color="#ffffff" />
          </button>
        </div>

        <div className="rounded-lg bg-slate-100 p-2 flex flex-col items-center my-5">
          <button  className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1"
          onClick={handleSaveRequest}
          title="Save Diagram"
          >
            Save
          </button>

          <button
            className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1"
            onClick={() => setIsDownloadModalOpen(true)}
            title="Download Diagram"
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
      <div className="flex-1 w-full p-4 rounded-lg bg-slate-100 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
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
              onClick={() => panzoomRef.current?.zoomIn()}
            >
              +
            </button>
            <button
              className="bg-gray-700 text-white px-3 py-1 rounded"
              onClick={() => panzoomRef.current?.zoomOut()}
            >
              -
            </button>
          </div>
        </div>

        {(privellege==="owner" || privellege==="edit" || !access) && <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 p-2 rounded-lg">
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
                      className="border p-2 m-1 rounded w-full min-w-[300px] sm:min-w-[400px] md:min-w-[500px]"
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Create a client Server Architecture with Database and Middlewares"
                      rows={2}
                    />
                  </div>

                  {/* meta data with prompt */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Model Selection */}
                    <select
                      name="model"
                      className="bg-gradient-to-r from-pink-100 via-blue-100 to-green-100 text-black rounded-full font-bold m-0.5 flex items-center justify-center border text-sm p-2 transition-all duration-300 flex-grow sm:flex-grow-0"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    >
                      {models.map((modelItem) => (
                        <option key={modelItem.name} value={modelItem.model}>
                          {modelItem.name}
                        </option>
                      ))}
                    </select>

                    {/* Mode selection */}
                    <select
                      name="edit/new"
                      className="bg-black text-white rounded-md font-bold m-0.5 flex items-center justify-center border text-sm p-2 transition-all duration-300 flex-grow sm:flex-grow-0"
                      onChange={(e) => setMode(e.target.value)}
                      value={mode}
                    >
                      <option value={"new"}>New</option>
                      <option value={"edit"}>Editing</option>
                    </select>

                    {/* generate button */}
                    <button
                      className={`bg-black text-white px-4 py-2 rounded font-black text-sm m-0.5 flex items-center justify-center flex-grow sm:flex-grow-0 ${
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
        </div>}
      </div>

      {/* Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md">
            <button
              className="absolute top-2 right-2 bg-black rounded-full p-1"
              onClick={() => setIsDownloadModalOpen(false)}
            >
              <X size={20} color="#fff" />
            </button>
            <h2 className="text-xl mb-4 font-black">Export Dmaid</h2>

            <div className="flex flex-col gap-2">
              {/* Input */}
              <div className="rounded-lg overflow-auto w-full flex  items-center ">
                <label htmlFor="exportName" className="pr-2 font-black text-sm whitespace-nowrap">Name</label>
                <input
                  type="text"
                  name="exportName"
                  id="exportName"
                  onChange={(e) => setExportSVGName(e.target.value)}
                  className="p-1 w-full border rounded"
                  value={exportSVGName}
                />
                <button
                  className={`bg-black text-white px-3 py-2 rounded font-black text-sm ml-1 mr-1 flex items-center ${
                    isAIGeneratingTitle ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={generateAItitleWithDiagrams}
                  disabled={isAIGeneratingTitle}
                  title="Generate Name with AI"
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
              <div className="border mt-4 rounded-lg overflow-auto max-h-60 w-full bg-slate-50">
                <div
                  className="overflow-auto max-h-60 p-2 flex justify-center items-center"
                  style={{ whiteSpace: "nowrap" }} 
                  dangerouslySetInnerHTML={{
                    __html:
                      diagramRef.current?.querySelector('svg')?.outerHTML || // Ensure only SVG is rendered
                      "<p class='text-center text-gray-500'>No diagram available for preview</p>",
                  }}
                />
              </div>

              {/* Download text and button */}
              <div className="flex items-center mt-4">
                <p className="text-sm">Export Dmaid (in SVG)</p>
                <button
                  className={`bg-black text-white px-4 py-2 rounded font-black text-sm ml-auto flex items-center ${
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
           projectId={id as string} // id might be undefined, ensure it's string for modal
           ownerEmail={owner}
         />
       )}
     </div>
    </div>
  );
};

export default MermaidEditor;