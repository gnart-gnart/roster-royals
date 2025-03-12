import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavBar from '../components/NavBar';
import { getAvailableSportEvents, getCompetitionEvents } from '../services/api';

function SportEventsPage() {
  const { groupId, sportKey } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [sportName, setSportName] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Get competitions for the selected sport
        const response = await getAvailableSportEvents(sportKey);
        console.log('API Response:', response); // Debug log
        
        let extractedEvents = [];
        
        // Check if we have categories in the response
        if (response && response.categories && response.categories.length > 0) {
          // Loop through each category and competition to fetch events
          for (const category of response.categories) {
            if (category.competitions && category.competitions.length > 0) {
              for (const competition of category.competitions) {
                try {
                  // Fetch events for this competition
                  const competitionEvents = await getCompetitionEvents(competition.key);
                  if (competitionEvents && competitionEvents.events) {
                    // Add category and competition name to each event for grouping
                    const eventsWithDetails = competitionEvents.events.map(event => ({
                      ...event,
                      categoryName: category.name,
                      competitionName: competition.name || 'Other'
                    }));
                    extractedEvents.push(...eventsWithDetails);
                  }
                } catch (err) {
                  console.error(`Error fetching events for competition ${competition.key}:`, err);
                }
              }
            }
          }
        }
        
        console.log('Extracted Events:', extractedEvents); // Debug log
        setEvents(extractedEvents);
        
        // Set the sport name
        if (response && response.name) {
          setSportName(response.name);
        } else {
          // Fallback to formatted sportKey if name not available
          setSportName(sportKey.charAt(0).toUpperCase() + sportKey.slice(1).replace(/-/g, ' '));
        }
        
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [sportKey]);

  // Helper function to format date and time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'TBD';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Group events by category and competition
  const eventsByCategory = events.reduce((acc, event) => {
    const category = event.categoryName || 'Other';
    const competition = event.competitionName || 'Other Events';
    
    if (!acc[category]) {
      acc[category] = {};
    }
    if (!acc[category][competition]) {
      acc[category][competition] = [];
    }
    acc[category][competition].push(event);
    return acc;
  }, {});

  const handleSelectEvent = (event) => {
    // Navigate to event betting page
    navigate(`/group/${groupId}/event/${event.key}`);
  };

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
            {sportName} Events
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : events.length === 0 ? (
          <Box>
            <Typography>No events available for this sport at the moment.</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Debug info: Sport key = {sportKey}
              </Typography>
            </Box>
          </Box>
        ) : (
          Object.entries(eventsByCategory).map(([category, competitions]) => (
            <Box key={category} sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ mb: 3, color: 'primary.main' }}>
                {category}
              </Typography>
              {Object.entries(competitions).map(([competition, competitionEvents]) => (
                <Box key={competition} sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    {competition}
                  </Typography>
                  <Grid container spacing={2}>
                    {competitionEvents.map((event) => (
                      <Grid item xs={12} md={6} key={event.key}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 3,
                              border: '1px solid rgba(96, 165, 250, 0.5)',
                            },
                          }}
                          onClick={() => handleSelectEvent(event)}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6">
                                {event.name}
                              </Typography>
                              <Chip 
                                label={event.status === 'open' ? 'Open' : event.status} 
                                color={event.status === 'open' ? 'success' : 'default'}
                                size="small"
                              />
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                Start: {formatDateTime(event.startsAt)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Markets: {event.markets?.length || 0}
                              </Typography>
                            </Box>
                            {event.competitors && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                  {event.competitors.map(comp => comp.name).join(' vs ')}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          ))
        )}
      </Container>
    </>
  );
}

export default SportEventsPage;