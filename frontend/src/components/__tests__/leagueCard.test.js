import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LeagueCard from '../LeagueCard';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('LeagueCard Component', () => {
  const mockLeague = {
    id: 1,
    name: 'Test League',
    description: 'A test league for testing',
    president: {
      id: 1,
      username: 'testpresident'
    },
    members: [
      { id: 1, username: 'testpresident' },
      { id: 2, username: 'member1' },
      { id: 3, username: 'member2' }
    ],
    sports: ['NBA', 'NFL'],
    created_at: '2023-01-01T00:00:00Z'
  };

  const renderLeagueCard = (props = {}) => {
    return render(
      <BrowserRouter>
        <LeagueCard league={mockLeague} {...props} />
      </BrowserRouter>
    );
  };

  test('renders LeagueCard with league information', () => {
    renderLeagueCard();
    
    // Check if league name is displayed
    expect(screen.getByText('Test League')).toBeInTheDocument();
    
    // Check if league description is displayed
    expect(screen.getByText('A test league for testing')).toBeInTheDocument();
    
    // Check if president is displayed
    expect(screen.getByText(/President: testpresident/i)).toBeInTheDocument();
    
    // Check if member count is displayed
    expect(screen.getByText(/3 members/i)).toBeInTheDocument();
    
    // Check if sports are displayed
    expect(screen.getByText(/NBA/i)).toBeInTheDocument();
    expect(screen.getByText(/NFL/i)).toBeInTheDocument();
  });

  test('displays join button when user is not a member', () => {
    renderLeagueCard({ currentUserId: 4 });
    expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument();
  });

  test('displays leave button when user is a member', () => {
    renderLeagueCard({ currentUserId: 2 });
    expect(screen.getByRole('button', { name: /leave/i })).toBeInTheDocument();
  });

  test('displays president badge when user is president', () => {
    renderLeagueCard({ currentUserId: 1 });
    expect(screen.getByText(/President/i)).toBeInTheDocument();
  });

  test('calls onJoin callback when join button is clicked', () => {
    const onJoin = jest.fn();
    renderLeagueCard({ currentUserId: 4, onJoin });
    
    const joinButton = screen.getByRole('button', { name: /join/i });
    fireEvent.click(joinButton);
    
    expect(onJoin).toHaveBeenCalledWith(1);
  });

  test('calls onLeave callback when leave button is clicked', () => {
    const onLeave = jest.fn();
    renderLeagueCard({ currentUserId: 2, onLeave });
    
    const leaveButton = screen.getByRole('button', { name: /leave/i });
    fireEvent.click(leaveButton);
    
    expect(onLeave).toHaveBeenCalledWith(1);
  });

  test('navigates to league page when card is clicked', () => {
    const navigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigate);
    
    renderLeagueCard();
    
    const card = screen.getByTestId('league-card');
    fireEvent.click(card);
    
    expect(navigate).toHaveBeenCalledWith('/league/1');
  });

  test('displays formatted date', () => {
    renderLeagueCard();
    expect(screen.getByText(/Jan 1, 2023/i)).toBeInTheDocument();
  });

  test('handles league with no description', () => {
    const leagueWithoutDescription = {
      ...mockLeague,
      description: null
    };
    
    render(
      <BrowserRouter>
        <LeagueCard league={leagueWithoutDescription} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/No description/i)).toBeInTheDocument();
  });

  test('handles league with no sports', () => {
    const leagueWithoutSports = {
      ...mockLeague,
      sports: []
    };
    
    render(
      <BrowserRouter>
        <LeagueCard league={leagueWithoutSports} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/No sports selected/i)).toBeInTheDocument();
  });
});