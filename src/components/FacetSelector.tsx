import { useAtom } from 'jotai';
import {
  XUISingleSelect,
  XUISingleSelectLabel,
  XUISingleSelectOption,
  XUISingleSelectOptions,
  XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import { FACET_OPTIONS, type FacetOption } from '../types/query';
import { facetAtom } from '../atoms';

export function FacetSelector() {
  const [selectedFacet, setSelectedFacet] = useAtom(facetAtom);

  return (
    <XUISingleSelect
      key={`facet-${selectedFacet}`}
      defaultSelectedOptionId={selectedFacet}
      onSelect={(value) => setSelectedFacet(value as FacetOption)}
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
