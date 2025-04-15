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
  ListItemAvatar,
  ListItemSecondaryAction,
  Tabs,
  Tab,
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
  removeMember,
} from '../services/api';
import NavBar from '../components/NavBar';
import ImageCropper from '../components/ImageCropper';
import Chat from '../components/Chat';

// Add the InviteDialog component before the LeaguePage component
function InviteDialog({ open, onClose, friends, onInvite, loading }) {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleFriend = (friendId) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  const handleInvite = () => {
    onInvite(selectedFriends);
    setSelectedFriends([]);
    setSearchQuery('');
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(226, 232, 240, 0.1)',
          minWidth: '400px',
        }
      }}
    >
      <DialogTitle sx={{ color: '#f8fafc' }}>Invite Friends</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              color: '#CBD5E1',
              '& fieldset': {
                borderColor: 'rgba(148, 163, 184, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(148, 163, 184, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8B5CF6',
              },
            },
          }}
        />
        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
          {filteredFriends.map((friend) => (
            <ListItem key={friend.id} sx={{ px: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedFriends.includes(friend.id)}
                    onChange={() => handleToggleFriend(friend.id)}
                    sx={{
                      color: '#8B5CF6',
                      '&.Mui-checked': {
                        color: '#8B5CF6',
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 1,
                        bgcolor: '#3B82F6',
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
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#94A3B8',
            '&:hover': {
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleInvite}
          disabled={selectedFriends.length === 0 || loading}
          variant="contained"
          sx={{
            bgcolor: '#8B5CF6',
            '&:hover': {
              bgcolor: '#7C3AED',
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(139, 92, 246, 0.4)',
            },
          }}
        >
          {loading ? 'Inviting...' : 'Invite Selected'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`league-tabpanel-${index}`}
      aria-labelledby={`league-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

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

  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const refreshLeagueData = async () => {
    try {
      const leagueData = await getLeague(id);
      console.log('League data received:', leagueData);
      console.log('League balance:', leagueData.balance);
      setLeague(leagueData);
      setMembers(leagueData.members || []);
    } catch (err) {
      console.error('Failed to refresh league data:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await refreshLeagueData();
        
        // Load friends for invite functionality
        const friendsData = await getFriends();
        setFriends(friendsData);
        
        // Load notifications and friend requests for navbar
        loadFriendRequests();
        loadNotifications();

        // Load league bets
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

  // Add event listener for balance updates
  useEffect(() => {
    const handleBalanceUpdate = async () => {
      await refreshLeagueData();
    };

    window.addEventListener('leagueBalanceUpdated', handleBalanceUpdate);
    return () => {
      window.removeEventListener('leagueBalanceUpdated', handleBalanceUpdate);
    };
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

  const handleInvite = async (selectedFriendIds) => {
    try {
      setLoading(true);
      // Invite each selected friend
      await Promise.all(selectedFriendIds.map(friendId => 
        inviteToLeague(id, friendId)
      ));
      
      setSnackbar({
        open: true,
        message: 'Invites sent successfully!',
        severity: 'success'
      });
      setInviteDialogOpen(false);
    } catch (err) {
      console.error('Failed to send invites:', err);
      setSnackbar({
        open: true,
        message: 'Failed to send invites. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
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

  const handleRemoveMember = async (memberId) => {
    try {
      await removeMember(id, memberId);
      // Update the members list
      setMembers(prev => prev.filter(member => member.id !== memberId));
      setSnackbar({
        open: true,
        message: 'Member removed successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to remove member:', err);
      setSnackbar({
        open: true,
        message: 'Failed to remove member. Please try again.',
        severity: 'error'
      });
    }
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
      setSelectedImage(file);
      setShowCropper(true);
    }
  };

  const handleCropComplete = (croppedImage) => {
    setEditFormData(prev => ({
      ...prev,
      image: croppedImage
    }));
    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setSelectedImage(null);
    setShowCropper(false);
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
    if (!imageUrl) return `/images/default_image_updated.png`;
    
    // Check if this is the default image path
    if (imageUrl.includes('default_image_updated.png')) {
      return `/images/default_image_updated.png`;
    }
    
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

  // Add a function to get preview URL
  const getPreviewUrl = (image) => {
    if (!image) return `/images/default_image_updated.png`;
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return getImageUrl(image);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
        {/* League Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/home')}
            sx={{ color: '#f8fafc' }}
          >
            <ArrowBackIcon />
          </IconButton>
          {isEditing ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <TextField
                name="name"
                value={editFormData.name}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    color: '#f8fafc',
                    '& fieldset': {
                      borderColor: 'rgba(148, 163, 184, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(148, 163, 184, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8B5CF6',
                    },
                  }
                }}
              />
              <IconButton 
                onClick={handleSaveEdit}
                sx={{ color: '#10B981' }}
              >
                <SaveIcon />
              </IconButton>
              <IconButton 
                onClick={handleCancelEdit}
                sx={{ color: '#EF4444' }}
              >
                <CancelIcon />
              </IconButton>
            </Box>
          ) : (
            <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 'bold', flex: 1 }}>
              {league?.name}
            </Typography>
          )}
          {isCaptain && !isEditing && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
              sx={{
                borderColor: '#8B5CF6',
                color: '#8B5CF6',
                '&:hover': {
                  borderColor: '#7C3AED',
                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                },
              }}
            >
              Edit League
            </Button>
          )}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.5)',
              borderRadius: '8px',
              px: 2,
              py: 1,
            }}
          >
            <AttachMoneyIcon sx={{ color: '#EAB308' }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#EAB308',
                fontWeight: 'bold'
              }}
            >
              {league?.balance !== undefined && league?.balance !== null ? parseFloat(league.balance).toFixed(2) : '0.00'}
            </Typography>
          </Box>
        </Box>

        {/* League Details Card */}
        <Card sx={{ 
          bgcolor: 'rgba(22, 28, 36, 0.4)', 
          borderRadius: '8px', 
          border: '1px solid rgba(30, 41, 59, 0.8)',
          mb: 4,
        }}>
          <CardContent sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            alignItems: 'flex-start'
          }}>
            {/* Image Section */}
            <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0 }}>
              <img 
                src={isEditing ? getPreviewUrl(editFormData.image) : getImageUrl(league?.image)}
                alt={league?.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/default_image_updated.png";
                }}
                style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              {isEditing && (
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{
                    mt: 2,
                    borderColor: '#8B5CF6',
                    color: '#8B5CF6',
                    '&:hover': {
                      borderColor: '#7C3AED',
                      backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    },
                  }}
                >
                  Change Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              )}
            </Box>

            {/* Description Section */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ color: '#94A3B8', mb: 2, fontWeight: 500 }}>
                About the League
              </Typography>
              {isEditing ? (
                <TextField
                  name="description"
                  value={editFormData.description}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Add a description for your league"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#CBD5E1',
                      backgroundColor: 'rgba(15, 23, 42, 0.3)',
                      '& fieldset': {
                        borderColor: 'rgba(148, 163, 184, 0.2)'
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(148, 163, 184, 0.3)'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8B5CF6'
                      }
                    }
                  }}
                />
              ) : (
                <Typography variant="body1" sx={{ color: '#CBD5E1', lineHeight: 1.7, fontSize: '1.05rem' }}>
                  {league?.description || 'No description available.'}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: '#94A3B8',
                '&.Mui-selected': {
                  color: '#8B5CF6',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#8B5CF6',
              },
            }}
          >
            <Tab label="Events" />
            <Tab label="Members & Leaderboard" />
            <Tab label="Chat" />
          </Tabs>
        </Box>

        {/* Events Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
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
              
              {/* Events List */}
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
                                  }
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
                <Card sx={{ 
                  bgcolor: 'rgba(22, 28, 36, 0.4)', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(30, 41, 59, 0.8)',
                  p: 3,
                  textAlign: 'center'
                }}>
                  <Typography sx={{ color: '#94A3B8' }}>
                    No events yet. {isCaptain && 'Create one to get started!'}
                  </Typography>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Members & Leaderboard Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {/* Members Section */}
              <Card sx={{ 
                bgcolor: 'rgba(22, 28, 36, 0.4)', 
                borderRadius: '8px', 
                border: '1px solid rgba(30, 41, 59, 0.8)',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                      Members
                    </Typography>
                    {isCaptain && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setInviteDialogOpen(true)}
                        sx={{
                          borderColor: '#8B5CF6',
                          color: '#8B5CF6',
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

                  {/* Existing Members List */}
                  <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                    {members.map((member) => (
                      <ListItem
                        key={member.id}
                        secondaryAction={
                          isCaptain && member.id !== user.id && (
                            <IconButton
                              edge="end"
                              onClick={() => handleRemoveMember(member.id)}
                              sx={{ color: '#EF4444' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: member.id === league?.captain?.id ? '#8B5CF6' : '#3B82F6' }}>
                            {member.username[0].toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ color: '#f8fafc' }}>
                                {member.username}
                              </Typography>
                              {member.id === league?.captain?.id && (
                                <Chip
                                  label="Captain"
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(139, 92, 246, 0.2)',
                                    color: '#8B5CF6',
                                    fontSize: '0.7rem',
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: '#64748B' }}>
                              Points: {member.points || 0}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Leaderboard Section */}
              <Card sx={{ 
                bgcolor: 'rgba(22, 28, 36, 0.4)', 
                borderRadius: '8px', 
                border: '1px solid rgba(30, 41, 59, 0.8)',
                height: '100%'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 3 }}>
                    Leaderboard
                  </Typography>

                  {/* Existing Leaderboard */}
                  {[...members]
                    .sort((a, b) => (b.points || 0) - (a.points || 0))
                    .map((member, index) => (
                      <Box
                        key={member.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                          p: 1.5,
                          borderRadius: '8px',
                          bgcolor: member.id === user.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                          border: member.id === user.id ? '1px solid rgba(139, 92, 246, 0.2)' : 'none',
                        }}
                      >
                        <Typography
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            color: index < 3 ? '#f8fafc' : '#64748B',
                            bgcolor: index === 0 ? '#F59E0B' : index === 1 ? '#94A3B8' : index === 2 ? '#B45309' : 'transparent',
                          }}
                        >
                          {index + 1}
                        </Typography>
                        
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            mr: 2,
                            bgcolor: member.id === league?.captain?.id ? '#8B5CF6' : '#3B82F6',
                          }}
                        >
                          {member.username[0].toUpperCase()}
                        </Avatar>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: '#f8fafc', fontWeight: 'medium' }}>
                            {member.username}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#10B981' }}>
                            {member.points || 0} points
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Chat Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card sx={{ 
            bgcolor: 'rgba(22, 28, 36, 0.4)', 
            borderRadius: '8px', 
            border: '1px solid rgba(30, 41, 59, 0.8)'
          }}>
            <CardContent>
              <Chat leagueId={id} />
            </CardContent>
          </Card>
        </TabPanel>
      </Container>

      <InviteDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        friends={friends}
        onInvite={handleInvite}
        loading={loading}
      />

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

      {showCropper && selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </Box>
  );
}

export default LeaguePage; 