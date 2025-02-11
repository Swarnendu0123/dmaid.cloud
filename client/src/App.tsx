import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Redirect from "./pages/Redirect";
import Landing from "./pages/Landing";
import Checkout from "./pages/Checkout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/blog/:id" element={<Home />} />
      <Route path="/b/:id" element={<Redirect />} />
      <Route path="/checkout" element={<Checkout />} />
    </Routes>
  );
}

export default App;
