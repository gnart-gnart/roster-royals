import React, { useState } from 'react';
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
  Typography,
  Box,
} from '@mui/material';
import { MoreVert as MoreVertIcon, GroupAdd as GroupAddIcon, PersonRemove as PersonRemoveIcon } from '@mui/icons-material';
import { inviteToGroup, removeFriend } from '../services/api';

function FriendsList({ friends, groups, onFriendRemoved }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [inviteMenuAnchor, setInviteMenuAnchor] = useState(null);

  // Only show groups where user is president
  const ownedGroups = groups.filter(group => 
    group.president.id === JSON.parse(localStorage.getItem('user')).id
  );

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

  const handleInviteToGroup = async (groupId) => {
    try {
      await inviteToGroup(groupId, selectedFriend.id);
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

  return (
    <List sx={{ p: 0 }}>
      {friends.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 3, 
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          No friends added yet
        </Box>
      ) : (
        friends.map((friend) => (
          <ListItem 
            key={friend.id}
            sx={{ 
              py: 1.5,
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              '&:last-child': { 
                borderBottom: 'none',
              },
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ backgroundColor: '#8b5cf6' }}>
                {friend.username ? friend.username[0].toUpperCase() : 'U'}
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={
                <Typography sx={{ color: '#f8fafc', fontWeight: '500' }}>
                  {friend.username}
                </Typography>
              }
              secondary={
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  {friend.points ? `${friend.points} points` : 'New player'}
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <IconButton 
                onClick={(e) => handleMenuOpen(e, friend)}
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': { color: '#f8fafc' }
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: '#1e293b',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            minWidth: 180,
          }
        }}
      >
        {ownedGroups.length > 0 && (
          <MenuItem 
            onClick={handleInviteClick}
            sx={{ 
              color: '#f8fafc',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' } 
            }}
          >
            <Typography
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <GroupAddIcon fontSize="small" />
              Invite to Group
            </Typography>
          </MenuItem>
        )}
        <MenuItem 
          onClick={handleRemoveFriend} 
          sx={{ 
            color: '#ef4444',
            '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
          }}
        >
          <Typography
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <PersonRemoveIcon fontSize="small" />
            Remove Friend
          </Typography>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={inviteMenuAnchor}
        open={Boolean(inviteMenuAnchor)}
        onClose={handleInviteMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: '#1e293b',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            minWidth: 180,
          }
        }}
      >
        {ownedGroups.map(group => (
          <MenuItem 
            key={group.id}
            onClick={() => handleInviteToGroup(group.id)}
            sx={{ 
              color: '#f8fafc',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' } 
            }}
          >
            {group.name}
          </MenuItem>
        ))}
      </Menu>
    </List>
  );
}

export default FriendsList; 