import XUIButton from '@xero/xui/react/button';
import XUIIcon from '@xero/xui/react/icon';
import crossSmall from '@xero/xui-icon/icons/cross-small';
import {
  XUISingleSelect,
  XUISingleSelectLabel,
  XUISingleSelectOption,
  XUISingleSelectOptions,
  XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import XUITextInput from '@xero/xui/react/textinput';
import { XUIRow, XUIColumn } from '@xero/xui/react/structural';
import {
  FILTER_FIELDS,
  METRIC_FILTER_OPERATORS,
  type FilterField,
  type MetricFilter,
} from '../types/query';

interface FilterRowProps {
  filter: MetricFilter;
  metricItemId: string;
  onUpdate: (metricItemId: string, filterId: string, updates: Partial<MetricFilter>) => void;
  onRemove: (metricItemId: string, filterId: string) => void;
}

function isResponseStatusField(field: FilterField): boolean {
  return field === 'response.status';
}

function getOperatorsForField(field: FilterField) {
  if (isResponseStatusField(field)) {
    return METRIC_FILTER_OPERATORS.filter(op => ['=', 'LIKE', 'IN'].includes(op.value));
  }
  return METRIC_FILTER_OPERATORS.filter(op => ['>', '>=', '<', '<=', '='].includes(op.value));
}

function getPlaceholderForField(field: FilterField): string {
  if (isResponseStatusField(field)) {
    return 'e.g. 404, 503 or 4xx, 5xx';
  }
  return 'e.g. 0.5';
}

export function FilterRow({ filter, metricItemId, onUpdate, onRemove }: FilterRowProps) {
  const isStatusField = isResponseStatusField(filter.field);
  const availableOperators = getOperatorsForField(filter.field);
  const placeholder = getPlaceholderForField(filter.field);
  const hasEmptyValue = !filter.value.trim();

  return (
    <div className="xui-margin-top-small xui-padding-left">
      <XUIRow variant="grid">
        <XUIColumn gridColumns={3}>
          <XUISingleSelect
            key={`${filter.id}-field-${filter.field}`}
            defaultSelectedOptionId={filter.field}
            onSelect={(selectedValue) =>
              onUpdate(metricItemId, filter.id, { field: selectedValue as FilterField })
            }
          >
            <XUISingleSelectLabel>Field</XUISingleSelectLabel>
            <XUISingleSelectTrigger />
            <XUISingleSelectOptions matchTriggerWidth>
              {FILTER_FIELDS.map(({ value, label }) => (
                <XUISingleSelectOption key={value} id={value}>
                  {label}
                </XUISingleSelectOption>
              ))}
            </XUISingleSelectOptions>
          </XUISingleSelect>
        </XUIColumn>
        {!isStatusField && (
          <XUIColumn gridColumns={2}>
            <XUISingleSelect
              key={`${filter.id}-operator-${filter.operator}`}
              defaultSelectedOptionId={filter.operator}
              onSelect={(selectedValue) =>
                onUpdate(metricItemId, filter.id, { operator: selectedValue as MetricFilter['operator'] })
              }
            >
              <XUISingleSelectLabel>Operator</XUISingleSelectLabel>
              <XUISingleSelectTrigger />
              <XUISingleSelectOptions matchTriggerWidth>
                {availableOperators.map(({ value, label }) => (
                  <XUISingleSelectOption key={value} id={value}>
                    {label}
                  </XUISingleSelectOption>
                ))}
              </XUISingleSelectOptions>
            </XUISingleSelect>
          </XUIColumn>
        )}
        <XUIColumn gridColumns={isStatusField ? 8 : 6}>
          <XUITextInput
            label="Value"
            type="text"
            placeholder={placeholder}
            value={filter.value}
            onChange={(event) =>
              onUpdate(metricItemId, filter.id, { value: event.target.value })
            }
            isFieldLayout
            isInvalid={hasEmptyValue}
            validationMessage={hasEmptyValue ? 'Empty filter will be ignored' : undefined}
          />
        </XUIColumn>
        <XUIColumn gridColumns={1}>
          <div style={{ paddingTop: '24px' }}>
            <XUIButton
              variant="borderless-main"
              onClick={() => onRemove(metricItemId, filter.id)}
              aria-label="Remove filter"
              size="small"
            >
              <XUIIcon icon={crossSmall} size="small" />
            </XUIButton>
          </div>
        </XUIColumn>
      </XUIRow>
    </div>
  );
}
