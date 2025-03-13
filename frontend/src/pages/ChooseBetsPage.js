
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
import { getAvailableSports } from '../services/api';

function ChooseBetsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSports = async () => {
      try {
        console.log("Fetching sports...");
        const data = await getAvailableSports();
        console.log("Sports data:", data);
        setSports(data);
      } catch (err) {
        console.error("Failed to load sports:", err);
        setError('Failed to load sports: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadSports();
  }, []);

  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/group/${groupId}`)}
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
            Choose Bets
          </Typography>
        </Box>

        {loading ? (
          <Typography>Loading sports...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={2}>
            {sports.map((sport) => (
              <Grid item xs={12} sm={6} md={4} key={sport.key}>
                <Card
                  onClick={() => navigate(`/group/${groupId}/choose-bets/${sport.key}`)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(96, 165, 250, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(30, 41, 59, 0.9)',
                      border: '1px solid rgba(96, 165, 250, 0.4)',
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {sport.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {sport.eventCount} events available
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}

export default ChooseBetsPage; 