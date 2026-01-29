import { render } from '@testing-library/react';
import { SectionRule } from './SectionRule';

describe('SectionRule', () => {
  it('renders an hr element', () => {
    const { container } = render(<SectionRule />);
    const hr = container.querySelector('hr');
    expect(hr).toBeInTheDocument();
  });

  it('applies 75% width style', () => {
    const { container } = render(<SectionRule />);
    const hr = container.querySelector('hr');
    expect(hr).toHaveStyle({ width: '75%' });
  });

  it('applies centered margin', () => {
    const { container } = render(<SectionRule />);
    const hr = container.querySelector('hr');
    expect(hr).toHaveStyle({ margin: '1rem auto' });
  });

  it('applies custom className when provided', () => {
    const { container } = render(<SectionRule className="custom-class" />);
    const hr = container.querySelector('hr');
    expect(hr).toHaveClass('custom-class');
  });

  it('applies border styling', () => {
    const { container } = render(<SectionRule />);
    const hr = container.querySelector('hr');
    expect(hr).toHaveStyle({ borderTop: '1px solid #e0e0e0' });
  });
});
