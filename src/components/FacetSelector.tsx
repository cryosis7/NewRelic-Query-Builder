import {
  XUISingleSelect,
  XUISingleSelectLabel,
  XUISingleSelectOption,
  XUISingleSelectOptions,
  XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import { FACET_OPTIONS, type FacetOption } from '../types/query';

interface FacetSelectorProps {
  selectedFacet: FacetOption;
  onChange: (facet: FacetOption) => void;
}

export function FacetSelector({ selectedFacet, onChange }: FacetSelectorProps) {
  return (
    <XUISingleSelect
      key={`facet-${selectedFacet}`}
      defaultSelectedOptionId={selectedFacet}
      onSelect={(value) => onChange(value as FacetOption)}
    >
      <XUISingleSelectLabel>Facet By</XUISingleSelectLabel>
      <XUISingleSelectTrigger />
      <XUISingleSelectOptions matchTriggerWidth>
        {FACET_OPTIONS.map(({ value, label }) => (
          <XUISingleSelectOption key={value} id={value}>
            {label}
          </XUISingleSelectOption>
        ))}
      </XUISingleSelectOptions>
    </XUISingleSelect>
  );
}
