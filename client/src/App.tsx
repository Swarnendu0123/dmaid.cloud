import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Redirect from "./pages/Redirect";


function App() {
  return (
    <Routes>
      <Route path="/blog/:id" element={<Home />} />
      <Route path="/b/:id" element={<Redirect />} />
    </Routes>
  );
}

export default App;
