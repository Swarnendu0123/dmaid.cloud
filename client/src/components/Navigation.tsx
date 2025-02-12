import { Link, useNavigate } from "react-router-dom";
import { signOut, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./auth/firebase.config";
import { BookMarked, LayoutDashboard, LogOut, UserCog } from "lucide-react";

const Navigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [dropdown, setDropdown] = useState(false);
  const navigate = useNavigate();

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

  const handleSignOut = async () => {
    try {
      const res = await signOut(auth);
      if (res === undefined) {
        setUser(null);
        navigate("/");
      }
    } catch (err: any) {
      console.log(err.message);
    }
  };

  return (
    <nav className="flex justify-between">
      <h1
        className="text-center text-3xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        Dnfy
      </h1>
      <ul className="flex justify-center space-x-4 text-sm font-normal">
        <li className="flex items-center space-x-2">
          <Link to="/" className="hover:underline text-gray-500">
            Free Resources
          </Link>
        </li>
        <li className="flex items-center space-x-2">
          <Link to="/pricing" className="hover:underline text-gray-500">
            Pricing
          </Link>
        </li>
        <li className="flex items-center space-x-2">
          <Link to="/about" className="hover:underline text-gray-500">
            About Me
          </Link>
        </li>
        {!user ? (
          <li className="flex items-center space-x-2">
            <Link
              to="/auth"
              className="bg-black text-white px-4 py-2 rounded font-extrabold"
            >
              Sign In
            </Link>
          </li>
        ) : (
          <li
            className="flex items-center space-x-2 bg-gray-200 rounded-md p-2 cursor-pointer"
            onClick={() => setDropdown(!dropdown)}
          >
            <p>{user.displayName}</p>
            <img
              src={user.photoURL || ""}
              alt="user"
              className="w-8 h-8 rounded-md"
            />
          </li>
        )}
        {user && dropdown && (
          <div className="absolute end-10 z-10 mt-12 divide-y divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg cursor-pointer">
            <div
              className="absolute end-0 z-10 mt-2 divide-y divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg"
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
                      className="bg-black text-white px-4 py-2 rounded font-extrabold m-0.5 my-1"
                      onClick={handleSignOut}
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
                <strong className="block p-2 text-xs font-medium  text-gray-600">
                  {user.email}
                </strong>
              </div>
            </div>
          </div>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
