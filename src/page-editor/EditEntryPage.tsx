import { useParams, useNavigate } from "react-router-dom";
import Editor from "./Editor";

function EditEntryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const entryId = id ? parseInt(id, 10) : undefined;

  const handleSaveSuccess = () => {
    navigate("/entries");
  };

  return <Editor entryId={entryId} onSaveSuccess={handleSaveSuccess} />;
}

export default EditEntryPage;
