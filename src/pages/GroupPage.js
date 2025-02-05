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
        <IconButton 
          onClick={() => navigate('/home')}
          sx={{ mr: 2, color: 'primary.main' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {groupNames[id] || 'Group Details'}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Scoreboard */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Leaderboard
          </Typography>
          <TableContainer component={Paper} sx={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            '& .MuiTableCell-root': {
              color: '#f8fafc',
              borderBottom: '1px solid rgba(96, 165, 250, 0.1)',
            },
            '& .MuiTableCell-head': {
              color: '#cbd5e1',
              fontWeight: 600,
            },
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Player</TableCell>
                  <TableCell align="right">Points</TableCell>
                  <TableCell align="right">Win Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockMembers.map((member, index) => (
                  <TableRow key={member.name}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>
                          {member.avatar}
                        </Avatar>
                        {member.name}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{member.points}</TableCell>
                    <TableCell align="right">{member.winRate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Available Bets */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Available Bets
          </Typography>
          <Grid container spacing={3}>
            {mockBets.map((bet) => (
              <Grid item xs={12} md={6} key={bet.id}>
                <Card sx={{
                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(96, 165, 250, 0.2)',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6">{bet.match}</Typography>
                        <Typography color="textSecondary">
                          {bet.date} • {bet.type}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Odds: {bet.odds}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          Points: {bet.points}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Chip
                          label={bet.status}
                          color={bet.status === 'Open' ? 'success' : 'default'}
                          sx={{ mb: 1 }}
                        />
                        {bet.status === 'Open' && (
                          <Button variant="contained" color="primary">
                            Place Bet
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default GroupPage; 