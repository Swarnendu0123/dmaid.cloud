import { Bug, Bot, Edit, Image, ArrowDownToLine } from "lucide-react";

const Sidebar = ({
  isEditorOpen,
  setIsEditorOpen,
  isChatOpen,
  setIsChatOpen,
  isCanvasEditMode,
  setIsCanvasEditMode,
  setIsDownloadModalOpen,
}: {
  isEditorOpen: boolean;
  setIsEditorOpen: (value: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (value: boolean) => void;
  isCanvasEditMode: boolean;
  setIsCanvasEditMode: (value: boolean) => void;
  setIsDownloadModalOpen: (value: boolean) => void;
}) => {
  return (
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

        <button
          className={`px-4 py-2 rounded font-extrabold m-0.5 my-1 transition-all duration-200 ${
            isCanvasEditMode
              ? "bg-blue-600 text-white"
              : "bg-black text-white hover:bg-gray-800"
          }`}
          onClick={() => setIsCanvasEditMode(!isCanvasEditMode)}
          title="Toggle Canvas Edit Mode"
        >
          <Edit size={16} color="#ffffff" />
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
  );
};

export default Sidebar;
