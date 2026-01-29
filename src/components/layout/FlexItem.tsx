import type { CSSProperties, ReactNode } from 'react';

interface FlexItemProps {
  // Maps to XUI classes
  grow?: boolean;      // xui-u-flex-1
  shrink?: boolean;    // xui-u-flex-none (when false)

  // Require inline styles (no XUI equivalent)
  flex?: string | number;
  alignSelf?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  alignContent?: 'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around';

  // Debug mode
  debug?: boolean;

  // Standard HTML props
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

function buildFlexItemClasses(props: FlexItemProps): string {
  const classes: string[] = [];

  if (props.grow) {
    classes.push('xui-u-flex-1');
  }
  if (props.shrink === false) {
    classes.push('xui-u-flex-none');
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

function buildFlexItemStyle(props: FlexItemProps): CSSProperties {
  const style: CSSProperties = {};

  if (props.flex !== undefined) {
    style.flex = props.flex;
  }
  if (props.alignSelf !== undefined) {
    const alignSelfMap = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      stretch: 'stretch',
      baseline: 'baseline',
    };
    style.alignSelf = alignSelfMap[props.alignSelf];
  }
  if (props.alignContent !== undefined) {
    const alignContentMap = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      stretch: 'stretch',
      'space-between': 'space-between',
      'space-around': 'space-around',
    };
    style.alignContent = alignContentMap[props.alignContent];
  }

  if (props.debug) {
    style.border = `2px solid ${getNextDebugColor()}`;
  }

  return style;
}

export function FlexItem(props: FlexItemProps) {
  const className = buildFlexItemClasses(props);
  const flexItemStyle = buildFlexItemStyle(props);
  const style = { ...flexItemStyle, ...props.style };

  return (
    <div
      className={className || undefined}
      style={Object.keys(style).length > 0 ? style : undefined}
    >
      {props.children}
    </div>
  );
}
