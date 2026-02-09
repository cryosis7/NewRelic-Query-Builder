import { render } from '@testing-library/react';
import { FlexItem } from './FlexItem';

describe('FlexItem', () => {
  it('renders without any classes when no props are provided', () => {
    const { container } = render(<FlexItem>Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv.className).toBe('');
  });

  it('applies flex-1 class when grow is true', () => {
    const { container } = render(<FlexItem grow>Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveClass('xui-u-flex-1');
  });

  it('applies flex-none class when shrink is false', () => {
    const { container } = render(<FlexItem shrink={false}>Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveClass('xui-u-flex-none');
  });

  it('applies both grow and shrink classes', () => {
    const { container } = render(
      <FlexItem grow shrink={false}>
        Content
      </FlexItem>
    );
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveClass('xui-u-flex-1');
    expect(itemDiv).toHaveClass('xui-u-flex-none');
  });

  it('applies flex style with string value', () => {
    const { container } = render(<FlexItem flex="1 1 auto">Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ flex: '1 1 auto' });
  });

  it('applies flex style with number value', () => {
    const { container } = render(<FlexItem flex={2}>Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ flex: 2 });
  });

  it('applies alignSelf style with start value', () => {
    const { container } = render(<FlexItem alignSelf="start">Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ alignSelf: 'flex-start' });
  });

  it('applies alignSelf style with center value', () => {
    const { container } = render(<FlexItem alignSelf="center">Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ alignSelf: 'center' });
  });

  it('applies alignSelf style with end value', () => {
    const { container } = render(<FlexItem alignSelf="end">Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ alignSelf: 'flex-end' });
  });

  it('applies alignSelf style with stretch value', () => {
    const { container } = render(<FlexItem alignSelf="stretch">Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ alignSelf: 'stretch' });
  });

  it('applies alignSelf style with baseline value', () => {
    const { container } = render(<FlexItem alignSelf="baseline">Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ alignSelf: 'baseline' });
  });

  it('applies both flex and alignSelf styles', () => {
    const { container } = render(
      <FlexItem flex={1} alignSelf="center">
        Content
      </FlexItem>
    );
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ flex: 1, alignSelf: 'center' });
  });

  it('merges custom className', () => {
    const { container } = render(
      <FlexItem className="custom-class" grow>
        Content
      </FlexItem>
    );
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveClass('xui-u-flex-1');
    expect(itemDiv).toHaveClass('custom-class');
  });

  it('merges custom style with flex styles', () => {
    const { container } = render(
      <FlexItem flex={1} style={{ padding: '10px' }}>
        Content
      </FlexItem>
    );
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ flex: 1, padding: '10px' });
  });

  it('custom style overrides flex styles', () => {
    const { container } = render(
      <FlexItem flex={1} style={{ flex: 2 }}>
        Content
      </FlexItem>
    );
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ flex: 2 });
  });

  it('does not add style attribute when no styles are provided', () => {
    const { container } = render(<FlexItem grow>Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).not.toHaveAttribute('style');
  });

  it('does not add class attribute when no classes are provided', () => {
    const { container } = render(
      <FlexItem flex={1}>Content</FlexItem>
    );
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).not.toHaveAttribute('class');
  });

  it('renders children', () => {
    const { getByText } = render(
      <FlexItem>
        <span>Child content</span>
      </FlexItem>
    );
    expect(getByText('Child content')).toBeInTheDocument();
  });

  it('applies debug border when debug prop is true', () => {
    const { container } = render(<FlexItem debug>Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv.style.border).toMatch(/2px solid/);
  });

  it('applies alignContent with start value', () => {
    const { container } = render(<FlexItem alignContent="start">Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ alignContent: 'flex-start' });
  });

  it('applies alignContent with center value', () => {
    const { container } = render(<FlexItem alignContent="center">Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ alignContent: 'center' });
  });

  it('applies alignContent with end value', () => {
    const { container } = render(<FlexItem alignContent="end">Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ alignContent: 'flex-end' });
  });

  it('applies alignContent with stretch value', () => {
    const { container } = render(<FlexItem alignContent="stretch">Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ alignContent: 'stretch' });
  });

  it('applies alignContent with space-between value', () => {
    const { container } = render(<FlexItem alignContent="space-between">Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ alignContent: 'space-between' });
  });

  it('applies alignContent with space-around value', () => {
    const { container } = render(<FlexItem alignContent="space-around">Content</FlexItem>);
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv).toHaveStyle({ alignContent: 'space-around' });
  });
});
