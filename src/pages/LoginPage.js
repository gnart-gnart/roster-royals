import React from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';

function LoginPage() {
  const handleGoogleLogin = () => {
    // Will implement Google authentication later
    console.log('Google login clicked');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', mt: 2 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Welcome to Sports Betting App
          </Typography>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleGoogleLogin}
          >
            Sign in with Google
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default LoginPage; 