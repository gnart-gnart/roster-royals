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
  CircularProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
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
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#0f0f13',
    }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/home')}
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
            {group?.name || 'Loading...'}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh' 
          }}>
            <CircularProgress sx={{ color: '#8b5cf6' }} />
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
          <>
            {group?.description && (
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4,
                  color: 'rgba(255, 255, 255, 0.8)',
                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  borderRadius: 2,
                  p: 3,
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                }}
              >
                {group.description}
              </Typography>
            )}

            {/* Main content grid */}
            <Grid container spacing={4}>
              {/* Left Column - Active Bets */}
              <Grid item xs={12} md={8}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                      Active Bets
                    </Typography>
                    
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate(`/group/${id}/choose-bets`)}
                      sx={{
                        backgroundColor: '#8b5cf6',
                        '&:hover': {
                          backgroundColor: '#7c3aed',
                        },
                        borderRadius: 1,
                      }}
                    >
                      Place Bet
                    </Button>
                  </Box>
                  
                  {mockBets.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4, 
                      backgroundColor: 'rgba(30, 41, 59, 0.7)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        No active bets yet
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      {mockBets.map((bet) => (
                        <Card 
                          key={bet.id}
                          sx={{ 
                            mb: 2,
                            backgroundColor: 'rgba(30, 41, 59, 0.7)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: 2,
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                                {bet.match}
                              </Typography>
                              <Chip 
                                label={bet.status} 
                                size="small"
                                sx={{ 
                                  backgroundColor: bet.status === 'Open' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                  color: bet.status === 'Open' ? '#10b981' : '#ef4444',
                                  fontWeight: 'medium',
                                  borderRadius: 1,
                                }}
                              />
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                              <Box sx={{ 
                                py: 0.5, 
                                px: 2, 
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                              }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }}>
                                  Type:
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: '500' }}>
                                  {bet.type}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ 
                                py: 0.5, 
                                px: 2, 
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                              }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }}>
                                  Odds:
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: bet.odds.startsWith('+') ? '#10b981' : '#ef4444',
                                    fontWeight: '600' 
                                  }}
                                >
                                  {bet.odds}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ 
                                py: 0.5, 
                                px: 2, 
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                              }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }}>
                                  Points:
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: '500' }}>
                                  {bet.points}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>
              
              {/* Right Column - Leaderboard */}
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  borderRadius: 2,
                  p: 3,
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                      Leaderboard
                    </Typography>
                    
                    {isPresident && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setInviteDialogOpen(true)}
                        sx={{
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
                        Invite
                      </Button>
                    )}
                  </Box>
                  
                  {mockMembers.map((member, index) => (
                    <Box 
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 1.5,
                        borderBottom: index < mockMembers.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                      }}
                    >
                      <Box sx={{ 
                        minWidth: 24, 
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: index < 3 ? ['#f59e0b', '#94a3b8', '#b45309'][index] : 'rgba(255, 255, 255, 0.5)'
                      }}>
                        {index + 1}
                      </Box>
                      
                      <Avatar 
                        sx={{ 
                          mx: 2, 
                          bgcolor: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#1e293b',
                          width: 30,
                          height: 30,
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {member.avatar}
                      </Avatar>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 'medium', color: '#f8fafc' }}>
                          {member.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Win Rate: {member.winRate}
                        </Typography>
                      </Box>
                      
                      <Typography sx={{ 
                        fontWeight: 'bold', 
                        color: '#f8fafc',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 1,
                        px: 1.5,
                        py: 0.5,
                      }}>
                        {member.points}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}

export default GroupPage; 