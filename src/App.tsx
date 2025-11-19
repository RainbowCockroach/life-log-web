import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/common";
import EditorPage from "./pages/EditorPage";
import EntriesPage from "./pages/EntriesPage";
import TagsPage from "./pages/TagsPage";
import ApiKeyPage from "./pages/ApiKeyPage";
import EditEntryPage from "./pages/EditEntryPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./themes/default.css";

function App() {
  return (
    <ThemeProvider>
      <Router basename="/life-log-web">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            backgroundColor: "var(--background-color)",
            color: "var(--text-color)"
          }}
        >
          <NavBar />
          <div>
            <Routes>
              <Route path="/" element={<EditorPage />} />
              <Route path="/entries" element={<EntriesPage />} />
              <Route path="/edit/:id" element={<EditEntryPage />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/api-key" element={<ApiKeyPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
