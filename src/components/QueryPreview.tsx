import { useState, useCallback } from 'react';
import XUIButton from '@xero/xui/react/button';
import XUIControlGroup from '@xero/xui/react/controlgroup';

interface QueryPreviewProps {
  query: string;
}

export function QueryPreview({ query }: QueryPreviewProps) {
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
    <XUIControlGroup label="Generated Query" isFieldLayout>
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
      <XUIButton
        variant={copied ? 'create' : 'standard'}
        onClick={handleCopy}
        isDisabled={!isValidQuery}
        aria-label={copied ? 'Copied!' : 'Copy query to clipboard'}
      >
        {copied ? '✓ Copied!' : 'Copy Query'}
      </XUIButton>
    </XUIControlGroup>
  );
}
