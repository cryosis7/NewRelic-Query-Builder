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
    type FilterField,
    METRIC_TYPES,
    type MetricFilter,
    type MetricQueryItem,
    type MetricType,
} from '../types/query';
import {FilterRow} from './FilterRow';
import {plusIcon} from "@xero/xui-icon";
import {Flex, FlexItem} from './layout';
import {SectionRule} from './SectionRule';

interface MetricItemProps {
    item: MetricQueryItem;
    index: number;
    isSingleItem: boolean;
    onRemoveItem: (id: string) => void;
    onUpdateItem: (id: string, updates: Partial<MetricQueryItem>) => void;
    onAddFilter: (metricItemId: string, field?: FilterField) => void;
    onUpdateFilter: (metricItemId: string, filterId: string, updates: Partial<MetricFilter>) => void;
    onRemoveFilter: (metricItemId: string, filterId: string) => void;
}

function isDurationMetric(metricType: MetricType): boolean {
    return metricType === 'duration';
}

export function MetricItem({
                               item,
                               index,
                               isSingleItem,
                               onRemoveItem,
                               onUpdateItem,
                               onAddFilter,
                               onUpdateFilter,
                               onRemoveFilter,
                           }: MetricItemProps) {
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
                        onUpdateItem(item.id, {metricType: selectedValue as MetricType})
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
                        onUpdateItem(item.id, {aggregationType: selectedValue as AggregationType})
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
                    onClick={() => onAddFilter(item.id)}
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
                                onUpdate={onUpdateFilter}
                                onRemove={onRemoveFilter}
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
                    onClick={() => onRemoveItem(item.id)}
                >
                    Remove
                </XUIButton>
            )}
        </Flex>
    );
}
