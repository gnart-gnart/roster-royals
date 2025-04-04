import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    currentUser: null,
    loading: false
  })
}));

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('LoginPage Component', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks();
    
    // Override the auth context mock for this test
    jest.spyOn(require('../../context/AuthContext'), 'useAuth')
      .mockImplementation(() => ({
        login: mockLogin,
        currentUser: null,
        loading: false
      }));
  });

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
  };

  test('renders login form', () => {
    renderLoginPage();
    
    // Check if form elements are present
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('handles form submission with valid credentials', async () => {
    renderLoginPage();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if login function was called with correct credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('displays error message with invalid credentials', async () => {
    // Mock login to throw an error
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    renderLoginPage();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('disables form during submission', async () => {
    renderLoginPage();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if form is disabled during submission
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  test('validates required fields', async () => {
    renderLoginPage();
    
    // Submit the form without filling in any fields
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if validation messages are displayed
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    
    // Check if login function was not called
    expect(mockLogin).not.toHaveBeenCalled();
  });
});