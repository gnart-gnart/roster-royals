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
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { searchUsers, sendFriendRequest } from '../services/api';
import SearchIcon from '@mui/icons-material/Search';
import NavBar from '../components/NavBar';

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
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#0f0f13',
    }}>
      <NavBar />
      <Container maxWidth="md" sx={{ pt: 4, pb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            onClick={() => navigate('/home')}
            startIcon={<ArrowBackIcon />}
            sx={{
              mr: 2,
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#f8fafc',
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.6)',
              },
              borderRadius: 1,
            }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
            Add Friends
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: '#f87171',
              '& .MuiAlert-icon': {
                color: '#f87171'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Search users"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 1,
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              </InputAdornment>
            ),
          }}
        />

        <Card sx={{
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: 2,
        }}>
          <List>
            {loading ? (
              <ListItem>
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 2 }}>
                  <CircularProgress size={30} sx={{ color: '#8b5cf6' }} />
                </Box>
              </ListItem>
            ) : searchResults.length === 0 ? (
              <ListItem sx={{ py: 3 }}>
                <ListItemText 
                  primary={
                    <Typography sx={{ 
                      textAlign: 'center', 
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      {searchQuery.length < 2 
                        ? "Start typing to search for users" 
                        : "No users found"}
                    </Typography>
                  }
                />
              </ListItem>
            ) : (
              searchResults.map((user) => (
                <ListItem 
                  key={user.id}
                  sx={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    '&:last-child': { 
                      borderBottom: 'none',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: '#8b5cf6' }}>
                      {user.username[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Typography sx={{ color: '#f8fafc', fontWeight: '500' }}>
                        {user.username}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        {user.points ? `${user.points} points` : 'New player'}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    {user.friendStatus === 'none' && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAddFriend(user.id)}
                        sx={{
                          backgroundColor: '#8b5cf6',
                          '&:hover': {
                            backgroundColor: '#7c3aed',
                          },
                          borderRadius: 1,
                          px: 2,
                        }}
                      >
                        Add Friend
                      </Button>
                    )}
                    {user.friendStatus === 'pending' && (
                      <Button
                        variant="outlined"
                        size="small"
                        disabled
                        sx={{
                          borderColor: 'rgba(139, 92, 246, 0.3)',
                          color: 'rgba(255, 255, 255, 0.5)',
                          borderRadius: 1,
                        }}
                      >
                        Request Sent
                      </Button>
                    )}
                    {user.friendStatus === 'friends' && (
                      <Button
                        variant="outlined"
                        size="small"
                        disabled
                        sx={{
                          borderColor: 'rgba(16, 185, 129, 0.3)',
                          color: '#10b981',
                          borderRadius: 1,
                        }}
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
    </Box>
  );
}

export default AddFriendPage; 