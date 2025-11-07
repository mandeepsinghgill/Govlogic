import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders landing page by default', () => {
    renderWithRouter(<App />);
    expect(screen.getByText(/GovSure/i)).toBeInTheDocument();
  });

  test('redirects to login when no token', () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderWithRouter(<App />);
    // Should redirect to login page
    expect(window.location.pathname).toBe('/login');
  });

  test('renders dashboard when authenticated', () => {
    localStorageMock.getItem.mockReturnValue('fake-token');
    renderWithRouter(<App />);
    // Should show dashboard content
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });
});
