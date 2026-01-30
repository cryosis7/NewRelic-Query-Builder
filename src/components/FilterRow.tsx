import {XUIIconButton} from '@xero/xui/react/button';
import clear from "@xero/xui-icon/icons-es6/clear";
import {
    XUISingleSelect,
    XUISingleSelectLabel,
    XUISingleSelectOption,
    XUISingleSelectOptions,
    XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import XUITextInput from '@xero/xui/react/textinput';
import {FILTER_FIELDS, type FilterField, METRIC_FILTER_OPERATORS, type MetricFilter,} from '../types/query';
import {Flex, FlexItem} from './layout';

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

export function FilterRow({filter, metricItemId, onUpdate, onRemove}: FilterRowProps) {
    const isStatusField = isResponseStatusField(filter.field);
    const availableOperators = getOperatorsForField(filter.field);
    const placeholder = getPlaceholderForField(filter.field);

    return (
        <Flex align="start">
            <FlexItem alignSelf="stretch" alignContent="center">
                    <XUIIconButton
                        className="xui-padding-xsmall-bottom"
                        style={{width: '36px', height: '36px', transform: 'translateY(+25%)'}}
                        ariaLabel="Remove filter"
                        iconSize="small"
                        iconColor={"red"}
                        icon={clear}
                        onClick={() => onRemove(metricItemId, filter.id)}
                    />
            </FlexItem>

            <FlexItem className="xui-padding-xsmall">
                <XUISingleSelect
                    key={`${filter.id}-field-${filter.field}`}
                    defaultSelectedOptionId={filter.field}
                    onSelect={(selectedValue) =>
                        onUpdate(metricItemId, filter.id, {field: selectedValue as FilterField})
                    }
                >
                    <XUISingleSelectLabel>Field</XUISingleSelectLabel>
                    <XUISingleSelectTrigger/>
                    <XUISingleSelectOptions matchTriggerWidth>
                        {FILTER_FIELDS.map(({value, label}) => (
                            <XUISingleSelectOption key={value} id={value}>
                                {label}
                            </XUISingleSelectOption>
                        ))}
                    </XUISingleSelectOptions>
                </XUISingleSelect>
            </FlexItem>

            {!isStatusField && (
                <FlexItem className="xui-padding-xsmall">
                    <XUISingleSelect
                        key={`${filter.id}-operator-${filter.operator}`}
                        defaultSelectedOptionId={filter.operator}
                        onSelect={(selectedValue) =>
                            onUpdate(metricItemId, filter.id, {operator: selectedValue as MetricFilter['operator']})
                        }
                    >
                        <XUISingleSelectLabel>Operator</XUISingleSelectLabel>
                        <XUISingleSelectTrigger/>
                        <XUISingleSelectOptions matchTriggerWidth>
                            {availableOperators.map(({value, label}) => (
                                <XUISingleSelectOption key={value} id={value}>
                                    {label}
                                </XUISingleSelectOption>
                            ))}
                        </XUISingleSelectOptions>
                    </XUISingleSelect>
                </FlexItem>
            )}

            <FlexItem grow className="xui-padding-xsmall">
                <XUITextInput
                    label="Value"
                    type="text"
                    placeholder={placeholder}
                    value={filter.value}
                    onChange={(event) =>
                        onUpdate(metricItemId, filter.id, {value: event.target.value})
                    }
                />
            </FlexItem>
        </Flex>
    );
}
