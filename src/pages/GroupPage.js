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
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  TextField,
  FormControlLabel,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import NavBar from '../components/NavBar';
import { inviteToGroup, getFriends, getGroups, getGroup } from '../services/api';

function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const isPresident = group?.president?.id === user?.id;
  const [members, setMembers] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);

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
        const data = await getGroup(id);  // API call to get group details
        setGroup(data);
      } catch (err) {
        setError('Failed to load group');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadGroup();
  }, [id]);

  useEffect(() => {
    if (inviteDialogOpen) {
      loadFriends();
    }
  }, [inviteDialogOpen]);

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

  useEffect(() => {
    if (group) {
      const sortedMembers = [...group.members].sort((a, b) => b.points - a.points);
      setMembers(sortedMembers);
    }
  }, [group]);

  const handleToggleFriend = (friendId) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      }
      return [...prev, friendId];
    });
  };

  const handleToggleAll = () => {
    if (selectAll) {
      setSelectedFriends([]);
    } else {
      setSelectedFriends(friends.map(friend => friend.id));
    }
    setSelectAll(!selectAll);
  };

  const handleInviteSelected = async () => {
    try {
      console.log('Sending invites for group:', group.id, 'to users:', selectedFriends);
      for (const friendId of selectedFriends) {
        try {
          const response = await inviteToGroup(group.id, friendId);
          console.log(`Invite sent to user ${friendId}:`, response);
        } catch (err) {
          console.error(`Failed to invite user ${friendId}:`, err);
        }
      }
    } catch (err) {
      console.error('Failed to invite friends:', err);
    } finally {
      setInviteDialogOpen(false);
      setSelectedFriends([]);
      setSearchQuery('');
      setSelectAll(false);
    }
  };

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!group) return <div>Group not found</div>;

  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/home')}
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
            {group?.name || 'Loading...'}
          </Typography>
        </Box>

        {group?.description && (
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3,
              color: 'text.secondary',
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              borderRadius: 1,
              p: 2
            }}
          >
            {group.description}
          </Typography>
        )}

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
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Invite Friends to Group</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2, mt: 1 }}>
              <TextField
                fullWidth
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAll}
                  onChange={handleToggleAll}
                  indeterminate={selectedFriends.length > 0 && selectedFriends.length < filteredFriends.length}
                />
              }
              label="Select All"
              sx={{ mb: 1 }}
            />

            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {filteredFriends.map(friend => (
                <ListItem key={friend.id} dense button onClick={() => handleToggleFriend(friend.id)}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedFriends.includes(friend.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={friend.username} />
                </ListItem>
              ))}
              {filteredFriends.length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary={friends.length === 0 ? "No friends to invite" : "No matches found"} 
                    sx={{ textAlign: 'center', color: 'text.secondary' }}
                  />
                </ListItem>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleInviteSelected}
              disabled={selectedFriends.length === 0}
            >
              Invite ({selectedFriends.length})
            </Button>
          </DialogActions>
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