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
                  <Avatar>{user.username[0]}</Avatar>
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