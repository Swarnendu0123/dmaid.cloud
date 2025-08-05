import { Bug, Bot, Edit, ArrowDownToLine, Image } from "lucide-react";

const Sidebar = ({
  isMovableEditorOpen,
  setIsMovableEditorOpen,
  isMovableExampleOpen,
  setIsMovableExampleOpen,
  isChatOpen,
  setIsChatOpen,
  isCanvasEditMode,
  setIsCanvasEditMode,
  setIsEmbedModalOpen,
}: {
  isMovableEditorOpen: boolean;
  setIsMovableEditorOpen: (value: boolean) => void;
  isMovableExampleOpen: boolean;
  setIsMovableExampleOpen: (value: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (value: boolean) => void;
  isCanvasEditMode: boolean;
  setIsCanvasEditMode: (value: boolean) => void;
  setIsEmbedModalOpen: (value: boolean) => void;
}) => {
  const SidebarButton = ({
    onClick,
    title,
    children,
    className = "",
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <button
      className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );

  // Add this button in your sidebar:
  <SidebarButton
    onClick={() => setIsEmbedModalOpen(true)}
    title="Generate Embed Code for Blogs/Websites"
    className="bg-purple-50 hover:bg-purple-100"
  >
    📋
  </SidebarButton>;
  return (
    <div>
      <div className="rounded-lg bg-slate-100 dark:bg-[#232326] p-2 flex flex-col items-center my-5">
        <p className="font-black my-2 text-gray-900 dark:text-[#e5e7eb]">
          {"</>"}
        </p>

        <button
          className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
          onClick={() => setIsMovableEditorOpen(!isMovableEditorOpen)}
          title="Toggle Code Editor"
        >
          <Bug size={16} color="#ffffff" />
        </button>

        <button
          className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
          onClick={() => setIsMovableExampleOpen(!isMovableExampleOpen)}
          title="Toggle Code Editor"
        >
          <Image size={16} color="#ffffff" />
        </button>

        <button
          className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
          onClick={() => setIsChatOpen(!isChatOpen)}
          title="Toggle AI Chat"
        >
          <Bot size={16} color="#ffffff" />
        </button>

        <button
          className={`px-4 py-2 rounded font-extrabold m-0.5 my-1 transition-all duration-200 ${
            isCanvasEditMode
              ? "bg-blue-600 text-white dark:bg-blue-700"
              : "bg-black text-white hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
          }`}
          onClick={() => setIsCanvasEditMode(!isCanvasEditMode)}
          title="Toggle Canvas Edit Mode"
        >
          <Edit size={16} color="#ffffff" />
        </button>

        <button
          className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
          onClick={() => setIsEmbedModalOpen(true)}
          title="Generate Embed Code"
        >
          <ArrowDownToLine size={16} color="#ffffff" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
