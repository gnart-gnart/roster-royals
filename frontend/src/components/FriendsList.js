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

  // Get owned groups for inviting friends
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

  const handleInviteClick = () => {
    setInviteMenuAnchor(anchorEl);
    handleMenuClose();
  };

  const handleInviteMenuClose = () => {
    setInviteMenuAnchor(null);
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
    <Box>
      {friends.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 3, 
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 2,
          color: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          No friends added yet
        </Box>
      ) : (
        <Box sx={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
        }}>
          {friends.map((friend) => (
            <Box 
              key={friend.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                '&:last-child': { 
                  borderBottom: 'none',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  bgcolor: '#8b5cf6',
                  width: 40,
                  height: 40,
                  mr: 2,
                  border: '2px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {friend.username ? friend.username[0].toUpperCase() : 'U'}
                </Avatar>
                <Box>
                  <Typography sx={{ color: '#f8fafc', fontWeight: '500' }}>
                    {friend.username}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>
                    {friend.points ? `${friend.points} points` : 'New player'}
                  </Typography>
                </Box>
              </Box>
              
              <IconButton 
                onClick={(e) => handleMenuOpen(e, friend)}
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': { 
                    color: '#f8fafc',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                  width: 32,
                  height: 32,
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(25, 25, 35, 0.98)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            minWidth: 180,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {ownedGroups.length > 0 && (
          <MenuItem 
            onClick={handleInviteClick}
            sx={{ 
              color: '#f8fafc',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
              py: 1.5,
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
            '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
            py: 1.5,
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
            backgroundColor: 'rgba(25, 25, 35, 0.98)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            minWidth: 180,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {ownedGroups.map(group => (
          <MenuItem 
            key={group.id}
            onClick={() => handleInviteToGroup(group.id)}
            sx={{ 
              color: '#f8fafc',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
              py: 1.5,
            }}
          >
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {group.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default FriendsList; 