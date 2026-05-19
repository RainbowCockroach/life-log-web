import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EditorPage from "./page-editor/EditorPage";
import EntriesPage from "./page-list-entries/EntriesPage";
import TagsPage from "./page-tags/TagsPage";
import ApiKeyPage from "./page-api-key/ApiKeyPage";
import EditEntryPage from "./page-editor/EditEntryPage";
import ExportPage from "./page-export/ExportPage";
import { ThemeProvider } from "./theming/ThemeProvider";
import "./themes/default.css";
import "./theming/variants.css";
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
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }}>
            <Routes>
              <Route path="/" element={<EditorPage />} />
              <Route path="/entries" element={<EntriesPage />} />
              <Route path="/edit/:id" element={<EditEntryPage />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/export" element={<ExportPage />} />
              <Route path="/api-key" element={<ApiKeyPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
