import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { getGroups, addGroupBet } from '../services/api';

function AddBetDialog({ open, onClose, event, market }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const allGroups = await getGroups();
        // Filter to only include groups where user is president
        const presidentGroups = allGroups.filter(
          group => group.president.id === user.id
        );
        setGroups(presidentGroups);
        if (presidentGroups.length > 0) {
          setSelectedGroup(presidentGroups[0].id);
        }
      } catch (err) {
        setError('Failed to load groups');
        console.error(err);
      }
    };

    if (open) {
      loadGroups();
    }
  }, [open, user.id]);

  const handleAddBet = async () => {
    if (!selectedGroup) {
      setError('Please select a group');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare bet data
      const betData = {
        groupId: selectedGroup,
        eventKey: event.key,
        marketKey: market.key || `basketball.moneyline:period=ot&period=ft`,
        eventName: `${event.home.name} vs ${event.away.name}`,
        marketName: market.name,
        startTime: event.cutoffTime,
        sport: event.sport,
        outcomes: market.selections.map(selection => ({
          key: selection.key,
          name: selection.name,
          odds: selection.price
        }))
      };

      console.log("Sending bet data:", betData);
      
      await addGroupBet(betData);
      onClose(true);
    } catch (err) {
      setError(err.message || 'Failed to add bet to group');
      console.error("Error adding bet:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Add Bet to Group</DialogTitle>
      <DialogContent>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Typography variant="subtitle1" gutterBottom>
          Event: {event?.home?.name} vs {event?.away?.name}
        </Typography>
        
        <Typography variant="subtitle2" gutterBottom>
          Market: {market?.name}
        </Typography>

        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography variant="subtitle2">Outcomes:</Typography>
          {market?.selections.map((selection, index) => (
            <Chip
              key={index}
              label={`${selection.name}: ${selection.price.toFixed(2)}`}
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Select Group</InputLabel>
          <Select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            label="Select Group"
          >
            {groups.map(group => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleAddBet}
          disabled={loading || !selectedGroup}
        >
          {loading ? 'Adding...' : 'Add Bet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddBetDialog; 