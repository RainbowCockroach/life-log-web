import { useState, useCallback } from 'react';
import Autocomplete, { type AutocompleteOption } from './Autocomplete';
import { searchTagSuggestions, createTag, type Tag } from '../services/api';

interface TagAutocompleteProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  tagType?: string;
  label?: string;
  placeholder?: string;
  defaultColor?: string;
}

export default function TagAutocomplete({
  selectedTags,
  onTagsChange,
  tagType = 'tag',
  label = 'Tags',
  placeholder = 'Type to search tags...',
  defaultColor = '#e0e0e0'
}: TagAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchTagSuggestions = useCallback(async (query: string): Promise<AutocompleteOption[]> => {
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
      if (query.trim() && !filtered.some((tag) => tag.name.toLowerCase() === query.toLowerCase())) {
        options.push({
          value: query,
          label: `Create new: "${query}"`,
          metadata: { isNew: true, name: query },
        });
      }

      return options;
    } catch (error) {
      console.error('Error fetching tag suggestions:', error);
      return [];
    }
  }, [selectedTags, tagType]);

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
            textColor: '#000000',
          },
        });
        onTagsChange([...selectedTags, newTag]);
        setInputValue('');
      } catch (error) {
        console.error('Error creating tag:', error);
        alert('Failed to create tag. Please try again.');
      } finally {
        setIsCreating(false);
      }
    } else if (option.metadata) {
      // Select existing tag
      onTagsChange([...selectedTags, option.metadata as Tag]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagId: number) => {
    onTagsChange(selectedTags.filter((tag) => tag.id !== tagId));
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '4px',
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        {label}
      </label>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          {selectedTags.map((tag) => (
            <div
              key={tag.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '13px',
                backgroundColor: tag.config?.backgroundColor || '#e0e0e0',
                color: tag.config?.textColor || '#000',
              }}
            >
              <span>{tag.name}</span>
              <button
                onClick={() => handleRemoveTag(tag.id)}
                style={{
                  marginLeft: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '16px',
                  color: tag.config?.textColor || '#000',
                  opacity: 0.7,
                }}
                aria-label={`Remove ${tag.name}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tag input with autocomplete */}
      <Autocomplete
        value={inputValue}
        onChange={setInputValue}
        onSelect={handleTagSelect}
        fetchSuggestions={fetchTagSuggestions}
        placeholder={isCreating ? 'Creating...' : placeholder}
        minChars={1}
        debounceMs={200}
      />
      {isCreating && (
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          Creating new tag...
        </div>
      )}
    </div>
  );
}
