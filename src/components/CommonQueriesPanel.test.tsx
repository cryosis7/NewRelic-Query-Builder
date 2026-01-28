import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommonQueriesPanel } from './CommonQueriesPanel';
import { QUERY_PRESETS } from '../data/presets';

describe('CommonQueriesPanel', () => {
  const mockOnSelectPreset = vi.fn();

  beforeEach(() => {
    mockOnSelectPreset.mockClear();
  });

  it('renders the Common Queries heading', () => {
    render(<CommonQueriesPanel onSelectPreset={mockOnSelectPreset} />);
    
    expect(screen.getByText('Common Queries')).toBeInTheDocument();
  });

  it('renders all preset buttons', () => {
    render(<CommonQueriesPanel onSelectPreset={mockOnSelectPreset} />);
    
    QUERY_PRESETS.forEach((preset) => {
      expect(screen.getByRole('button', { name: preset.name })).toBeInTheDocument();
    });
  });

  it('renders buttons with title attribute containing description', () => {
    render(<CommonQueriesPanel onSelectPreset={mockOnSelectPreset} />);
    
    QUERY_PRESETS.forEach((preset) => {
      const button = screen.getByRole('button', { name: preset.name });
      expect(button).toHaveAttribute('title', preset.description);
    });
  });

  it('calls onSelectPreset with correct state when API Prod button is clicked', async () => {
    const user = userEvent.setup();
    render(<CommonQueriesPanel onSelectPreset={mockOnSelectPreset} />);
    
    await user.click(screen.getByRole('button', { name: 'API Prod - Last Hour' }));
    
    expect(mockOnSelectPreset).toHaveBeenCalledTimes(1);
    const calledWith = mockOnSelectPreset.mock.calls[0][0];
    expect(calledWith.applications).toEqual(['global-tax-mapper-api']);
    expect(calledWith.environment).toBe('prod');
    expect(calledWith.excludeHealthChecks).toBe(true);
    expect(calledWith.metricItems?.[0]?.metricType).toBe('transaction-count');
  });

  it('calls onSelectPreset with all apps when All Apps button is clicked', async () => {
    const user = userEvent.setup();
    render(<CommonQueriesPanel onSelectPreset={mockOnSelectPreset} />);
    
    await user.click(screen.getByRole('button', { name: 'All Apps Prod - Last Hour' }));
    
    expect(mockOnSelectPreset).toHaveBeenCalledTimes(1);
    const calledWith = mockOnSelectPreset.mock.calls[0][0];
    expect(calledWith.applications).toEqual([
      'global-tax-mapper-api',
      'global-tax-mapper-bff', 
      'global-tax-mapper-integrator-api'
    ]);
  });

  it('calls onSelectPreset with UAT environment when UAT button is clicked', async () => {
    const user = userEvent.setup();
    render(<CommonQueriesPanel onSelectPreset={mockOnSelectPreset} />);
    
    await user.click(screen.getByRole('button', { name: 'API UAT - Last Hour' }));
    
    expect(mockOnSelectPreset).toHaveBeenCalledTimes(1);
    const calledWith = mockOnSelectPreset.mock.calls[0][0];
    expect(calledWith.environment).toBe('uat');
  });

  it('includes timePeriod in preset state', async () => {
    const user = userEvent.setup();
    render(<CommonQueriesPanel onSelectPreset={mockOnSelectPreset} />);
    
    await user.click(screen.getByRole('button', { name: 'API Prod - Last Hour' }));
    
    const calledWith = mockOnSelectPreset.mock.calls[0][0];
    expect(calledWith.timePeriod).toBeDefined();
    expect(calledWith.timePeriod.since).toBeDefined();
    expect(calledWith.timePeriod.until).toBeDefined();
  });

  it('renders exactly 5 preset buttons', () => {
    render(<CommonQueriesPanel onSelectPreset={mockOnSelectPreset} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });
});
