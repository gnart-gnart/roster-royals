import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  Button,
  ListItemAvatar,
  Avatar,
  Box,
  Tooltip,
} from '@mui/material';
import { MoreVert as MoreVertIcon, Person as PersonIcon, AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { inviteToLeague, removeFriend } from '../services/api';

function FriendsList({ friends, leagues, onFriendRemoved }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [inviteMenuAnchor, setInviteMenuAnchor] = useState(null);

  // Only show leagues where user is captain
  const ownedLeagues = leagues.filter(league => 
    league.captain.id === JSON.parse(localStorage.getItem('user')).id
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
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    
    // If this is the current user, check for embedded image data
    if (friend.id === currentUser.id) {
      // Try embedded image from user object first
      if (currentUser.embeddedImageData) {
        return currentUser.embeddedImageData;
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

  const handleMenuOpen = (event, friend) => {
    setAnchorEl(event.currentTarget);
    setSelectedFriend(friend);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFriend(null);
  };

  const handleInviteClick = (event) => {
    setInviteMenuAnchor(event.currentTarget);
  };

  const handleInviteMenuClose = () => {
    setInviteMenuAnchor(null);
    handleMenuClose();
  };

  const handleInviteToLeague = async (leagueId) => {
    try {
      await inviteToLeague(leagueId, selectedFriend.id);
      handleInviteMenuClose();
    } catch (err) {
      console.error('Failed to invite friend:', err);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      await removeFriend(selectedFriend.id);
      onFriendRemoved(selectedFriend.id);
      handleMenuClose();
    } catch (err) {
      console.error('Failed to remove friend:', err);
    }
  };

  const handleViewProfile = () => {
    navigate(`/profile/${selectedFriend.id}`);
    handleMenuClose();
  };

  return (
    <List>
      {friends.map((friend) => (
        <ListItem 
          key={friend.id} 
          button 
          onClick={() => navigate(`/profile/${friend.id}`)}
        >
          <ListItemAvatar>
            <Avatar 
              sx={{ bgcolor: '#8B5CF6' }}
              src={getFriendImageSource(friend)}
            >
              {friend.username?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {friend.username}
                <Tooltip title="View Profile">
                  <AccountCircleIcon 
                    fontSize="small" 
                    sx={{ 
                      ml: 1, 
                      color: '#8B5CF6',
                      opacity: 0.8,
                      '&:hover': {
                        opacity: 1
                      }
                    }} 
                  />
                </Tooltip>
              </Box>
            }
            secondary={`Points: ${friend.points}`}
          />
          <ListItemSecondaryAction>
            <IconButton onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the ListItem onClick
              handleMenuOpen(e, friend);
            }}>
              <MoreVertIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewProfile}>
          View Profile
        </MenuItem>
        {ownedLeagues.length > 0 && (
          <MenuItem onClick={handleInviteClick}>
            Invite to League
          </MenuItem>
        )}
        <MenuItem onClick={handleRemoveFriend} sx={{ color: 'error.main' }}>
          Remove Friend
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={inviteMenuAnchor}
        open={Boolean(inviteMenuAnchor)}
        onClose={handleInviteMenuClose}
      >
        {ownedLeagues.map(league => (
          <MenuItem 
            key={league.id}
            onClick={() => handleInviteToLeague(league.id)}
          >
            {league.name}
          </MenuItem>
        ))}
      </Menu>
    </List>
  );
}

export default FriendsList; 