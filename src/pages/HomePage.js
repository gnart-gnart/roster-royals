import React, { useState } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

function HomePage() {
  const navigate = useNavigate();
  const [showAllFriends, setShowAllFriends] = useState(false);
  const FRIENDS_DISPLAY_LIMIT = 5;

  const mockGroups = [
    { 
      id: 1, 
      name: 'NFL Betting Club', 
      members: 8,
      president: 'Mike Brown',
      topPlayers: [
        { name: 'John Doe', points: 2450, avatar: 'J' },
        { name: 'Sarah Wilson', points: 2100, avatar: 'S' },
        { name: 'Mike Brown', points: 1890, avatar: 'M', isPresident: true },
      ]
    },
    { 
      id: 2, 
      name: 'NBA Fantasy League', 
      members: 12,
      president: 'David Kim',
      topPlayers: [
        { name: 'Alex Johnson', points: 3200, avatar: 'A' },
        { name: 'Emma Davis', points: 2900, avatar: 'E' },
        { name: 'Chris Lee', points: 2750, avatar: 'C' },
      ]
    },
    { 
      id: 3, 
      name: 'MLB Predictions', 
      members: 6,
      president: 'Lisa Chen',
      topPlayers: [
        { name: 'Tom Harris', points: 1800, avatar: 'T' },
        { name: 'Lisa Chen', points: 1650, avatar: 'L', isPresident: true },
        { name: 'Ryan Park', points: 1500, avatar: 'R' },
      ]
    },
  ];

  const mockFriends = [
    { id: 1, name: 'John Doe', avatar: 'J' },
    { id: 2, name: 'Jane Smith', avatar: 'J' },
    { id: 3, name: 'Mike Johnson', avatar: 'M' },
    { id: 4, name: 'Sarah Wilson', avatar: 'S' },
    { id: 5, name: 'David Kim', avatar: 'D' },
    { id: 6, name: 'Emma Davis', avatar: 'E' },
    { id: 7, name: 'Alex Thompson', avatar: 'A' },
    { id: 8, name: 'Lisa Chen', avatar: 'L' },
    { id: 9, name: 'Ryan Park', avatar: 'R' },
    { id: 10, name: 'Maria Garcia', avatar: 'M' },
  ];

  const displayedFriends = showAllFriends 
    ? mockFriends 
    : mockFriends.slice(0, FRIENDS_DISPLAY_LIMIT);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Your Groups
          </Typography>
          <Grid container spacing={2}>
            {mockGroups.map((group) => (
              <Grid item xs={12} key={group.id}>
                <Card sx={{
                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(96, 165, 250, 0.2)',
                  '&:hover': {
                    border: '1px solid rgba(96, 165, 250, 0.4)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}>
                  <CardActionArea onClick={() => navigate(`/group/${group.id}`)}>
                    <CardContent>
                      <Typography variant="h6">{group.name}</Typography>
                      <Typography color="textSecondary" sx={{ mb: 1 }}>
                        {group.members} members • President: {group.president}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                          Top Players
                        </Typography>
                        {group.topPlayers.map((player, index) => (
                          <Box key={index} sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            mb: 1,
                            opacity: 1 - (index * 0.2)
                          }}>
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                mr: 1, 
                                fontSize: '0.8rem',
                                bgcolor: player.isPresident ? 'primary.main' : 'grey.600',
                                border: player.isPresident ? '2px solid #60a5fa' : 'none'
                              }}
                            >
                              {player.avatar}
                            </Avatar>
                            <Typography variant="body2">
                              {player.name}
                              {player.isPresident && (
                                <Typography
                                  component="span"
                                  color="primary"
                                  sx={{ ml: 1, fontSize: '0.75rem' }}
                                >
                                  (President)
                                </Typography>
                              )}
                            </Typography>
                            <Typography variant="body2" color="primary" sx={{ ml: 'auto' }}>
                              {player.points} pts
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
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
            <List>
              {displayedFriends.map((friend, index) => (
                <React.Fragment key={friend.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>{friend.avatar}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={friend.name} />
                  </ListItem>
                  {index < displayedFriends.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            {mockFriends.length > FRIENDS_DISPLAY_LIMIT && (
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
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default HomePage; 