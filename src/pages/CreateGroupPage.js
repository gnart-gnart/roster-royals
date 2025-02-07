import React, { useState } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function CreateGroupPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedBets, setSelectedBets] = useState([]);

  const mockFriends = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mike Johnson' },
    { id: 4, name: 'Sarah Wilson' },
    { id: 5, name: 'David Kim' },
  ];

  const sports = [
    { id: 'nfl', name: 'NFL Football' },
    { id: 'nba', name: 'NBA Basketball' },
    { id: 'mlb', name: 'MLB Baseball' },
  ];

  const steps = ['Group Details', 'Sport Selection', 'Review'];

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

  const handleSelectAllFriends = () => {
    if (selectedFriends.length === mockFriends.length) {
      setSelectedFriends([]);
    } else {
      setSelectedFriends(mockFriends.map(friend => friend.id));
    }
  };

  const handleBetToggle = (betId) => {
    setSelectedBets(prev => {
      if (prev.includes(betId)) {
        return prev.filter(id => id !== betId);
      }
      return [...prev, betId];
    });
  };

  const handleCreateGroup = () => {
    // TODO: Implement group creation with backend
    navigate('/home');
  };

  const sportBets = {
    nfl: [
      { id: 'nfl_1', name: 'Week 1 - Chiefs vs Jets', type: 'Spread', points: 100 },
      { id: 'nfl_2', name: 'Week 1 - Cowboys vs Eagles', type: 'Moneyline', points: 150 },
      { id: 'nfl_3', name: 'Week 1 - Bills vs Dolphins', type: 'Over/Under', points: 100 },
    ],
    nba: [
      { id: 'nba_1', name: 'Lakers vs Warriors', type: 'Spread', points: 100 },
      { id: 'nba_2', name: 'Celtics vs Bucks', type: 'Moneyline', points: 150 },
      { id: 'nba_3', name: 'Heat vs Nuggets', type: 'Over/Under', points: 100 },
    ],
    mlb: [
      { id: 'mlb_1', name: 'Yankees vs Red Sox', type: 'Moneyline', points: 100 },
      { id: 'mlb_2', name: 'Dodgers vs Giants', type: 'Run Line', points: 150 },
      { id: 'mlb_3', name: 'Cubs vs Cardinals', type: 'Over/Under', points: 100 },
    ],
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Select Friends
              </Typography>
              <Button
                size="small"
                onClick={handleSelectAllFriends}
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                  },
                }}
              >
                {selectedFriends.length === mockFriends.length ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>
            <Card sx={{ maxHeight: 300, overflow: 'auto' }}>
              <List>
                {mockFriends.map((friend) => (
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
                    <ListItemText primary={friend.name} />
                  </ListItem>
                ))}
              </List>
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
                onChange={(e) => {
                  setSelectedSport(e.target.value);
                  setSelectedBets([]); // Reset selected bets when sport changes
                }}
                label="Select Sport"
              >
                {sports.map((sport) => (
                  <MenuItem key={sport.id} value={sport.id}>
                    {sport.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedSport && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Optional: Select Initial Bets
                </Typography>
                <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)' }}>
                  <List>
                    {sportBets[selectedSport].map((bet) => (
                      <ListItem
                        key={bet.id}
                        button
                        onClick={() => handleBetToggle(bet.id)}
                      >
                        <ListItemIcon>
                          <Checkbox
                            checked={selectedBets.includes(bet.id)}
                            edge="start"
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={bet.name}
                          secondary={
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {bet.type} • {bet.points} points
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Box>
            )}
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
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="primary">
                Initial Bets
              </Typography>
              {selectedBets.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {selectedBets.map(betId => {
                    const bet = sportBets[selectedSport].find(b => b.id === betId);
                    return (
                      <Chip
                        key={betId}
                        label={`${bet.name} (${bet.type})`}
                        variant="outlined"
                      />
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No initial bets selected
                </Typography>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle1" color="primary">
                Members
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {selectedFriends.map(friendId => (
                  <Chip
                    key={friendId}
                    label={mockFriends.find(f => f.id === friendId)?.name}
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
              disabled={!groupName || !selectedSport || selectedFriends.length === 0}
            >
              Create Group
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && (!groupName || selectedFriends.length === 0)) ||
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