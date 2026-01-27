import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationSelector } from './ApplicationSelector';
import type { Application } from '../types/query';

describe('ApplicationSelector', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it('renders all three application options', () => {
    render(
      <ApplicationSelector
        selectedApplications={[]}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByLabelText('Global Tax Mapper API')).toBeInTheDocument();
    expect(screen.getByLabelText('Global Tax Mapper BFF')).toBeInTheDocument();
    expect(screen.getByLabelText('Global Tax Mapper Integrator API')).toBeInTheDocument();
  });

  it('shows checkboxes as checked when applications are selected', () => {
    render(
      <ApplicationSelector
        selectedApplications={['global-tax-mapper-api', 'global-tax-mapper-bff']}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByLabelText('Global Tax Mapper API')).toBeChecked();
    expect(screen.getByLabelText('Global Tax Mapper BFF')).toBeChecked();
    expect(screen.getByLabelText('Global Tax Mapper Integrator API')).not.toBeChecked();
  });

  it('calls onToggle with correct application when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ApplicationSelector
        selectedApplications={[]}
        onToggle={mockOnToggle}
      />
    );

    await user.click(screen.getByLabelText('Global Tax Mapper API'));
    expect(mockOnToggle).toHaveBeenCalledWith('global-tax-mapper-api');
  });

  it('allows multiple applications to be selected', async () => {
    const user = userEvent.setup();
    render(
      <ApplicationSelector
        selectedApplications={['global-tax-mapper-api']}
        onToggle={mockOnToggle}
      />
    );

    await user.click(screen.getByLabelText('Global Tax Mapper BFF'));
    expect(mockOnToggle).toHaveBeenCalledWith('global-tax-mapper-bff');
  });

  it('renders the Applications legend', () => {
    render(
      <ApplicationSelector
        selectedApplications={[]}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText('Applications')).toBeInTheDocument();
  });
});
