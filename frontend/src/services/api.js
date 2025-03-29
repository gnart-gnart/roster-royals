const API_URL = process.env.REACT_APP_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Using token:', token); // Debug log
  return {
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}`,
  };
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Clear invalid token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    throw new Error('Please login again');
  }
  
  if (!response.ok) {
    const text = await response.text();
    console.error('API Error:', response.status, text);
    throw new Error(text || 'API request failed');
  }
  
  return response.json();
};

export const createLeague = async (leagueData) => {
  const response = await fetch(`${API_URL}/leagues/create/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(leagueData),
  });

  if (!response.ok) {
    throw new Error('Failed to create league');
  }

  return response.json();
};

export const sendFriendRequest = async (userId) => {
  const response = await fetch(`${API_URL}/friend-request/send/${userId}/`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to send friend request');
  }

  return response.json();
};

export const getFriendRequests = async () => {
  const response = await fetch(`${API_URL}/friend-requests/`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to get friend requests');
  }

  return response.json();
};

export const handleFriendRequest = async (requestId, action) => {
  const response = await fetch(`${API_URL}/friend-request/${requestId}/handle/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    throw new Error('Failed to handle friend request');
  }

  return response.json();
};

export const getFriends = async () => {
  const response = await fetch(`${API_URL}/friends/`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getLeagues = async () => {
  const response = await fetch(`${API_URL}/leagues/`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leagues');
  }

  return response.json();
};

export const searchUsers = async (query) => {
  const response = await fetch(`${API_URL}/users/search/?q=${encodeURIComponent(query)}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to search users');
  }

  return response.json();
};

export const getNotifications = async () => {
  const response = await fetch(`${API_URL}/notifications/`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  return response.json();
};

export const markNotificationsRead = async () => {
  const response = await fetch(`${API_URL}/notifications/mark-read/`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to mark notifications as read');
  }

  return response.json();
};

export const removeFriend = async (friendId) => {
  const response = await fetch(`${API_URL}/friends/remove/${friendId}/`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to remove friend');
  }

  return response.json();
};

export const inviteToLeague = async (leagueId, userId) => {
  console.log(`Sending invite for league ${leagueId} to user ${userId}`);
  const response = await fetch(`${API_URL}/leagues/${leagueId}/invite/${userId}/`, {
    method: 'POST',
    headers: getHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Invite failed:', data);
    throw new Error(data.error || 'Failed to send invite');
  }

  console.log('Invite response:', data);
  return data;
};

export const handleLeagueInvite = async (inviteId, action) => {
  const response = await fetch(`${API_URL}/league-invites/${inviteId}/handle/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    throw new Error('Failed to handle invite');
  }

  return response.json();
};

export const getLeague = async (leagueId) => {
  try {
    const response = await fetch(`${API_URL}/leagues/${leagueId}/`, {
      headers: getHeaders(),
    });
    return response.json();
  } catch (error) {
    console.error('Error fetching league:', error);
    throw error;
  }
};

export const browseMarket = async () => {
  const response = await fetch(`${API_URL}/market/browse/`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getAvailableSports = async () => {
  const response = await fetch(`${API_URL}/leagues/bets/`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}; 

export const getAvailableSportEvents = async (sport) => {
  // If sport parameter is provided, fetch data for that sport using the new endpoint
  const endpoint = sport ? 
    `${API_URL}/leagues/bets/${sport}/` : 
    `${API_URL}/leagues/bets/`;
  
  const response = await fetch(endpoint, {
    headers: getHeaders(),
  });
  
  return handleResponse(response);
};

export const getCompetitionEvents = async (competitionKey) => {
  const endpoint = `${API_URL}/leagues/bets/competition/${competitionKey}/`;
  const response = await fetch(endpoint, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getEventDetails = async (eventId) => {
  const endpoint = `${API_URL}/leagues/bets/events/${eventId}/`;
  const response = await fetch(endpoint, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

/**
 * Place a bet in a league
 * @param {Object} betData - The bet data
 * @returns {Promise<Object>} - A promise that resolves to the created bet
 */
export const placeBet = async (betData) => {
  try {
    console.log(`Placing bet with data:`, betData);

    // Use getHeaders to stay consistent with other API calls
    const response = await fetch(`${API_URL}/leagues/bets/post_league_event/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        league_id: betData.leagueId,
        event_key: betData.eventKey,
        event_name: betData.eventName,
        sport: betData.sport,
        market_data: {
          marketKey: betData.marketKey,
          outcomeKey: betData.outcomeKey,
          odds: betData.odds,
          amount: betData.amount
        }
      }),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error placing bet:', error);
    throw error;
  }
};

export const getLeagueEvents = async (leagueId) => {
  const response = await fetch(`${API_URL}/leagues/${leagueId}/events/`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

