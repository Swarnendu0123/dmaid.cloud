import { Route, Routes } from "react-router-dom";
import "./App.css";
import Redirect from "./pages/ShortURL_Redirect";
import Landing from "./pages/Landing";
import CreateDiagramPage from "./pages/Diagram/CreateDiagram";
import Navigation from "./components/Navigation";
import { useEffect, useState } from "react";

function App() {
  const [isDarkMode, _] = useState(
    localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <Routes>
        <Route path="/" element={<Navigation />} >
        {/* Landing Page */}
        <Route index element={<Landing />} />

        {/* Diagram */}
        <Route path="diagram/create" element={<CreateDiagramPage />} />

        {/* Short URL Redirect */}
        <Route path="d/:id" element={<Redirect />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
