import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createGroup, getFriends } from '../services/api';

function CreateGroupPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [error, setError] = useState('');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const sports = [
    { id: 'nfl', name: 'NFL Football' },
    { id: 'nba', name: 'NBA Basketball' },
    { id: 'mlb', name: 'MLB Baseball' },
  ];

  const steps = ['Group Details', 'Sport Selection', 'Review'];

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friendsData = await getFriends();
        setFriends(friendsData);
      } catch (err) {
        setError('Failed to load friends');
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, []);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFriendToggle = (friendId) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      }
      return [...prev, friendId];
    });
  };

  const handleCreateGroup = async () => {
    try {
      await createGroup({
        name: groupName,
        sport: selectedSport,
        members: selectedFriends.length > 0 ? selectedFriends : [],
      });
      navigate('/home');
    } catch (err) {
      setError('Failed to create group. Please try again.');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              sx={{ mb: 4 }}
            />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Select Friends
            </Typography>
            <Card sx={{ maxHeight: 300, overflow: 'auto' }}>
              {loading ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>Loading friends...</Box>
              ) : error ? (
                <Box sx={{ p: 2, color: 'error.main' }}>{error}</Box>
              ) : (
                <List>
                  {friends.map((friend) => (
                    <ListItem
                      key={friend.id}
                      button
                      onClick={() => handleFriendToggle(friend.id)}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={selectedFriends.includes(friend.id)}
                          edge="start"
                        />
                      </ListItemIcon>
                      <ListItemText primary={friend.username} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Card>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Select Sport</InputLabel>
              <Select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                label="Select Sport"
              >
                {sports.map((sport) => (
                  <MenuItem key={sport.id} value={sport.id}>
                    {sport.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Group Details
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="primary">
                Group Name
              </Typography>
              <Typography>{groupName}</Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="primary">
                Sport
              </Typography>
              <Typography>
                {sports.find(s => s.id === selectedSport)?.name || 'Not selected'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="primary">
                Members
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {selectedFriends.map(friendId => (
                  <Chip
                    key={friendId}
                    label={friends.find(f => f.id === friendId)?.username}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          onClick={() => navigate('/home')}
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">
          Create New Group
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card sx={{ p: 3 }}>
        {renderStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleCreateGroup}
              disabled={!groupName || !selectedSport}
            >
              Create Group
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && !groupName) ||
                (activeStep === 1 && !selectedSport)
              }
            >
              Next
            </Button>
          )}
        </Box>
      </Card>
    </Container>
  );
}

export default CreateGroupPage;
