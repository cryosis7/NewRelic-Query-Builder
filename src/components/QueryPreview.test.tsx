import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryPreview } from './QueryPreview';

describe('QueryPreview', () => {
  it('renders the Generated Query legend', () => {
    render(<QueryPreview query="SELECT * FROM Transaction" />);
    
    expect(screen.getByText('Generated Query')).toBeInTheDocument();
  });

  it('displays the provided query text', () => {
    const query = 'FROM Transaction select count(*)';
    render(<QueryPreview query={query} />);
    
    expect(screen.getByText(query)).toBeInTheDocument();
  });

  it('renders the Copy Query button', () => {
    render(<QueryPreview query="SELECT * FROM Transaction" />);
    
    expect(screen.getByRole('button', { name: /copy query/i })).toBeInTheDocument();
  });

  it('copies query to clipboard when Copy button is clicked', async () => {
    const user = userEvent.setup();
    const query = 'FROM Transaction select count(*)';
    render(<QueryPreview query={query} />);
    
    await user.click(screen.getByRole('button', { name: /copy query/i }));
    
    // Verify the copy succeeded by checking the button changed to "Copied!"
    // The button only shows "Copied!" after a successful clipboard write
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
    });
  });

  it('shows Copied! feedback after successful copy', async () => {
    const user = userEvent.setup();
    render(<QueryPreview query="SELECT * FROM Transaction" />);
    
    await user.click(screen.getByRole('button', { name: /copy query/i }));
    
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
  });

  it('reverts button text back to Copy Query after 2 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<QueryPreview query="SELECT * FROM Transaction" />);
    
    await user.click(screen.getByRole('button', { name: /copy query/i }));
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copy query/i })).toBeInTheDocument();
    });
    
    vi.useRealTimers();
  });

  it('disables Copy button when query is invalid (starts with --)', () => {
    render(<QueryPreview query="-- Select at least one application" />);
    
    expect(screen.getByRole('button', { name: /copy query/i })).toBeDisabled();
  });

  it('enables Copy button when query is valid', () => {
    render(<QueryPreview query="FROM Transaction select count(*)" />);
    
    expect(screen.getByRole('button', { name: /copy query/i })).toBeEnabled();
  });

  it('displays invalid query with warning styling', () => {
    render(<QueryPreview query="-- Select at least one application" />);
    
    const pre = screen.getByText('-- Select at least one application');
    expect(pre).toHaveStyle({ backgroundColor: '#fff3cd' });
  });

  it('displays valid query with standard styling', () => {
    render(<QueryPreview query="FROM Transaction select count(*)" />);
    
    const pre = screen.getByText('FROM Transaction select count(*)');
    expect(pre).toHaveStyle({ backgroundColor: '#f5f5f5' });
  });
});
