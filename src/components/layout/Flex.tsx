import type { CSSProperties, ReactNode } from 'react';

interface FlexProps {
  // Maps to XUI classes
  direction?: 'row' | 'column';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean;
  inline?: boolean;

  // Require inline styles (no XUI equivalent)
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;

  // Debug mode
  debug?: boolean;

  // Standard HTML props
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

function buildFlexClasses(props: FlexProps): string {
  const classes = [props.inline ? 'xui-u-flex-inline' : 'xui-u-flex'];

  if (props.direction) {
    classes.push(`xui-u-flex-${props.direction}`);
  }
  if (props.justify) {
    classes.push(`xui-u-flex-justify-${props.justify}`);
  }
  if (props.align) {
    classes.push(`xui-u-flex-align-${props.align}`);
  }
  if (props.wrap) {
    classes.push('xui-u-flex-wrap');
  }

  if (props.className) {
    classes.push(props.className);
  }

  return classes.join(' ');
}

// Color pool for debug borders
const DEBUG_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
  '#E63946', '#06FFA5', '#118AB2', '#EF476F', '#FFD166',
  '#06D6A0', '#F72585', '#7209B7', '#3A0CA3', '#4361EE',
];

let debugColorIndex = 0;

function getNextDebugColor(): string {
  const color = DEBUG_COLORS[debugColorIndex % DEBUG_COLORS.length];
  debugColorIndex++;
  return color;
}

function buildGapStyle(props: FlexProps): CSSProperties {
  const gapStyle: CSSProperties = {};

  if (props.gap !== undefined) {
    gapStyle.gap = props.gap;
  }
  if (props.rowGap !== undefined) {
    gapStyle.rowGap = props.rowGap;
  }
  if (props.columnGap !== undefined) {
    gapStyle.columnGap = props.columnGap;
  }

  if (props.debug) {
    gapStyle.border = `2px solid ${getNextDebugColor()}`;
  }

  return gapStyle;
}

export function Flex(props: FlexProps) {
  const className = buildFlexClasses(props);
  const gapStyle = buildGapStyle(props);
  const style = { ...gapStyle, ...props.style };

  return (
    <div className={className} style={Object.keys(style).length > 0 ? style : undefined}>
      {props.children}
    </div>
  );
}
