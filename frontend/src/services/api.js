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

export const createGroup = async (groupData) => {
  const response = await fetch(`${API_URL}/groups/create/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(groupData),
  });

  if (!response.ok) {
    throw new Error('Failed to create group');
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

export const getGroups = async () => {
  const response = await fetch(`${API_URL}/groups/`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch groups');
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

export const inviteToGroup = async (groupId, userId) => {
  console.log(`Sending invite for group ${groupId} to user ${userId}`);
  const response = await fetch(`${API_URL}/groups/${groupId}/invite/${userId}/`, {
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

export const handleGroupInvite = async (inviteId, action) => {
  const response = await fetch(`${API_URL}/group-invites/${inviteId}/handle/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    throw new Error('Failed to handle invite');
  }

  return response.json();
};

export const getGroup = async (groupId) => {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}/`, {
      headers: getHeaders(),
    });
    return response.json();
  } catch (error) {
    console.error('Error fetching group:', error);
    throw error;
  }
};

export const getAvailableSports = async () => {
  console.log("Fetching available sports from API...");
  try {
    // Add a timeout to the fetch to avoid long hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
    
    console.log("Sending request to:", `${API_URL}/sports/`);
    const response = await fetch(`${API_URL}/sports/`, {
      method: 'GET',
      headers: getHeaders(),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId); // Clear the timeout if request completes normally
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `API Error (${response.status}): Failed to fetch sports`);
      } catch (e) {
        throw new Error(`API Error (${response.status}): ${errorText || 'Failed to fetch sports'}`);
      }
    }
    
    const data = await response.json();
    console.log("API sports data received:", data);
    
    // If the API returns an empty array or no data, provide fallback data
    if (!data || data.length === 0) {
      console.log("API returned empty data, using fallback sports data");
      return getFallbackSports();
    }
    
    return data;
  } catch (error) {
    // Handle different error types distinctly
    if (error.name === 'AbortError') {
      console.error("Request timeout - API did not respond in time");
    } else if (error.message.includes('Failed to fetch')) {
      console.error("Network error - Unable to connect to API:", error);
    } else {
      console.error("Error fetching sports data:", error);
    }
    
    // Always return fallback data in case of any error
    return getFallbackSports();
  }
};

export function getFallbackSports() {
  return [
    { key: 'nba', name: 'Basketball', activeEvents: 12, description: 'NBA games and player props' },
    { key: 'nfl', name: 'Football', activeEvents: 8, description: 'NFL matchups and player stats' },
    { key: 'mlb', name: 'Baseball', activeEvents: 15, description: 'MLB games and team stats' },
    { key: 'nhl', name: 'Hockey', activeEvents: 9, description: 'NHL matches and player performance' },
    { key: 'soccer', name: 'Soccer', activeEvents: 20, description: 'Soccer matches from top leagues' },
    { key: 'ufc', name: 'UFC/MMA', activeEvents: 4, description: 'MMA fights and fighter props' }
  ];
}

export const getAvailableSportEvents = async (sport) => {
  // If sport parameter is provided, fetch events for that sport
  const endpoint = sport ? 
    `${API_URL}/groups/bets/${sport}/` : 
    `${API_URL}/groups/bets/`;
    
  const response = await fetch(endpoint, {
    headers: getHeaders(),
  });
  
  return handleResponse(response);
};

export const getCompetitionEvents = async (competitionKey) => {
  const endpoint = `${API_URL}/groups/bets/competition/${competitionKey}/`;
  const response = await fetch(endpoint, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const submitBet = async (betData) => {
  try {
    const response = await fetch(`${API_URL}/bets/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(betData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit bet');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting bet:', error);
    throw error;
  }
};


