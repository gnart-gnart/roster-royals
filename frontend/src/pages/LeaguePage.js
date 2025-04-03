import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  Box,
  Button,
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
  IconButton,
  Tooltip,
  Badge,
  Menu,
  Divider,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  CardContent,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { 
  inviteToLeague, 
  getFriends, 
  getLeagues, 
  getLeague, 
  getFriendRequests, 
  getNotifications, 
  handleFriendRequest, 
  handleLeagueInvite, 
  markNotificationsRead,
  placeBet, 
  getLeagueEvents,
  addBet,
  deleteBet,
  updateLeague,
  getLeagueBets,
} from '../services/api';
import NavBar from '../components/NavBar';

function LeaguePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bets, setBets] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')) || { username: '' };
  const isCaptain = league?.captain?.id === user?.id;
  const [members, setMembers] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [leagueEvents, setLeagueEvents] = useState([]);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    image: null
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Navbar state
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Profile menu state
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const profileMenuOpen = Boolean(profileAnchorEl);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
    memberId: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load league data
        const leagueData = await getLeague(id);
        setLeague(leagueData);
        setMembers(leagueData.members || []);
        
        // Load friends for invite functionality
        const friendsData = await getFriends();
        setFriends(friendsData);
        
        // Load notifications and friend requests for navbar
        loadFriendRequests();
        loadNotifications();

        // Load league bets (these would be the bets added to the league)
        loadLeagueBets();

        // Get league events
        const eventsData = await getLeagueEvents(id);
        setLeagueEvents(eventsData);
      } catch (err) {
        setError('Failed to load league data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    if (league) {
      setEditFormData({
        name: league.name || '',
        description: league.description || '',
        image: league.image || null
      });
    }
  }, [league]);

  const loadFriendRequests = async () => {
    try {
      const data = await getFriendRequests();
      setFriendRequests(data.requests);
    } catch (err) {
      console.error('Failed to load friend requests:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const loadLeagueBets = async () => {
    try {
      // Get events from the dedicated endpoint
      const eventsData = await getLeagueEvents(id);
      if (eventsData && Array.isArray(eventsData)) {
        setBets(eventsData.map(event => ({
          id: event.id,
          event_key: event.event_key,
          event_name: event.event_name,
          sport: event.sport,
          marketKey: event.market_data?.marketKey,
          outcomeKey: event.market_data?.outcomeKey,
          odds: event.market_data?.odds,
          amount: event.market_data?.amount,
          status: 'ACTIVE',
          created_at: event.created_at
        })));
      } else {
        setBets([]);
      }
    } catch (err) {
      console.error('Failed to load league bets:', err);
      setBets([]);
    }
  };

  const handleNotificationsOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotifAnchorEl(null);
    // Mark notifications as read when closing
    if (notifications.some(n => !n.is_read)) {
      markNotificationsRead();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAcceptFriend = async (requestId) => {
    try {
      await handleFriendRequest(requestId, 'accept');
      loadFriendRequests();
      // Trigger friends update
      window.dispatchEvent(new Event('friendsUpdated'));
    } catch (err) {
      console.error('Failed to accept friend request:', err);
    }
  };

  const handleRejectFriend = async (requestId) => {
    try {
      await handleFriendRequest(requestId, 'reject');
      loadFriendRequests();
    } catch (err) {
      console.error('Failed to reject friend request:', err);
    }
  };

  const handleLeagueInviteAction = async (notificationId, inviteId, action) => {
    try {
      await handleLeagueInvite(inviteId, action);
      
      // Remove the notification from the list
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      
      // Refresh leagues list if accepted
      if (action === 'accept') {
        // Dispatch event before loading leagues to ensure all listeners are notified
        window.dispatchEvent(new Event('leaguesUpdated'));
        navigate('/home');
      }
    } catch (err) {
      console.error('Failed to handle league invite:', err);
    }
  };

  const handleInvite = async () => {
    if (selectedFriends.length === 0) return;
    
    try {
      const invitePromises = selectedFriends.map(friendId => 
        inviteToLeague(id, friendId)
      );
      
      await Promise.all(invitePromises);
      setInviteDialogOpen(false);
      setSelectedFriends([]);
    } catch (err) {
      console.error('Failed to invite friends:', err);
    }
  };

  const handleFriendSelect = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(prev => prev.filter(id => id !== friendId));
    } else {
      setSelectedFriends(prev => [...prev, friendId]);
    }
  };

  const handleSelectAllToggle = () => {
    if (selectAll) {
      setSelectedFriends([]);
    } else {
      const availableFriends = friends
        .filter(friend => !members.some(member => member.id === friend.id))
        .map(friend => friend.id);
      setSelectedFriends(availableFriends);
    }
    setSelectAll(!selectAll);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter friends based on search query
  const filteredFriends = friends
    .filter(friend => !members.some(member => member.id === friend.id))
    .filter(friend => 
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Profile menu handlers
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handlePromoteToCoCaptain = (memberId) => {
    setConfirmDialog({
      open: true,
      title: 'Promote to Co-Captain',
      message: 'Are you sure you want to promote this member to co-captain?',
      action: 'promote',
      memberId,
    });
  };

  const handleRemoveMember = (memberId) => {
    setConfirmDialog({
      open: true,
      title: 'Remove Member',
      message: 'Are you sure you want to remove this member from the league?',
      action: 'remove',
      memberId,
    });
  };

  const handleConfirmAction = () => {
    // This will be implemented later with backend logic
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditFormData({
      name: league.name || '',
      description: league.description || '',
      image: league.image || null
    });
    setIsEditing(false);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setEditFormData({
        ...editFormData,
        image: file
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editFormData.name.trim()) {
      setSnackbar({
        open: true,
        message: 'League name cannot be empty',
        severity: 'error'
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', editFormData.name);
      formData.append('description', editFormData.description);
      if (editFormData.image) {
        formData.append('image', editFormData.image);
      }

      const updatedLeague = await updateLeague(id, formData);
      
      setLeague(updatedLeague);
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: 'League details updated successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to update league:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update league details',
        severity: 'error'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Add a function to get the full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // If the URL is already absolute (starts with http or https), return it as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // If the URL starts with /media/, prepend the API URL
    if (imageUrl.startsWith('/media/')) {
      return `${process.env.REACT_APP_API_URL}${imageUrl}`;
    }
    // Otherwise, assume it's a relative media path and construct the full URL
    return `${process.env.REACT_APP_API_URL}/media/${imageUrl.replace('media/', '')}`;
  };

  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh', pb: 4 }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* Header with back button and league name */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={() => navigate('/home')} 
              sx={{ 
                color: '#f8fafc',
                mr: 1,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            {isEditing ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  name="name"
                  value={editFormData.name}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  sx={{ input: { color: '#f8fafc' } }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    borderColor: '#8B5CF6',
                    color: '#8B5CF6',
                    '&:hover': {
                      borderColor: '#7C3AED',
                      backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    },
                  }}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                <IconButton 
                  onClick={handleSaveEdit}
                  sx={{ color: '#10B981', ml: 1 }}
                >
                  <SaveIcon />
                </IconButton>
                <IconButton 
                  onClick={handleCancelEdit}
                  sx={{ color: '#EF4444', ml: 1 }}
                >
                  <CancelIcon />
                </IconButton>
              </Box>
            ) : (
              <>
                <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                  {loading ? 'Loading...' : league?.name}
                </Typography>
                {isCaptain && (
                  <Tooltip title="Edit league details">
                    <IconButton 
                      onClick={handleEditClick}
                      sx={{ color: '#60A5FA', ml: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
          </Box>
          
          {/* User Money Display */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: 'rgba(255, 215, 0, 0.15)', 
              p: '8px 16px', 
              borderRadius: 2,
              border: '1px solid rgba(255, 215, 0, 0.3)'
            }}
          >
            <Typography sx={{ color: '#FFD700', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <AttachMoneyIcon fontSize="small" />
              </Box>
              {typeof user.money === 'number' 
                ? user.money.toFixed(2) 
                : parseFloat(user.money || 0).toFixed(2)
              }
            </Typography>
          </Box>
        </Box>

        {!loading && league && (
          <Box 
            sx={{ 
              px: 2, 
              py: 3, 
              mb: 3,
              backgroundColor: 'rgba(22, 28, 36, 0.4)', 
              borderRadius: '8px',
              border: '1px solid rgba(30, 41, 59, 0.8)',
            }}
          >
            {league.image && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <img 
                  src={getImageUrl(league.image)} 
                  alt={league.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            )}
            {isEditing ? (
              <TextField
                name="description"
                value={editFormData.description}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                placeholder="Add a description for your league"
                sx={{ input: { color: '#CBD5E1' } }}
              />
            ) : (
              <Typography variant="body1" sx={{ color: '#CBD5E1' }}>
                {league.description || 'A league for sports betting'}
              </Typography>
            )}
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                League Events
              </Typography>
        {isCaptain && (
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/league/${id}/create-event`)}
                    sx={{
                        bgcolor: '#8B5CF6',
                        color: 'white',
                        borderRadius: '20px',
                        textTransform: 'none',
                        fontWeight: 'medium',
                        px: 2,
                        '&:hover': {
                            backgroundColor: '#7C3AED',
                        },
                    }}
                >
                    Create Event
                </Button>
                
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/league/${id}/market`)}
                    sx={{
                        borderColor: '#8B5CF6',
                        color: '#8B5CF6',
                        borderRadius: '20px',
                        textTransform: 'none',
                        fontWeight: 'medium',
                        px: 2,
                        '&:hover': {
                            borderColor: '#7C3AED',
                            backgroundColor: 'rgba(139, 92, 246, 0.08)',
                        },
                    }}
                >
                    Browse Market
                </Button>
            </Box>
              )}
            </Box>
            
            {/* Display league events */}
            {leagueEvents && leagueEvents.length > 0 ? (
              <Grid container spacing={2}>
                {leagueEvents.map((event) => (
                  <Grid item xs={12} key={event.id}>
                    <Card sx={{ 
                      bgcolor: 'rgba(22, 28, 36, 0.4)', 
                      borderRadius: '8px', 
                      border: '1px solid rgba(30, 41, 59, 0.8)',
                      overflow: 'hidden',
                      boxShadow: 'none',
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                            {event.event_name || 'Event'}
                          </Typography>
                          <Chip 
                            label={event.completed ? 'Completed' : 'Active'} 
                            color={event.completed ? 'error' : 'success'}
                            size="small"
                          />
                        </Box>
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                              Sport:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                              {event.sport || 'Not specified'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                              Market:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                              {event.markets?.[0]?.key || 'Moneyline'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                              Home Team:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                              {event.home_team || 'Home'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                              Away Team:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                              {event.away_team || 'Away'}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                          {!event.completed && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/league/${id}/event/${event.id}/place-user-bet`)}
                              sx={{
                                borderColor: '#10B981',
                                color: '#10B981',
                                '&:hover': {
                                  borderColor: '#059669',
                                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                },
                              }}
                            >
                              Place Bet
                            </Button>
                          )}
                          
                          {isCaptain && !event.completed && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/league/${id}/event/${event.id}/complete`)}
                              sx={{
                                borderColor: '#F59E0B',
                                color: '#F59E0B',
                                '&:hover': {
                                  borderColor: '#D97706',
                                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                                },
                              }}
                            >
                              Complete Event
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center', color: '#6B7280', bgcolor: 'rgba(22, 28, 36, 0.4)', borderRadius: '8px', border: '1px solid rgba(30, 41, 59, 0.8)' }}>
                No events available yet.
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                Leaderboard
              </Typography>
              {isCaptain && (
            <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setInviteDialogOpen(true)}
              sx={{
                    borderColor: '#8B5CF6',
                    color: '#8B5CF6',
                    borderRadius: '20px',
                    textTransform: 'none',
                '&:hover': {
                      borderColor: '#7C3AED',
                      backgroundColor: 'rgba(139, 92, 246, 0.08)',
                },
              }}
            >
                  Invite
            </Button>
              )}
            </Box>
            
            <Box sx={{ 
              bgcolor: 'rgba(22, 28, 36, 0.4)', 
              borderRadius: '8px',
              border: '1px solid rgba(30, 41, 59, 0.8)',
              overflow: 'hidden'
            }}>
              {loading ? (
                <Box sx={{ p: 3, textAlign: 'center', color: '#6B7280' }}>
                  Loading members...
                </Box>
              ) : members.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', color: '#6B7280' }}>
                  No members yet
          </Box>
              ) : (
                <List disablePadding>
                  {members
                    .sort((a, b) => (b.points || 0) - (a.points || 0))
                    .map((member, index) => (
                      <ListItem 
                        key={member.id}
                        sx={{ 
                          py: 2, 
                          borderBottom: index === members.length - 1 ? 'none' : '1px solid rgba(30, 41, 59, 0.8)',
                        }}
                      >
                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                          <Typography 
                            sx={{ 
                              width: 30, 
                              fontWeight: 'bold', 
                              color: index < 3 ? '#FFD700' : '#CBD5E1',
                              textAlign: 'center' 
                            }}
                          >
                            {index + 1}
                          </Typography>
                          
                          <Avatar 
                            sx={{ 
                              bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#8B5CF6',
                              width: 36, 
                              height: 36, 
                              mx: 1,
                              fontSize: '16px',
                              color: index < 3 ? '#111827' : '#FFFFFF',
                            }}
                          >
                            {member.username ? member.username[0].toUpperCase() : 'U'}
                          </Avatar>
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography sx={{ color: '#f8fafc', fontWeight: 'medium' }}>
                                {member.username}
                              </Typography>
                              {league?.captain?.id === member.id && (
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    ml: 1, 
                                    color: '#8B5CF6',
                                    bgcolor: 'rgba(139, 92, 246, 0.1)',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: '4px',
                                  }}
                                >
                                  Captain
                                </Typography>
                              )}
                              {member.is_co_captain && (
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    ml: 1, 
                                    color: '#8B5CF6',
                                    bgcolor: 'rgba(139, 92, 246, 0.1)',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: '4px',
                                  }}
                                >
                                  Co-Captain
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                              Win Rate: {Math.floor(Math.random() * 30) + 50}%
                            </Typography>
                          </Box>
                          
                          <Typography sx={{ color: '#10B981', fontWeight: 'bold' }}>
                            {member.points || 0}
                          </Typography>
                          
                          {isCaptain && member.id !== league.captain.id && (
                            <Box sx={{ display: 'flex', ml: 2 }}>
                              <Tooltip title={member.is_co_captain ? "Remove Co-Captain" : "Promote to Co-Captain"}>
                                <IconButton
                                  size="small"
                                  onClick={() => handlePromoteToCoCaptain(member.id)}
                                  sx={{ 
                                    color: member.is_co_captain ? '#8B5CF6' : '#CBD5E1',
                                    '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)' }
                                  }}
                                >
                                  {member.is_co_captain ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Remove Member">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveMember(member.id)}
                                  sx={{ 
                                    color: '#F87171',
                                    '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' }
                                  }}
                                >
                                  <PersonRemoveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </Box>
                      </ListItem>
                    ))}
                </List>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(22, 28, 36, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          color: '#f8fafc',
          maxWidth: '500px',
          width: '100%',
        }
      }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Invite Friends to Join
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
              <TextField
            placeholder="Search friends"
                fullWidth
                value={searchQuery}
            onChange={handleSearch}
                InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#CBD5E1', mr: 1 }} />,
            }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#8B5CF6',
                  borderWidth: '2px',
                },
              }
            }}
          />
          
          {filteredFriends.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 2, color: '#CBD5E1' }}>
              {searchQuery ? 'No matching friends found' : 'No friends available to invite'}
            </Box>
          ) : (
            <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAll}
                    onChange={handleSelectAllToggle}
                    sx={{
                      color: '#CBD5E1',
                      '&.Mui-checked': {
                        color: '#8B5CF6',
                      },
                    }}
                />
              }
              label="Select All"
                sx={{ mb: 1, color: '#f8fafc' }}
              />
              <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
                {filteredFriends.map((friend) => (
                  <ListItem key={friend.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Checkbox
                      checked={selectedFriends.includes(friend.id)}
                        onChange={() => handleFriendSelect(friend.id)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked': {
                            color: '#8B5CF6',
                          },
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: '#8B5CF6', 
                              width: 32, 
                              height: 32, 
                              mr: 1,
                              fontSize: '14px',
                            }}
                          >
                            {friend.username[0].toUpperCase()}
                          </Avatar>
                          <Typography sx={{ color: '#f8fafc' }}>
                            {friend.username}
                          </Typography>
                        </Box>
                      }
                    />
                </ListItem>
              ))}
              </List>
            </>
          )}
          </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
          <Button 
            onClick={() => setInviteDialogOpen(false)}
            sx={{ 
              color: '#CBD5E1',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
              Cancel
            </Button>
            <Button 
            onClick={handleInvite}
              disabled={selectedFriends.length === 0}
            sx={{
              backgroundColor: '#8B5CF6',
              color: 'white',
              '&:hover': {
                backgroundColor: '#7C3AED',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(139, 92, 246, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)',
              }
            }}
          >
            Send Invites
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogContent>
            <Typography>{confirmDialog.message}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              variant="contained"
              color={confirmDialog.action === 'remove' ? 'error' : 'primary'}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
  );
}

export default LeaguePage; 