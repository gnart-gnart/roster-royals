import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SettingsPage from '../SettingsPage';

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    },
    updatePassword: jest.fn(),
    deleteAccount: jest.fn(),
    loading: false
  })
}));

describe('SettingsPage Component', () => {
  const mockUpdatePassword = jest.fn();
  const mockDeleteAccount = jest.fn();
  
  beforeEach(() => {
    // Reset the mocks before each test
    jest.clearAllMocks();
    
    // Override the auth context mock for this test
    jest.spyOn(require('../../context/AuthContext'), 'useAuth')
      .mockImplementation(() => ({
        currentUser: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        },
        updatePassword: mockUpdatePassword,
        deleteAccount: mockDeleteAccount,
        loading: false
      }));
  });

  const renderSettingsPage = () => {
    return render(
      <BrowserRouter>
        <SettingsPage />
      </BrowserRouter>
    );
  };

  test('renders settings page', () => {
    renderSettingsPage();
    
    // Check if page title and sections are displayed
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
    expect(screen.getByText(/change password/i)).toBeInTheDocument();
    expect(screen.getByText(/delete account/i)).toBeInTheDocument();
  });

  test('handles password change', async () => {
    renderSettingsPage();
    
    // Fill in the password change form
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'currentpass' }
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'newpass' }
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpass' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    
    // Check if updatePassword function was called with correct data
    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith({
        current_password: 'currentpass',
        new_password: 'newpass',
        new_password2: 'newpass'
      });
    });
  });

  test('validates password change form', async () => {
    renderSettingsPage();
    
    // Submit the form without filling in any fields
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    
    // Check if validation messages are displayed
    expect(screen.getByText(/current password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/confirm new password is required/i)).toBeInTheDocument();
    
    // Check if updatePassword function was not called
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  test('validates password match', async () => {
    renderSettingsPage();
    
    // Fill in the form with mismatched passwords
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'currentpass' }
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'newpass' }
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'differentpass' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    
    // Check if validation message is displayed
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    
    // Check if updatePassword function was not called
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  test('handles account deletion', async () => {
    renderSettingsPage();
    
    // Click delete account button
    fireEvent.click(screen.getByRole('button', { name: /delete account/i }));
    
    // Confirm deletion in the dialog
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    
    // Check if deleteAccount function was called
    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalled();
    });
  });

  test('cancels account deletion', async () => {
    renderSettingsPage();
    
    // Click delete account button
    fireEvent.click(screen.getByRole('button', { name: /delete account/i }));
    
    // Cancel deletion in the dialog
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    
    // Check if deleteAccount function was not called
    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });

  test('displays success message after password change', async () => {
    // Mock successful password update
    mockUpdatePassword.mockResolvedValueOnce();
    
    renderSettingsPage();
    
    // Fill in and submit the password change form
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'currentpass' }
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'newpass' }
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpass' }
    });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    
    // Check if success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument();
    });
  });

  test('displays error message after failed password change', async () => {
    // Mock failed password update
    mockUpdatePassword.mockRejectedValueOnce(new Error('Invalid current password'));
    
    renderSettingsPage();
    
    // Fill in and submit the password change form
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'wrongpass' }
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'newpass' }
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpass' }
    });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid current password/i)).toBeInTheDocument();
    });
  });
});