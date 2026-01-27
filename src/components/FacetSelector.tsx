import XUIRadio, { XUIRadioGroup } from '@xero/xui/react/radio';
import { FACET_OPTIONS, type FacetOption } from '../types/query';

interface FacetSelectorProps {
  selectedFacet: FacetOption;
  onChange: (facet: FacetOption) => void;
}

export function FacetSelector({ selectedFacet, onChange }: FacetSelectorProps) {
  return (
    <XUIRadioGroup label="Facet By" isFieldLayout>
      {FACET_OPTIONS.map(({ value, label }) => (
        <XUIRadio
          key={value}
          name="facet"
          value={value}
          isChecked={selectedFacet === value}
          onChange={() => onChange(value)}
        >
          {label}
        </XUIRadio>
      ))}
    </XUIRadioGroup>
  );
}
