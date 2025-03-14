import { Route, Routes } from "react-router-dom";
import "./App.css";
import Redirect from "./pages/ShortURL_Redirect";
import Landing from "./pages/Landing";
import Auth from "./components/auth/login.auth";
import CreateDiagramPage from "./pages/Diagram/CreateDiagram";
import Navigation from "./components/Navigation";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigation />}>
        {/* Landing Page */}
        <Route index element={<Landing />} />

        {/* Diagram */}
        <Route path="diagram/create" element={<CreateDiagramPage />} />

        {/* Short URL Redirect */}
        <Route path="d/:id" element={<Redirect />} />

        {/* Authentication */}
        <Route path="auth" element={<Auth />} />
      </Route>
    </Routes>
  );
}

export default App;
