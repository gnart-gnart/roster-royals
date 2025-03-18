import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavBar from '../components/NavBar';
import { getAvailableSports, getFallbackSports } from '../services/api';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsHockeyIcon from '@mui/icons-material/SportsHockey';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import SportsIcon from '@mui/icons-material/Sports';
import { COLORS } from '../styles/constants';

// Sport display name mapping
const SPORT_DISPLAY_NAMES = {
  'nba': 'Basketball',
  'nfl': 'Football',
  'mlb': 'Baseball',
  'soccer': 'Soccer',
  'nhl': 'Hockey',
  'ufc': 'UFC/MMA',
  'tennis': 'Tennis',
  'golf': 'Golf'
};

function ChooseBetsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSports = async () => {
      try {
        const data = await getAvailableSports();
        console.log("Loaded sports data:", data);
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

  // Debug empty sports issue
  useEffect(() => {
    console.log("Current sports state:", sports);
  }, [sports]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#0f0f13',
    }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/group/${groupId}`)}
            sx={{
              mr: 2,
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#f8fafc',
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.6)',
              },
              borderRadius: 2,
            }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
            Choose Sports
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Select a sport to see available events and place your bets.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            py: 8
          }}>
            <CircularProgress sx={{ color: '#8b5cf6', mb: 2 }} />
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Loading available sports...
            </Typography>
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ 
              p: 4,
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: 2,
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171'
            }}
          >
            {error}
          </Alert>
        ) : sports.length === 0 ? (
          // Handle case when sports array is empty but no error
          <Box sx={{ 
            p: 4,
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(8px)',
            borderRadius: 2,
            border: '1px solid rgba(139, 92, 246, 0.2)',
            textAlign: 'center'
          }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#f8fafc' }}>
              No Sports Available
            </Typography>
            <Typography sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
              There are currently no sports available for betting. Please check back later.
            </Typography>
            
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{
                backgroundColor: '#8b5cf6',
                '&:hover': {
                  backgroundColor: '#7c3aed',
                },
                borderRadius: 1,
                px: 3,
                py: 1.5
              }}
            >
              Refresh
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {sports.map((sport) => {
              // Determine sport color and icon based on the key
              let sportColor, SportIcon;
              
              switch(sport.key) {
                case 'nba':
                  sportColor = '#8b5cf6'; // Purple
                  SportIcon = SportsBasketballIcon;
                  break;
                case 'nfl':
                  sportColor = '#2563eb'; // Blue
                  SportIcon = SportsFootballIcon;
                  break;
                case 'mlb':
                  sportColor = '#ef4444'; // Red
                  SportIcon = SportsBaseballIcon;
                  break;
                case 'soccer':
                  sportColor = '#10b981'; // Green
                  SportIcon = SportsSoccerIcon;
                  break;
                case 'nhl':
                  sportColor = '#60a5fa'; // Light blue
                  SportIcon = SportsHockeyIcon;
                  break;
                case 'ufc':
                  sportColor = '#f59e0b'; // Amber
                  SportIcon = SportsMmaIcon;
                  break;
                default:
                  sportColor = '#f59e0b'; // Default amber
                  SportIcon = SportsIcon;
              }
              
              // Get a more readable display name
              const displayName = SPORT_DISPLAY_NAMES[sport.key] || sport.name || sport.key;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={sport.key}>
                  <Card
                    onClick={() => navigate(`/group/${groupId}/sport/${sport.key}`)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: 'rgba(25, 25, 35, 0.8)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: 3,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 20px -5px rgba(${sportColor === '#8b5cf6' ? '139, 92, 246' : sportColor === '#10b981' ? '16, 185, 129' : '96, 165, 250'}, 0.2)`,
                        borderColor: `${sportColor}40`,
                      },
                      height: '100%',
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        backgroundColor: sportColor,
                        borderRadius: '50%',
                        width: 50,
                        height: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        zIndex: 1,
                      }}
                    >
                      <SportIcon sx={{ fontSize: 28, color: 'white' }} />
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#f8fafc' }}>
                        {displayName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                        {sport.description || `View and bet on ${displayName} events`}
                      </Typography>
                      <Box 
                        sx={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            py: 0.5, 
                            px: 1.5, 
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: 2,
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: (sport.activeEvents > 0) ? '#10b981' : 'rgba(255, 255, 255, 0.3)'
                            }} 
                          />
                          <Typography variant="body2" sx={{ 
                            color: (sport.activeEvents > 0) ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)',
                            fontWeight: '500',
                            fontSize: '0.75rem',
                          }}>
                            {sport.activeEvents > 0 ? `${sport.activeEvents} events` : 'Coming soon'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {error && (
          <Box sx={{ mb: 3 }}>
            {/* Debug section */}
            <Box sx={{ 
              mt: 4,
              p: 3, 
              backgroundColor: 'rgba(30, 41, 59, 0.7)', 
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <Typography variant="h6" sx={{ color: '#f8fafc', mb: 2 }}>
                Troubleshooting Options
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    // Force reload with fallback data
                    setSports(getFallbackSports());
                    setLoading(false);
                    setError('');
                  }}
                  sx={{
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    color: '#f8fafc',
                    '&:hover': { borderColor: 'rgba(139, 92, 246, 0.6)' },
                  }}
                >
                  Use Demo Sports
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => {
                    // Try navigating directly to basketball events
                    navigate(`/group/${groupId}/sport/nba`);
                  }}
                  sx={{
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    color: '#f8fafc',
                    '&:hover': { borderColor: 'rgba(139, 92, 246, 0.6)' },
                  }}
                >
                  Go to Basketball Events
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => window.location.reload()}
                  sx={{
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    color: '#f8fafc',
                    '&:hover': { borderColor: 'rgba(139, 92, 246, 0.3)' },
                  }}
                >
                  Refresh Page
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default ChooseBetsPage; 