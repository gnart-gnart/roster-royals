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
  CircularProgress,
  Fade,
  Grow,
  Slide,
  alpha,
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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LayersIcon from '@mui/icons-material/Layers';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import ForumIcon from '@mui/icons-material/Forum';
import HistoryIcon from '@mui/icons-material/History';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
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
  getLeagueCircuits,
} from '../services/api';
import NavBar from '../components/NavBar';
import ImageCropper from '../components/ImageCropper';
import Chat from '../components/Chat';

// Add the InviteDialog component before the LeaguePage component
function InviteDialog({ open, onClose, friends, onInvite, loading }) {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const user = JSON.parse(localStorage.getItem('user')) || {};

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
    // Ensure we're passing an array of friend IDs
    if (selectedFriends && selectedFriends.length > 0) {
    onInvite(selectedFriends);
    setSelectedFriends([]);
    setSearchQuery('');
    } else {
      // If no friends selected, do nothing or show a message
      console.warn("No friends selected for invitation");
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to get the proper image URL
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

  // Function to get friend profile image source
  const getFriendImageSource = (friend) => {
    // If this is the current user, check for embedded image data
    if (friend.id === user.id) {
      // Try embedded image from user object first
      if (user.embeddedImageData) {
        return user.embeddedImageData;
      }
      
      // Then try session storage with user-specific key
      const userSpecificKey = `profileImageDataUrl_${friend.id}`;
      const profileImageDataUrl = sessionStorage.getItem(userSpecificKey);
      if (profileImageDataUrl) {
        return profileImageDataUrl;
      }
    }
    
    // Add fallback to use API-based avatar for other users
    if (friend.profile_image_url) {
      return getImageUrl(friend.profile_image_url);
    }
    
    // Return avatar API URL as fallback
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.username)}&background=random`;
  };

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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} sx={{ color: '#8B5CF6' }} />
          </Box>
        ) : (
          <>
            {friends.length === 0 ? (
              <Box sx={{ textAlign: 'center', color: '#94A3B8', p: 2 }}>
                <Typography variant="body1">You don't have any friends yet.</Typography>
                <Typography variant="body2">Add friends to invite them to your league.</Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2, color: '#8B5CF6', borderColor: '#8B5CF6' }}
                  onClick={() => {
                    onClose();
                    // Navigate to add friends page
                    window.location.href = '/add-friend';
                  }}
                >
                  Add Friends
                </Button>
              </Box>
            ) : filteredFriends.length === 0 ? (
              <Box sx={{ textAlign: 'center', color: '#94A3B8', p: 2 }}>
                <Typography variant="body1">No friends match your search.</Typography>
              </Box>
            ) : (
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
                            src={getFriendImageSource(friend)}
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
            )}
          </>
        )}
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
  const [leagueCircuits, setLeagueCircuits] = useState([]);
  
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
      console.log(`Loading league data for ID: ${id}`);
      const leagueData = await getLeague(id);
      console.log('League data received:', leagueData);
      console.log('League balance:', leagueData.balance);
      
      // Log the member data to inspect structure
      if (leagueData.members) {
        console.log("League members data:", leagueData.members);
        console.log("First member profile data sample:", leagueData.members[0]);
      }
      
      setLeague(leagueData);
      setMembers(leagueData.members || []);
      
      // Set the edit form data
      setEditFormData({
        name: leagueData.name || '',
        description: leagueData.description || '',
        image: leagueData.image || null
      });
      
      loadFriendRequests();
      loadNotifications();
      
      // Load league events and circuits
      const eventsData = await getLeagueEvents(id);
      setLeagueEvents(eventsData || []);
      
      try {
        const circuitsData = await getLeagueCircuits(id);
        setLeagueCircuits(circuitsData || []);
      } catch (circuitErr) {
        console.error('Error loading league circuits:', circuitErr);
      }
    } catch (err) {
      console.error('Failed to refresh league data:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load league data
        const leagueData = await getLeague(id);
        setLeague(leagueData);
        setMembers(leagueData.members || []);
        
        // Load friends data - ensure this is included
        const friendsData = await getFriends();
        setFriends(friendsData);
        
        // Set the edit form data
        setEditFormData({
          name: leagueData.name || '',
          description: leagueData.description || '',
          image: leagueData.image || null
        });
        
        loadFriendRequests();
        loadNotifications();
        
        // Load league events and circuits
        const eventsData = await getLeagueEvents(id);
        setLeagueEvents(eventsData || []);
        
        try {
          const circuitsData = await getLeagueCircuits(id);
          setLeagueCircuits(circuitsData || []);
        } catch (circuitErr) {
          console.error('Error loading league circuits:', circuitErr);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load league data');
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
      loadNotifications();
      if (action === 'accept') {
        const updatedLeagueData = await getLeague(id);
        setLeague(updatedLeagueData);
        setMembers(updatedLeagueData.members || []);
      }
    } catch (err) {
      console.error(`Failed to ${action} league invite:`, err);
      setSnackbar({ open: true, message: `Failed to ${action} invite`, severity: 'error' });
    }
  };

  const handleInvite = async (selectedFriendIds) => {
    try {
      setLoading(true);
      
      // Ensure selectedFriendIds is an array
      const friendIds = Array.isArray(selectedFriendIds) ? selectedFriendIds : 
                        (selectedFriendIds ? [selectedFriendIds] : []);
      
      if (friendIds.length === 0) {
      setSnackbar({
        open: true,
          message: 'No friends selected to invite',
          severity: 'warning'
        });
        setLoading(false);
        return;
      }
      
      // Set up a counter for successful invites
      let successCount = 0;
      let errorMessages = [];
      
      // Process each invite and collect errors
      for (const friendId of friendIds) {
        try {
          await inviteToLeague(id, friendId);
          successCount++;
        } catch (err) {
          const friendName = friends.find(f => f.id === friendId)?.username || 'Friend';
          errorMessages.push(`${friendName}: ${err.message}`);
        }
      }
      
      // Determine the appropriate message based on results
      if (successCount === friendIds.length) {
        // All invites succeeded
        setSnackbar({
          open: true,
          message: 'All invites sent successfully!',
        severity: 'success'
      });
      setInviteDialogOpen(false);
      } else if (successCount > 0) {
        // Some invites succeeded
        setSnackbar({
          open: true,
          message: `${successCount} of ${friendIds.length} invites sent successfully.`,
          severity: 'warning'
        });
        setInviteDialogOpen(false);
      } else {
        // No invites succeeded
        setSnackbar({
          open: true,
          message: errorMessages.length === 1 ? errorMessages[0] : 'Failed to send invites. Please try again.',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Failed to send invites:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to send invites. Please try again.',
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

  // Function to get member profile image source
  const getMemberImageSource = (member) => {
    // If this is the current user, check for embedded image data
    if (member.id === user.id) {
      // Try embedded image from user object first
      if (user.embeddedImageData) {
        return user.embeddedImageData;
      }
      
      // Then try session storage with user-specific key
      const userSpecificKey = `profileImageDataUrl_${member.id}`;
      const profileImageDataUrl = sessionStorage.getItem(userSpecificKey);
      if (profileImageDataUrl) {
        return profileImageDataUrl;
      }
    }
    
    // Add fallback to use API-based avatar for other users
    if (member.profile_image_url) {
      return getImageUrl(member.profile_image_url);
    }
    
    // Return avatar API URL as fallback - this ensures all users have an image
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(member.username)}&background=random`;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenInviteDialog = async () => {
    try {
      // Get fresh friends data when opening the dialog
      const friendsData = await getFriends();
      setFriends(friendsData);
      setInviteDialogOpen(true);
    } catch (err) {
      console.error('Failed to load friends:', err);
      setError('Failed to load friends list');
    }
  };

  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
        {/* Enhanced League Header with animation and visual elements */}
        <Fade in={true} timeout={800}>
          <Box sx={{ 
            mb: 4, 
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '12px',
            bgcolor: 'rgba(30, 41, 59, 0.8)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
          }}>
            {/* Decorative elements */}
            <Box sx={{
              position: 'absolute',
              top: -80,
              right: -80,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(30, 41, 59, 0) 70%)',
              filter: 'blur(40px)',
              zIndex: 0
            }} />
            
            <Box sx={{
              position: 'absolute',
              bottom: -60,
              left: -60,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(30, 41, 59, 0) 70%)',
              filter: 'blur(30px)',
              zIndex: 0
            }} />

            <Box sx={{ 
              p: 3,
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' }, 
              gap: 2, 
              position: 'relative',
              zIndex: 1
            }}>
          <IconButton 
            onClick={() => navigate('/home')}
                sx={{ 
                  color: '#f8fafc',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                  transition: 'all 0.2s ease'
                }}
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
                        bgcolor: 'rgba(15, 23, 42, 0.3)',
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
                  <Tooltip title="Save changes">
              <IconButton 
                onClick={handleSaveEdit}
                      sx={{ 
                        color: '#10B981',
                        bgcolor: 'rgba(16, 185, 129, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(16, 185, 129, 0.2)',
                        }
                      }}
              >
                <SaveIcon />
              </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
              <IconButton 
                onClick={handleCancelEdit}
                      sx={{ 
                        color: '#EF4444',
                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(239, 68, 68, 0.2)',
                        }
                      }}
              >
                <CancelIcon />
              </IconButton>
                  </Tooltip>
            </Box>
          ) : (
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#f8fafc', 
                    fontWeight: 'bold', 
                    flex: 1,
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '& > svg': {
                      color: '#8B5CF6',
                      fontSize: '1.8rem'
                    }
                  }}
                >
                  <EmojiEventsIcon /> {league?.name}
            </Typography>
          )}
              
          {isCaptain && !isEditing && (
                <Grow in={true} timeout={1000}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
              sx={{
                borderColor: '#8B5CF6',
                color: '#8B5CF6',
                      borderRadius: '8px',
                      px: 2,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 'medium',
                '&:hover': {
                  borderColor: '#7C3AED',
                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                        transform: 'translateY(-2px)',
                },
                      transition: 'all 0.2s ease',
              }}
            >
              Edit League
            </Button>
                </Grow>
              )}
          </Box>
        </Box>
        </Fade>

        {/* League Details Card with enhanced styling */}
        <Slide direction="up" in={true} timeout={400} mountOnEnter unmountOnExit>
        <Card sx={{ 
            bgcolor: alpha('#1e293b', 0.7),
            backgroundImage: 'linear-gradient(to bottom right, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))',
            borderRadius: '16px', 
            border: '1px solid rgba(226, 232, 240, 0.1)',
          mb: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(to right, #8B5CF6, #3B82F6)',
            }
        }}>
          <CardContent sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
              alignItems: 'flex-start',
              p: { xs: 2.5, md: 3 }
            }}>
              {/* Image Section with improved styling */}
              <Box sx={{ 
                width: { xs: '100%', md: '300px' }, 
                flexShrink: 0,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '12px',
                  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  pointerEvents: 'none'
                }
              }}>
                <Box sx={{ 
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  height: '200px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, transparent 70%, rgba(0, 0, 0, 0.7))',
                    zIndex: 1,
                    pointerEvents: 'none'
                  },
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}>
              <img 
                src={isEditing ? getPreviewUrl(editFormData.image) : getImageUrl(league?.image)}
                alt={league?.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/default_image_updated.png";
                }}
                style={{
                  width: '100%',
                      height: '100%',
                  objectFit: 'cover',
                }}
              />
                </Box>
              {isEditing && (
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                    startIcon={<EditIcon />}
                  sx={{
                    mt: 2,
                    borderColor: '#8B5CF6',
                    color: '#8B5CF6',
                      textTransform: 'none',
                      fontWeight: 'medium',
                      py: 1,
                      borderRadius: '8px',
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

              {/* Description Section with improved styling */}
            <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ 
                  color: '#94A3B8', 
                  mb: 2, 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&::before': {
                    content: '""',
                    display: 'block',
                    width: '4px',
                    height: '20px',
                    borderRadius: '2px',
                    background: 'linear-gradient(to bottom, #8B5CF6, #3B82F6)',
                    marginRight: '8px'
                  }
                }}>
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
                        borderRadius: '8px',
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
                  <Typography variant="body1" sx={{ 
                    color: '#CBD5E1', 
                    lineHeight: 1.7, 
                    fontSize: '1.05rem',
                    p: 2,
                    borderRadius: '8px',
                    bgcolor: 'rgba(15, 23, 42, 0.3)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                  }}>
                  {league?.description || 'No description available.'}
                </Typography>
              )}
                
                {/* League statistics overview */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  mt: 3, 
                  flexWrap: 'wrap'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1.5
                  }}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(139, 92, 246, 0.1)', 
                      color: '#8B5CF6',
                      width: 40,
                      height: 40
                    }}>
                      <PeopleAltIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        Members
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#f8fafc' }}>
                        {members?.length || 0}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1.5
                  }}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(59, 130, 246, 0.1)', 
                      color: '#3B82F6',
                      width: 40,
                      height: 40
                    }}>
                      <SportsTennisIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        Events
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#f8fafc' }}>
                        {leagueEvents?.length || 0}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1.5
                  }}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(245, 158, 11, 0.1)', 
                      color: '#F59E0B',
                      width: 40,
                      height: 40
                    }}>
                      <LayersIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        Circuits
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#f8fafc' }}>
                        {leagueCircuits?.length || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
            </Box>
          </CardContent>
        </Card>
        </Slide>

        {/* Tabs Navigation */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'rgba(255, 255, 255, 0.1)', 
          mb: 3,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(to right, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.3))',
          }
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                color: '#94A3B8',
                minHeight: '56px',
                fontWeight: 'medium',
                fontSize: '0.95rem',
                textTransform: 'none',
                borderRadius: '8px 8px 0 0',
                mx: 0.5,
                '&.Mui-selected': {
                  color: '#8B5CF6',
                  fontWeight: 'bold',
                  bgcolor: 'rgba(139, 92, 246, 0.08)',
                },
                '&:hover': {
                  color: '#e0e7ff',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
                transition: 'all 0.2s ease',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#8B5CF6',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab 
              icon={<EmojiEventsIcon sx={{ fontSize: '1.2rem' }} />} 
              iconPosition="start"
              label="Events" 
            />
            <Tab 
              icon={<GroupsIcon sx={{ fontSize: '1.2rem' }} />} 
              iconPosition="start"
              label="Members & Leaderboard" 
            />
            <Tab 
              icon={<ForumIcon sx={{ fontSize: '1.2rem' }} />} 
              iconPosition="start"
              label="Chat" 
            />
            {isCaptain && (
              <Tab 
                icon={<HistoryIcon sx={{ fontSize: '1.2rem' }} />} 
                iconPosition="start"
                label="History" 
              />
            )}
          </Tabs>
        </Box>

        {/* Events Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Circuits Section */}
            <Grid item xs={12}>
              <Fade in={true} timeout={800}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #F59E0B, #D97706)',
                    borderRadius: '2px'
                  }
                }}>
                  <Typography variant="h5" sx={{ 
                    color: '#f8fafc', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    '& > svg': {
                      color: '#F59E0B',
                    }
                  }}>
                    <LayersIcon /> Circuits
                </Typography>
                {isCaptain && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/league/${id}/create-circuit`)}
                    sx={{
                        background: 'linear-gradient(to right, #F59E0B, #D97706)',
                      color: 'white',
                        borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 'medium',
                      px: 2,
                        py: 1,
                        boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)',
                      '&:hover': {
                          boxShadow: '0 6px 15px rgba(245, 158, 11, 0.4)',
                          transform: 'translateY(-2px)',
                      },
                        transition: 'all 0.3s ease',
                    }}
                  >
                    Create Circuit
                  </Button>
                )}
              </Box>
              </Fade>

              {/* Circuits List */}
              {leagueCircuits && leagueCircuits.length > 0 ? (
                <Grid container spacing={2}>
                  {leagueCircuits.map((circuit, index) => (
                    <Grid item xs={12} sm={6} md={4} key={circuit.id}>
                      <Grow in={true} timeout={600 + (index * 100)}>
                      <Card 
                        onClick={() => navigate(`/league/${id}/circuit/${circuit.id}`)}
                        sx={{ 
                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
                            borderRadius: '12px', 
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                          overflow: 'hidden',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                          cursor: 'pointer',
                            height: '100%',
                            transition: 'all 0.3s ease',
                          '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 12px 20px rgba(0, 0, 0, 0.2)',
                              borderColor: 'rgba(245, 158, 11, 0.4)',
                            },
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '4px',
                              background: 'linear-gradient(to right, #F59E0B, #D97706)',
                            }
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ 
                                bgcolor: 'rgba(245, 158, 11, 0.15)', 
                                color: '#F59E0B',
                                mr: 1.5,
                              }}>
                                <EmojiEventsIcon />
                              </Avatar>
                              <Typography variant="h6" sx={{ 
                                color: '#f8fafc', 
                                fontWeight: 'bold', 
                                flexGrow: 1,
                                textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                              }}>
                               {circuit.name}
                             </Typography>
                             <Chip 
                               label={circuit.status || 'Active'} 
                               color={circuit.status === 'active' ? 'success' : circuit.status === 'completed' ? 'default' : 'warning'}
                               size="small"
                                sx={{
                                  fontWeight: 'medium',
                                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
                                }}
                             />
                          </Box>
                            
                            <Box sx={{ 
                              borderLeft: '3px solid rgba(245, 158, 11, 0.3)',
                              pl: 2,
                              py: 1,
                              mb: 2,
                              borderRadius: '2px',
                            }}>
                              <Typography variant="body2" sx={{ 
                                color: '#CBD5E1', 
                                mb: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                '& > svg': {
                                  color: '#F59E0B',
                                  fontSize: '1rem',
                                }
                              }}>
                                <AttachMoneyIcon /> Entry Fee: ${circuit.entry_fee}
                          </Typography>
                              <Typography variant="body2" sx={{ 
                                color: '#94A3B8',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                '& > svg': {
                                  color: '#64748B',
                                  fontSize: '1rem',
                                }
                              }}>
                                <PeopleAltIcon /> {circuit.participant_count || 0} participant(s)
                          </Typography>
                            </Box>
                            
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              mt: 2
                            }}>
                              <Button 
                                size="small"
                                sx={{
                                  color: '#F59E0B',
                                  textTransform: 'none',
                                  fontWeight: 'medium',
                                  '&:hover': {
                                    bgcolor: 'rgba(245, 158, 11, 0.1)',
                                  }
                                }}
                              >
                                View Details
                              </Button>
                            </Box>
                        </CardContent>
                      </Card>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Fade in={true} timeout={800}>
                <Card sx={{ 
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))',
                    borderRadius: '12px', 
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                    p: 4,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '180px',
                  }}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(245, 158, 11, 0.1)', 
                      color: '#F59E0B',
                      width: 56,
                      height: 56,
                      mb: 2
                    }}>
                      <LayersIcon sx={{ fontSize: '2rem' }} />
                    </Avatar>
                    <Typography sx={{ color: '#94A3B8', mb: 2 }}>
                      No circuits running yet. {isCaptain && 'Create one to get started!'}
                  </Typography>
                    {isCaptain && (
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(`/league/${id}/create-circuit`)}
                        sx={{
                          borderColor: '#F59E0B',
                          color: '#F59E0B',
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 'medium',
                          px: 2,
                          py: 0.75,
                          '&:hover': {
                            borderColor: '#D97706',
                            backgroundColor: 'rgba(245, 158, 11, 0.08)',
                          },
                        }}
                      >
                        Create Circuit
                      </Button>
                    )}
                </Card>
                </Fade>
              )}
            </Grid>

            {/* Divider */}
             <Grid item xs={12}>
              <Divider sx={{ 
                my: 4, 
                borderColor: 'rgba(255, 255, 255, 0.1)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  bgcolor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '20px',
                  height: '20px',
                  bgcolor: '#8B5CF6',
                  opacity: 0.2,
                  borderRadius: '50%',
                  zIndex: 1,
                }
              }} />
            </Grid>

            {/* League Events Section with enhanced styling */}
            <Grid item xs={12}>
              <Fade in={true} timeout={1000}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'center' }, 
                  mb: 3,
                  gap: { xs: 2, sm: 0 },
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #8B5CF6, #6D28D9)',
                    borderRadius: '2px'
                  }
                }}>
                  <Typography variant="h5" sx={{ 
                    color: '#f8fafc', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    '& > svg': {
                      color: '#8B5CF6',
                    }
                  }}>
                    <EmojiEventsIcon /> League Events
                </Typography>
                {isCaptain && (
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2,
                      flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      width: { xs: '100%', sm: 'auto' },
                      justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                    }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate(`/league/${id}/create-event`)}
                      sx={{
                          background: 'linear-gradient(to right, #8B5CF6, #6D28D9)',
                        color: 'white',
                          borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 'medium',
                        px: 2,
                          py: 1,
                          minWidth: '150px',
                          boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)',
                        '&:hover': {
                            boxShadow: '0 6px 15px rgba(139, 92, 246, 0.4)',
                            transform: 'translateY(-2px)',
                        },
                          transition: 'all 0.3s ease',
                      }}
                    >
                      Create Event
                    </Button>
                    
                    <Button
                      variant="outlined"
                        startIcon={<SearchIcon />}
                      onClick={() => navigate(`/league/${id}/market`)}
                      sx={{
                        borderColor: '#8B5CF6',
                        color: '#8B5CF6',
                          borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 'medium',
                        px: 2,
                          py: 1,
                          minWidth: '150px',
                        '&:hover': {
                          borderColor: '#7C3AED',
                          backgroundColor: 'rgba(139, 92, 246, 0.08)',
                            transform: 'translateY(-2px)',
                        },
                          transition: 'all 0.3s ease',
                      }}
                    >
                      Browse Market
                    </Button>
                  </Box>
                )}
              </Box>
              </Fade>
              
              {/* Events List with enhanced cards */}
              {leagueEvents && leagueEvents.length > 0 ? (
                <Grid container spacing={2}>
                  {leagueEvents.map((event, index) => (
                    <Grid item xs={12} key={event.id}>
                      <Grow in={true} timeout={800 + (index * 100)}>
                      <Card sx={{ 
                          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
                          borderRadius: '12px', 
                          border: event.completed ? 
                            '1px solid rgba(239, 68, 68, 0.2)' : 
                            '1px solid rgba(16, 185, 129, 0.2)',
                        overflow: 'hidden',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                            transform: 'translateY(-3px)',
                          },
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '4px',
                            background: event.completed ? 
                              'linear-gradient(to right, #EF4444, #DC2626)' : 
                              'linear-gradient(to right, #10B981, #059669)',
                          }
                        }}>
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: { xs: 'column', sm: 'row' },
                              justifyContent: 'space-between', 
                              alignItems: { xs: 'flex-start', sm: 'center' },
                              mb: 2,
                              gap: { xs: 1, sm: 0 }
                            }}>
                              <Typography variant="h6" sx={{ 
                                color: '#f8fafc', 
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                '& > svg': {
                                  color: event.completed ? '#EF4444' : '#10B981',
                                }
                              }}>
                                <SportsTennisIcon /> {event.event_name || 'Event'}
                            </Typography>
                            <Chip 
                              label={event.completed ? 'Completed' : 'Active'} 
                              color={event.completed ? 'error' : 'success'}
                              size="small"
                                sx={{ 
                                  fontWeight: 'medium',
                                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
                                }}
                            />
                          </Box>
                          
                            <Box sx={{ 
                              p: 2, 
                              mb: 2, 
                              borderRadius: '8px',
                              bgcolor: 'rgba(15, 23, 42, 0.5)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                            }}>
                              <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" sx={{ 
                                    color: '#94A3B8',
                                    fontWeight: 'medium',
                                    mb: 0.5
                                  }}>
                                Sport:
                              </Typography>
                                  <Chip
                                    size="small"
                                    label={event.sport || 'Not specified'}
                                    sx={{ 
                                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                                      color: '#60A5FA',
                                      fontWeight: 'medium',
                                    }}
                                  />
                            </Grid>
                            
                            <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" sx={{ 
                                    color: '#94A3B8',
                                    fontWeight: 'medium',
                                    mb: 0.5
                                  }}>
                                Market:
                              </Typography>
                                  <Chip
                                    size="small"
                                    label={event.markets?.[0]?.key || 'Moneyline'}
                                    sx={{ 
                                      bgcolor: 'rgba(245, 158, 11, 0.1)',
                                      color: '#F59E0B',
                                      fontWeight: 'medium',
                                    }}
                                  />
                            </Grid>
                            
                            <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" sx={{ 
                                    color: '#94A3B8',
                                    fontWeight: 'medium',
                                    mb: 0.5
                                  }}>
                                Home Team:
                              </Typography>
                                  <Typography variant="body1" sx={{ 
                                    color: '#CBD5E1',
                                    fontWeight: 'medium'
                                  }}>
                                {event.home_team || 'Home'}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" sx={{ 
                                    color: '#94A3B8',
                                    fontWeight: 'medium',
                                    mb: 0.5
                                  }}>
                                Away Team:
                              </Typography>
                                  <Typography variant="body1" sx={{ 
                                    color: '#CBD5E1',
                                    fontWeight: 'medium'
                                  }}>
                                {event.away_team || 'Away'}
                              </Typography>
                            </Grid>
                          </Grid>
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'flex-end', 
                              gap: 2,
                              mt: 2
                            }}>
                            {!event.completed && (
                              <Button
                                  variant="contained"
                                size="small"
                                  startIcon={<AttachMoneyIcon />}
                                onClick={() => navigate(`/league/${id}/event/${event.id}/place-user-bet`)}
                                sx={{
                                    background: 'linear-gradient(to right, #10B981, #059669)',
                                    color: 'white',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 'medium',
                                    px: 2,
                                    py: 1,
                                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
                                  '&:hover': {
                                      boxShadow: '0 6px 15px rgba(16, 185, 129, 0.3)',
                                      transform: 'translateY(-2px)',
                                  },
                                    transition: 'all 0.3s ease',
                                }}
                              >
                                Place Bet
                              </Button>
                            )}
                            
                            {isCaptain && !event.completed && (
                              <Button
                                variant="outlined"
                                size="small"
                                  startIcon={<EmojiEventsIcon />}
                                onClick={() => navigate(`/league/${id}/event/${event.id}/complete`)}
                                sx={{
                                  borderColor: '#F59E0B',
                                  color: '#F59E0B',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 'medium',
                                    px: 2,
                                    py: 1,
                                  '&:hover': {
                                    borderColor: '#D97706',
                                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                                      transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                              >
                                Complete Event
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Fade in={true} timeout={800}>
                <Card sx={{ 
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))',
                    borderRadius: '12px', 
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                    p: 4,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '180px',
                  }}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(139, 92, 246, 0.1)', 
                      color: '#8B5CF6',
                      width: 56,
                      height: 56,
                      mb: 2
                    }}>
                      <EmojiEventsIcon sx={{ fontSize: '2rem' }} />
                    </Avatar>
                    <Typography sx={{ color: '#94A3B8', mb: 2 }}>
                    No events yet. {isCaptain && 'Create one to get started!'}
                  </Typography>
                    {isCaptain && (
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(`/league/${id}/create-event`)}
                        sx={{
                          borderColor: '#8B5CF6',
                          color: '#8B5CF6',
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 'medium',
                          px: 2,
                          py: 0.75,
                          '&:hover': {
                            borderColor: '#7C3AED',
                            backgroundColor: 'rgba(139, 92, 246, 0.08)',
                          },
                        }}
                      >
                        Create Event
                      </Button>
                    )}
                </Card>
                </Fade>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Members & Leaderboard Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {/* Members Section with enhanced styling */}
              <Fade in={true} timeout={600}>
              <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
                  borderRadius: '12px', 
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  height: '100%',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                  }
                }}>
                  <CardContent sx={{ p: 0 }}>
                    {/* Members header with decoration */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      p: 3,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      position: 'relative'
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: '#f8fafc', 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        '& > svg': {
                          color: '#3B82F6'
                        }
                      }}>
                        <PeopleAltIcon /> Members
                    </Typography>
                    {isCaptain && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleOpenInviteDialog}
                        sx={{
                            borderColor: '#3B82F6',
                            color: '#3B82F6',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 'medium',
                            py: 0.75,
                            px: 2,
                          '&:hover': {
                              borderColor: '#2563EB',
                              backgroundColor: 'rgba(59, 130, 246, 0.08)',
                              transform: 'translateY(-2px)',
                          },
                            transition: 'all 0.2s ease',
                        }}
                      >
                        Invite
                      </Button>
                    )}
                  </Box>

                    {/* Existing Members List with improved styling */}
                    <List sx={{ 
                      maxHeight: 500, 
                      overflow: 'auto',
                      p: 0,
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(15, 23, 42, 0.5)',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(59, 130, 246, 0.3)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: 'rgba(59, 130, 246, 0.5)',
                      },
                    }}>
                      {members.map((member, index) => (
                        <Grow in={true} timeout={600 + (index * 100)} key={member.id}>
                      <ListItem
                            sx={{ 
                              py: 1.5,
                              px: 3,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: 'rgba(59, 130, 246, 0.05)',
                              },
                              borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                              position: 'relative',
                              '&::before': member.id === league?.captain?.id ? {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '3px',
                                background: 'linear-gradient(to bottom, #8B5CF6, #3B82F6)',
                                borderRadius: '0 2px 2px 0',
                              } : {},
                            }}
                        secondaryAction={
                          isCaptain && member.id !== user.id && (
                                <Tooltip title="Remove member">
                            <IconButton
                              edge="end"
                              onClick={() => handleRemoveMember(member.id)}
                                    sx={{ 
                                      color: '#EF4444',
                                      '&:hover': {
                                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                                      }
                                    }}
                            >
                              <DeleteIcon />
                            </IconButton>
                                </Tooltip>
                          )
                        }
                      >
                        <ListItemAvatar>
                          <Avatar 
                            src={getMemberImageSource(member)}
                                sx={{ 
                                  bgcolor: member.id === league?.captain?.id ? '#8B5CF6' : '#3B82F6',
                                  width: 42,
                                  height: 42,
                                  border: '2px solid',
                                  borderColor: member.id === league?.captain?.id ? 'rgba(139, 92, 246, 0.5)' : 'rgba(59, 130, 246, 0.5)',
                                  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)',
                                }}
                          >
                            {member.username[0].toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography sx={{ 
                                    color: '#f8fafc',
                                    fontWeight: 'medium'
                                  }}>
                                {member.username}
                                    {member.id === user.id && ' (You)'}
                              </Typography>
                              {member.id === league?.captain?.id && (
                                <Chip
                                  label="Captain"
                                  size="small"
                                      icon={<StarIcon sx={{ fontSize: '0.8rem !important' }} />}
                                  sx={{
                                        bgcolor: 'rgba(139, 92, 246, 0.15)',
                                    color: '#8B5CF6',
                                    fontSize: '0.7rem',
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                                <Typography variant="body2" sx={{ 
                                  color: '#10B981',
                                  fontWeight: 'medium',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  mt: 0.5
                                }}>
                                  <AttachMoneyIcon sx={{ fontSize: '1rem' }} />
                                  {member.points || 0} points
                            </Typography>
                          }
                        />
                      </ListItem>
                        </Grow>
                    ))}
                  </List>
                </CardContent>
              </Card>
              </Fade>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Leaderboard Section with enhanced styling */}
              <Fade in={true} timeout={800}>
              <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
                  borderRadius: '12px', 
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  height: '100%',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(to right, #10B981, #059669)',
                  }
              }}>
                <CardContent>
                    {/* Leaderboard header with decoration */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      mb: 3,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -10,
                        left: 0,
                        width: '60px',
                        height: '3px',
                        background: 'linear-gradient(90deg, #10B981, #059669)',
                        borderRadius: '2px'
                      }
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: '#f8fafc', 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        '& > svg': {
                          color: '#10B981'
                        }
                      }}>
                        <EmojiEventsIcon /> Leaderboard
                  </Typography>
                    </Box>

                    {/* Top 3 winners display with medals */}
                    {members.length > 0 && (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: { xs: 2, sm: 4 },
                        mb: 4,
                        pt: 1,
                        pb: 3,
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '20%',
                          right: '20%',
                          height: '1px',
                          background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)',
                        }
                      }}>
                        {/* Sort members by points and take top 3 */}
                        {[...members]
                          .sort((a, b) => (b.points || 0) - (a.points || 0))
                          .slice(0, 3)
                          .map((member, index) => {
                            const medalColors = [
                              { bg: '#F59E0B', border: '#D97706', number: 1 }, // Gold
                              { bg: '#94A3B8', border: '#64748B', number: 2 }, // Silver
                              { bg: '#B45309', border: '#92400E', number: 3 }  // Bronze
                            ];
                            
                            const medal = medalColors[index];
                            
                            return (
                              <Grow in={true} timeout={800 + (index * 150)} key={member.id}>
                                <Box sx={{ 
                                  display: 'flex', 
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  // Make 1st place highest, 2nd place lower, 3rd place lowest
                                  mt: index === 0 ? 0 : index === 1 ? 2 : 4,
                                  position: 'relative',
                                  zIndex: 3 - index
                                }}>
                                  <Box sx={{
                                    position: 'relative',
                                    mb: 1
                                  }}>
                                    <Avatar 
                                      src={getMemberImageSource(member)}
                                      sx={{ 
                                        width: index === 0 ? 60 : 50,
                                        height: index === 0 ? 60 : 50,
                                        border: '3px solid',
                                        borderColor: medal.border,
                                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                                        bgcolor: member.id === league?.captain?.id ? '#8B5CF6' : '#3B82F6',
                                      }}
                                    >
                                      {member.username[0].toUpperCase()}
                                    </Avatar>
                                    <Box sx={{ 
                                      position: 'absolute',
                                      bottom: -6,
                                      right: -6,
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      bgcolor: medal.bg,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: '2px solid',
                                      borderColor: medal.border,
                                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                                      zIndex: 1
                                    }}>
                                      <Typography sx={{ 
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        color: '#fff'
                                      }}>
                                        {medal.number}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Typography sx={{ 
                                    color: '#f8fafc', 
                                    fontWeight: 'medium',
                                    fontSize: '0.9rem',
                                    textAlign: 'center',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100px',
                                  }}>
                                    {member.username}
                                  </Typography>
                                  <Typography sx={{ 
                                    color: '#10B981',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                  }}>
                                    {member.points || 0} pts
                                  </Typography>
                                </Box>
                              </Grow>
                            );
                          })
                        }
                      </Box>
                    )}

                    {/* Full Leaderboard List */}
                    <Box sx={{ 
                      maxHeight: 300, 
                      overflow: 'auto',
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(15, 23, 42, 0.5)',
                        borderRadius: '10px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(16, 185, 129, 0.3)',
                        borderRadius: '10px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: 'rgba(16, 185, 129, 0.5)',
                      },
                    }}>
                  {[...members]
                    .sort((a, b) => (b.points || 0) - (a.points || 0))
                    .map((member, index) => (
                          <Grow in={true} timeout={600 + (index * 50)} key={member.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                                mb: 1.5,
                          p: 1.5,
                          borderRadius: '8px',
                                bgcolor: member.id === user.id ? 'rgba(139, 92, 246, 0.1)' : 'rgba(15, 23, 42, 0.5)',
                                border: member.id === user.id ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid rgba(30, 41, 59, 0.8)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                },
                        }}
                      >
                        <Typography
                          sx={{
                                  width: 28,
                                  height: 28,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            color: index < 3 ? '#f8fafc' : '#64748B',
                                  bgcolor: index === 0 ? '#F59E0B' : index === 1 ? '#94A3B8' : index === 2 ? '#B45309' : 'rgba(15, 23, 42, 0.8)',
                                  border: index < 3 ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                                  boxShadow: index < 3 ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                          }}
                        >
                          {index + 1}
                        </Typography>
                        
                        <Avatar
                          src={getMemberImageSource(member)}
                          sx={{
                            width: 32,
                            height: 32,
                            mr: 2,
                            bgcolor: member.id === league?.captain?.id ? '#8B5CF6' : '#3B82F6',
                                  border: '2px solid',
                                  borderColor: member.id === league?.captain?.id ? 'rgba(139, 92, 246, 0.5)' : 'rgba(59, 130, 246, 0.5)',
                          }}
                        >
                          {member.username[0].toUpperCase()}
                        </Avatar>
                        
                              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ color: '#f8fafc', fontWeight: 'medium' }}>
                            {member.username}
                                  {member.id === user.id && (
                                    <Typography component="span" sx={{ 
                                      color: '#8B5CF6',
                                      ml: 0.5,
                                      fontSize: '0.85rem',
                                      fontStyle: 'italic',
                                    }}>
                                      (You)
                          </Typography>
                                  )}
                          </Typography>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                                  color: '#10B981',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: '20px',
                                  fontWeight: 'bold',
                                  fontSize: '0.85rem',
                                }}>
                                  {member.points || 0} pts
                        </Box>
                      </Box>
                            </Box>
                          </Grow>
                    ))}
                    </Box>
                </CardContent>
              </Card>
              </Fade>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Chat Tab */}
        <TabPanel value={tabValue} index={2}>
          <Fade in={true} timeout={800}>
          <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
              borderRadius: '12px', 
              border: '1px solid rgba(139, 92, 246, 0.2)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              height: '70vh',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: 'linear-gradient(to right, #8B5CF6, #6D28D9)',
              },
              '& *::-webkit-scrollbar': {
                width: '8px',
                background: 'transparent',
              },
              '& *::-webkit-scrollbar-thumb': {
                background: 'rgba(148, 163, 184, 0.3)',
                borderRadius: '4px',
                '&:hover': {
                  background: 'rgba(148, 163, 184, 0.5)',
                }
              },
              '& *::-webkit-scrollbar-track': {
                background: 'rgba(15, 23, 42, 0.3)',
                borderRadius: '4px',
              }
            }}>
              <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Chat leagueId={id} />
            </CardContent>
          </Card>
          </Fade>
        </TabPanel>

        {/* History Tab (Only for captains) */}
        <TabPanel value={tabValue} index={3}>
          {isCaptain ? (
            <Fade in={true} timeout={800}>
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
                      borderRadius: '12px', 
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: 'linear-gradient(to right, #8B5CF6, #6D28D9)',
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <HistoryIcon sx={{ color: '#8B5CF6', mr: 1.5 }} />
                          <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                            Completed Events
                          </Typography>
                        </Box>
                        
                        {/* Completed Events List */}
                        {leagueEvents && leagueEvents.filter(event => event.completed).length > 0 ? (
                          <TableContainer component={Paper} sx={{ 
                            bgcolor: 'transparent',
                            backgroundImage: 'none',
                            boxShadow: 'none'
                          }}>
                            <Table sx={{ 
                              '& .MuiTableCell-root': {
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                color: '#CBD5E1',
                              },
                              '& .MuiTableCell-head': {
                                bgcolor: 'rgba(15, 23, 42, 0.5)',
                                color: '#94A3B8',
                                fontWeight: 'bold',
                              },
                              '& .MuiTableRow-root:hover': {
                                bgcolor: 'rgba(59, 130, 246, 0.05)',
                              }
                            }}>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Event</TableCell>
                                  <TableCell>Date</TableCell>
                                  <TableCell>Sport</TableCell>
                                  <TableCell>Match</TableCell>
                                  <TableCell>Winner</TableCell>
                                  <TableCell>Participants</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {leagueEvents
                                  .filter(event => event.completed)
                                  .map((event) => (
                                    <TableRow key={event.id}>
                                      <TableCell sx={{ color: '#f8fafc', fontWeight: 'medium' }}>
                                        {event.event_name}
                                      </TableCell>
                                      <TableCell>
                                        {event.completed_at ? 
                                          new Date(event.completed_at).toLocaleDateString() : 
                                          new Date(event.created_at).toLocaleDateString()}
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          size="small"
                                          label={event.sport || 'Not specified'}
                                          sx={{ 
                                            bgcolor: 'rgba(59, 130, 246, 0.1)',
                                            color: '#60A5FA',
                                            fontWeight: 'medium',
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        {event.home_team} vs {event.away_team}
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          size="small"
                                          label={event.winner || 'Unknown'}
                                          sx={{ 
                                            bgcolor: 'rgba(16, 185, 129, 0.1)',
                                            color: '#10B981',
                                            fontWeight: 'medium',
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>{event.participants_count || '-'}</TableCell>
                                    </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Box sx={{ 
                            textAlign: 'center', 
                            py: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                          }}>
                            <Avatar sx={{ 
                              bgcolor: 'rgba(139, 92, 246, 0.1)', 
                              color: '#8B5CF6',
                              width: 56,
                              height: 56,
                              mb: 2
                            }}>
                              <HistoryIcon sx={{ fontSize: '2rem' }} />
                            </Avatar>
                            <Typography sx={{ color: '#94A3B8' }}>
                              No completed events yet.
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Member History section removed */}
                </Grid>
              </Box>
            </Fade>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Avatar sx={{ 
                bgcolor: 'rgba(239, 68, 68, 0.1)', 
                color: '#EF4444',
                width: 64,
                height: 64,
                mb: 2
              }}>
                <PersonIcon sx={{ fontSize: '2.5rem' }} />
              </Avatar>
              <Typography variant="h6" sx={{ color: '#f8fafc', mb: 1 }}>
                Access Restricted
              </Typography>
              <Typography sx={{ color: '#94A3B8', maxWidth: '450px' }}>
                The History tab is only accessible to league captains.
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Container>

      {/* Enhanced Invite Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(226, 232, 240, 0.1)',
            borderRadius: '12px',
            minWidth: '400px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(to right, #3B82F6, #1D4ED8)',
            }
          }
        }}
        TransitionComponent={Fade}
        transitionDuration={400}
      >
        <DialogTitle sx={{ 
          color: '#f8fafc', 
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          py: 2.5,
          px: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PeopleAltIcon sx={{ color: '#3B82F6' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Invite Friends to League
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1 }} />,
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#CBD5E1',
                bgcolor: 'rgba(30, 41, 59, 0.8)',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'rgba(148, 163, 184, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(148, 163, 184, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3B82F6',
                },
              },
            }}
          />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={28} sx={{ color: '#3B82F6' }} />
            </Box>
          ) : (
            <>
              {friends.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  color: '#94A3B8', 
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(59, 130, 246, 0.1)', 
                    color: '#3B82F6',
                    width: 56,
                    height: 56 
                  }}>
                    <PeopleAltIcon sx={{ fontSize: '2rem' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>You don't have any friends yet.</Typography>
                    <Typography variant="body2">Add friends to invite them to your league.</Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      mt: 1, 
                      bgcolor: '#3B82F6',
                      color: 'white',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 'medium',
                      px: 2,
                      py: 1,
                      '&:hover': {
                        bgcolor: '#2563EB',
                      }
                    }}
                    onClick={() => {
                      setInviteDialogOpen(false);
                      // Navigate to add friends page
                      window.location.href = '/add-friend';
                    }}
                  >
                    Add Friends
                  </Button>
                </Box>
              ) : filteredFriends.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  color: '#94A3B8', 
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <SearchIcon sx={{ fontSize: '2rem', color: '#64748B' }} />
                  <Typography variant="body1">No friends match your search.</Typography>
                </Box>
              ) : (
                <List sx={{ 
                  maxHeight: 300, 
                  overflow: 'auto',
                  p: 0,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(59, 130, 246, 0.3)',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: 'rgba(59, 130, 246, 0.5)',
                  },
                }}>
                  {filteredFriends.map((friend, index) => (
                    <Grow in={true} timeout={400 + (index * 50)} key={friend.id}>
                      <ListItem 
                        sx={{ 
                          px: 1.5, 
                          py: 0.5,
                          borderRadius: '8px',
                          my: 0.5,
                          '&:hover': {
                            bgcolor: 'rgba(59, 130, 246, 0.05)',
                          }
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedFriends.includes(friend.id)}
                              onChange={() => {
                                setSelectedFriends(prev => {
                                  if (prev.includes(friend.id)) {
                                    return prev.filter(id => id !== friend.id);
                                  } else {
                                    return [...prev, friend.id];
                                  }
                                });
                              }}
                              sx={{
                                color: '#3B82F6',
                                '&.Mui-checked': {
                                  color: '#3B82F6',
                                },
                                '& .MuiSvgIcon-root': {
                                  fontSize: 20,
                                }
                              }}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={friend.profile_image_url ? getImageUrl(friend.profile_image_url) : `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.username)}&background=random`}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  mr: 1.5,
                                  bgcolor: '#3B82F6',
                                  border: '2px solid rgba(59, 130, 246, 0.3)',
                                }}
                              >
                                {friend.username[0].toUpperCase()}
                              </Avatar>
                              <Typography sx={{ color: '#f8fafc' }}>
                                {friend.username}
                              </Typography>
                            </Box>
                          }
                          sx={{ 
                            mx: 0,
                            width: '100%',
                            '& .MuiFormControlLabel-label': {
                              width: '100%'
                            }
                          }}
                        />
                      </ListItem>
                    </Grow>
                  ))}
                </List>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 2.5, 
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <Typography sx={{ 
            color: '#94A3B8',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            <PeopleAltIcon sx={{ fontSize: '1rem' }} />
            {selectedFriends.length} friend(s) selected
          </Typography>
          <Box>
            <Button 
              onClick={() => setInviteDialogOpen(false)}
              sx={{
                color: '#94A3B8',
                mr: 1.5,
                textTransform: 'none',
                fontWeight: 'medium'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleInvite(selectedFriends)}
              disabled={selectedFriends.length === 0}
              variant="contained"
              sx={{
                bgcolor: '#3B82F6',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'medium',
                px: 2,
                py: 1,
                '&:hover': {
                  bgcolor: '#2563EB',
                },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(59, 130, 246, 0.3)',
                  color: 'rgba(255, 255, 255, 0.5)',
                }
              }}
            >
              Send Invites
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Enhanced Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(226, 232, 240, 0.1)',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: confirmDialog.action === 'remove' ? 
                'linear-gradient(to right, #EF4444, #DC2626)' : 
                'linear-gradient(to right, #3B82F6, #1D4ED8)',
            }
          }
        }}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={400}
      >
        <DialogTitle sx={{ 
          color: '#f8fafc',
          fontWeight: 'bold',
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          '& > svg': {
            color: confirmDialog.action === 'remove' ? '#EF4444' : '#3B82F6',
            fontSize: '1.5rem'
          }
        }}>
          {confirmDialog.action === 'remove' ? <DeleteIcon /> : <EmojiEventsIcon />}
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#CBD5E1' }}>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            sx={{
              color: '#94A3B8',
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={confirmDialog.action === 'remove' ? 'error' : 'primary'}
            sx={{ 
              textTransform: 'none',
              fontWeight: 'medium',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              px: 2,
              py: 1
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            minWidth: '300px',
            alignItems: 'center',
            ...(snackbar.severity === 'success' && {
              bgcolor: alpha('#10B981', 0.9),
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#ffffff'
              }
            }),
            ...(snackbar.severity === 'error' && {
              bgcolor: alpha('#EF4444', 0.9),
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#ffffff'
              }
            }),
            ...(snackbar.severity === 'warning' && {
              bgcolor: alpha('#F59E0B', 0.9),
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#ffffff'
              }
            }),
            ...(snackbar.severity === 'info' && {
              bgcolor: alpha('#3B82F6', 0.9),
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#ffffff'
              }
            }),
            backdropFilter: 'blur(10px)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Image Cropper */}
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