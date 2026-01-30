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
    METRIC_TYPES,
    type MetricQueryItem,
    type MetricType,
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

function isDurationMetric(metricType: MetricType): boolean {
    return metricType === 'duration';
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

    const availableAggregations = isDurationMetric(item.metricType)
        ? AGGREGATION_TYPES
        : AGGREGATION_TYPES.filter((aggregation) => aggregation.value === 'count');

    return (
        <Flex justify="start" align="center">
            <FlexItem className="xui-padding-horizontal">
                <XUISingleSelect
                    key={`${item.id}-metricType-${item.metricType}`}
                    defaultSelectedOptionId={item.metricType}
                    onSelect={(selectedValue) =>
                        updateItem({ id: item.id, updates: {metricType: selectedValue as MetricType} })
                    }
                >
                    <XUISingleSelectLabel>Metric {index + 1}</XUISingleSelectLabel>
                    <XUISingleSelectTrigger/>
                    <XUISingleSelectOptions matchTriggerWidth>
                        {METRIC_TYPES.map(({value, label}) => (
                            <XUISingleSelectOption key={value} id={value}>
                                {label}
                            </XUISingleSelectOption>
                        ))}
                    </XUISingleSelectOptions>
                </XUISingleSelect>
            </FlexItem>
            <FlexItem className="xui-padding-horizontal">
                <XUISingleSelect
                    key={`${item.id}-aggregation-${item.aggregationType}`}
                    defaultSelectedOptionId={item.aggregationType}
                    onSelect={(selectedValue) =>
                        updateItem({ id: item.id, updates: {aggregationType: selectedValue as AggregationType} })
                    }
                >
                    <XUISingleSelectLabel>Aggregation</XUISingleSelectLabel>
                    <XUISingleSelectTrigger/>
                    <XUISingleSelectOptions matchTriggerWidth>
                        {availableAggregations.map(({value, label}) => (
                            <XUISingleSelectOption key={value} id={value}>
                                {label}
                            </XUISingleSelectOption>
                        ))}
                    </XUISingleSelectOptions>
                </XUISingleSelect>
            </FlexItem>

            <FlexItem>
                <XUIButton
                    variant="borderless-main"
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
