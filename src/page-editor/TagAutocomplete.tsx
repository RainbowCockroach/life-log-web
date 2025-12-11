import { useState, useCallback } from "react";
import { searchTagSuggestions, createTag, type Tag } from "../services/api";
import type { AutocompleteOption } from "../components/Autocomplete";
import Autocomplete from "../components/Autocomplete";
import TagChip from "../components/TagChip";

interface TagAutocompleteProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  tagType?: string;
  label?: string;
  placeholder?: string;
  defaultColor?: string;
  singleSelect?: boolean;
}

export default function TagAutocomplete({
  selectedTags,
  onTagsChange,
  tagType = "tag",
  label = "Tags",
  placeholder = "Type to search tags...",
  defaultColor = "#e0e0e0",
  singleSelect = false,
}: TagAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchTagSuggestions = useCallback(
    async (query: string): Promise<AutocompleteOption[]> => {
      try {
        const suggestions = await searchTagSuggestions(query, tagType);

        // Filter out already selected tags
        const filtered = suggestions.filter(
          (tag) => !selectedTags.some((selected) => selected.id === tag.id)
        );

        const options: AutocompleteOption[] = filtered.map((tag) => ({
          value: tag.name,
          label: tag.name,
          metadata: tag,
        }));

        // Add "Create new" option if query doesn't match any existing tag exactly
        if (
          query.trim() &&
          !filtered.some(
            (tag) => tag.name.toLowerCase() === query.toLowerCase()
          )
        ) {
          options.push({
            value: query,
            label: `Create new: "${query}"`,
            metadata: { isNew: true, name: query },
          });
        }

        return options;
      } catch (error) {
        console.error("Error fetching tag suggestions:", error);
        return [];
      }
    },
    [selectedTags, tagType]
  );

  const handleTagSelect = async (option: AutocompleteOption) => {
    if (option.metadata?.isNew) {
      // Create new tag
      setIsCreating(true);
      try {
        const newTag = await createTag({
          name: option.metadata.name,
          type: tagType,
          config: {
            backgroundColor: defaultColor,
            textColor: "#000000",
          },
        });
        if (singleSelect) {
          onTagsChange([newTag]);
        } else {
          onTagsChange([...selectedTags, newTag]);
        }
        setInputValue("");
      } catch (error) {
        console.error("Error creating tag:", error);
        alert("Failed to create tag. Please try again.");
      } finally {
        setIsCreating(false);
      }
    } else if (option.metadata) {
      // Select existing tag
      if (singleSelect) {
        onTagsChange([option.metadata as Tag]);
      } else {
        onTagsChange([...selectedTags, option.metadata as Tag]);
      }
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagId: number) => {
    onTagsChange(selectedTags.filter((tag) => tag.id !== tagId));
  };

  return (
    <div style={{ marginBottom: "12px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <label
          style={{
            fontSize: "14px",
            fontWeight: "500",
            minWidth: "fit-content",
          }}
        >
          {label}
        </label>

        {/* Tag input with autocomplete - disabled if singleSelect and already has selection */}
        {!(singleSelect && selectedTags.length > 0) && (
          <div style={{ flex: 1, minWidth: "200px" }}>
            <Autocomplete
              value={inputValue}
              onChange={setInputValue}
              onSelect={handleTagSelect}
              fetchSuggestions={fetchTagSuggestions}
              placeholder={isCreating ? "Creating..." : placeholder}
              minChars={1}
              debounceMs={200}
            />
            {isCreating && (
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
              >
                Creating new tag...
              </div>
            )}
          </div>
        )}

        {/* Selected tags display - inline */}
        {selectedTags.length > 0 && (
          <>
            {selectedTags.map((tag) => (
              <TagChip key={tag.id} tag={tag} onRemove={handleRemoveTag} />
            ))}
          </>
        )}
      </div>

      {singleSelect && selectedTags.length > 0 && (
        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
          Remove current selection to choose a different {label.toLowerCase()}
        </div>
      )}
    </div>
  );
}
