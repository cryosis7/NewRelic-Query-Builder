import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FacetSelector } from './FacetSelector';

describe('FacetSelector', () => {
  it('renders all facet options', () => {
    const onChange = vi.fn();
    render(<FacetSelector selectedFacet="request.uri" onChange={onChange} />);

    expect(screen.getByLabelText('No Facet')).toBeInTheDocument();
    expect(screen.getByLabelText('Request URI')).toBeInTheDocument();
    expect(screen.getByLabelText('Response Status')).toBeInTheDocument();
    expect(screen.getByLabelText('HTTP Method')).toBeInTheDocument();
    expect(screen.getByLabelText('Transaction Name')).toBeInTheDocument();
  });

  it('checks the selected facet option', () => {
    const onChange = vi.fn();
    render(<FacetSelector selectedFacet="response.status" onChange={onChange} />);

    expect(screen.getByLabelText('Response Status')).toBeChecked();
    expect(screen.getByLabelText('Request URI')).not.toBeChecked();
  });

  it('calls onChange when a facet option is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FacetSelector selectedFacet="request.uri" onChange={onChange} />);

    await user.click(screen.getByLabelText('HTTP Method'));

    expect(onChange).toHaveBeenCalledWith('http.method');
  });

  it('handles "none" selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FacetSelector selectedFacet="request.uri" onChange={onChange} />);

    await user.click(screen.getByLabelText('No Facet'));

    expect(onChange).toHaveBeenCalledWith('none');
  });
});
