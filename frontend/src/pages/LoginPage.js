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
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        backgroundColor: '#0f0f13',
        color: 'white',
      }}
    >
      {/* Left section - Login Form */}
      <Box
        sx={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Box
          sx={{
            maxWidth: 400,
            width: '100%',
            mx: 'auto',
            p: 3,
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Sign in
          </Typography>
          
          {error && <Alert severity="error" sx={{ mt: 2, width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              sx={{ 
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }
              }}
              InputProps={{
                endAdornment: (
                  <Box sx={{ color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer' }}>
                    👁️
                  </Box>
                ),
              }}
            />
            
            <Typography 
              variant="body2" 
              sx={{ 
                textAlign: 'right', 
                color: '#10b981', 
                mb: 2,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Forgot password?
            </Typography>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 1, 
                mb: 2, 
                py: 1.5,
                backgroundColor: '#8b5cf6',
                '&:hover': {
                  backgroundColor: '#7c3aed',
                },
                borderRadius: 1,
              }}
            >
              Sign in
            </Button>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
              <Box sx={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              <Typography sx={{ mx: 2, color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
                OR
              </Typography>
              <Box sx={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            </Box>
            
            {isLogin && !googleEmail && (
              <Box sx={{ mt: 2, width: '100%' }}>
                <GoogleOAuthProvider clientId="1065387003454-mrilapnplql4coaj3ebvv4jcut0a1rr3.apps.googleusercontent.com">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google login failed')}
                    theme="filled_black"
                    size="large"
                    width="100%"
                    text="Continue with Google"
                    shape="rectangular"
                  />
                </GoogleOAuthProvider>
              </Box>
            )}
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ username: '', email: '', password: '' });
                }}
                sx={{ 
                  textAlign: 'center', 
                  color: 'white',
                  textTransform: 'none',
                }}
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign In"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Right section - Promo Content */}
      <Box
        sx={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            BEAT THE ODDS
          </Typography>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: '#10b981', mb: 3 }}>
            WIN TOGETHER
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Join friends in private leagues and prove your sports knowledge
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4 }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
            }}>
              ⚡
            </Box>
            <Box sx={{ 
              p: 2, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(139, 92, 246, 0.1)', 
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
            }}>
              🏆
            </Box>
            <Box sx={{ 
              p: 2, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
            }}>
              💰
            </Box>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              fontStyle: 'italic', 
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: 350,
              mx: 'auto'
            }}
          >
            "The ultimate platform for competing with friends on sports predictions"
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage; 