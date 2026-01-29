interface SectionRuleProps {
  className?: string;
}

export function SectionRule({ className = '' }: SectionRuleProps) {
  return (
    <hr
      className={className}
      style={{
        width: '75%',
        margin: '1rem auto',
        border: 'none',
        borderTop: '1px solid #e0e0e0',
      }}
    />
  );
}
