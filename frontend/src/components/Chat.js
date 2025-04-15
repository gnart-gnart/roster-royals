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
import { format } from 'date-fns';

function Chat({ leagueId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'rgba(22, 28, 36, 0.4)',
        border: '1px solid rgba(30, 41, 59, 0.8)',
        borderRadius: '8px',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(30, 41, 59, 0.8)' }}>
        <Typography variant="h6" sx={{ color: '#f8fafc' }}>
          League Chat
        </Typography>
      </Box>
      
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message) => (
          <Box 
            key={message.id}
            sx={{ 
              display: 'flex',
              mb: 2,
              flexDirection: message.sender.id === user.id ? 'row-reverse' : 'row',
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: message.sender.id === user.id ? '#8B5CF6' : '#3B82F6',
                width: 32,
                height: 32,
                fontSize: '14px',
              }}
            >
              {message.sender.username[0].toUpperCase()}
            </Avatar>
            
            <Box sx={{ mx: 1, maxWidth: '70%' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: message.sender.id === user.id 
                    ? 'rgba(139, 92, 246, 0.2)' 
                    : 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid',
                  borderColor: message.sender.id === user.id 
                    ? 'rgba(139, 92, 246, 0.3)' 
                    : 'rgba(30, 41, 59, 0.8)',
                }}
              >
                <Typography variant="body2" sx={{ color: '#f8fafc' }}>
                  {message.message}
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
                  {format(new Date(message.created_at), 'MMM d, h:mm a')}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      
      <Divider />
      
      <Box 
        component="form" 
        onSubmit={handleSendMessage}
        sx={{ 
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#CBD5E1',
              backgroundColor: 'rgba(15, 23, 42, 0.3)',
              '& fieldset': {
                borderColor: 'rgba(148, 163, 184, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(148, 163, 184, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8B5CF6',
              },
            },
          }}
        />
        <IconButton 
          type="submit" 
          color="primary"
          sx={{ 
            color: '#8B5CF6',
            '&:hover': {
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default Chat; 