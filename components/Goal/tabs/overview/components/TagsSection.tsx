import { useState } from 'react';
import { Input } from '@/components/ui/Input/index';
import { TagsSectionProps } from '../types';

export const TagsSection = ({ tags, styles, onTagAdd, onTagRemove }: TagsSectionProps) => {
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tags?.map((tag) => (
        <span
          key={tag.id}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer
            ${styles.background} ${styles.text}`}
        >
          {tag.name}
          <button
            className="ml-2 hover:text-white"
            onClick={() => onTagRemove?.(tag.id)}
          >
            ×
          </button>
        </span>
      ))}
      {showTagInput ? (
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newTag.trim()) {
              onTagAdd?.(newTag.trim());
              setNewTag('');
              setShowTagInput(false);
            }
          }}
          className="w-32 h-8 bg-white/5 border-white/10 text-white text-sm"
          autoFocus
        />
      ) : (
        <button
          className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-sm hover:bg-white/10"
          onClick={() => setShowTagInput(true)}
        >
          + Tag
        </button>
      )}
    </div>
  );
}; 