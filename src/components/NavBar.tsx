import { NavLink } from "react-router-dom";
import { Pencil, List, Tag, Download, Key } from "lucide-react";
import { hasApiKey } from "../utils/apiKeyStorage";
import { ThemeToggle } from "./ThemeToggle";
import { ThemePicker } from "./ThemePicker";
import "./NavBar.css";

const ICON_SIZE = 16;

function NavBar() {
  const noApiKey = !hasApiKey();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    "nav-pill nav-icon-btn" + (isActive ? " nav-pill--active" : "");

  const apiKeyClass = ({ isActive }: { isActive: boolean }) =>
    "nav-pill nav-icon-btn" +
    (isActive ? " nav-pill--active" : "") +
    (noApiKey ? " nav-pill--danger" : "");

  return (
    <nav className="app-nav">
      <div className="app-nav__links">
        <NavLink to="/" end className={linkClass} title="Editor" aria-label="Editor">
          <Pencil size={ICON_SIZE} />
        </NavLink>
        <NavLink to="/entries" className={linkClass} title="Entries" aria-label="Entries">
          <List size={ICON_SIZE} />
        </NavLink>
        <NavLink to="/tags" className={linkClass} title="Tags" aria-label="Tags">
          <Tag size={ICON_SIZE} />
        </NavLink>
        <NavLink to="/export" className={linkClass} title="Export" aria-label="Export">
          <Download size={ICON_SIZE} />
        </NavLink>
        <NavLink to="/api-key" className={apiKeyClass} title="API Key" aria-label="API Key">
          <Key size={ICON_SIZE} />
        </NavLink>
      </div>
      <div className="app-nav__spacer" />
      <div className="app-nav__tools">
        <ThemePicker />
        <ThemeToggle variant="toggle" showLabels={false} />
      </div>
    </nav>
  );
}

export default NavBar;
