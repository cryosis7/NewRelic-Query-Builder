import { useAtomValue, useSetAtom } from 'jotai';
import XUIButton from '@xero/xui/react/button';
import {MetricItem} from './MetricItem';
import {SectionRule} from './SectionRule';
import {Flex} from "./layout";
import { metricItemsAtom, addMetricItemAtom } from '../atoms';

export function MetricQueryBuilder() {
    const items = useAtomValue(metricItemsAtom);
    const addItem = useSetAtom(addMetricItemAtom);

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
                    />
                        {!isLastItem && <SectionRule/>}
                    </div>
                );
            })}

            <XUIButton variant="standard" onClick={() => addItem()} fullWidth="always" className="xui-margin-top">
                Add metric
            </XUIButton>
        </Flex>
    );
}
