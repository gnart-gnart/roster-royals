import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: null,
    loading: false
  })
}));

describe('ProtectedRoute Component', () => {
  const TestComponent = () => <div>Protected Content</div>;
  
  const renderProtectedRoute = (isAuthenticated = false, isLoading = false) => {
    // Override the mock for this test
    jest.spyOn(require('../../context/AuthContext'), 'useAuth')
      .mockImplementation(() => ({
        currentUser: isAuthenticated ? { id: 1, username: 'testuser' } : null,
        loading: isLoading
      }));
    
    return render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    );
  };

  test('redirects to login when user is not authenticated', () => {
    renderProtectedRoute(false);
    
    // Check if protected content is not displayed
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    
    // Check if redirected to login page
    expect(window.location.pathname).toBe('/login');
  });

  test('displays loading state when authentication is loading', () => {
    renderProtectedRoute(false, true);
    
    // Check if loading state is displayed
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    
    // Check if protected content is not displayed
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('renders protected content when user is authenticated', () => {
    renderProtectedRoute(true);
    
    // Check if protected content is displayed
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});