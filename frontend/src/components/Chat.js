import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Avatar,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { format, parseISO } from 'date-fns';

function Chat({ leagueId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  // Function to get the proper image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If the URL is already absolute (starts with http or https), return it as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // If the URL starts with /media/, prepend the API URL
    if (imageUrl.startsWith('/media/')) {
      return `${process.env.REACT_APP_API_URL}${imageUrl}`;
    }
    // Otherwise, assume it's a relative media path and construct the full URL
    return `${process.env.REACT_APP_API_URL}/media/${imageUrl.replace('media/', '')}`;
  };

  // Function to get sender profile image source
  const getSenderImageSource = (sender) => {
    // If this is the current user, check for embedded image data
    if (sender.id === user.id) {
      // Try embedded image from user object first
      if (user.embeddedImageData) {
        return user.embeddedImageData;
      }
      
      // Then try session storage with user-specific key
      const userSpecificKey = `profileImageDataUrl_${sender.id}`;
      const profileImageDataUrl = sessionStorage.getItem(userSpecificKey);
      if (profileImageDataUrl) {
        return profileImageDataUrl;
      }
    }
    
    // Add fallback to use API-based avatar for other users
    if (sender.profile_image_url) {
      return getImageUrl(sender.profile_image_url);
    }
    
    // Return avatar API URL as fallback
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.username)}&background=random`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add auto-scroll on component mount as well
  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [loading]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        const baseUrl = process.env.REACT_APP_API_URL.replace(/\/+$/, '');
        const response = await fetch(`${baseUrl}/api/leagues/${leagueId}/chat/messages`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Please log in again');
          } else {
            throw new Error('Failed to fetch messages');
          }
        }
        
        const data = await response.json();
        setMessages(data);
        setLoading(false);
      } catch (err) {
        console.error('Chat error:', err);
        setError('Failed to load chat messages');
        setLoading(false);
      }
    };

    if (leagueId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [leagueId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const baseUrl = process.env.REACT_APP_API_URL.replace(/\/+$/, '');
      const response = await fetch(`${baseUrl}/api/leagues/${leagueId}/chat/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Send message error:', errorData);
        
        if (response.status === 401) {
          setError('Please log in again');
        } else if (response.status === 403) {
          setError('You are not a member of this league');
        } else if (response.status === 404) {
          setError('League not found');
        } else if (response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          throw new Error(errorData.error || 'Failed to send message');
        }
        return;
      }

      const data = await response.json();
      setMessages(prev => [...prev, data]);
      setNewMessage('');
      setError('');
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to send message');
    }
  };

  // Helper function to safely format timestamps
  const formatTimestamp = (timestamp) => {
    try {
      // Check if timestamp is a valid string
      if (!timestamp || typeof timestamp !== 'string') {
        return '';
      }
      
      // Try to parse the timestamp with parseISO for better compatibility
      const date = parseISO(timestamp);
      
      // Verify that the date is valid before formatting
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return format(date, 'MMM d, h:mm a');
    } catch (err) {
      console.error('Error formatting timestamp:', err);
      return '';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: '#CBD5E1' }}>
        Loading chat...
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
        {error}
      </Box>
    );
  }

  return (
    <Paper 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'rgba(22, 28, 36, 0.4)',
        border: '1px solid rgba(30, 41, 59, 0.8)',
        borderRadius: '8px',
        overflow: 'hidden', // Prevent content from overflowing
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(30, 41, 59, 0.8)' }}>
        <Typography variant="h6" sx={{ color: '#f8fafc' }}>
          League Chat
        </Typography>
      </Box>
      
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        '&::-webkit-scrollbar': {
          width: '8px',
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(148, 163, 184, 0.3)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(148, 163, 184, 0.5)',
          }
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(15, 23, 42, 0.3)',
          borderRadius: '4px',
        },
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(148, 163, 184, 0.3) rgba(15, 23, 42, 0.3)',
      }}>
        {messages.map((message) => {
          return (
          <Box 
            key={message.id}
            sx={{ 
              display: 'flex',
              mb: 2,
              flexDirection: message.sender.id === user.id ? 'row-reverse' : 'row',
            }}
          >
            <Avatar 
              src={getSenderImageSource(message.sender)}
              sx={{ 
                bgcolor: message.sender.id === user.id ? '#8B5CF6' : '#3B82F6',
                width: 32,
                height: 32,
                fontSize: '14px',
              }}
              imgProps={{
                style: { objectFit: 'cover' },
                onError: (e) => {
                  console.error('Error loading profile image:', e);
                  e.target.src = ''; // Clear src to show fallback
                }
              }}
            >
              {message.sender.username[0].toUpperCase()}
            </Avatar>
            
            <Box 
              sx={{ 
                maxWidth: '70%',
                ml: message.sender.id === user.id ? 0 : 1,
                mr: message.sender.id === user.id ? 1 : 0,
                p: 1.5,
                bgcolor: message.sender.id === user.id ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                borderRadius: '12px',
                wordBreak: 'break-word',
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  mb: 0.5, 
                  color: message.sender.id === user.id ? '#C4B5FD' : '#93C5FD',
                  fontWeight: 'bold',
                }}
              >
                {message.sender.username}
              </Typography>
              <Typography variant="body2" sx={{ color: '#f1f5f9' }}>
                {message.content || message.message || "No message content available"}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  mt: 0.5, 
                  color: '#94A3B8',
                  textAlign: message.sender.id === user.id ? 'right' : 'left',
                }}
              >
                {message.timestamp ? formatTimestamp(message.timestamp) : ''}
              </Typography>
            </Box>
          </Box>
        );
        })}
        <div ref={messagesEndRef} />
      </Box>
      
      <Box 
        component="form" 
        sx={{ 
          p: 1.5, 
          display: 'flex',
          alignItems: 'center',
          borderTop: '1px solid rgba(30, 41, 59, 0.8)',
          mt: 'auto', // Push to bottom
        }}
        onSubmit={handleSendMessage}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{
            mr: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              color: '#f1f5f9',
              '& fieldset': {
                borderColor: 'rgba(148, 163, 184, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(148, 163, 184, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8B5CF6',
              },
            },
            '& .MuiOutlinedInput-input': {
              '&::placeholder': {
                color: '#94A3B8',
                opacity: 1,
              },
            },
          }}
          InputProps={{
            sx: { borderRadius: '12px' },
          }}
        />
        <IconButton 
          color="primary" 
          type="submit"
          disabled={!newMessage.trim()}
          sx={{ 
            bgcolor: 'rgba(139, 92, 246, 0.1)',
            '&:hover': {
              bgcolor: 'rgba(139, 92, 246, 0.2)',
            },
            '&.Mui-disabled': {
              opacity: 0.5,
            }
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default Chat; 