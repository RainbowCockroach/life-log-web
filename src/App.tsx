import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EditorPage from "./page-editor/EditorPage";
import EntriesPage from "./page-list-entries/EntriesPage";
import TagsPage from "./page-tags/TagsPage";
import ApiKeyPage from "./page-api-key/ApiKeyPage";
import EditEntryPage from "./page-editor/EditEntryPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./themes/default.css";
import NavBar from "./components/NavBar";

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
            color: "var(--text-color)",
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
