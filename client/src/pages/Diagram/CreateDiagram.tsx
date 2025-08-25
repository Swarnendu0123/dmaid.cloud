import { useState, useEffect, useRef, useCallback } from "react";

import mermaid from "mermaid";
import Panzoom from "@panzoom/panzoom";
import {
  ArrowDownToLine,
  Check,
  Copy,
  Lock,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { default_code } from "./default_mermaid_code";
import { v4 as uuidv4 } from "uuid";
import { BACKEND_URL } from "../../config";
import { useRecoilState } from "recoil";
import { chatState, codeState } from "../../store/atoms";
import Sidebar from "../../components/EditorPage/SideBar";
import ErrorNotification from "../../components/EditorPage/ErrorNotification";
import ChatBox from "../../components/EditorPage/ChatBox";
import MovableCodeEditor from "../../components/EditorPage/MovableCodeEditor";
import MovableExampleSection from "../../components/EditorPage/MovableExampleSection";

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

interface DiagramType {
  name: string;
  value: string;
  description: string;
}

const MermaidEditor = () => {
  const [code, setCode] = useRecoilState<string>(codeState);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [chat, setChat] = useRecoilState<string>(chatState);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([default_code]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [imageTitle, setimageTitle] = useState("Dmaid_" + uuidv4());
  const [owner, setOwner] = useState("swarno@admin.dmaid.cloud");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(
    "meta-llama/llama-4-maverick-17b-128e-instruct"
  );
  const [mode, setMode] = useState("new");
  const [diagramType, setDiagramType] = useState("auto");
  const [isCanvasEditMode, setIsCanvasEditMode] = useState(false);
  interface SelectedElement {
    element: HTMLElement;
    type: "text" | "shape";
    index: number;
  }

  const [selectedElement, setSelectedElement] =
    useState<SelectedElement | null>(null);
  const [editableText, setEditableText] = useState("");

  // Error state
  const [error, setError] = useState<ErrorState>({ type: null, message: "" });

  // Modals
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isMovableEditorOpen, setIsMovableEditorOpen] = useState(true);
  const [isMovableExampleOpen, setIsMovableExampleOpen] = useState(true);

  // Loading states
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAIGeneratingDiagram, setIsAIGeneratingDiagram] = useState(false);
  const [isAIGeneratingTitle, setIsAIGeneratingTitle] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const panzoomRef = useRef<any>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Embedding state
  // 1. Add branding state (add to your existing useState declarations)
  const [includeBranding, setIncludeBranding] = useState(true);
  const [brandingPosition, setBrandingPosition] = useState("bottom-right"); // "bottom-right", "bottom-left", "top-right", "top-left"

  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [embedCode, setEmbedCode] = useState("");
  const [embedDescription, setEmbedDescription] = useState("");
  const [embedType, setEmbedType] = useState("download"); // "markdown", "html", "svg"

  const models: Model[] = [
    {
      name: "Llama 4 [17B]",
      description: "",
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
    },
    {
      name: "Llama 3.3 [70B]",
      description: "",
      model: "llama-3.3-70b-versatile",
    },
    {
      name: "DeepSeek R1 [70B]",
      description: "",
      model: "deepseek-r1-distill-llama-70b",
    },
    {
      name: "Kimi K2 [70B]",
      description: "",
      model: "moonshotai/kimi-k2-instruct",
    },
  ];

  const diagramTypes: DiagramType[] = [
    {
      name: "Auto-detect",
      value: "auto",
      description: "AI will automatically choose the best diagram type"
    },
    {
      name: "Flowchart",
      value: "flowchart",
      description: "For processes, workflows, decision trees, system flows"
    },
    {
      name: "Sequence Diagram",
      value: "sequence",
      description: "For interactions between actors over time, API calls, user journeys"
    },
    {
      name: "Class Diagram",
      value: "class",
      description: "For object-oriented structures, database schemas"
    },
    {
      name: "State Diagram",
      value: "state",
      description: "For system states and transitions"
    },
    {
      name: "Entity Relationship",
      value: "er",
      description: "For database relationships and data models"
    },
    {
      name: "Gantt Chart",
      value: "gantt",
      description: "For project timelines and scheduling"
    },
    {
      name: "Pie Chart",
      value: "pie",
      description: "For data distribution and percentages"
    },
    {
      name: "User Journey",
      value: "journey",
      description: "For user experience flows"
    },
    {
      name: "Mindmap",
      value: "mindmap",
      description: "For hierarchical information and brainstorming"
    },
    {
      name: "Timeline",
      value: "timeline",
      description: "For chronological events"
    },
    {
      name: "Git Graph",
      value: "gitgraph",
      description: "For version control workflows and branching strategies"
    },
    {
      name: "C4 Diagram",
      value: "c4",
      description: "For system architecture contexts"
    }
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

  // 2. Add function to make SVG elements editable
  const makeElementsEditable = useCallback(() => {
    if (!diagramRef.current) return;

    const svgElement = diagramRef.current.querySelector("svg");
    if (!svgElement) return;

    // Remove any existing event listeners by cloning elements
    const clonedSvg = svgElement.cloneNode(true);
    if (svgElement.parentNode) {
      svgElement.parentNode.replaceChild(clonedSvg, svgElement);
    }

    if (!isCanvasEditMode) return;

    // Make text elements editable only in edit mode
    const textElements = (clonedSvg as Element).querySelectorAll("text, tspan");
    textElements.forEach((textEl, index) => {
      (textEl as HTMLElement).style.cursor = "pointer";
      textEl.addEventListener("click", (e) => {
        if (!isCanvasEditMode) return; // Double check
        e.stopPropagation();
        setSelectedElement({
          element: textEl as HTMLElement,
          type: "text",
          index,
        });
        setEditableText(textEl.textContent || "");
      });
    });

    // Make shape elements selectable for repositioning only in edit mode
    const shapeElements = (clonedSvg as Element).querySelectorAll(
      "rect, circle, ellipse, polygon, path"
    );
    shapeElements.forEach((shapeEl, index) => {
      (shapeEl as HTMLElement).style.cursor = "move";
      let isDragging = false;
      let startX: number, startY: number, startTransform: string;

      const handleMouseDown = (e: MouseEvent) => {
        if (!isCanvasEditMode) return; // Check edit mode
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const transform = shapeEl.getAttribute("transform") || "";
        startTransform = transform;

        setSelectedElement({
          element: shapeEl as HTMLElement,
          type: "shape",
          index,
        });
      };

      const handleMouseMove = (e: { clientX: number; clientY: number }) => {
        if (!isDragging || !isCanvasEditMode) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newTransform = startTransform;
        if (newTransform.includes("translate")) {
          // Update existing translate
          newTransform = newTransform.replace(
            /translate\([^)]*\)/,
            `translate(${deltaX}, ${deltaY})`
          );
        } else {
          // Add new translate
          newTransform = `translate(${deltaX}, ${deltaY}) ${newTransform}`;
        }

        shapeEl.setAttribute("transform", newTransform);
      };

      const handleMouseUp = () => {
        isDragging = false;
      };

      shapeEl.addEventListener(
        "mousedown",
        handleMouseDown as (e: Event) => void
      );
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    });
  }, [isCanvasEditMode]);

  // 3. Update the renderDiagram function to include editability
  const renderDiagram = useCallback(async () => {
    if (!diagramRef.current) return;

    try {
      // Store zoom and pan state
      const currentZoom = panzoomRef.current?.getScale() || 1;
      const currentPan = panzoomRef.current?.getPan() || { x: 0, y: 0 };

      const { svg } = await mermaid.render("generatedDiagram", code);
      diagramRef.current.innerHTML = svg;

      // Always call makeElementsEditable - it will handle the mode check internally
      setTimeout(() => {
        makeElementsEditable();
      }, 100);

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
  }, [code, showError, clearError, makeElementsEditable]);

  // Add effect to re-apply editability when mode changes
  useEffect(() => {
    makeElementsEditable();
  }, [isCanvasEditMode, makeElementsEditable]);

  // 4. Add function to handle text editing
  const handleTextEdit = useCallback(
    (newText: string | null) => {
      if (!selectedElement || selectedElement.type !== "text") return;

      const textElement = selectedElement.element;
      textElement.textContent = newText;

      // Update the Mermaid code to reflect changes
      // This is a simplified approach - you might need more sophisticated parsing
      const oldText = editableText;
      const newCode = code.replace(oldText, newText || "");
      setCode(newCode);
      localStorage.setItem("mermaid_code", newCode);

      setSelectedElement(null);
      setEditableText("");
    },
    [selectedElement, editableText, code, setCode]
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
      a.download = `${imageTitle || "diagram"}.svg`;
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
  }, [imageTitle, showError]);

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
        { prompt, model, diagramType },
        "Diagram generation"
      );

      if (data.chat) {
        setChat(data.chat);

        if (data.title) {
          setimageTitle(data.title);
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
        { diagram: code, chat, prompt, model, diagramType },
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
        setimageTitle(data.title);
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

  // 2. Create function to add branding to SVG
  const addBrandingToSVG = useCallback(
    (svgContent: string) => {
      if (!includeBranding) return svgContent;

      try {
        // Parse the SVG to add branding
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
        const svgElement = svgDoc.querySelector("svg");

        if (!svgElement) return svgContent;

        // Get SVG dimensions with fallbacks
        const viewBox = svgElement.getAttribute("viewBox");
        const width = svgElement.getAttribute("width") || "800";
        const height = svgElement.getAttribute("height") || "600";

        let svgWidth = parseInt(width) || 800;
        let svgHeight = parseInt(height) || 600;

        // If viewBox exists, use those dimensions
        if (viewBox) {
          const viewBoxValues = viewBox.split(" ");
          svgWidth = parseInt(viewBoxValues[2]) || svgWidth;
          svgHeight = parseInt(viewBoxValues[3]) || svgHeight;
        }

        // Ensure minimum dimensions to prevent overflow
        svgWidth = Math.max(svgWidth, 200);
        svgHeight = Math.max(svgHeight, 100);

        // Create branding group
        const brandingGroup = svgDoc.createElementNS(
          "http://www.w3.org/2000/svg",
          "g"
        );
        brandingGroup.setAttribute("class", "dmaid-branding");

        // Calculate position based on brandingPosition with responsive padding
        let x, y, textAnchor;
        const padding = Math.max(10, Math.min(svgWidth * 0.02, 20)); // Responsive padding between 10-20px
        const fontSize = Math.max(8, Math.min(svgWidth * 0.015, 12)); // Responsive font size between 8-12px
        const textWidth = fontSize * 12; // Approximate text width
        const textHeight = fontSize + 4;

        switch (brandingPosition) {
          case "bottom-right":
            x = svgWidth - padding;
            y = svgHeight - padding;
            textAnchor = "end";
            break;
          case "bottom-left":
            x = padding;
            y = svgHeight - padding;
            textAnchor = "start";
            break;
          case "top-right":
            x = svgWidth - padding;
            y = padding + textHeight;
            textAnchor = "end";
            break;
          case "top-left":
            x = padding;
            y = padding + textHeight;
            textAnchor = "start";
            break;
          default:
            x = svgWidth - padding;
            y = svgHeight - padding;
            textAnchor = "end";
        }

        // Ensure text doesn't go outside bounds
        if (textAnchor === "start") {
          x = Math.max(padding, x);
          x = Math.min(svgWidth - textWidth - padding, x);
        } else {
          x = Math.min(svgWidth - padding, x);
          x = Math.max(textWidth + padding, x);
        }

        y = Math.max(textHeight + padding, y);
        y = Math.min(svgHeight - padding, y);

        // Create background rectangle for better visibility with responsive dimensions
        const bgRect = svgDoc.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        const bgWidth = textWidth + 10;
        const bgHeight = textHeight + 4;
        const bgX = textAnchor === "end" ? x - bgWidth : x - 5;
        const bgY = y - textHeight;

        bgRect.setAttribute("x", Math.max(0, bgX).toString());
        bgRect.setAttribute("y", Math.max(0, bgY).toString());
        bgRect.setAttribute(
          "width",
          Math.min(bgWidth, svgWidth - Math.max(0, bgX)).toString()
        );
        bgRect.setAttribute(
          "height",
          Math.min(bgHeight, svgHeight - Math.max(0, bgY)).toString()
        );
        bgRect.setAttribute("fill", "rgba(255, 255, 255, 0.9)");
        bgRect.setAttribute("stroke", "rgba(0, 0, 0, 0.1)");
        bgRect.setAttribute("stroke-width", "1");
        bgRect.setAttribute("rx", "3");

        // Create the branding text with responsive font size
        const brandingText = svgDoc.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        brandingText.setAttribute("x", x.toString());
        brandingText.setAttribute("y", y.toString());
        brandingText.setAttribute("font-family", "Arial, sans-serif");
        brandingText.setAttribute("font-size", fontSize.toString());
        brandingText.setAttribute("fill", "#666");
        brandingText.setAttribute("text-anchor", textAnchor);
        brandingText.textContent = "Created with dmaid.cloud";

        // Create clickable link
        const linkElement = svgDoc.createElementNS(
          "http://www.w3.org/1999/xlink",
          "a"
        );
        linkElement.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          "https://dmaid.cloud"
        );
        linkElement.setAttribute("target", "_blank");
        linkElement.setAttribute(
          "title",
          "Create your own diagrams at dmaid.cloud"
        );

        // Assemble the branding
        linkElement.appendChild(bgRect);
        linkElement.appendChild(brandingText);
        brandingGroup.appendChild(linkElement);

        // Add branding to SVG
        svgElement.appendChild(brandingGroup);

        // Return the modified SVG
        return new XMLSerializer().serializeToString(svgElement);
      } catch (err) {
        console.warn("Failed to add branding:", err);
        return svgContent; // Return original if branding fails
      }
    },
    [includeBranding, brandingPosition]
  );

  // Fixed generateEmbedCode function - removed 'code' from dependencies
  const generateEmbedCode = useCallback(async () => {
    try {
      if (!diagramRef.current) {
        throw new Error("No diagram available");
      }

      const svgElement = diagramRef.current.querySelector("svg");
      if (!svgElement) {
        throw new Error("No valid diagram found");
      }

      // Skip code generation for download type
      if (embedType === "download") {
        return;
      }

      // Get SVG content and add branding
      const originalSvgContent = new XMLSerializer().serializeToString(
        svgElement
      );
      const brandedSvgContent = addBrandingToSVG(originalSvgContent);

      // Generate different embed formats
      let generatedCode = "";

      switch (embedType) {
        case "markdown":
          generatedCode = `# ${imageTitle || "Diagram"}
  
  ${embedDescription ? `${embedDescription}\n\n` : ""}
  
  ![${
    imageTitle || "Diagram"
  }](data:image/svg+xml;charset=utf-8,${encodeURIComponent(brandedSvgContent)})
  
  ---
  *Created with [dmaid.cloud](https://dmaid.cloud) - Free Mermaid Diagram Editor*`;
          break;

        case "html":
          generatedCode = `<!-- Embeddable HTML -->
  <div class="diagram-embed" style="text-align: center; margin: 20px 0;">
    ${imageTitle ? `<h3>${imageTitle}</h3>` : ""}
    ${embedDescription ? `<p>${embedDescription}</p>` : ""}
    <div style="display: inline-block; border: 1px solid #ddd; padding: 10px; border-radius: 8px;">
      ${brandedSvgContent}
    </div>
    <p style="font-size: 12px; color: #666; margin-top: 10px;">
      Created with <a href="https://dmaid.cloud" target="_blank" style="color: #0066cc;">dmaid.cloud</a>
    </p>
  </div>`;
          break;

        case "svg":
          generatedCode = brandedSvgContent;
          break;

        default:
          generatedCode = brandedSvgContent;
      }

      setEmbedCode(generatedCode);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate embed code";
      showError("api", errorMessage);
    }
  }, [embedType, imageTitle, embedDescription, showError, addBrandingToSVG]);

  // function to generate embed code when type or title changes
  const copyEmbedCode = useCallback(async () => {
    try {
      if (!embedCode) {
        throw new Error("No embed code available");
      }

      await navigator.clipboard.writeText(embedCode);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      showError("clipboard", "Failed to copy embed code");
    }
  }, [embedCode, showError]);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return false;
  });

  useEffect(() => {
    const handler = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("storage", handler);
    const observer = new MutationObserver(handler);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      window.removeEventListener("storage", handler);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex gap-4 p-4 items-start relative">
      <ErrorNotification
        error={{ ...error, type: error.type || "" }}
        clearError={clearError}
      />

      {/* Side bar */}
      <Sidebar
        isMovableEditorOpen={isMovableEditorOpen}
        setIsMovableEditorOpen={setIsMovableEditorOpen}
        isMovableExampleOpen={isMovableExampleOpen}
        setIsMovableExampleOpen={setIsMovableExampleOpen}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        isCanvasEditMode={isCanvasEditMode}
        setIsCanvasEditMode={setIsCanvasEditMode}
        setIsEmbedModalOpen={setIsEmbedModalOpen}
      />

      {/* Canvas */}
      <div className="w-full p-4 rounded-lg bg-dot-grid bg-dot-grid-size overflow-hidden relative">
        {isCanvasEditMode && (
          <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium z-20">
            Canvas Edit Mode Active
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dot-grid bg-dot-grid-size z-10">
            <div className="animate-spin text-gray-600 text-4xl">⟳</div>
          </div>
        )}

        <div
          ref={containerRef}
          className={`p-4 h-[600px] flex justify-center items-center relative ${
            isCanvasEditMode ? "cursor-default" : "cursor-grab"
          }`}
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
        <ChatBox
          chat={chat}
          prompt={prompt}
          setPrompt={setPrompt}
          model={model}
          setModel={setModel}
          mode={mode}
          setMode={setMode}
          diagramType={diagramType}
          setDiagramType={setDiagramType}
          isAIGeneratingDiagram={isAIGeneratingDiagram}
          editOrGenerateWithAI={editOrGenerateWithAI}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
          models={models}
          diagramTypes={diagramTypes}
        />

        <MovableCodeEditor
          code={code}
          setCode={setCode}
          isOpen={isMovableEditorOpen}
          setIsOpen={setIsMovableEditorOpen}
          handleUndo={handleUndo}
          handleRedo={handleRedo}
          handleCopy={copyToClipboard}
          copiedToClipboard={copiedToClipboard}
          history={history}
          redoStack={redoStack}
          isDark={isDark}
        />
        <MovableExampleSection
          isOpen={isMovableExampleOpen}
          setIsOpen={setIsMovableExampleOpen}
        />
      </div>

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

      {/* 6. Add text editing modal (insert after other modals)  */}
      {selectedElement && selectedElement.type === "text" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-md">
            <button
              className="absolute top-2 right-2 bg-black rounded hover:bg-gray-800 transition-colors"
              onClick={() => {
                setSelectedElement(null);
                setEditableText("");
              }}
              title="Close"
            >
              <X size={20} color="#fff" />
            </button>

            <h2 className="text-xl mb-4 font-black">Edit Text</h2>

            <div className="flex flex-col gap-4">
              <textarea
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                className="border p-2 rounded resize-none"
                rows={3}
                placeholder="Enter new text"
              />

              <div className="flex gap-2 justify-end">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                  onClick={() => {
                    setSelectedElement(null);
                    setEditableText("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                  onClick={() => handleTextEdit(editableText)}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embed & Download Modal */}
      {isEmbedModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 dark:bg-[#232326]">
          <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-7xl max-h-[90vh] overflow-y-auto w-full mx-4 dark:bg-[#232326] dark:text-white">
            <button
              className="absolute top-2 right-2 bg-black rounded px-2 py-1 hover:bg-gray-800 transition-colors"
              onClick={() => setIsEmbedModalOpen(false)}
              title="Close"
            >
              <X size={20} color="#fff" />
            </button>

            <h2 className="text-2xl mb-4 font-black">
              Export & Embed Your Diagram
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left side - Configuration */}
              <div className="flex flex-col gap-4">
                {/* Export Type Selection */}
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm">Export Type</label>
                  <div className="flex gap-2">
                    <button
                      className={`px-4 py-2 rounded font-bold text-sm transition-colors ${
                        embedType === "download"
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() => setEmbedType("download")}
                    >
                      Download SVG
                    </button>
                    <button
                      className={`px-4 py-2 rounded font-bold text-sm transition-colors ${
                        embedType === "markdown"
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() => setEmbedType("markdown")}
                    >
                      Markdown
                    </button>
                    <button
                      className={`px-4 py-2 rounded font-bold text-sm transition-colors ${
                        embedType === "html"
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() => setEmbedType("html")}
                    >
                      HTML
                    </button>
                    <button
                      className={`px-4 py-2 rounded font-bold text-sm transition-colors ${
                        embedType === "svg"
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() => setEmbedType("svg")}
                    >
                      SVG Code
                    </button>
                  </div>
                </div>

                {/* File name input */}
                <div className="flex items-center gap-2">
                  <label className="font-bold text-sm min-w-[50px]">
                    Name:
                  </label>
                  <input
                    type="text"
                    onChange={(e) => setimageTitle(e.target.value)}
                    className="p-2 flex-1 border rounded text-black bg-white"
                    value={imageTitle}
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

                {/* Description - only show for embed types */}
                {embedType !== "download" && (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">
                      Description (Optional)
                    </label>
                    <textarea
                      value={embedDescription}
                      onChange={(e) => setEmbedDescription(e.target.value)}
                      className="border p-2 rounded resize-none"
                      rows={3}
                      placeholder="Brief description of the diagram"
                      maxLength={500}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm">Branding</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeBranding"
                      checked={includeBranding}
                      onChange={(e) => setIncludeBranding(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="includeBranding" className="text-sm">
                      Include "Created with dmaid.cloud" watermark (bottom
                      right)
                    </label>
                  </div>
                </div>

                {includeBranding && (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">
                      Branding Position
                    </label>
                    <select
                      value={brandingPosition}
                      onChange={(e) => setBrandingPosition(e.target.value)}
                      className="border p-2 rounded text-black bg-white"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-2">
                  {embedType === "download" ? (
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
                          Download SVG
                          <ArrowDownToLine
                            size={16}
                            color="#ffffff"
                            className="ml-2"
                          />
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        className="bg-gray-600 text-white px-4 py-2 rounded font-bold hover:bg-black transition-colors flex items-center gap-2"
                        onClick={generateEmbedCode}
                        disabled={!code.trim() || loading}
                        title={
                          !code.trim()
                            ? "Please enter a valid Mermaid diagram code"
                            : "Generate embed code"
                        }
                      >
                        Generate Code
                      </button>
                      {embedCode && (
                        <button
                          className="bg-gray-600 text-white px-4 py-2 rounded font-bold hover:bg-black transition-colors flex items-center gap-2"
                          onClick={copyEmbedCode}
                        >
                          {copiedToClipboard ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                          {copiedToClipboard ? "Copied!" : "Copy"}
                        </button>
                      )}
                    </>
                  )}
                </div>

                {embedCode && embedType !== "download" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-blue-700">
                      {embedType === "markdown" && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Copy the compressed code by clicking on the "Copy"
                            Button
                          </li>
                          <li>Paste into your README.md or blog post</li>
                          <li>The SVG will render directly</li>
                        </ul>
                      )}
                      {embedType === "html" && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Copy the compressed code by clicking on the "Copy"
                            Button
                          </li>
                          <li>Paste into your website or blog</li>

                          <li>Optimized for minimal file size</li>
                        </ul>
                      )}
                      {embedType === "svg" && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Copy the compressed SVG code by clicking on the
                            "Copy" Button
                          </li>
                          <li>Use in any application that supports SVG</li>
                          <li>Can be saved as .svg file</li>
                        </ul>
                      )}
                    </div>
                  </div>
                )}
                {embedType === "download" && (
                  <div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-bold mb-2">Ready to Download</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Click the download button above to save your diagram as
                        an SVG file.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - Preview, Code & Information */}
              <div className="flex flex-col gap-4">
                {/* Preview */}
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm">
                    Preview {includeBranding && "(with branding)"}
                  </label>
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] max-h-[300px] overflow-auto">
                    {diagramRef.current?.innerHTML ? (
                      <div className="text-center">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: includeBranding
                              ? addBrandingToSVG(diagramRef.current.innerHTML)
                              : diagramRef.current.innerHTML,
                          }}
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center flex items-center justify-center h-full">
                        No diagram available
                      </p>
                    )}
                  </div>
                </div>

                {/* Generated Code or Download Info */}
                {embedType === "download" ? (
                  <div className="flex flex-col gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-bold text-blue-800 mb-2">
                        Download Information:
                      </h4>
                      <div className="text-sm text-blue-700 space-y-2">
                        <p>
                          <strong>Format:</strong> SVG (Scalable Vector
                          Graphics)
                        </p>
                        <p>
                          <strong>Filename:</strong> {imageTitle || "diagram"}
                          .svg
                        </p>
                        <p>
                          <strong>Features:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>High-quality vector graphics</li>
                          <li>Scalable to any size without quality loss</li>
                          <li>
                            Can be opened in browsers, design tools, or editors
                          </li>
                          <li>Small file size</li>
                          {includeBranding && (
                            <li>Includes dmaid.cloud branding</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-sm">
                        Generated Embed Code (Compressed)
                      </label>
                      <textarea
                        value={
                          embedCode
                            ? embedCode
                                .replace(/\s+/g, " ")
                                .replace(/>\s+</g, "><")
                                .trim()
                            : ""
                        }
                        readOnly
                        className="border p-3 rounded font-mono text-xs resize-none bg-gray-50 h-32 leading-tight dark:text-black"
                        placeholder="Click 'Generate Code' to create compressed embed code"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MermaidEditor;
