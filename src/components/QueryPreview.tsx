import {useCallback, useState} from 'react';
import XUIButton from '@xero/xui/react/button';
import {Flex, FlexItem} from "./layout";
import copy from '@xero/xui-icon/icons-es6/copy'

interface QueryPreviewProps {
    query: string;
}

export function QueryPreview({query}: QueryPreviewProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(query);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [query]);

    const isValidQuery = !query.startsWith('--');

    return (
        <Flex direction="column">
            {/*<FlexItem>*/}
            <label>Generated Query</label>
            {/*</FlexItem>*/}
            <pre
                className="xui-text-panelcontent xui-padding"
                style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    backgroundColor: isValidQuery ? '#f5f5f5' : '#fff3cd',
                    borderRadius: '4px',
                    minHeight: '100px',
                    marginBottom: '12px',
                }}
            >
        {query}
      </pre>
            <FlexItem>
                <XUIButton
                    variant={!copied ? 'create' : 'standard'}
                    onClick={handleCopy}
                    isDisabled={!isValidQuery}
                    aria-label={copied ? 'Copied!' : 'Copy query to clipboard'}
                    fullWidth="always"
                    leftIcon={copy}
                >
                    {copied ? 'Copied!' : 'Copy Query'}
                </XUIButton>
            </FlexItem>
        </Flex>
    );
}
