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
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavBar from '../components/NavBar';
import { getAvailableSports } from '../services/api';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsIcon from '@mui/icons-material/Sports';

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
              borderRadius: 1,
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
          <Box sx={{ 
            p: 4,
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            borderRadius: 2,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171'
          }}>
            {error}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {sports.map((sport) => {
              // Determine sport color
              let sportColor;
              switch(sport.key) {
                case 'nba': sportColor = '#8b5cf6'; break;
                case 'nfl': sportColor = '#2563eb'; break;
                case 'mlb': sportColor = '#ef4444'; break;
                case 'soccer': sportColor = '#10b981'; break;
                default: sportColor = '#f59e0b'; 
              }
              
              // Determine sport icon
              let SportIcon;
              switch(sport.key) {
                case 'nba': SportIcon = SportsBasketballIcon; break;
                case 'nfl': SportIcon = SportsFootballIcon; break;
                case 'mlb': SportIcon = SportsBaseballIcon; break;
                case 'soccer': SportIcon = SportsSoccerIcon; break;
                default: SportIcon = SportsIcon;
              }
              
              return (
                <Grid item xs={12} sm={6} md={4} key={sport.key}>
                  <Card
                    onClick={() => navigate(`/group/${groupId}/choose-bets/${sport.key}`)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: 'rgba(30, 41, 59, 0.7)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 10px 15px -3px rgba(${sportColor === '#8b5cf6' ? '139, 92, 246' : sportColor === '#10b981' ? '16, 185, 129' : '96, 165, 250'}, 0.2)`,
                        borderColor: `${sportColor}50`,
                      },
                      overflow: 'visible',
                      position: 'relative'
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: -15,
                        right: 20,
                        backgroundColor: sportColor,
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <SportIcon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc', mb: 1 }}>
                        {sport.name}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mt: 2,
                        py: 0.5, 
                        px: 1.5, 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 1,
                        width: 'fit-content'
                      }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {sport.eventCount} {sport.eventCount === 1 ? 'event' : 'events'} available
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default ChooseBetsPage; 