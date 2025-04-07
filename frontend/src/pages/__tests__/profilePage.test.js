import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../ProfilePage';

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      points: 100,
      date_joined: '2024-01-01T00:00:00Z'
    },
    updateProfile: jest.fn(),
    loading: false
  })
}));

// Mock the API service
jest.mock('../../services/api', () => ({
  getFriends: jest.fn(),
  getLeagues: jest.fn()
}));

describe('ProfilePage Component', () => {
  const mockUpdateProfile = jest.fn();
  const mockGetFriends = jest.fn();
  const mockGetLeagues = jest.fn();
  
  beforeEach(() => {
    // Reset the mocks before each test
    jest.clearAllMocks();
    
    // Override the auth context mock for this test
    jest.spyOn(require('../../context/AuthContext'), 'useAuth')
      .mockImplementation(() => ({
        currentUser: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          points: 100,
          date_joined: '2024-01-01T00:00:00Z'
        },
        updateProfile: mockUpdateProfile,
        loading: false
      }));
    
    // Override the API service mocks
    jest.spyOn(require('../../services/api'), 'getFriends')
      .mockImplementation(mockGetFriends);
    jest.spyOn(require('../../services/api'), 'getLeagues')
      .mockImplementation(mockGetLeagues);
  });

  const renderProfilePage = () => {
    return render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
  };

  test('renders profile information', () => {
    renderProfilePage();
    
    // Check if profile information is displayed
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText(/joined/i)).toBeInTheDocument();
  });

  test('handles profile update', async () => {
    renderProfilePage();
    
    // Click edit button
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));
    
    // Update the form
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'newusername' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'newemail@example.com' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Check if updateProfile function was called with correct data
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        username: 'newusername',
        email: 'newemail@example.com'
      });
    });
  });

  test('displays friends list', async () => {
    // Mock friends data
    mockGetFriends.mockResolvedValueOnce([
      { id: 2, username: 'friend1', points: 50 },
      { id: 3, username: 'friend2', points: 75 }
    ]);
    
    renderProfilePage();
    
    // Check if friends are displayed
    await waitFor(() => {
      expect(screen.getByText('friend1')).toBeInTheDocument();
      expect(screen.getByText('friend2')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
    });
  });

  test('displays leagues list', async () => {
    // Mock leagues data
    mockGetLeagues.mockResolvedValueOnce([
      { id: 1, name: 'League 1', member_count: 10 },
      { id: 2, name: 'League 2', member_count: 20 }
    ]);
    
    renderProfilePage();
    
    // Check if leagues are displayed
    await waitFor(() => {
      expect(screen.getByText('League 1')).toBeInTheDocument();
      expect(screen.getByText('League 2')).toBeInTheDocument();
      expect(screen.getByText('10 members')).toBeInTheDocument();
      expect(screen.getByText('20 members')).toBeInTheDocument();
    });
  });

  test('handles loading state', () => {
    // Override the auth context mock to show loading state
    jest.spyOn(require('../../context/AuthContext'), 'useAuth')
      .mockImplementation(() => ({
        currentUser: null,
        loading: true
      }));
    
    renderProfilePage();
    
    // Check if loading state is displayed
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('handles error state', async () => {
    // Mock API error
    mockGetFriends.mockRejectedValueOnce(new Error('Failed to load friends'));
    
    renderProfilePage();
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to load friends/i)).toBeInTheDocument();
    });
  });

  test('validates profile update form', async () => {
    renderProfilePage();
    
    // Click edit button
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));
    
    // Submit the form without filling in required fields
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Check if validation messages are displayed
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    
    // Check if updateProfile function was not called
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });
});