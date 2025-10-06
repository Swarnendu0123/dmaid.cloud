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
      <div className="rounded-2xl glass-card p-3 flex flex-col items-center my-5 shadow-glossy border border-white/30 dark:border-gray-700/30">
        <p className="font-black my-2 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
          {"</>"}
        </p>

        <button
          className="glass-button px-4 py-2 rounded-lg font-bold m-0.5 my-1 hover:shadow-glow-purple transition-all duration-300"
          onClick={() => setIsMovableEditorOpen(!isMovableEditorOpen)}
          title="Toggle Code Editor"
        >
          <Bug size={16} color="#ffffff" />
        </button>

        <button
          className="glass-button px-4 py-2 rounded-lg font-bold m-0.5 my-1 hover:shadow-glow-purple transition-all duration-300"
          onClick={() => setIsMovableExampleOpen(!isMovableExampleOpen)}
          title="Toggle Examples"
        >
          <Image size={16} color="#ffffff" />
        </button>

        <button
          className="glass-button px-4 py-2 rounded-lg font-bold m-0.5 my-1 hover:shadow-glow-purple transition-all duration-300"
          onClick={() => setIsChatOpen(!isChatOpen)}
          title="Toggle AI Chat"
        >
          <Bot size={16} color="#ffffff" />
        </button>

        <button
          className={`px-4 py-2 rounded-lg font-bold m-0.5 my-1 transition-all duration-300 ${
            isCanvasEditMode
              ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-glow-blue"
              : "glass-button hover:shadow-glow-purple"
          }`}
          onClick={() => setIsCanvasEditMode(!isCanvasEditMode)}
          title="Toggle Canvas Edit Mode"
        >
          <Edit size={16} color="#ffffff" />
        </button>

        <button
          className="glass-button px-4 py-2 rounded-lg font-bold m-0.5 my-1 hover:shadow-glow-purple transition-all duration-300"
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
