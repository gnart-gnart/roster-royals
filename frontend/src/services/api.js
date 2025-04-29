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
    // Check for specific error that might indicate a duplicate invite
    if (data.error && data.error.includes('already exists')) {
      throw new Error('This person has already been invited to this league');
    }
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
    console.log(`[placeBet] Placing bet with data:`, betData);

    // Prepare request data in the format expected by the backend
    const requestData = {
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
      },
      // Add outcomeKey directly at the top level as well
      // This is critically important for tiebreaker events
      outcomeKey: betData.outcomeKey
    };
    
    // Add circuit-specific data if this is a circuit bet
    if (betData.isCircuitBet) {
      requestData.circuitId = betData.circuitId;
      requestData.isCircuitBet = true;
      requestData.weight = betData.weight || 1;
      
      console.log(`[placeBet] Placing circuit bet for circuit ${betData.circuitId} with weight ${betData.weight}`);
      console.log(`[placeBet] Final request data:`, JSON.stringify(requestData));
    }

    // Use getHeaders to stay consistent with other API calls
    const response = await fetch(`${API_URL}/api/leagues/bets/post_league_event/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestData),
    });

    const data = await handleResponse(response);
    console.log(`[placeBet] Response:`, data);
    return data;
  } catch (error) {
    console.error('[placeBet] Error placing bet:', error);
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

/**
 * Fetch user bets for a specific event within a circuit
 * @param {string|number} circuitId - The ID of the circuit
 * @param {string|number} eventId - The ID of the event
 * @returns {Promise<Array>} - A promise that resolves to an array of user bets for the event
 */
export const getCircuitUserBets = async (circuitId, eventId) => {
  try {
    console.log(`[getCircuitUserBets] Fetching bets for circuit ${circuitId}, event ${eventId}`);
    
    const url = eventId ? 
      `${API_URL}/api/circuits/${circuitId}/events/${eventId}/bets/` : 
      `${API_URL}/api/circuits/${circuitId}/events/0/bets/`;
    
    console.log(`[getCircuitUserBets] API URL: ${url}`);
    
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      console.error(`[getCircuitUserBets] API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`[getCircuitUserBets] Error response: ${errorText}`);
      throw new Error(`Failed to fetch circuit user bets: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter to only include current user's bets
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    const userBets = data.filter(bet => bet.user_id === userId);
    
    console.log(`[getCircuitUserBets] Success: Found ${userBets.length} bets for user on event ${eventId} in circuit ${circuitId} (out of ${data.length} total bets)`, userBets);
    return userBets;
  } catch (error) {
    console.error(`[getCircuitUserBets] Exception:`, error);
    throw error;
  }
};

/**
 * Fetch all user bets for a circuit
 * @param {string|number} circuitId - The ID of the circuit
 * @returns {Promise<Array>} - A promise that resolves to an array of the current user's bets for the circuit
 */
export const getCurrentUserCircuitBets = async (circuitId) => {
  try {
    console.log(`[getCurrentUserCircuitBets] Fetching bets for circuit ${circuitId}`);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    
    if (!userId) {
      console.error('[getCurrentUserCircuitBets] No user ID found in localStorage');
      return [];
    }
    
    console.log(`[getCurrentUserCircuitBets] Current user ID: ${userId}`);
    
    // First try getting all events in the circuit
    const circuitDetails = await getCircuitDetail(circuitId);
    
    if (!circuitDetails || !circuitDetails.component_events || circuitDetails.component_events.length === 0) {
      console.log('[getCurrentUserCircuitBets] No component events found in circuit');
      return [];
    }
    
    console.log(`[getCurrentUserCircuitBets] Found ${circuitDetails.component_events.length} events in circuit`);
    
    // Get bets for each event and combine them
    const allBets = [];
    const eventIds = circuitDetails.component_events.map(ce => ce.league_event.id);
    
    console.log(`[getCurrentUserCircuitBets] Event IDs: ${eventIds.join(', ')}`);
    
    for (const component of circuitDetails.component_events) {
      try {
        const eventId = component.league_event.id;
        const eventBets = await getCircuitUserBets(circuitId, eventId);
        
        // The backend returns only bets for the specified circuit already
        if (eventBets.length > 0) {
          console.log(`[getCurrentUserCircuitBets] Found ${eventBets.length} bets for event ${eventId} in circuit ${circuitId}`);
          // Add event_id to each bet since it's not included in the backend response
          const betsWithEventId = eventBets.map(bet => ({
            ...bet,
            event_id: eventId
          }));
          allBets.push(...betsWithEventId);
        }
      } catch (err) {
        console.warn(`[getCurrentUserCircuitBets] Failed to fetch bets for event`, err);
        // Continue with other events
      }
    }
    
    console.log(`[getCurrentUserCircuitBets] Total bets found: ${allBets.length}`, allBets);
    return allBets;
  } catch (error) {
    console.error('[getCurrentUserCircuitBets] Error:', error);
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

export const updateUserSettings = async (settingsData) => {
  const response = await fetch(`${API_URL}/api/profile/settings/`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(settingsData),
  });
  return handleResponse(response);
};

/**
 * Join a circuit
 * @param {string|number} circuitId - The ID of the circuit to join
 * @returns {Promise<Object>} - A promise resolving to the API response
 */
export const joinCircuit = async (circuitId) => {
  try {
    const response = await fetch(`${API_URL}/api/circuits/${circuitId}/join/`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error joining circuit:', error);
    throw error;
  }
};

/**
 * Complete a circuit with tiebreaker
 * @param {number} circuitId - The ID of the circuit to complete
 * @param {number} tiebreakerEventId - The ID of the tiebreaker event
 * @param {string|number} tiebreakerValue - The correct value for the tiebreaker
 * @returns {Promise<Object>} - A promise that resolves to the API response
 */
export const completeCircuitWithTiebreaker = async (circuitId, tiebreakerEventId, tiebreakerValue) => {
  try {
    const response = await fetch(`${API_URL}/api/circuits/${circuitId}/complete-with-tiebreaker/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        tiebreaker_event_id: tiebreakerEventId,
        tiebreaker_value: tiebreakerValue
      }),
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error completing circuit with tiebreaker:', error);
    throw error;
  }
};

/**
 * Get events that the current user has already placed bets on in a circuit
 * @param {string|number} circuitId - The ID of the circuit
 * @returns {Promise<Array>} - A promise that resolves to an array of event IDs
 */
export const getCircuitCompletedBets = async (circuitId) => {
  try {
    console.log(`[getCircuitCompletedBets] Fetching completed bets for circuit ${circuitId}`);
    
    const response = await fetch(`${API_URL}/api/circuits/${circuitId}/completed-bets/`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      console.error(`[getCircuitCompletedBets] API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`[getCircuitCompletedBets] Error response: ${errorText}`);
      throw new Error(`Failed to fetch completed bets: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[getCircuitCompletedBets] Success: Found ${data.length} completed bets`, data);
    return data;
  } catch (error) {
    console.error(`[getCircuitCompletedBets] Exception:`, error);
    throw error;
  }
};

/**
 * Complete a specific event within a circuit
 * @param {string|number} circuitId - The ID of the circuit
 * @param {string|number} eventId - The ID of the event to complete
 * @param {string} winningOutcome - The winning outcome of the event
 * @param {number|null} numericValue - Optional numeric value for tiebreaker events
 * @returns {Promise<Object>} - A promise that resolves to the updated circuit data
 */
export const completeCircuitEvent = async (circuitId, eventId, winningOutcome, numericValue = null) => {
  try {
    console.log(`[completeCircuitEvent] Completing event ${eventId} in circuit ${circuitId}`);
    console.log(`[completeCircuitEvent] Winning outcome: ${winningOutcome}, Numeric value: ${numericValue}`);
    
    const requestData = {
      winning_outcome: winningOutcome
    };
    
    // Include numeric value if provided
    if (numericValue !== null) {
      requestData.numeric_value = numericValue;
    }
    
    const response = await fetch(`${API_URL}/api/circuits/${circuitId}/events/${eventId}/complete-event/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestData),
    });
    
    const data = await handleResponse(response);
    console.log(`[completeCircuitEvent] Response:`, data);
    return data;
  } catch (error) {
    console.error('[completeCircuitEvent] Error completing circuit event:', error);
    throw error;
  }
};

