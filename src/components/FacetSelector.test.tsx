import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FacetSelector } from './FacetSelector';

describe('FacetSelector', () => {
  it('renders all facet options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FacetSelector selectedFacet="request.uri" onChange={onChange} />);

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('option', { name: 'No Facet' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Request URI' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Response Status' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'HTTP Method' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Transaction Name' })).toBeInTheDocument();
  });

  it('calls onChange when a facet option is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FacetSelector selectedFacet="request.uri" onChange={onChange} />);

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'HTTP Method' }));

    expect(onChange).toHaveBeenCalledWith('http.method');
  });

  it('handles "none" selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FacetSelector selectedFacet="request.uri" onChange={onChange} />);

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'No Facet' }));

    expect(onChange).toHaveBeenCalledWith('none');
  });
});
