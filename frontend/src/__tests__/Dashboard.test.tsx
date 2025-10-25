import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardEnhanced from '../pages/DashboardEnhanced';

// Mock the API calls
jest.mock('../services/api', () => ({
  getOpportunities: jest.fn().mockResolvedValue([]),
  getAnalytics: jest.fn().mockResolvedValue({
    pipeline_value: 1000000,
    win_rate: 0.75,
    active_opportunities: 25
  })
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  test('renders dashboard title', () => {
    renderWithRouter(<DashboardEnhanced />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  test('renders analytics cards', () => {
    renderWithRouter(<DashboardEnhanced />);
    expect(screen.getByText(/Pipeline Value/i)).toBeInTheDocument();
    expect(screen.getByText(/Win Rate/i)).toBeInTheDocument();
  });

  test('renders top opportunities section', () => {
    renderWithRouter(<DashboardEnhanced />);
    expect(screen.getByText(/Top 25 Opportunities/i)).toBeInTheDocument();
  });
});
