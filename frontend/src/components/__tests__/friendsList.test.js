import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FriendsList from '../FriendsList';

// Mock the API service
jest.mock('../../services/api', () => ({
  getFriends: jest.fn().mockResolvedValue([
    { id: 1, username: 'friend1', points: 1200 },
    { id: 2, username: 'friend2', points: 1500 }
  ]),
  removeFriend: jest.fn().mockResolvedValue({ success: true })
}));

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('FriendsList Component', () => {
  const renderFriendsList = () => {
    return render(
      <BrowserRouter>
        <FriendsList />
      </BrowserRouter>
    );
  };

  test('renders FriendsList component', () => {
    renderFriendsList();
    expect(screen.getByText(/Friends/i)).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    renderFriendsList();
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('displays friends after loading', async () => {
    renderFriendsList();
    
    // Wait for friends to load
    await waitFor(() => {
      expect(screen.getByText('friend1')).toBeInTheDocument();
      expect(screen.getByText('friend2')).toBeInTheDocument();
    });
    
    // Check if points are displayed
    expect(screen.getByText('1200')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
  });

  test('displays empty state when no friends', async () => {
    // Override the mock for this test
    jest.spyOn(require('../../services/api'), 'getFriends')
      .mockResolvedValueOnce([]);
    
    renderFriendsList();
    
    // Wait for empty state to be displayed
    await waitFor(() => {
      expect(screen.getByText(/No friends yet/i)).toBeInTheDocument();
    });
  });

  test('displays error state when API fails', async () => {
    // Override the mock for this test
    jest.spyOn(require('../../services/api'), 'getFriends')
      .mockRejectedValueOnce(new Error('API Error'));
    
    renderFriendsList();
    
    // Wait for error state to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error loading friends/i)).toBeInTheDocument();
    });
  });

  test('removes friend when remove button is clicked', async () => {
    renderFriendsList();
    
    // Wait for friends to load
    await waitFor(() => {
      expect(screen.getByText('friend1')).toBeInTheDocument();
    });
    
    // Click remove button for friend1
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);
    
    // Check if confirmation dialog appears
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    
    // Confirm removal
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    
    // Check if API was called
    await waitFor(() => {
      expect(require('../../services/api').removeFriend).toHaveBeenCalledWith(1);
    });
  });

  test('cancels friend removal when cancel button is clicked', async () => {
    renderFriendsList();
    
    // Wait for friends to load
    await waitFor(() => {
      expect(screen.getByText('friend1')).toBeInTheDocument();
    });
    
    // Click remove button for friend1
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);
    
    // Check if confirmation dialog appears
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    
    // Cancel removal
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Check if dialog is closed
    expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
    
    // Check if API was not called
    expect(require('../../services/api').removeFriend).not.toHaveBeenCalled();
  });
});