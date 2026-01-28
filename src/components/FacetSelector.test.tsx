import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FacetSelector } from './FacetSelector';

describe('FacetSelector', () => {
  it('renders all facet options', () => {
    const onChange = vi.fn();
    render(<FacetSelector selectedFacet="request.uri" onChange={onChange} />);

    expect(screen.getByText('No Facet')).toBeInTheDocument();
    expect(screen.getByText('Request URI')).toBeInTheDocument();
    expect(screen.getByText('Response Status')).toBeInTheDocument();
    expect(screen.getByText('HTTP Method')).toBeInTheDocument();
    expect(screen.getByText('Transaction Name')).toBeInTheDocument();
  });

  it('calls onChange when a facet option is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FacetSelector selectedFacet="request.uri" onChange={onChange} />);

    await user.click(screen.getByText('HTTP Method'));

    expect(onChange).toHaveBeenCalledWith('http.method');
  });

  it('handles "none" selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FacetSelector selectedFacet="request.uri" onChange={onChange} />);

    await user.click(screen.getByText('No Facet'));

    expect(onChange).toHaveBeenCalledWith('none');
  });
});
