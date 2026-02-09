import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the main application with all section headings', () => {
    render(<App />);

    expect(screen.getByText('New Relic Query Builder')).toBeInTheDocument();
    expect(screen.getByText('General Query Filters')).toBeInTheDocument();
    expect(screen.getByText('Metric to Query')).toBeInTheDocument();
    expect(screen.getByText('View Options')).toBeInTheDocument();
    expect(screen.getByText('NewRelic Query')).toBeInTheDocument();
  });
});
