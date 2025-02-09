import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Collapse,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { getGroups, getFriends, removeFriend } from '../services/api';
import GroupCard from '../components/GroupCard';
import NavBar from '../components/NavBar';

function HomePage() {
  const navigate = useNavigate();
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const FRIENDS_DISPLAY_LIMIT = 5;

  const loadGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (err) {
      console.error('Failed to load groups:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [groupsData, friendsData] = await Promise.all([
          getGroups(),
          getFriends()
        ]);
        setGroups(groupsData);
        setFriends(friendsData);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Add event listener for friend updates
    const handleFriendsUpdate = () => {
      getFriends().then(friendsData => setFriends(friendsData));
    };

    window.addEventListener('friendsUpdated', handleFriendsUpdate);

    // Listen for group updates
    window.addEventListener('groupsUpdated', loadGroups);

    // Cleanup
    return () => {
      window.removeEventListener('friendsUpdated', handleFriendsUpdate);
      window.removeEventListener('groupsUpdated', loadGroups);
    };
  }, []);

  const displayedFriends = showAllFriends 
    ? friends 
    : friends.slice(0, FRIENDS_DISPLAY_LIMIT);

  const handleRemoveFriend = async (friendId) => {
    try {
      await removeFriend(friendId);
      // Update the friends list
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch (err) {
      setError('Failed to remove friend');
    }
  };

  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4">
                Your Groups
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
                onClick={() => navigate('/create-group')}
                sx={{
                  backgroundColor: 'rgba(96, 165, 250, 0.1)',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  color: '#f8fafc',
                  '&:hover': {
                    backgroundColor: 'rgba(96, 165, 250, 0.2)',
                    border: '1px solid rgba(96, 165, 250, 0.6)',
                  },
                }}
              >
                Create Group
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ textAlign: 'center', mt: 4 }}>Loading groups...</Box>
            ) : error ? (
              <Box sx={{ color: 'error.main', mt: 4 }}>{error}</Box>
            ) : groups.length === 0 ? (
              <Card sx={{
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(96, 165, 250, 0.2)',
              }}>
                <Box sx={{ p: 2, textAlign: 'center' }}>No groups yet. Create one!</Box>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {groups.map((group) => (
                  <Grid item xs={12} key={group.id}>
                    <GroupCard
                      name={group.name}
                      sport={group.sport}
                      memberCount={group.members.length}
                      onClick={() => navigate(`/group/${group.id}`)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4">
                Friends
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
                onClick={() => navigate('/add-friend')}
                sx={{
                  backgroundColor: 'rgba(96, 165, 250, 0.1)',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  color: '#f8fafc',
                  '&:hover': {
                    backgroundColor: 'rgba(96, 165, 250, 0.2)',
                    border: '1px solid rgba(96, 165, 250, 0.6)',
                  },
                }}
              >
                Add Friend
              </Button>
            </Box>
            <Card sx={{
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              maxHeight: showAllFriends ? 'none' : '400px',
            }}>
              {loading ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>Loading friends...</Box>
              ) : error ? (
                <Box sx={{ p: 2, color: 'error.main' }}>{error}</Box>
              ) : friends.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>No friends yet. Add some!</Box>
              ) : (
                <>
                  <List>
                    {displayedFriends.map((friend, index) => (
                      <React.Fragment key={friend.id}>
                        <ListItem
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label="remove friend"
                              onClick={() => handleRemoveFriend(friend.id)}
                              sx={{
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                },
                              }}
                            >
                              <PersonRemoveIcon />
                            </IconButton>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>{friend.username[0]}</Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={friend.username} />
                        </ListItem>
                        {index < displayedFriends.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                  {friends.length > FRIENDS_DISPLAY_LIMIT && (
                    <Box sx={{ p: 1 }}>
                      <Button
                        fullWidth
                        size="small"
                        onClick={() => setShowAllFriends(!showAllFriends)}
                        endIcon={showAllFriends ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'rgba(96, 165, 250, 0.1)',
                          },
                        }}
                      >
                        {showAllFriends ? 'Show Less' : 'Show More'}
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default HomePage; 