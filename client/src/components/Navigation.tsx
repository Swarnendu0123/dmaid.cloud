import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="flex justify-between">
      <h1 className="text-center text-3xl font-bold">Better SDE</h1>
      <ul className="flex justify-center space-x-4 text-sm font-normal">
        <li>
          <Link to="/" className="hover:underline text-gray-500">
            Free Resources
          </Link>
        </li>
        <li>
          <Link to="/pricing" className="hover:underline text-gray-500">
            Pricing
          </Link>
        </li>
        <li>
          <Link to="/about" className="hover:underline text-gray-500">
            About Me
          </Link>
        </li>
        <li>
          <Link
            to="/auth/signin"
            className="bg-black text-white px-4 py-2 rounded font-extrabold"
          >
            Sign In
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
