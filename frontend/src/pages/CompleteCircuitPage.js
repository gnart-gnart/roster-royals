import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Step,
  StepLabel,
  Stepper,
  ListItem,
  List,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GavelIcon from '@mui/icons-material/Gavel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { 
  getCircuitDetail, 
  getEventDetails, 
  completeCircuitWithTiebreaker,
  completeCircuitEvent 
} from '../services/api';
import NavBar from '../components/NavBar';

function CompleteCircuitPage() {
  const { leagueId, circuitId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [circuit, setCircuit] = useState(null);
  const [tiebreakerEvent, setTiebreakerEvent] = useState(null);
  const [tiebreakerValue, setTiebreakerValue] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // UI state
  const [tiedParticipants, setTiedParticipants] = useState([]);
  const [hasTie, setHasTie] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // New state for step-by-step completion
  const [activeStep, setActiveStep] = useState(0);
  const [incompleteEvents, setIncompleteEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [possibleOutcomes, setPossibleOutcomes] = useState([]);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [activeEventIndex, setActiveEventIndex] = useState(0);

  // Check if user is the captain
  const [isCaptain, setIsCaptain] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Function to get user profile image URL
  const getProfileImageUrl = (user) => {
    // If this is the current user, check for embedded image data
    if (user?.id === currentUser?.id) {
      // Try embedded image from user object first
      if (currentUser.embeddedImageData) {
        return currentUser.embeddedImageData;
      }
      
      // Then try session storage with user-specific key
      const userSpecificKey = `profileImageDataUrl_${user.id}`;
      const profileImageDataUrl = sessionStorage.getItem(userSpecificKey);
      if (profileImageDataUrl) {
        return profileImageDataUrl;
      }
    }
    
    // Check for profile_image_url property
    if (user?.profile_image_url) {
      // Handle relative URLs
      if (user.profile_image_url.startsWith('/')) {
        return `${window.location.origin}${user.profile_image_url}`;
      }
      return user.profile_image_url;
    }
    
    // Return avatar API URL as fallback
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=random`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch circuit details
        const circuitData = await getCircuitDetail(circuitId);
        setCircuit(circuitData);
        
        // Check if current user is the captain
        if (circuitData.captain.id === currentUser.id) {
          setIsCaptain(true);
        } else {
          setError('Only league captains can complete circuits');
        }
        
        // Check if circuit has a tiebreaker event
        if (circuitData.tiebreaker_event) {
          // Fetch tiebreaker event details
          const eventData = await getEventDetails(circuitData.tiebreaker_event.id);
          setTiebreakerEvent(eventData);
        }
        
        // Process completion status
        const status = circuitData.completion_status || {};
        setCompletionProgress(status.progress_percentage || 0);
        
        // Set the active step based on completion status
        if (status.all_events_completed) {
          if (status.tiebreaker_needed) {
            setActiveStep(2); // Tiebreaker step
          } else {
            setActiveStep(3); // Final completion step
          }
        } else {
          setActiveStep(1); // Event completion step
        }
        
        // Check for ties in the leaderboard
        if (circuitData.participants && circuitData.participants.length > 0) {
          const sortedParticipants = [...circuitData.participants].sort((a, b) => b.score - a.score);
          const topScore = sortedParticipants[0].score;
          const tied = sortedParticipants.filter(p => p.score === topScore);
          
          if (tied.length > 1) {
            setHasTie(true);
            setTiedParticipants(tied);
          }
        }
        
        // Find incomplete events
        const componentEvents = circuitData.component_events || [];
        
        // Modified filtering logic to properly identify all events that need completion
        const incomplete = componentEvents.filter(ce => {
          const event = ce.league_event;
          
          // Check if event is not completed
          if (event.completed) return false;
          
          // Check if it's a custom event that needs input
          const isCustomEvent = event.market_data?.custom === true;
          
          // Check if it requires input via completion_status
          const requiresInput = ce.completion_status?.requires_input;
          
          // Include the event if it's not completed AND (requires input OR is a custom event)
          return !event.completed && (requiresInput || isCustomEvent);
        });
        
        setIncompleteEvents(incomplete);
        
        // Set current event if there are incomplete events
        if (incomplete.length > 0) {
          setCurrentEvent(incomplete[0]);
          
          // Determine possible outcomes for this event
          const outcomes = getPossibleOutcomes(incomplete[0]);
          setPossibleOutcomes(outcomes);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [circuitId, leagueId, currentUser.id]);

  // Helper function to get possible outcomes for an event
  const getPossibleOutcomes = (eventComponent) => {
    if (!eventComponent) return [];
    
    const event = eventComponent.league_event;
    const status = eventComponent.completion_status || {};
    
    // Use possible outcomes from status if available
    if (status.possible_outcomes && status.possible_outcomes.length > 0) {
      return status.possible_outcomes;
    }
    
    // If this is a custom event, handle it differently
    if (event.market_data?.custom === true) {
      const answerType = event.market_data.answerType?.toLowerCase();
      
      // Handle different answer types for custom events
      if (answerType === 'yesno') {
        return ['Yes', 'No'];
      } else if (answerType === 'multiplechoice' && event.market_data.answerOptions?.length > 0) {
        return event.market_data.answerOptions;
      } else if (answerType === 'text' || answerType === 'number') {
        // For free text or number inputs, we don't show a dropdown
        // Return empty array to signal that text input should be used
        return [];
      }
    }
    
    // For standard events with teams
    if (event.home_team && event.away_team) {
      return [event.home_team, event.away_team];
    }
    
    // For events with options in market data
    if (event.market_data && event.market_data.options) {
      return event.market_data.options;
    }
    
    return [];
  };

  const handleTiebreakerValueChange = (e) => {
    setTiebreakerValue(e.target.value);
  };

  const handleOutcomeChange = (e) => {
    setSelectedOutcome(e.target.value);
  };

  // Handle completion of the current event
  const handleCompleteEvent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    if (!currentEvent) {
      setError('No event selected for completion');
      setSubmitting(false);
      return;
    }
    
    const event = currentEvent.league_event;
    const isCustomEvent = event.market_data?.custom === true;
    const answerType = event.market_data?.answerType?.toLowerCase();
    
    // Determine if this event uses text input
    const useTextInput = event.betting_type === 'tiebreaker_closest' || 
                         event.betting_type === 'tiebreaker_unique' || 
                         (isCustomEvent && (answerType === 'text' || answerType === 'number'));
    
    // Validate input based on event type
    if (!useTextInput && !selectedOutcome) {
      setError('Please select a winning outcome');
      setSubmitting(false);
      return;
    }
    
    if (useTextInput && !tiebreakerValue) {
      setError(`Please enter a${answerType === 'number' ? ' numeric' : ''} value for the ${isCustomEvent ? 'custom event' : 'tiebreaker'}`);
      setSubmitting(false);
      return;
    }
    
    try {
      let numericValue = null;
      let outcome = selectedOutcome;
      
      // For text input events (tiebreakers and custom text/number events)
      if (useTextInput) {
        // Try to parse as numeric if it's a number type
        if (answerType === 'number' || event.betting_type.startsWith('tiebreaker')) {
          numericValue = parseFloat(tiebreakerValue);
          if (isNaN(numericValue)) {
            throw new Error('Please enter a valid number');
          }
        }
        
        // Use tiebreakerValue as the outcome for text-based inputs
        outcome = tiebreakerValue.toString();
      }
      
      console.log(`Completing event ${event.id} with outcome ${outcome}${numericValue !== null ? `, numeric value: ${numericValue}` : ''}`);
      
      // Call API to complete the event
      const response = await completeCircuitEvent(
        circuitId,
        event.id,
        outcome,
        numericValue
      );
      
      // Update circuit data with the response
      setCircuit(response);
      
      // Process completion status
      const status = response.completion_status || {};
      setCompletionProgress(status.progress_percentage || 0);
      
      // Check for ties after updating
      const hasTieAfterUpdate = status.has_tie || false;
      setHasTie(hasTieAfterUpdate);
      
      // Move to next incomplete event or final step
      const remaining = incompleteEvents.slice(activeEventIndex + 1);
      if (remaining.length > 0) {
        // Move to next event
        setActiveEventIndex(activeEventIndex + 1);
        setCurrentEvent(remaining[0]);
        setPossibleOutcomes(getPossibleOutcomes(remaining[0]));
        setSelectedOutcome('');
        setTiebreakerValue('');
        setSuccess(`Event "${event.event_name}" completed successfully. Moving to next event.`);
      } else {
        // All events completed
        if (hasTieAfterUpdate && response.tiebreaker_event) {
          // Need tiebreaker
          setActiveStep(2);
          setSuccess('All events completed. Tiebreaker required.');
        } else {
          // Ready for final completion
          setActiveStep(3);
          setSuccess('All events completed successfully. Ready for final completion.');
        }
      }
    } catch (err) {
      console.error('Error completing event:', err);
      setError(err.message || 'Failed to complete the event');
    }
    
    setSubmitting(false);
  };

  const handleFinalCircuitCompletion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    // For tiebreaker step
    if (activeStep === 2) {
      // Validate input
      if (!tiebreakerValue.trim()) {
        setError('Please enter a tiebreaker value');
        setSubmitting(false);
        return;
      }
      
      if (!tiebreakerEvent || !tiebreakerEvent.id) {
        setError('Cannot complete circuit without a valid tiebreaker event');
        setSubmitting(false);
        return;
      }
    }

    try {
      let response;
      
      // Different API calls based on whether tiebreaker is needed
      if (activeStep === 2) {
        // Complete with tiebreaker
        response = await completeCircuitWithTiebreaker(
          circuitId, 
          tiebreakerEvent.id, 
          tiebreakerValue
        );
      } else {
        // Simple completion - use the final tiebreaker
        response = await completeCircuitWithTiebreaker(
          circuitId, 
          circuit.tiebreaker_event?.id || 0, 
          "0" // Default value when no tiebreaker is needed
        );
      }
      
      console.log('Circuit completion response:', response);
      
      // Show success message with winners information
      if (response.winners && response.winners.length > 1) {
        setSuccess(`Circuit has been completed! Winners: ${response.winners.map(w => w.username).join(', ')}. Each winner receives $${response.prize_per_winner}.`);
      } else if (response.winners && response.winners.length === 1) {
        setSuccess(`Circuit has been completed! Winner: ${response.winners[0].username}. Prize: $${response.total_prize}.`);
      } else {
        setSuccess('Circuit has been completed successfully!');
      }
      
      // Update circuit
      setCircuit({
        ...circuit,
        status: 'completed'
      });
      
      // Redirect to circuit page after a short delay
      setTimeout(() => {
        navigate(`/league/${leagueId}/circuit/${circuitId}`);
      }, 3000);
    } catch (err) {
      console.error('Error completing circuit:', err);
      setError(err.message || 'Failed to complete the circuit');
    }
    
    setSubmitting(false);
  };

  const renderParticipantsTable = () => {
    if (!circuit || !circuit.participants) return null;
    
    const sortedParticipants = [...circuit.participants].sort((a, b) => b.score - a.score);
    
    return (
      <TableContainer component={Paper} sx={{ mb: 4, bgcolor: 'rgba(30, 41, 59, 0.7)' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>User</TableCell>
              <TableCell align="right">Score</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedParticipants.map((participant, index) => {
              const isTopScore = index === 0 || participant.score === sortedParticipants[0].score;
              
              return (
                <TableRow 
                  key={participant.user.id} 
                  sx={{ 
                    bgcolor: isTopScore && hasTie ? 'rgba(139, 92, 246, 0.1)' : undefined
                  }}
                >
                  <TableCell sx={{ fontWeight: 'bold' }}>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={getProfileImageUrl(participant.user)} 
                        sx={{ width: 28, height: 28, mr: 1, fontSize: '0.8rem', bgcolor: '#8B5CF6' }}
                      >
                        {participant.user.username ? participant.user.username[0].toUpperCase() : '?'}
                      </Avatar>
                      {participant.user.username}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                    {participant.score}
                  </TableCell>
                  <TableCell align="center">
                    {isTopScore && hasTie ? (
                      <Chip 
                        size="small" 
                        color="secondary" 
                        label="Tied for 1st" 
                        icon={<GavelIcon />} 
                      />
                    ) : (
                      isTopScore ? (
                        <Chip 
                          size="small" 
                          color="success" 
                          label="Leader" 
                          icon={<EmojiEventsIcon />} 
                        />
                      ) : null
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderEventCompletionStep = () => {
    if (!currentEvent) {
      return (
        <Alert severity="info" sx={{ mt: 3 }}>
          No events need to be completed.
        </Alert>
      );
    }
    
    const event = currentEvent.league_event;
    const isTiebreaker = event.betting_type === 'tiebreaker_closest' || event.betting_type === 'tiebreaker_unique';
    const isCustomEvent = event.market_data?.custom === true;
    const answerType = event.market_data?.answerType?.toLowerCase();
    
    // Determine if this event should use text input instead of a dropdown
    const useTextInput = isTiebreaker || 
                         (isCustomEvent && (answerType === 'text' || answerType === 'number'));
    
    return (
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'rgba(30, 41, 59, 0.7)' }}>
        <Typography variant="h6" gutterBottom>
          Event {activeEventIndex + 1} of {incompleteEvents.length}: {event.event_name}
        </Typography>
        
        <Box sx={{ my: 2 }}>
          <Chip 
            icon={<SportsSoccerIcon />}
            label={`Sport: ${event.sport}`} 
            variant="outlined" 
            sx={{ mr: 1, mb: 1 }}
          />
          <Chip 
            icon={<GavelIcon />}
            label={`Weight: ${currentEvent.weight}x`} 
            variant="outlined" 
            sx={{ mr: 1, mb: 1 }}
          />
          {isTiebreaker && (
            <Chip 
              icon={<GavelIcon />}
              label="Tiebreaker Event" 
              color="secondary"
              sx={{ mb: 1, mr: 1 }}
            />
          )}
          {isCustomEvent && (
            <Chip
              label={`Custom Event (${answerType || 'custom'})`}
              color="primary"
              sx={{ mb: 1 }}
            />
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <form onSubmit={handleCompleteEvent}>
          {useTextInput ? (
            <TextField
              label={answerType === 'number' ? "Correct Answer (Numeric)" : "Correct Answer"}
              value={tiebreakerValue}
              onChange={(e) => setTiebreakerValue(e.target.value)}
              type={answerType === 'number' ? "number" : "text"}
              fullWidth
              margin="normal"
              required
              helperText={`Enter the correct ${answerType === 'number' ? 'numeric' : ''} answer for this ${isCustomEvent ? 'custom' : 'tiebreaker'} event`}
              InputProps={{
                inputProps: answerType === 'number' ? { step: 'any' } : {}
              }}
            />
          ) : (
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Winning Outcome</InputLabel>
              <Select
                value={selectedOutcome}
                onChange={handleOutcomeChange}
                label="Winning Outcome"
              >
                {possibleOutcomes.map((outcome, index) => (
                  <MenuItem key={index} value={outcome}>{outcome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting || (useTextInput ? !tiebreakerValue : !selectedOutcome)}
              startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            >
              {submitting ? 'Processing...' : 'Complete Event'}
            </Button>
          </Box>
        </form>
      </Paper>
    );
  };

  const renderTiebreakerStep = () => {
    if (!tiebreakerEvent) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          No tiebreaker event is configured for this circuit.
        </Alert>
      );
    }
    
    return (
      <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <GavelIcon sx={{ mr: 1 }} /> Tiebreaker Required
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            {hasTie ? `${tiedParticipants.length} participants are tied for first place with ${tiedParticipants[0]?.score || 0} points.` : 'Participants are tied for first place.'} 
            Please enter the correct answer for the tiebreaker event to determine the winner.
          </Alert>
          
          <Typography variant="subtitle1" gutterBottom>
            Tiebreaker Event: {tiebreakerEvent.event_name}
          </Typography>
          
          {tiebreakerEvent.market_data?.custom ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Type: {tiebreakerEvent.market_data.answerType || 'Custom Event'}
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This is a market event. Please enter "home" for {tiebreakerEvent.home_team}, 
              "away" for {tiebreakerEvent.away_team}, or another valid outcome.
            </Alert>
          )}
          
          <form onSubmit={handleFinalCircuitCompletion}>
            <TextField
              label="Correct Answer"
              value={tiebreakerValue}
              onChange={handleTiebreakerValueChange}
              fullWidth
              margin="normal"
              required
              helperText={
                tiebreakerEvent.market_data?.answerType === 'number' 
                  ? 'Enter the correct numeric answer' 
                  : tiebreakerEvent.market_data?.answerType === 'yesNo'
                    ? 'Enter "Yes" or "No"'
                    : tiebreakerEvent.market_data?.answerType === 'multipleChoice'
                      ? `Enter one of: ${tiebreakerEvent.market_data.answerOptions?.join(', ') || 'the available options'}`
                      : 'Enter the correct outcome'
              }
            />
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting || !tiebreakerValue.trim()}
                startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              >
                {submitting ? 'Processing...' : 'Complete Circuit'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    );
  };

  const renderFinalCompletionStep = () => {
    if (!circuit || !circuit.participants || circuit.participants.length === 0) {
      return (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No participants found in this circuit.
        </Alert>
      );
    }
    
    const sortedParticipants = [...circuit.participants].sort((a, b) => b.score - a.score);
    const winner = sortedParticipants[0];
    
    return (
      <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <EmojiEventsIcon sx={{ mr: 1, color: '#F59E0B' }} /> Complete Circuit
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            All events have been completed and there is a clear winner. You can complete the circuit now to distribute the prize.
          </Alert>
          
          <Typography variant="subtitle1" gutterBottom>
            Winner: {winner?.user.username}
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Score: {winner?.score} points
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Prize Pool: ${parseFloat(circuit.entry_fee) * circuit.participants.length}
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              onClick={handleFinalCircuitCompletion}
            >
              {submitting ? 'Processing...' : 'Complete Circuit'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  if (!isCaptain) {
    return (
      <>
        <NavBar />
        <Container sx={{ mt: 4 }}>
          <Alert severity="error">
            {error || 'Only league captains can complete circuits'}
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/league/${leagueId}/circuit/${circuitId}`)}
              variant="outlined"
            >
              Back to Circuit
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  if (circuit?.status === 'completed') {
    return (
      <>
        <NavBar />
        <Container sx={{ mt: 4 }}>
          <Alert severity="info">
            This circuit has already been completed.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/league/${leagueId}/circuit/${circuitId}`)}
              variant="outlined"
            >
              Back to Circuit
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  // Define the steps for the stepper
  const steps = [
    'Start',
    'Complete Events',
    'Tiebreaker',
    'Finalize Circuit'
  ];

  return (
    <>
      <NavBar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/league/${leagueId}/circuit/${circuitId}`)}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Back to Circuit
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom>
            Complete Circuit
          </Typography>
          
          {circuit && (
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {circuit.name}
            </Typography>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Progress indicator */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Grid container spacing={3}>
          {/* Current step content */}
          <Grid item xs={12}>
            {activeStep === 0 && (
              <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Circuit Completion Process
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    You are about to complete this circuit. This process will:
                  </Alert>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="Set the winning outcome for each event" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="Calculate scores for all participant bets" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="Determine the winner(s) and distribute prizes" />
                    </ListItem>
                  </List>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => setActiveStep(1)}
                    >
                      Begin Completion
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
            
            {activeStep === 1 && renderEventCompletionStep()}
            {activeStep === 2 && renderTiebreakerStep()}
            {activeStep === 3 && renderFinalCompletionStep()}
          </Grid>

          {/* Leaderboard (always shown) */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Current Leaderboard
            </Typography>
            {renderParticipantsTable()}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default CompleteCircuitPage; 