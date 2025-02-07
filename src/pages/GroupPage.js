import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data mapping group IDs to names
  const groupNames = {
    1: 'NFL Betting Club',
    2: 'NBA Fantasy League',
    3: 'MLB Predictions',
  };

  const mockMembers = [
    { name: 'John Doe', points: 2450, avatar: 'J', winRate: '68%' },
    { name: 'Sarah Wilson', points: 2100, avatar: 'S', winRate: '65%' },
    { name: 'Mike Brown', points: 1890, avatar: 'M', winRate: '62%' },
    { name: 'David Kim', points: 1750, avatar: 'D', winRate: '58%' },
    { name: 'Rachel Green', points: 1600, avatar: 'R', winRate: '55%' },
    { name: 'James Wilson', points: 1450, avatar: 'J', winRate: '52%' },
    { name: 'Emily Davis', points: 1300, avatar: 'E', winRate: '50%' },
    { name: 'Michael Scott', points: 1200, avatar: 'M', winRate: '48%' },
  ].sort((a, b) => b.points - a.points);

  const mockBets = [
    {
      id: 1,
      match: 'Lakers vs Warriors',
      date: '2024-02-20',
      type: 'Spread',
      odds: '-110',
      points: 100,
      status: 'Open',
    },
    {
      id: 2,
      match: 'Chiefs vs 49ers',
      date: '2024-02-21',
      type: 'Moneyline',
      odds: '+150',
      points: 120,
      status: 'Closed',
    },
    {
      id: 3,
      match: 'Celtics vs Bucks',
      date: '2024-02-22',
      type: 'Over/Under',
      odds: '-105',
      points: 130,
      status: 'Open',
    },
    {
      id: 4,
      match: 'Eagles vs Cowboys',
      date: '2024-02-23',
      type: 'Spread',
      odds: '+120',
      points: 140,
      status: 'Open',
    },
    {
      id: 5,
      match: 'Yankees vs Red Sox',
      date: '2024-02-24',
      type: 'Moneyline',
      odds: '-130',
      points: 150,
      status: 'Open',
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          onClick={() => navigate('/home')}
          startIcon={<ArrowBackIcon />}
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
          {groupNames[id] || 'Group Details'}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Scoreboard */}
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Leaderboard
          </Typography>
          <Card sx={{
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
          }}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              No members in this group yet.
            </Box>
          </Card>
        </Grid>

        {/* Available Bets */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Available Bets
          </Typography>
          <Card sx={{
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
          }}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              No bets available yet.
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default GroupPage; 