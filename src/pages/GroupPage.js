import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavBar from '../components/NavBar';
import { inviteToGroup, getFriends, getGroups } from '../services/api';

function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [group, setGroup] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const isPresident = group?.president?.id === user?.id;
  const [members, setMembers] = useState([]);

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

  useEffect(() => {
    const loadGroup = async () => {
      try {
        const groups = await getGroups();
        const foundGroup = groups.find(g => g.id === parseInt(id));
        setGroup(foundGroup);
      } catch (err) {
        console.error('Failed to load group:', err);
      }
    };
    loadGroup();
  }, [id]);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friendsList = await getFriends();
        // Filter out friends who are already members
        setFriends(friendsList.filter(
          friend => !group.members.some(member => member.id === friend.id)
        ));
      } catch (err) {
        console.error('Failed to load friends:', err);
      }
    };

    if (group && isPresident) {
      loadFriends();
    }
  }, [group, isPresident]);

  useEffect(() => {
    if (group) {
      const sortedMembers = [...group.members].sort((a, b) => b.points - a.points);
      setMembers(sortedMembers);
    }
  }, [group]);

  const handleInvite = async (friendId) => {
    try {
      await inviteToGroup(group.id, friendId);
      setInviteDialogOpen(false);
    } catch (err) {
      console.error('Failed to invite member:', err);
    }
  };

  return (
    <>
      <NavBar />
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

        {isPresident && (
          <Button
            variant="contained"
            onClick={() => setInviteDialogOpen(true)}
            sx={{ mb: 2 }}
          >
            Invite Members
          </Button>
        )}

        <Dialog
          open={inviteDialogOpen}
          onClose={() => setInviteDialogOpen(false)}
        >
          <DialogTitle>Invite Friends to Group</DialogTitle>
          <List>
            {friends.map(friend => (
              <ListItem
                key={friend.id}
                button
                onClick={() => handleInvite(friend.id)}
              >
                <ListItemText primary={friend.username} />
              </ListItem>
            ))}
            {friends.length === 0 && (
              <ListItem>
                <ListItemText primary="No friends to invite" />
              </ListItem>
            )}
          </List>
        </Dialog>

        <Grid container spacing={4}>
          {/* Leaderboard - Full width */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Leaderboard
            </Typography>
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Group Leaderboard
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Member</TableCell>
                      <TableCell align="right">Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.map((member, index) => (
                      <TableRow key={member.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1 }}>{member.username[0]}</Avatar>
                            {member.username}
                            {member.id === group.president.id && (
                              <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                (President)
                              </Typography>
                            )}
                          </div>
                        </TableCell>
                        <TableCell align="right">{member.points}</TableCell>
                      </TableRow>
                    ))}
                    {members.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No members yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Available Bets - Full width */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Available Bets
            </Typography>
            <Card sx={{
              width: '100%',
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
    </>
  );
}

export default GroupPage; 