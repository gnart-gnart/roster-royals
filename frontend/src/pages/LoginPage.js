import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  TextField,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [googleEmail, setGoogleEmail] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });


  // Get the API base URL from the environment variables
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        // Regular login logic
        const response = await fetch(`${API_URL}/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: formData.username, password: formData.password }),
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('Token saved:', data.token);
          navigate('/home');
        } else {
          setError(data.error || 'Login failed');
        }
      } else {
        // Registration logic
        const response = await fetch(`${API_URL}/register/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/home');
        } else {
          setError(data.error || 'Registration failed');
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('Failed to connect to server');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('Sending Google token to backend...');
      const response = await fetch(`${API_URL}/google-auth/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (response.ok) {
        if (data.exists) {
          // User exists, proceed with login
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/home');
        } else {
          // User doesn't exist, prepare for registration
          console.log('New user, setting up registration...');
          setGoogleEmail(data.email);
          setFormData(prev => ({
            ...prev,
            email: data.email,
            username: data.suggested_username || '' // Use suggested username if provided
          }));
          setIsLogin(false);
        }
      } else {
        setError(data.error || 'Google authentication failed');
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError(`Authentication error: ${err.message}`);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography
          component="h1"
          variant="h1"
          sx={{
            color: '#60a5fa',
            fontWeight: '700',
            marginBottom: 6,
            textAlign: 'center',
            fontSize: { xs: '3.5rem', sm: '4.5rem' },
            textShadow: '0 2px 10px rgba(96, 165, 250, 0.3)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          Roster Royals
        </Typography>
        
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          
          {(!isLogin || googleEmail) && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!googleEmail}
              InputProps={{
                sx: { backgroundColor: googleEmail ? 'rgba(0, 0, 0, 0.1)' : 'inherit' }
              }}
            />
          )}
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          
          {isLogin && !googleEmail && (
            <Box sx={{ mt: 2, width: '100%' }}>
              <GoogleOAuthProvider clientId="1065387003454-mrilapnplql4coaj3ebvv4jcut0a1rr3.apps.googleusercontent.com">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google login failed')}
                  theme="filled_black"
                  size="large"
                  width="100%"
                  text="Sign in with Google"
                />
              </GoogleOAuthProvider>
            </Box>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {isLogin ? 'Sign In' : 'Register'}
          </Button>
          
          {!googleEmail && (
            <Button
              fullWidth
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ username: '', email: '', password: '' });
              }}
              sx={{ textAlign: 'center' }}
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default LoginPage; 