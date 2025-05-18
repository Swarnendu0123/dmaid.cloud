// Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileText, History as HistoryIcon, LogOut } from 'lucide-react';
import { auth } from "../../components/auth/firebase.config"; // Adjust path if necessary
import { User as UserType, signOut } from "firebase/auth";
import { BACKEND_URL } from "../../config"; // Adjust path if necessary

interface DiagramItem {
  _id: string;
  diagramName: string;
  mode: 'public' | 'private'; // Or other access types your app supports
  updatedAt: string; // Assuming your backend provides this
}

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true); // Sidebar starts open
  const [user, setUser] = useState<UserType | null>(null);
  const [diagrams, setDiagrams] = useState<DiagramItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserDiagrams();
      } else {
        setDiagrams([]);
        // Optionally navigate to login or home page if user logs out
        // navigate('/login'); 
      }
    });
    return () => unsubscribe();
  }, []); // Re-run if `navigate` changes, though typically stable

  const fetchUserDiagrams = async () => {
    if (!auth.currentUser) return; // Ensure user is still current
    setIsLoading(true);
    try {
      // This endpoint should return diagrams belonging to the authenticated user.
      // Your backend will need to identify the user (e.g., via session cookie or JWT).
      const response = await fetch(`${BACKEND_URL}/diagrams/user`, {
        method: 'GET',
        credentials: 'include', // Crucial for sending session cookies
        headers: {
          'Content-Type': 'application/json',
          // If using token-based auth, you might need:
          // 'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch user diagrams:', errorData.error || response.statusText);
        setDiagrams([]);
        if (response.status === 401) { // Unauthorized
            // handle logout or redirect to login
        }
        return;
      }
      const data = await response.json();
      // Sort diagrams by updatedAt in descending order (newest first)
      const sortedDiagrams = (data.diagrams || []).sort(
        (a: DiagramItem, b: DiagramItem) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setDiagrams(sortedDiagrams);
    } catch (error) {
      console.error('Error fetching user diagrams:', error);
      setDiagrams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleDiagramClick = (diagramId: string, accessMode: string) => {
    navigate(`/diagram/create/${diagramId}/${accessMode}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Navigate to home or login page after logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };


  return (
    <div
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col bg-slate-100 border-r border-slate-300 shadow-md transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64 md:w-72' : 'w-16'
      }`}
    >
      {/* Header and Toggle Button */}
      <div className={`flex items-center p-3 border-b border-slate-300 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <div className="flex items-center">
            <HistoryIcon size={22} className="text-slate-700 mr-2" />
            <h2 className="text-lg font-semibold text-slate-800">My Diagrams</h2>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-slate-600 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Diagrams List */}
      <nav className="flex-grow overflow-y-auto pt-3">
        {isLoading && isOpen && (
          <div className="px-3 py-2 text-sm text-slate-500">Loading diagrams...</div>
        )}
        {!isLoading && diagrams.length === 0 && isOpen && (
          <div className="px-3 py-2 text-sm text-slate-500">No diagrams yet.</div>
        )}
        
        <ul className={`space-y-1 ${isOpen ? 'px-2' : 'flex flex-col items-center py-2'}`}>
          {diagrams.map((diagram) => (
            <li key={diagram._id}>
              <button
                onClick={() => handleDiagramClick(diagram._id, diagram.mode)}
                className={`w-full flex items-center p-2.5 rounded-md text-sm font-medium transition-colors duration-150 group
                            ${isOpen ? 'text-slate-700 hover:bg-slate-200 hover:text-slate-900' 
                                     : 'text-slate-600 hover:bg-slate-200 justify-center'}`}
                title={isOpen ? diagram.diagramName : `${diagram.diagramName}\n(Click to open)`}
              >
                <FileText size={18} className={`${isOpen ? 'mr-3 text-slate-500 group-hover:text-slate-700' : 'text-slate-600 group-hover:text-slate-800'}`} />
                {isOpen && <span className="truncate flex-1 text-left">{diagram.diagramName || "Untitled Diagram"}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info and Logout Button - Footer */}
      {user && (
        <div className="mt-auto p-3 border-t border-slate-300">
          {isOpen ? (
            <div className="flex flex-col items-start text-xs text-slate-600">
              <span className="font-medium truncate max-w-full" title={user.email || ''}>
                {user.displayName || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="mt-1.5 text-red-500 hover:text-red-700 font-medium flex items-center"
              >
                <LogOut size={14} className="mr-1" /> Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-md text-red-500 hover:bg-red-100 hover:text-red-700 w-full flex justify-center"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;