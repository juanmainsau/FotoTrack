import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import { MainscreenPage } from "./pages/MainscreenPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app/mainscreen" element={<MainscreenPage />} />
    </Routes>
  );
}
