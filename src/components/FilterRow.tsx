import {XUIIconButton} from '@xero/xui/react/button';
import clear from "@xero/xui-icon/icons-es6/clear";
import exclamation from "@xero/xui-icon/icons-es6/exclamation";
import {
    XUISingleSelect,
    XUISingleSelectLabel,
    XUISingleSelectOption,
    XUISingleSelectOptions,
    XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import XUITextInput from '@xero/xui/react/textinput';
import {FILTER_FIELDS, getFieldByName, getOperatorsForField, type MetricFilter} from '../types/query';
import {Flex, FlexItem} from './layout';

interface FilterRowProps {
    filter: MetricFilter;
    metricItemId: string;
    onUpdate: (metricItemId: string, filterId: string, updates: Partial<MetricFilter>) => void;
    onRemove: (metricItemId: string, filterId: string) => void;
}

function getPlaceholderForField(field: string): string {
    const fieldDef = getFieldByName(field);
    if (fieldDef?.dataType === 'string') {
        if (field === 'response.status') {
            return 'e.g. 404, 503 or 4xx, 5xx';
        }
        return 'e.g. /api/endpoint';
    }
    return 'e.g. 0.5';
}

export function FilterRow({filter, metricItemId, onUpdate, onRemove}: FilterRowProps) {
    const availableOperators = getOperatorsForField(filter.field);
    const placeholder = getPlaceholderForField(filter.field);

    return (
        <Flex align="start" className="xui-margin-left">
            <FlexItem alignSelf="stretch" alignContent="center">
                    <XUIIconButton
                        className="xui-padding-xsmall-bottom"
                        style={{width: '38px', height: '38px', top: "12px"}}
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
                        onUpdate(metricItemId, filter.id, {field: selectedValue})
                    }
                >
                    <XUISingleSelectLabel>Field</XUISingleSelectLabel>
                    <XUISingleSelectTrigger/>
                    <XUISingleSelectOptions matchTriggerWidth={false}>
                        {FILTER_FIELDS.map(({value, label}) => (
                            <XUISingleSelectOption key={value} id={value}>
                                {label}
                            </XUISingleSelectOption>
                        ))}
                    </XUISingleSelectOptions>
                </XUISingleSelect>
            </FlexItem>

            <FlexItem alignSelf="stretch" alignContent="center">
                <XUIIconButton
                    style={{width: '38px', height: '38px', top: "12px", border: `${filter.negated ? '1px solid orange' : ''}`}}
                    ariaLabel="Toggle NOT"
                    iconSize={filter.negated ? 'large' : 'small'}
                    iconColor={filter.negated ? "orange" : undefined}
                    icon={exclamation}
                    onClick={() => onUpdate(metricItemId, filter.id, {negated: !filter.negated})}
                />
            </FlexItem>

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
                    <XUISingleSelectOptions matchTriggerWidth={false}>
                        {availableOperators.map(({value, label}) => (
                            <XUISingleSelectOption key={value} id={value}>
                                {label}
                            </XUISingleSelectOption>
                        ))}
                    </XUISingleSelectOptions>
                </XUISingleSelect>
            </FlexItem>

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
