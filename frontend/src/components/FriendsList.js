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
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
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
    <List>
      {friends.map((friend) => (
        <ListItem key={friend.id}>
          <ListItemText 
            primary={friend.username}
            secondary={`Points: ${friend.points}`}
          />
          <ListItemSecondaryAction>
            <IconButton onClick={(e) => handleMenuOpen(e, friend)}>
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
        {ownedGroups.length > 0 && (
          <MenuItem onClick={handleInviteClick}>
            Invite to Group
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
        {ownedGroups.map(group => (
          <MenuItem 
            key={group.id}
            onClick={() => handleInviteToGroup(group.id)}
          >
            {group.name}
          </MenuItem>
        ))}
      </Menu>
    </List>
  );
}

export default FriendsList; 