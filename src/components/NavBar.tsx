import { Link } from "react-router-dom";
import { hasApiKey } from "../utils/apiKeyStorage";

function NavBar() {
  const noApiKey = !hasApiKey();

  return (
    <nav>
      <Link to="/">
        <button>Editor</button>
      </Link>
      <Link to="/entries">
        <button>Entries</button>
      </Link>
      <Link to="/tags">
        <button>Tags</button>
      </Link>
      <Link to="/api-key">
        <button style={{ background: noApiKey ? "#dc2626" : "", color: noApiKey ? "white" : "" }}>
          API Key
        </button>
      </Link>
    </nav>
  );
}

export default NavBar;
