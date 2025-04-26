import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { searchUsers, sendFriendRequest } from '../services/api';

function AddFriendPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await sendFriendRequest(userId);
      // Update the user's status in search results
      setSearchResults(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, friendStatus: 'pending' }
            : user
        )
      );
    } catch (err) {
      // Show the specific error message from the backend
      setError(err.message);
      console.error('Failed to send friend request:', err);
    }
  };

  // Function to get the proper image URL (copied from FriendsList)
  const getImageUrl = (imageUrl) => {
    // If no image URL is provided, use a fallback
    if (!imageUrl) {
      console.log("No image URL provided, using fallback");
      return null;
    }
    
    console.log("Processing image URL:", imageUrl);
    
    // If the URL is already absolute (starts with http or https), return it as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      console.log("URL is already absolute:", imageUrl);
      return imageUrl;
    }
    
    // If the URL starts with /media/, prepend the API URL
    if (imageUrl.startsWith('/media/')) {
      const fullUrl = `${process.env.REACT_APP_API_URL}${imageUrl}`;
      console.log("Converting /media/ URL to:", fullUrl);
      return fullUrl;
    }
    
    // Otherwise, assume it's a relative media path and construct the full URL
    const fullUrl = `${process.env.REACT_APP_API_URL}/media/${imageUrl.replace('media/', '')}`;
    console.log("Converting relative URL to:", fullUrl);
    return fullUrl;
  };

  // Function to get user profile image source
  const getFriendImageSource = (user) => {
    if (!user) {
      console.log("No user data provided to getFriendImageSource");
      return null;
    }

    // Debug: Log the user object to see all available image-related properties
    console.log(`Profile data for ${user.username}:`, {
      hasProfileImageUrl: !!user.profile_image_url, 
      profileImageUrl: user.profile_image_url,
      hasProfileImage: !!user.profile_image,
      profileImage: user.profile_image
    });
    
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    if (user.id === currentUser.id) {
      if (currentUser.embeddedImageData) {
        console.log("Using embedded image data for current user");
        return currentUser.embeddedImageData;
      }
      const userSpecificKey = `profileImageDataUrl_${user.id}`;
      const profileImageDataUrl = sessionStorage.getItem(userSpecificKey);
      if (profileImageDataUrl) {
        console.log("Using session storage image for current user");
        return profileImageDataUrl;
      }
    }
    
    // Check for profile_image_url (this should be the most reliable source now)
    if (user.profile_image_url) {
      // For absolute URLs, use them directly
      if (user.profile_image_url.startsWith('http://') || user.profile_image_url.startsWith('https://')) {
        console.log(`Using absolute profile_image_url for ${user.username}:`, user.profile_image_url);
        return user.profile_image_url;
      } else {
        // For relative URLs, use the getImageUrl helper
        const imageUrl = getImageUrl(user.profile_image_url);
        console.log(`Resolved profile_image_url for ${user.username} to:`, imageUrl);
        return imageUrl;
      }
    }
    
    // Check for profile_image field as fallback
    if (user.profile_image) {
      const imageUrl = getImageUrl(user.profile_image);
      console.log(`Resolved profile_image for ${user.username} to:`, imageUrl);
      return imageUrl;
    }
    
    // Return avatar API URL as fallback
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`;
    console.log(`Using fallback URL for ${user.username}:`, fallbackUrl);
    return fallbackUrl;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          onClick={() => navigate('/home')}
          startIcon={<ArrowBackIcon />}
          sx={{
            mr: 2,
            backgroundColor: 'rgba(96, 165, 250, 0.1)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            color: '#f8fafc',
            '&:hover': {
              backgroundColor: 'rgba(96, 165, 250, 0.2)',
              border: '1px solid rgba(96, 165, 250, 0.6)',
            },
          }}
        >
          Back
        </Button>
        <Typography variant="h4">
          Add Friends
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Search users"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Card sx={{
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(96, 165, 250, 0.2)',
      }}>
        <List>
          {loading ? (
            <ListItem>
              <ListItemText primary="Searching..." />
            </ListItem>
          ) : searchResults.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary={searchQuery.length < 2 
                  ? "Start typing to search for users" 
                  : "No users found"}
              />
            </ListItem>
          ) : (
            searchResults.map((user) => (
              <ListItem key={user.id}>
                <ListItemAvatar>
                  {console.log("Rendering avatar for user:", user.username, "with image source:", getFriendImageSource(user))}
                  <Avatar 
                    src={getFriendImageSource(user)}
                    alt={`${user.username}'s profile image`}
                    sx={{ 
                      bgcolor: '#8B5CF6',
                      width: 40,
                      height: 40
                    }}
                    imgProps={{
                      style: { objectFit: 'cover' },
                      onError: (e) => {
                        console.error('Error loading profile image:', e);
                        console.log('Failed URL:', e.target.src);
                        console.log('User data:', user);
                        e.target.src = ''; // Clear src to show fallback
                      },
                      loading: "eager"
                    }}
                  >
                    {user.username?.[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={user.username}
                  secondary={`${user.points} points`}
                />
                <ListItemSecondaryAction>
                  {user.friendStatus === 'none' && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAddFriend(user.id)}
                    >
                      Add Friend
                    </Button>
                  )}
                  {user.friendStatus === 'pending' && (
                    <Button
                      variant="outlined"
                      size="small"
                      disabled
                    >
                      Request Sent
                    </Button>
                  )}
                  {user.friendStatus === 'friends' && (
                    <Button
                      variant="outlined"
                      size="small"
                      disabled
                    >
                      Friends
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
      </Card>
    </Container>
  );
}

export default AddFriendPage; 