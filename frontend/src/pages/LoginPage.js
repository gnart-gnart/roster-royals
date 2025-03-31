import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  TextField,
  Alert,
  Grid,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function LoginPage({ initRegister = false }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(!initRegister);
  const [error, setError] = useState('');
  const [googleEmail, setGoogleEmail] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Get the API base URL from the environment variables
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        // Use auth service login
        try {
          await login(formData.username, formData.password);
          navigate('/home');
        } catch (error) {
          setError('Login failed: ' + error.message);
        }
      } else {
        // Use auth service register
        try {
          await register(formData.username, formData.email, formData.password);
          navigate('/home');
        } catch (error) {
          setError('Registration failed: ' + error.message);
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
      const response = await fetch(`${API_URL}/api/google-auth/`, {
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

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Grid container sx={{ minHeight: '100vh', bgcolor: '#080a10' }}>
      {/* Left side - Login Form */}
      <Grid item xs={12} md={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: 400, mx: 'auto', width: '100%' }}>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', color: '#f8fafc' }}>
            Sign in
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: 'rgba(96, 165, 250, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(96, 165, 250, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8b5cf6',
                    borderWidth: '2px',
                  },
                }
              }}
            />
            
            {(!isLogin || googleEmail) && (
              <TextField
                margin="normal"
                required
                fullWidth
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!!googleEmail}
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: googleEmail ? 'rgba(0, 0, 0, 0.1)' : 'rgba(15, 23, 42, 0.8)',
                    borderRadius: '8px',
                    '& fieldset': {
                      borderColor: 'rgba(96, 165, 250, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(96, 165, 250, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8b5cf6',
                      borderWidth: '2px',
                    },
                  }
                }}
              />
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: 'rgba(96, 165, 250, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(96, 165, 250, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8b5cf6',
                    borderWidth: '2px',
                  },
                }
              }}
            />
            
            {isLogin && (
              <Typography 
                variant="body2" 
                sx={{ textAlign: 'right', mb: 2, color: '#10b981', cursor: 'pointer' }}
              >
                Forgot password?
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 1, 
                mb: 3, 
                py: 1.5,
                backgroundColor: '#8b5cf6',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#7c3aed',
                }
              }}
            >
              {isLogin ? 'Sign in' : 'Register'}
            </Button>
            
            <Box sx={{ textAlign: 'center', position: 'relative', mb: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  position: 'relative', 
                  bgcolor: '#080a10', 
                  px: 2, 
                  zIndex: 1,
                  color: 'rgba(255, 255, 255, 0.5)'
                }}
              >
                OR
              </Typography>
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: 0, 
                  right: 0, 
                  height: '1px', 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  zIndex: 0
                }} 
              />
            </Box>
            
            {isLogin && !googleEmail && (
              <Box sx={{ mb: 2 }}>
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
            
            {!googleEmail && (
              <Button
                fullWidth
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ username: '', email: '', password: '' });
                }}
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </Button>
            )}
          </Box>
        </Box>
      </Grid>
      
      {/* Right side - Promotional Content */}
      <Grid 
        item 
        md={6} 
        sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#080a10',
          p: 6,
          position: 'relative'
        }}
      >
        <Box sx={{ maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, color: '#f8fafc' }}>
            BEAT THE ODDS
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 4, color: '#10b981' }}>
            WIN TOGETHER
          </Typography>
          <Typography variant="body1" sx={{ mb: 6, color: 'rgba(255, 255, 255, 0.7)' }}>
            Join friends in private leagues and prove your sports knowledge
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
            <Box 
              component="div" 
              sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px solid #10b981',
                color: '#10b981',
                fontSize: '24px'
              }}
            >
              ★
            </Box>
            <Box 
              component="div" 
              sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px solid #8b5cf6',
                color: '#8b5cf6',
                fontSize: '24px'
              }}
            >
              🏆
            </Box>
            <Box 
              component="div" 
              sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px solid #60a5fa',
                color: '#60a5fa',
                fontSize: '24px'
              }}
            >
              $
            </Box>
          </Box>
          
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mt: 6, 
              fontStyle: 'italic',
              color: 'rgba(255, 255, 255, 0.5)'
            }}
          >
            "The ultimate platform for competing with friends on sports predictions"
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

export default LoginPage; 