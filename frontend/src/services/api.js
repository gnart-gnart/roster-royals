const API_URL = process.env.REACT_APP_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('[getHeaders] Token retrieved from localStorage:', token ? `${token.substring(0, 5)}...` : 'null');
  
  if (!token) {
    console.warn('[getHeaders] No token found in localStorage! This will cause authentication failures.');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Token ${token}` : '',
  };
  
  console.log('[getHeaders] Generated headers:', headers);
  return headers;
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
  const isFormData = leagueData instanceof FormData;
  const response = await fetch(`${API_URL}/api/leagues/create/`, {
    method: 'POST',
    headers: isFormData ? {
      'Authorization': getHeaders().Authorization
    } : getHeaders(),
    body: isFormData ? leagueData : JSON.stringify(leagueData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create league');
  }

  return response.json();
};

export const sendFriendRequest = async (userId) => {
  const response = await fetch(`${API_URL}/api/friend-request/send/${userId}/`, {
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
  const response = await fetch(`${API_URL}/api/friend-requests/`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to get friend requests');
  }

  return response.json();
};

export const handleFriendRequest = async (requestId, action) => {
  const response = await fetch(`${API_URL}/api/friend-request/${requestId}/handle/`, {
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
  const response = await fetch(`${API_URL}/api/friends/`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getLeagues = async () => {
  const response = await fetch(`${API_URL}/api/leagues/`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leagues');
  }

  return response.json();
};

export const searchUsers = async (query) => {
  const response = await fetch(`${API_URL}/api/users/search/?q=${encodeURIComponent(query)}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to search users');
  }

  return response.json();
};

export const getNotifications = async () => {
  console.log("Fetching notifications...");
  const response = await fetch(`${API_URL}/api/notifications/`, {
    headers: getHeaders(),
  });

  console.log("Notifications response status:", response.status);
  
  if (!response.ok) {
    console.error("Error fetching notifications:", response.statusText);
    throw new Error('Failed to fetch notifications');
  }

  const data = await response.json();
  console.log("Notifications data:", data);
  return data;
};

export const markNotificationsRead = async () => {
  const response = await fetch(`${API_URL}/api/notifications/mark-read/`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to mark notifications as read');
  }

  return response.json();
};

export const removeFriend = async (friendId) => {
  const response = await fetch(`${API_URL}/api/friends/remove/${friendId}/`, {
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
  const response = await fetch(`${API_URL}/api/leagues/${leagueId}/invite/${userId}/`, {
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
  const response = await fetch(`${API_URL}/api/league-invites/${inviteId}/handle/`, {
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
    const response = await fetch(`${API_URL}/api/leagues/${leagueId}/`, {
      headers: getHeaders(),
    });
    return response.json();
  } catch (error) {
    console.error('Error fetching league:', error);
    throw error;
  }
};

export const updateLeague = async (leagueId, updateData) => {
  const isFormData = updateData instanceof FormData;
  const response = await fetch(`${API_URL}/api/leagues/${leagueId}/update/`, {
    method: 'PUT',
    headers: isFormData ? {
      'Authorization': getHeaders().Authorization
    } : getHeaders(),
    body: isFormData ? updateData : JSON.stringify(updateData),
  });
  
  return handleResponse(response);
};

export const browseMarket = async () => {
  const response = await fetch(`${API_URL}/api/market/browse/`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getAvailableSports = async () => {
  const response = await fetch(`${API_URL}/api/leagues/bets/`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}; 

export const getAvailableSportEvents = async (sport) => {
  // If sport parameter is provided, fetch data for that sport using the new endpoint
  const endpoint = sport ? 
    `${API_URL}/api/leagues/bets/${sport}/` : 
    `${API_URL}/api/leagues/bets/`;
  
  const response = await fetch(endpoint, {
    headers: getHeaders(),
  });
  
  return handleResponse(response);
};

export const getCompetitionEvents = async (competitionKey) => {
  const endpoint = `${API_URL}/api/leagues/bets/competition/${competitionKey}/`;
  const response = await fetch(endpoint, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getEventDetails = async (eventId) => {
  try {
    const headers = getHeaders();
    console.log(`[getEventDetails] Event ID: ${eventId}, Auth headers:`, headers);
    console.log(`[getEventDetails] Token from localStorage:`, localStorage.getItem('token'));
    
    // Normalize the event ID
    const normalizedEventId = eventId.toString();
    console.log(`[getEventDetails] Using normalized event ID: ${normalizedEventId}`);
    
    const url = `${API_URL}/api/leagues/events/${normalizedEventId}/`;
    console.log(`[getEventDetails] Fetching from URL: ${url}`);
    
    const response = await fetch(url, {
      headers: headers,
    });
    
    console.log(`[getEventDetails] Response status:`, response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getEventDetails] Error response: ${errorText}`);
      
      // If we got a 401, let's verify the token status
      if (response.status === 401) {
        const token = localStorage.getItem('token');
        console.error(`[getEventDetails] Authentication failure. Token exists: ${!!token}`);
        throw new Error(`Authentication failed. Please log in again.`);
      }
      
      throw new Error(`Failed to get event details: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[getEventDetails] Success - received data:`, data);
    return data;
  } catch (error) {
    console.error('[getEventDetails] Error:', error);
    throw error;
  }
};

export const getLeagueEvents = async (leagueId) => {
  try {
    const response = await fetch(`${API_URL}/api/leagues/${leagueId}/events/`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get league events: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting league events:', error);
    throw error;
  }
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
    const response = await fetch(`${API_URL}/api/leagues/bets/post_league_event/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        league_id: betData.leagueId,
        event_key: betData.eventKey,
        event_id: betData.eventId,
        event_name: betData.eventName,
        sport: betData.sport,
        commence_time: betData.commenceTime,
        home_team: betData.homeTeam,
        away_team: betData.awayTeam,
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

/**
 * Complete a league event and determine winners/losers
 * @param {number} eventId - The ID of the event to complete
 * @param {string} winningOutcome - The outcome that won (e.g., "home", "away", "draw")
 * @returns {Promise<Object>} - A promise that resolves to the API response
 */
export const completeLeagueEvent = async (eventId, winningOutcome) => {
  try {
    const response = await fetch(`${API_URL}/api/leagues/events/${eventId}/complete/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        winning_outcome: winningOutcome
      }),
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error completing league event:', error);
    throw error;
  }
};

/**
 * Create a custom betting event with manual details
 * @param {Object} eventData - The event data containing details for the custom event
 * @returns {Promise<Object>} - A promise that resolves to the created event
 */
export const createCustomEvent = async (eventData) => {
  try {
    console.log("Creating custom event with data:", eventData);
    const response = await fetch(`${API_URL}/api/leagues/events/create/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(eventData),
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating custom event:', error);
    throw error;
  }
};

export const removeMember = async (leagueId, memberId) => {
  const response = await fetch(`${API_URL}/api/leagues/${leagueId}/members/${memberId}/remove/`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to remove member');
  }

  return response.json();
};

/**
 * Fetch circuits for a specific league
 * @param {string|number} leagueId - The ID of the league
 * @returns {Promise<Array>} - A promise that resolves to an array of circuits
 */
export const getLeagueCircuits = async (leagueId) => {
    try {
        const response = await fetch(`${API_URL}/api/leagues/${leagueId}/circuits/`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching league circuits:', error);
        throw error;
    }
};

/**
 * Create a new circuit within a league
 * @param {string|number} leagueId - The ID of the league
 * @param {Object} circuitData - Data for the new circuit, including name, description, entry_fee, component_events_data, etc.
 * @returns {Promise<Object>} - A promise resolving to the newly created circuit object
 */
export const createCircuit = async (leagueId, circuitData) => {
    try {
        const response = await fetch(`${API_URL}/api/leagues/${leagueId}/circuits/create/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(circuitData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error creating circuit:', error);
        throw error; // Re-throw the error to be caught by the calling component
    }
};

/**
 * Fetch detailed information for a specific circuit
 * @param {string|number} circuitId - The ID of the circuit
 * @returns {Promise<Object>} - A promise that resolves to the detailed circuit object
 */
export const getCircuitDetail = async (circuitId) => {
    try {
        const response = await fetch(`${API_URL}/api/circuits/${circuitId}/`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching circuit detail:', error);
        throw error;
    }
};

export const getUserProfile = async () => {
  const response = await fetch(`${API_URL}/api/profile/`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getOtherUserProfile = async (userId) => {
  const response = await fetch(`${API_URL}/api/profile/${userId}/`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getUserBettingStats = async () => {
  const response = await fetch(`${API_URL}/api/profile/betting-stats/`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getUserBetHistory = async () => {
  const response = await fetch(`${API_URL}/api/profile/bet-history/`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getOtherUserBettingStats = async (userId) => {
  const response = await fetch(`${API_URL}/api/profile/${userId}/betting-stats/`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getOtherUserBetHistory = async (userId) => {
  const response = await fetch(`${API_URL}/api/profile/${userId}/bet-history/`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const updateUserProfile = async (profileData) => {
  const isFormData = profileData instanceof FormData;
  const response = await fetch(`${API_URL}/api/profile/update/`, {
    method: 'PUT',
    headers: isFormData ? {
      'Authorization': getHeaders().Authorization
    } : getHeaders(),
    body: isFormData ? profileData : JSON.stringify(profileData),
  });
  return handleResponse(response);
};

