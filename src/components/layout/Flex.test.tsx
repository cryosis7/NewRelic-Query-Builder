import { render } from '@testing-library/react';
import { Flex } from './Flex';

describe('Flex', () => {
  it('renders with default flex class', () => {
    const { container } = render(<Flex>Content</Flex>);
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).toHaveClass('xui-u-flex');
  });

  it('applies inline flex class when inline prop is true', () => {
    const { container } = render(<Flex inline>Content</Flex>);
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).toHaveClass('xui-u-flex-inline');
  });

  it('applies direction class', () => {
    const { container } = render(<Flex direction="column">Content</Flex>);
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).toHaveClass('xui-u-flex-column');
  });

  it('applies justify class', () => {
    const { container } = render(<Flex justify="center">Content</Flex>);
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).toHaveClass('xui-u-flex-justify-center');
  });

  it('applies align class', () => {
    const { container } = render(<Flex align="start">Content</Flex>);
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).toHaveClass('xui-u-flex-align-start');
  });

  it('applies wrap class when wrap is true', () => {
    const { container } = render(<Flex wrap>Content</Flex>);
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).toHaveClass('xui-u-flex-wrap');
  });

  it('applies multiple XUI classes', () => {
    const { container } = render(
      <Flex direction="row" justify="space-between" align="center" wrap>
        Content
      </Flex>
    );
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).toHaveClass('xui-u-flex');
    expect(flexDiv).toHaveClass('xui-u-flex-row');
    expect(flexDiv).toHaveClass('xui-u-flex-justify-space-between');
    expect(flexDiv).toHaveClass('xui-u-flex-align-center');
    expect(flexDiv).toHaveClass('xui-u-flex-wrap');
  });

  it('applies gap style', () => {
    const { container } = render(<Flex gap="8px">Content</Flex>);
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).toHaveStyle({ gap: '8px' });
  });

  it('applies rowGap style', () => {
    const { container } = render(<Flex rowGap="16px">Content</Flex>);
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).toHaveStyle({ rowGap: '16px' });
  });

  it('applies columnGap style', () => {
    const { container } = render(<Flex columnGap="12px">Content</Flex>);
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).toHaveStyle({ columnGap: '12px' });
  });

  it('applies all gap styles together', () => {
    const { container } = render(
      <Flex gap="8px" rowGap="16px" columnGap="12px">
        Content
      </Flex>
    );
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).toHaveStyle({
      gap: '8px',
      rowGap: '16px',
      columnGap: '12px',
    });
  });

  it('merges custom className', () => {
    const { container } = render(
      <Flex className="custom-class">Content</Flex>
    );
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).toHaveClass('xui-u-flex');
    expect(flexDiv).toHaveClass('custom-class');
  });

  it('merges custom style with gap styles', () => {
    const { container } = render(
      <Flex gap="8px" style={{ padding: '10px' }}>
        Content
      </Flex>
    );
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).toHaveStyle({ gap: '8px', padding: '10px' });
  });

  it('custom style overrides gap styles', () => {
    const { container } = render(
      <Flex gap="8px" style={{ gap: '20px' }}>
        Content
      </Flex>
    );
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).toHaveStyle({ gap: '20px' });
  });

  it('does not add style attribute when no styles are provided', () => {
    const { container } = render(<Flex>Content</Flex>);
    const flexDiv = container.firstChild as HTMLElement;
    expect(flexDiv).not.toHaveAttribute('style');
  });

  it('renders children', () => {
    const { getByText } = render(
      <Flex>
        <span>Child 1</span>
        <span>Child 2</span>
      </Flex>
    );
    expect(getByText('Child 1')).toBeInTheDocument();
    expect(getByText('Child 2')).toBeInTheDocument();
  });
});
