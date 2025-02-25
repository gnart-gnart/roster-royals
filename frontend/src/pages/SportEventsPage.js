import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavBar from '../components/NavBar';

function SportEventsPage() {
  const { groupId, sportKey } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/group/${groupId}/choose-bets`)}
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
            {sportKey.charAt(0).toUpperCase() + sportKey.slice(1)} Events
          </Typography>
        </Box>

        {loading ? (
          <Typography>Loading events...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Typography>Events will be displayed here</Typography>
        )}
      </Container>
    </>
  );
}

export default SportEventsPage; 