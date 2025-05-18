// Example in a parent layout component (e.g., App.tsx or EditorPageLayout.tsx)
import Sidebar from './historySidebar'; // Adjust path
import MermaidEditor from './CreateDiagram'; // Adjust path

function EditorPageLayout() {


  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <main className="flex-grow overflow-auto"> 
       
        <div className="p-4"> 
           <MermaidEditor />
        </div>
      </main>
    </div>
  );
}

export default EditorPageLayout;