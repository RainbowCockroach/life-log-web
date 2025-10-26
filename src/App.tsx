import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/common";
import EditorPage from "./pages/EditorPage";
import EntriesPage from "./pages/EntriesPage";
import TagsPage from "./pages/TagsPage";
import ApiKeyPage from "./pages/ApiKeyPage";
import EditEntryPage from "./pages/EditEntryPage";

function App() {
  return (
    <Router basename="/life-log-web">
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
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
  );
}

export default App;
