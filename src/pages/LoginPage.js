import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    navigate('/home');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
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
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{
            padding: '16px 32px',
            fontSize: '1.1rem',
            backgroundColor: 'rgba(96, 165, 250, 0.1)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            color: '#f8fafc',
            '&:hover': {
              backgroundColor: 'rgba(96, 165, 250, 0.2)',
              border: '1px solid rgba(96, 165, 250, 0.6)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Sign in with Google
        </Button>
      </Box>
    </Container>
  );
}

export default LoginPage; 