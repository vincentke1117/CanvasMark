import { ChangeEvent, useState } from 'react';
import { useInstance } from '@milkdown/react';
import {
  PaginationMarkerOption,
  buildPaginationMarkerOptions,
  parsePaginationOptionValue,
  serializePaginationOptionValue,
} from '../modules/pagination/paginationMarkers';
import { insertPaginationMarker } from '../modules/editor/paginationCommands';

const markerOptions: PaginationMarkerOption[] = buildPaginationMarkerOptions();

export const PaginationMarkerMenu = () => {
  const [value, setValue] = useState('');
  const [loading, get] = useInstance();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const optionValue = event.target.value;
    if (!optionValue) {
      return;
    }

    if (loading) {
      setValue('');
      return;
    }

    const editor = get();
    if (!editor) {
      setValue('');
      return;
    }

    const parsed = parsePaginationOptionValue(optionValue);
    if (!parsed) {
      setValue('');
      return;
    }

    editor.action((ctx) => {
      insertPaginationMarker(ctx, parsed.id, parsed.condition);
    });

    setValue('');
  };

  return (
    <label className="cm-field" style={{ flexDirection: 'row' }}>
      <span>分页标记</span>
      <select
        className="cm-select"
        aria-label="插入分页或分段标记"
        value={value}
        onChange={handleChange}
      >
        <option value="">选择标记</option>
        {markerOptions.map((option) => (
          <option
            key={serializePaginationOptionValue(option)}
            value={serializePaginationOptionValue(option)}
            title={option.description}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};
