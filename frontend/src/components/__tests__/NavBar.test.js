import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import NavBar from '../NavBar';

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    currentUser: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    },
    logout: jest.fn()
  })
}));

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('NavBar Component', () => {
  const renderNavBar = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <NavBar />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders NavBar with logo', () => {
    renderNavBar();
    const logoElement = screen.getByText(/Roster Royals/i);
    expect(logoElement).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderNavBar();
    
    // Check for main navigation links
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Leagues/i)).toBeInTheDocument();
    expect(screen.getByText(/Market/i)).toBeInTheDocument();
    expect(screen.getByText(/Events/i)).toBeInTheDocument();
  });

  test('renders user menu when logged in', () => {
    renderNavBar();
    
    // Check for user menu
    const userMenuButton = screen.getByRole('button', { name: /testuser/i });
    expect(userMenuButton).toBeInTheDocument();
  });

  test('opens user menu when clicked', () => {
    renderNavBar();
    
    // Click on user menu
    const userMenuButton = screen.getByRole('button', { name: /testuser/i });
    fireEvent.click(userMenuButton);
    
    // Check if menu items are visible
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  test('renders mobile menu button', () => {
    renderNavBar();
    
    // Check for mobile menu button
    const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
    expect(mobileMenuButton).toBeInTheDocument();
  });

  test('opens mobile menu when clicked', () => {
    renderNavBar();
    
    // Click on mobile menu button
    const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(mobileMenuButton);
    
    // Check if mobile menu items are visible
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Leagues/i)).toBeInTheDocument();
    expect(screen.getByText(/Market/i)).toBeInTheDocument();
    expect(screen.getByText(/Events/i)).toBeInTheDocument();
  });
}); 