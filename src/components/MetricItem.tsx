import { useSetAtom } from 'jotai';
import XUIButton from '@xero/xui/react/button';
import {
    XUISingleSelect,
    XUISingleSelectLabel,
    XUISingleSelectOption,
    XUISingleSelectOptions,
    XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import {
    AGGREGATION_TYPES,
    type AggregationType,
    SEARCH_FIELDS,
    type MetricQueryItem,
    getFieldByName,
} from '../types/query';
import {FilterRow} from './FilterRow';
import {plusIcon} from "@xero/xui-icon";
import {Flex, FlexItem} from './layout';
import {SectionRule} from './SectionRule';
import {
    updateMetricItemAtom,
    removeMetricItemAtom,
    addFilterAtom,
    updateFilterAtom,
    removeFilterAtom,
} from '../atoms';

interface MetricItemProps {
    item: MetricQueryItem;
    index: number;
    isSingleItem: boolean;
}

export function MetricItem({
                               item,
                               index,
                               isSingleItem,
                           }: MetricItemProps) {
    const updateItem = useSetAtom(updateMetricItemAtom);
    const removeItem = useSetAtom(removeMetricItemAtom);
    const addFilter = useSetAtom(addFilterAtom);
    const updateFilter = useSetAtom(updateFilterAtom);
    const removeFilter = useSetAtom(removeFilterAtom);

    const fieldDef = getFieldByName(item.field);
    if (!fieldDef) {
        throw new Error('Unknown metricType: ' + item.field);
    }

    const availableAggregations = fieldDef.dataType === 'string'
        ? AGGREGATION_TYPES.filter((aggregator => aggregator.isNumericalAggregator !== true))
        : AGGREGATION_TYPES;

    return (
        <Flex justify="start" align="center" gap={12}>
            <FlexItem>
                <XUISingleSelect
                    key={`${item.id}-field-${item.field}`}
                    defaultSelectedOptionId={item.field}
                    onSelect={(selectedValue) =>
                        updateItem({ id: item.id, updates: {field: selectedValue} })
                    }
                >
                    <XUISingleSelectLabel>Metric {index + 1}</XUISingleSelectLabel>
                    <XUISingleSelectTrigger/>
                    <XUISingleSelectOptions matchTriggerWidth={false}>
                        {SEARCH_FIELDS.map(({value, label}) => (
                            <XUISingleSelectOption key={value} id={value}>
                                {label}
                            </XUISingleSelectOption>
                        ))}
                    </XUISingleSelectOptions>
                </XUISingleSelect>
            </FlexItem>
            <FlexItem>
                <XUISingleSelect
                    key={`${item.id}-aggregation-${item.aggregationType}`}
                    defaultSelectedOptionId={item.aggregationType}
                    onSelect={(selectedValue) =>
                        updateItem({ id: item.id, updates: {aggregationType: selectedValue as AggregationType} })
                    }
                >
                    <XUISingleSelectLabel>Aggregation</XUISingleSelectLabel>
                    <XUISingleSelectTrigger/>
                    <XUISingleSelectOptions matchTriggerWidth={false}>
                        {availableAggregations.map(({value, label}) => (
                            <XUISingleSelectOption key={value} id={value}>
                                {label}
                            </XUISingleSelectOption>
                        ))}
                    </XUISingleSelectOptions>
                </XUISingleSelect>
            </FlexItem>

            <FlexItem shrink={false}>
                <XUIButton
                    variant="borderless-main"
                    style={{top: "12px"}}
                    onClick={() => addFilter({ metricItemId: item.id })}
                    leftIcon={plusIcon}
                >
                    Add Filter
                </XUIButton>
            </FlexItem>

            {item.filters.length > 0 && (
                <FlexItem>
                    {item.filters.map((filter, index) => (
                        <div key={filter.id}>
                            <FilterRow
                                filter={filter}
                                metricItemId={item.id}
                                onUpdate={(metricItemId, filterId, updates) =>
                                    updateFilter({ metricItemId, filterId, updates })
                                }
                                onRemove={(metricItemId, filterId) =>
                                    removeFilter({ metricItemId, filterId })
                                }
                            />
                            {index + 1 != item.filters.length && (<SectionRule/>)}
                        </div>
                    ))}
                </FlexItem>
            )}

            {!isSingleItem && (
                <XUIButton
                    style={{marginLeft: 'auto'}}
                    variant="negative"
                    onClick={() => removeItem(item.id)}
                >
                    Remove
                </XUIButton>
            )}
        </Flex>
    );
}
