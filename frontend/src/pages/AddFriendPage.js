import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Alert,
  InputAdornment,
  CircularProgress,
  Chip,
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
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

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

  const handleAccept = async (requestId) => {
    setLoadingRequests(true);
    try {
      await sendFriendRequest(requestId, 'accept');
      // Update the request status in pendingRequests
      setPendingRequests(prev => prev.filter(request => request.id !== requestId));
    } catch (err) {
      setError('Failed to accept friend request');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleReject = async (requestId) => {
    setLoadingRequests(true);
    try {
      await sendFriendRequest(requestId, 'reject');
      // Update the request status in pendingRequests
      setPendingRequests(prev => prev.filter(request => request.id !== requestId));
    } catch (err) {
      setError('Failed to reject friend request');
    } finally {
      setLoadingRequests(false);
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
              borderRadius: 2,
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
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: '#f87171'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Card sx={{
          backgroundColor: 'rgba(25, 25, 35, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          mb: 4,
        }}>
          <CardContent sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="Search users"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
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

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={40} sx={{ color: '#8b5cf6' }} />
              </Box>
            ) : searchResults.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4, 
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 2,
                color: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                {searchQuery.length < 2 
                  ? "Start typing to search for users" 
                  : "No users found matching your search"}
              </Box>
            ) : (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', color: '#f8fafc' }}>
                  Search Results
                </Typography>
                <Box sx={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  overflow: 'hidden',
                }}>
                  {searchResults.map((user) => (
                    <Box
                      key={user.id}
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        '&:last-child': { 
                          borderBottom: 'none',
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ 
                          bgcolor: '#8b5cf6',
                          width: 40,
                          height: 40,
                          mr: 2,
                          border: '2px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          {user.username[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ color: '#f8fafc', fontWeight: '500' }}>
                            {user.username}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>
                            {user.points ? `${user.points} points` : 'New player'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {user.friendStatus === 'none' && (
                        <Button
                          variant="contained"
                          onClick={() => handleAddFriend(user.id)}
                          sx={{
                            backgroundColor: '#8b5cf6',
                            '&:hover': {
                              backgroundColor: '#7c3aed',
                            },
                            borderRadius: 1,
                            fontWeight: '500',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                          }}
                        >
                          Add Friend
                        </Button>
                      )}
                      {user.friendStatus === 'pending' && (
                        <Chip
                          label="Request Sent"
                          sx={{
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            color: '#f59e0b',
                            borderRadius: 1,
                            fontWeight: '500',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                          }}
                        />
                      )}
                      {user.friendStatus === 'friends' && (
                        <Chip
                          label="Friends"
                          sx={{
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            borderRadius: 1,
                            fontWeight: '500',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc', mb: 3 }}>
            Friend Requests
          </Typography>
          
          {loadingRequests ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={30} sx={{ color: '#8b5cf6' }} />
            </Box>
          ) : pendingRequests.length === 0 ? (
            <Card sx={{
              backgroundColor: 'rgba(25, 25, 35, 0.8)',
              backdropFilter: 'blur(8px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <CardContent>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 3, 
                  color: 'rgba(255, 255, 255, 0.7)',
                }}>
                  No pending friend requests
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{
              backgroundColor: 'rgba(25, 25, 35, 0.8)',
              backdropFilter: 'blur(8px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
            }}>
              {pendingRequests.map((request, index) => (
                <Box
                  key={request.id}
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                    borderBottom: index < pendingRequests.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ 
                      bgcolor: '#8b5cf6',
                      width: 40,
                      height: 40,
                      mr: 2,
                      border: '2px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {request.username[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography sx={{ color: '#f8fafc', fontWeight: '500' }}>
                        {request.username}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>
                        Sent you a friend request
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={() => handleAccept(request.id)}
                      sx={{
                        backgroundColor: '#10b981',
                        '&:hover': { backgroundColor: '#059669' },
                        borderRadius: 1,
                        fontWeight: '500',
                        boxShadow: 'none',
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleReject(request.id)}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': { 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        borderRadius: 1,
                        fontWeight: '500',
                      }}
                    >
                      Decline
                    </Button>
                  </Box>
                </Box>
              ))}
            </Card>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default AddFriendPage; 