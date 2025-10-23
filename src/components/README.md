# Components Directory Structure

This directory contains all React components organized by their usage pattern.

## Structure

### `/common` - Universal Components

Components that are reusable across multiple pages and features:

- **Tag.tsx** - Tag display component with customizable colors
- **MarkdownViewer.tsx** - Markdown rendering component with image support
- **Autocomplete.tsx** - Generic autocomplete input component
- **NavBar.tsx** - Application navigation bar
- **ApiKeyModal.tsx** - API key configuration modal

### `/editor` - Editor Page Components

Components specific to the editor/content creation page:

- **Editor.tsx** - Main editor container component
- **MarkdownEditor.tsx** - Markdown editing interface with preview
- **TagAutocomplete.tsx** - Tag selection with autocomplete for entries
- **Editor.css** - Styles specific to the editor

### `/entries` - Entries Page Components

Components specific to the entries list/viewing page:

- **EntriesList.tsx** - Main entries listing component with pagination
- **EntriesList.css** - Styles specific to the entries list

## Import Guidelines

Each subfolder has an `index.ts` file that exports all components. You can import using:

```typescript
// Named imports from index (recommended)
import { NavBar, Tag } from "../components/common";
import { Editor } from "../components/editor";
import { EntriesList } from "../components/entries";

// Direct imports (also valid)
import Editor from "../components/editor/Editor";
import NavBar from "../components/common/NavBar";
```

## Adding New Components

When adding a new component, consider:

1. **Is it reusable across multiple pages?** → Put it in `/common`
2. **Is it specific to a particular feature/page?** → Create or use an appropriate subfolder
3. **Don't forget to export it** in the subfolder's `index.ts` file
