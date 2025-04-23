const API_URL = process.env.REACT_APP_API_URL;

export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/api/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const register = async (username, email, password) => {
  const response = await fetch(`${API_URL}/api/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  const data = await response.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const updatePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(`${API_URL}/api/update-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (!response.ok) {
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update password');
      } else {
        // If not JSON, it might be HTML error page or other error
        const text = await response.text();
        console.error('Non-JSON error response:', text);
        throw new Error('Server error occurred. Please try again later.');
      }
    }

    // Only try to parse as JSON if the request was successful
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return await response.json();
    } else {
      // Handle successful response that isn't JSON
      return { success: true };
    }
  } catch (error) {
    console.error('Password update error:', error);
    throw error;
  }
};

export const deleteAccount = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(`${API_URL}/api/delete-account/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`
      },
    });

    if (!response.ok) {
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete account');
      } else {
        // If not JSON, it might be HTML error page or other error
        const text = await response.text();
        console.error('Non-JSON error response:', text);
        throw new Error('Server error occurred. Please try again later.');
      }
    }

    // Clear local storage on successful account deletion
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return true;
  } catch (error) {
    console.error('Account deletion error:', error);
    throw error;
  }
}; 