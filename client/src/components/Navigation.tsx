import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./auth/firebase.config";
import {
  BookMarked,
  CircleX,
  LayoutDashboard,
  LogOut,
  LogOutIcon,
  Plus,
  UserCog,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useSetRecoilState } from "recoil";
import { chatState } from "../store/atoms";

const Navigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const setChat = useSetRecoilState<string>(chatState);
  const [dropdown, setDropdown] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);

        setChat(
          `## Hello ${
            user.displayName?.split(" ")[0] || "User"
          },\n\n ## I'm \`Dmaid AI\` :) \n\nI help people in creating high-quality technical diagrams.\n\nI can generate,\n **Flowcharts, Sequences, Classes, State Diagrams, Entity Relationship, Gantt Charts, Pie Charts, Requirement, User Journey, Git Graph, Mindmaps, Timeline, Quadrant Chart, Packet, C4 Context, Block, Bar Graph** \n\nExplain me your specifications and I will create diagrams for you instantly.\n\n ### How I have been made? \n\n\`\`\`mermaid\nflowchart TD\n    A[💡 Brain] --> C{Creative Process}\n    B[❤️ Love] --> C\n    C --> D[🛠️ Development]\n    C --> E[🎨 Design]\n    C --> F[⚡ Innovation]\n    D --> G[🚀 Dmaid]\n    E --> G\n    F --> G\n    G --> H[👥 Users]\n    H --> I[🌟 Impact]\n    \n    style A fill:#e1f5fe,stroke:#01579b,stroke-width:2px\n    style B fill:#fce4ec,stroke:#880e4f,stroke-width:2px\n    style C fill:#f3e5f5,stroke:#4a148c,stroke-width:2px\n    style G fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px\n    style I fill:#fff3e0,stroke:#ef6c00,stroke-width:2px\n\`\`\`\n\n ~ Developed with ❤️, by [Swarnendu](https://www.linkedin.com/in/swarnendu-bhandari/)`
        );
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const signInWithGoogle = async () => {
    try {
      signInWithPopup(auth, new GoogleAuthProvider());
      setIsAuthModalOpen(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log(e.message);
      } else {
        console.log("An unknown error occurred.");
      }
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await signOut(auth);
      if (res === undefined) {
        setUser(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.log("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="text-black font-normal">
      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 bg-black rounded"
              onClick={() => setIsAuthModalOpen(false)}
            >
              <X size={20} color="#fff" />
            </button>
            <h2 className="text-xl mb-4 font-black">Authentication</h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <div className="flex items-center justify-center">
                  <button
                    className="flex items-center bg-black  border border-gray-600 rounded-lg shadow-md px-6 py-2 text-sm font-medium text-white"
                    onClick={signInWithGoogle}
                  >
                    <svg
                      className="h-6 w-6 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      width="800px"
                      height="800px"
                      viewBox="-0.5 0 48 48"
                      version="1.1"
                    >
                      {" "}
                      <title>Google-color</title>{" "}
                      <desc>Created with Sketch.</desc> <defs> </defs>{" "}
                      <g
                        id="Icons"
                        stroke="none"
                        stroke-width="1"
                        fill="none"
                        fill-rule="evenodd"
                      >
                        {" "}
                        <g
                          id="Color-"
                          transform="translate(-401.000000, -860.000000)"
                        >
                          {" "}
                          <g
                            id="Google"
                            transform="translate(401.000000, 860.000000)"
                          >
                            {" "}
                            <path
                              d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
                              id="Fill-1"
                              fill="#FBBC05"
                            >
                              {" "}
                            </path>{" "}
                            <path
                              d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
                              id="Fill-2"
                              fill="#EB4335"
                            >
                              {" "}
                            </path>{" "}
                            <path
                              d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
                              id="Fill-3"
                              fill="#34A853"
                            >
                              {" "}
                            </path>{" "}
                            <path
                              d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
                              id="Fill-4"
                              fill="#4285F4"
                            >
                              {" "}
                            </path>{" "}
                          </g>{" "}
                        </g>{" "}
                      </g>{" "}
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLogoutModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 bg-black rounded"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              <X size={20} color="#fff" />
            </button>
            <h2 className="text-xl font-black">Log Out</h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <div className="flex items-center justify-center flex-col">
                  <div className="">
                    <p className="font-semibold  text-sm">
                      Are you sure you want to Log Out?
                    </p>
                  </div>
                  <div className="flex justify-evenly w-full">
                    <button
                      className="bg-black text-white px-4 py-2 rounded  m-0.5 my-1 flex items-center"
                      onClick={() => setIsLogoutModalOpen(false)}
                    >
                      Cancel
                      <CircleX size={16} color="#ffffff" className="ml-2" />
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded  m-0.5 my-1 flex items-center"
                      onClick={() => {
                        handleSignOut();
                        setIsLogoutModalOpen(false);
                      }}
                    >
                      Log out
                      <LogOutIcon size={16} color="#fff" className="ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex justify-between items-center py-2 px-4 bg-white/80 text-black dark:bg-[#232326]/90 dark:text-[#e5e7eb] backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => navigate("/")}> 
          <img src="/logo_dmaid.png" alt="Dmaid Logo" className="h-10 w-auto" />
          <span className="text-2xl md:text-3xl font-black tracking-tight">Dmaid Workspace</span>
        </div>
        <ul className="flex justify-center space-x-4 text-sm font-normal items-center">
          <li className="flex items-center space-x-2">
            <Link
              to="/diagram/create"
              className="hover:underline text-gray-500"
            >
              <button className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1">
                <Plus size={16} />
              </button>
            </Link>
          </li>
          {!user ? (
            <li className="flex items-center space-x-2">
              <button
                className="bg-black text-white px-4 py-2 rounded font-extrabold"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Sign In
              </button>
            </li>
          ) : (
            <li
              className="flex items-center space-x-2 bg-gray-200 dark:bg-[#232326] rounded-md p-2 cursor-pointer"
              onClick={() => setDropdown(!dropdown)}
            >
              <p className="text-gray-900 dark:text-[#e5e7eb]">{user.displayName}</p>
              <img
                src={user.photoURL || ""}
                alt="user"
                className="w-8 h-8 rounded-md"
              />
            </li>
          )}
          {user && dropdown && (
            <div className="absolute end-10 z-10 mt-12 divide-y divide-gray-100 dark:divide-gray-700 rounded-md border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#232326] shadow-lg cursor-pointer">
              <div
                className="absolute end-0 z-10 mt-2 divide-y divide-gray-100 dark:divide-gray-700 rounded-md border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#232326] shadow-lg"
                role="menu"
              >
                <div className="p-5 flex justify-centre items-start flex-col">
                  {/* avatar */}
                  <div className="flex items-end space-x-3 justify-center">
                    <img
                      src={user.photoURL || ""}
                      alt="user"
                      className="w-20 h-20 rounded-md"
                    />
                    <div className="flex flex-col items-start justify-between h-full">
                      <button className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1">
                        <LayoutDashboard size={16} />
                      </button>
                      <button className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1">
                        <BookMarked size={16} />
                      </button>
                    </div>
                    <div className="flex flex-col items-start justify-between h-full">
                      <button className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1">
                        <UserCog size={16} />
                      </button>
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded font-extrabold m-0.5 my-1"
                        onClick={() => setIsLogoutModalOpen(true)}
                      >
                        <LogOut size={16} />
                      </button>
                    </div>
                  </div>
                  <strong className="block p-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {user.email}
                  </strong>
                </div>
              </div>
            </div>
          )}
          <li>
            <button
              className="bg-gray-200 dark:bg-gray-700 rounded-full p-2 transition-colors"
              onClick={() => setIsDark((d) => !d)}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-700" />}
            </button>
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
};

export default Navigation;
