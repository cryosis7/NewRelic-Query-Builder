import XUIButton from '@xero/xui/react/button';
import type {FilterField, MetricFilter, MetricQueryItem} from '../types/query';
import {MetricItem} from './MetricItem';
import {SectionRule} from './SectionRule';
import {Flex} from "./layout";

interface MetricQueryBuilderProps {
    items: MetricQueryItem[];
    onAddItem: () => void;
    onRemoveItem: (id: string) => void;
    onUpdateItem: (id: string, updates: Partial<MetricQueryItem>) => void;
    onAddFilter: (metricItemId: string, field?: FilterField) => void;
    onUpdateFilter: (metricItemId: string, filterId: string, updates: Partial<MetricFilter>) => void;
    onRemoveFilter: (metricItemId: string, filterId: string) => void;
}

export function MetricQueryBuilder({
                                       items,
                                       onAddItem,
                                       onRemoveItem,
                                       onUpdateItem,
                                       onAddFilter,
                                       onUpdateFilter,
                                       onRemoveFilter,
                                   }: MetricQueryBuilderProps) {
    return (
        <Flex direction="column">
            {items.map((item, index) => {
                const isSingleItem = items.length === 1;
                const isLastItem = index === items.length - 1;

                return (
                    <div key={item.id}>
                        <MetricItem
                        item={item}
                        index={index}
                        isSingleItem={isSingleItem}
                        onRemoveItem={onRemoveItem}
                        onUpdateItem={onUpdateItem}
                        onAddFilter={onAddFilter}
                        onUpdateFilter={onUpdateFilter}
                        onRemoveFilter={onRemoveFilter}
                    />
                        {!isLastItem && <SectionRule/>}
                    </div>
                );
            })}

            <XUIButton variant="standard" onClick={onAddItem} fullWidth="always" className="xui-margin-top">
                Add metric
            </XUIButton>
        </Flex>
    );
}
