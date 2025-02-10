import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavBar from '../components/NavBar';

function SportEventsPage() {
  const { groupId, sportKey } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch(`/api/bets/${sportKey}`, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('auth_token')}`
          }
        });
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError('Failed to load events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [sportKey]);

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
            Available Events
          </Typography>
        </Box>

        {loading ? (
          <Typography>Loading events...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={2}>
            {/* We'll add event cards here once we see the event data structure */}
            <Typography>Events will be displayed here</Typography>
          </Grid>
        )}
      </Container>
    </>
  );
}

export default SportEventsPage; 