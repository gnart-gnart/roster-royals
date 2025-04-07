import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LeaguePage from '../LeaguePage';

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      id: 1,
      username: 'testuser'
    },
    loading: false
  })
}));

// Mock the API service
jest.mock('../../services/api', () => ({
  getLeague: jest.fn(),
  joinLeague: jest.fn(),
  leaveLeague: jest.fn(),
  getLeagueMembers: jest.fn(),
  getLeagueStandings: jest.fn()
}));

describe('LeaguePage Component', () => {
  const mockGetLeague = jest.fn();
  const mockJoinLeague = jest.fn();
  const mockLeaveLeague = jest.fn();
  const mockGetLeagueMembers = jest.fn();
  const mockGetLeagueStandings = jest.fn();
  
  beforeEach(() => {
    // Reset the mocks before each test
    jest.clearAllMocks();
    
    // Override the API service mocks
    jest.spyOn(require('../../services/api'), 'getLeague')
      .mockImplementation(mockGetLeague);
    jest.spyOn(require('../../services/api'), 'joinLeague')
      .mockImplementation(mockJoinLeague);
    jest.spyOn(require('../../services/api'), 'leaveLeague')
      .mockImplementation(mockLeaveLeague);
    jest.spyOn(require('../../services/api'), 'getLeagueMembers')
      .mockImplementation(mockGetLeagueMembers);
    jest.spyOn(require('../../services/api'), 'getLeagueStandings')
      .mockImplementation(mockGetLeagueStandings);
  });

  const renderLeaguePage = (leagueId = '1') => {
    return render(
      <BrowserRouter>
        <Routes>
          <Route path="/league/:id" element={<LeaguePage />} />
        </Routes>
      </BrowserRouter>
    );
  };

  test('renders league information', async () => {
    // Mock league data
    mockGetLeague.mockResolvedValueOnce({
      id: 1,
      name: 'Test League',
      description: 'Test Description',
      president: { id: 1, username: 'testuser' },
      member_count: 10,
      sports: ['Football', 'Basketball'],
      created_at: '2024-01-01T00:00:00Z'
    });
    
    renderLeaguePage();
    
    // Check if league information is displayed
    await waitFor(() => {
      expect(screen.getByText('Test League')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('10 members')).toBeInTheDocument();
      expect(screen.getByText('Football')).toBeInTheDocument();
      expect(screen.getByText('Basketball')).toBeInTheDocument();
    });
  });

  test('handles joining league', async () => {
    // Mock league data
    mockGetLeague.mockResolvedValueOnce({
      id: 1,
      name: 'Test League',
      president: { id: 2, username: 'otheruser' },
      member_count: 10
    });
    
    renderLeaguePage();
    
    // Click join button
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /join league/i }));
    });
    
    // Check if joinLeague function was called
    expect(mockJoinLeague).toHaveBeenCalledWith(1);
  });

  test('handles leaving league', async () => {
    // Mock league data with current user as member
    mockGetLeague.mockResolvedValueOnce({
      id: 1,
      name: 'Test League',
      president: { id: 2, username: 'otheruser' },
      member_count: 10,
      is_member: true
    });
    
    renderLeaguePage();
    
    // Click leave button
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /leave league/i }));
    });
    
    // Check if leaveLeague function was called
    expect(mockLeaveLeague).toHaveBeenCalledWith(1);
  });

  test('displays league members', async () => {
    // Mock league and members data
    mockGetLeague.mockResolvedValueOnce({
      id: 1,
      name: 'Test League'
    });
    mockGetLeagueMembers.mockResolvedValueOnce([
      { id: 1, username: 'testuser', points: 100 },
      { id: 2, username: 'member1', points: 50 },
      { id: 3, username: 'member2', points: 75 }
    ]);
    
    renderLeaguePage();
    
    // Check if members are displayed
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('member1')).toBeInTheDocument();
      expect(screen.getByText('member2')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
    });
  });

  test('displays league standings', async () => {
    // Mock league and standings data
    mockGetLeague.mockResolvedValueOnce({
      id: 1,
      name: 'Test League'
    });
    mockGetLeagueStandings.mockResolvedValueOnce([
      { id: 1, username: 'testuser', points: 100, rank: 1 },
      { id: 2, username: 'member1', points: 50, rank: 2 },
      { id: 3, username: 'member2', points: 75, rank: 3 }
    ]);
    
    renderLeaguePage();
    
    // Check if standings are displayed
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('member1')).toBeInTheDocument();
      expect(screen.getByText('member2')).toBeInTheDocument();
    });
  });

  test('handles loading state', () => {
    renderLeaguePage();
    
    // Check if loading state is displayed
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('handles error state', async () => {
    // Mock API error
    mockGetLeague.mockRejectedValueOnce(new Error('Failed to load league'));
    
    renderLeaguePage();
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to load league/i)).toBeInTheDocument();
    });
  });

  test('displays president actions for league president', async () => {
    // Mock league data with current user as president
    mockGetLeague.mockResolvedValueOnce({
      id: 1,
      name: 'Test League',
      president: { id: 1, username: 'testuser' }
    });
    
    renderLeaguePage();
    
    // Check if president actions are displayed
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit league/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /manage members/i })).toBeInTheDocument();
    });
  });
});