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
import { inviteToLeague, removeFriend } from '../services/api';

function FriendsList({ friends, leagues, onFriendRemoved }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [inviteMenuAnchor, setInviteMenuAnchor] = useState(null);

  // Only show leagues where user is captain
  const ownedLeagues = leagues.filter(league => 
    league.captain.id === JSON.parse(localStorage.getItem('user')).id
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