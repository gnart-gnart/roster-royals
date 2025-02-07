const API_URL = 'http://localhost:8000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}`,
  };
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
  const response = await fetch(`${API_URL}/friend-request/${userId}/`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to send friend request');
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

  if (!response.ok) {
    throw new Error('Failed to fetch friends');
  }

  return response.json();
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