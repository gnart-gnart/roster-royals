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

  // New state to track participants with recent score changes
  const [updatedParticipants, setUpdatedParticipants] = useState({});
  const [lastCompletedEvent, setLastCompletedEvent] = useState(null);

  // Add global CSS to head for animations
  React.useEffect(() => {
    // Add keyframes styles to document
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 15px rgba(16, 185, 129, 0.7); }
        100% { transform: scale(1); opacity: 0.8; }
      }
      @keyframes fadeInUp {
        0% { opacity: 0; transform: translateY(10px); }
        50% { opacity: 1; transform: translateY(-5px); }
        100% { opacity: 0; transform: translateY(-15px); }
      }
      @keyframes scoreHighlight {
        0% { background-color: transparent; }
        30% { background-color: rgba(16, 185, 129, 0.2); }
        100% { background-color: transparent; }
      }
      @keyframes shine {
        0% { background-position: -100% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(styleEl);
    
    // Cleanup
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

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
          
          // Log tied participants for debugging
          console.log(`Found ${tied.length} participants tied with top score ${topScore}`);
          tied.forEach(p => console.log(`- ${p.user.username}: ${p.score} points`));
          
          if (tied.length > 1) {
            setHasTie(true);
            setTiedParticipants(tied);
          } else {
            setHasTie(false);
            setTiedParticipants([]);
          }
        }
        
        // Find incomplete events
        const componentEvents = circuitData.component_events || [];
        
        // Modified filtering logic to properly identify all events that need completion
        const incomplete = componentEvents.filter(ce => {
          const event = ce.league_event;
          
          // Check if event is not completed
          if (event.completed) return false;
          
          // Exclude tiebreaker event from the events completion phase - handle it in the tiebreaker phase instead
          if (circuitData.tiebreaker_event && event.id === circuitData.tiebreaker_event.id) return false;
          
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

  // New effect to clear animations after a delay
  useEffect(() => {
    if (Object.keys(updatedParticipants).length > 0) {
      // Clear the participant updates after a timeout
      const timer = setTimeout(() => {
        setUpdatedParticipants({});
      }, 5000); // 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [updatedParticipants]);

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

  // Function to reload circuit data
  const reloadCircuitData = async () => {
    try {
      const circuitData = await getCircuitDetail(circuitId);
      console.log("Reloaded circuit data:", circuitData);
      
      // Update circuit state
      setCircuit(circuitData);
      
      // Check for ties in the leaderboard
      if (circuitData.participants && circuitData.participants.length > 0) {
        const sortedParticipants = [...circuitData.participants].sort((a, b) => b.score - a.score);
        const topScore = sortedParticipants[0].score;
        const tied = sortedParticipants.filter(p => p.score === topScore);
        
        console.log(`Reloaded data: Found ${tied.length} participants tied with top score ${topScore}`);
        tied.forEach(p => console.log(`- ${p.user.username}: ${p.score} points`));
        
        if (tied.length > 1) {
          setHasTie(true);
          setTiedParticipants(tied);
        } else {
          setHasTie(false);
          setTiedParticipants([]);
        }
      }
      
      return circuitData;
    } catch (err) {
      console.error("Error reloading circuit data:", err);
      // Don't set error state to avoid disrupting UI
      return null;
    }
  };

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
      
      // Extract info about the completed event from response
      const completedEventInfo = response.completed_event || {};
      const eventWeight = completedEventInfo.weight || currentEvent.weight;
      
      // Find which participants got points by comparing their scores
      if (circuit && response) {
        // Use participant_updates if provided by the API
        if (response.participant_updates && Object.keys(response.participant_updates).length > 0) {
          console.log('Using participant_updates from API:', response.participant_updates);
          
          // Convert participant_updates to the expected format for animations
          const newScoreUpdates = {};
          Object.entries(response.participant_updates).forEach(([userId, data]) => {
            newScoreUpdates[userId] = {
              points: data.points,
              username: data.username,
              weight: eventWeight
            };
          });
          
          setUpdatedParticipants(newScoreUpdates);
        } else {
          // Fallback to calculating score differences manually
          console.log('No participant_updates in API response, calculating manually');
          const prevScores = {};
          circuit.participants.forEach(p => {
            prevScores[p.user.id] = p.score;
          });
          
          // Find participants who got points
          const newScoreUpdates = {};
          response.participants.forEach(p => {
            const prevScore = prevScores[p.user.id] || 0;
            const scoreChange = p.score - prevScore;
            
            if (scoreChange > 0) {
              newScoreUpdates[p.user.id] = {
                points: scoreChange,
                username: p.user.username,
                weight: eventWeight
              };
            }
          });
          
          setUpdatedParticipants(newScoreUpdates);
        }
        
        // Set last completed event info for display
        setLastCompletedEvent({
          id: event.id,
          name: event.event_name,
          outcome: outcome,
          weight: eventWeight
        });
      }
      
      // Update circuit data with the response
      setCircuit(response);
      
      // Process completion status
      const status = response.completion_status || {};
      setCompletionProgress(status.progress_percentage || 0);
      
      // Check for ties after updating
      const hasTieAfterUpdate = status.has_tie || false;
      setHasTie(hasTieAfterUpdate);
      
      // Reload circuit data to get fresh state
      await reloadCircuitData();
      
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
        // All regular events completed
        
        // Check if circuit has a tiebreaker event that needs to be handled separately
        const hasTiebreakerEvent = circuit && circuit.tiebreaker_event && !circuit.tiebreaker_event.completed;
        
        // Check if there's a tie in scores requiring the tiebreaker
        const hasTiedParticipants = status.has_tie || status.tiebreaker_needed;
        
        if (hasTiebreakerEvent) {
          // Move to tiebreaker step if there's a tie or tiebreaker event needs completion
          setActiveStep(2);
          setSuccess(`All regular events completed! ${hasTiedParticipants ? 'Participants are tied - tiebreaker required.' : 'Please complete the tiebreaker event.'}`);
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
    if (e) e.preventDefault();
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

      console.log(`Completing circuit ${circuitId} with tiebreaker event ${tiebreakerEvent.id}, value: "${tiebreakerValue}"`);
      console.log(`Current tied participants: ${tiedParticipants.length} with score ${tiedParticipants[0]?.score || 0}`);
      
      try {
        // First reload circuit data to ensure we have latest state
        await reloadCircuitData();
        
        // Complete with tiebreaker
        const response = await completeCircuitWithTiebreaker(
          circuitId, 
          tiebreakerEvent.id, 
          tiebreakerValue
        );
        
        console.log("Tiebreaker completion response:", response);
        console.log("Winner(s):", response.winners);
        console.log("Total prize:", response.total_prize);
        console.log("Prize per winner:", response.prize_per_winner);
        
        // Reload circuit data again to ensure we have the latest state after completion
        await reloadCircuitData();
        
        // Update circuit with the response data
        setCircuit(response);
        setSuccess(`Circuit completed successfully! ${response.message || ''}`);
        
        // Navigate back to circuit page after 2 seconds
        setTimeout(() => {
          navigate(`/league/${leagueId}/circuit/${circuitId}`);
        }, 2000);
      } catch (err) {
        console.error("Error completing circuit with tiebreaker:", err);
        setError(err.message || 'Failed to complete the circuit');
      } finally {
        setSubmitting(false);
      }
    } else {
      // Simple completion - use the final tiebreaker
      try {
        // First reload circuit data to ensure we have latest state
        await reloadCircuitData();
        
        // Complete the circuit directly if there's no tie or tiebreaker needed
        const response = await completeCircuit(circuitId);
        
        console.log("Standard completion response:", response);
        
        // Reload circuit data again to ensure we have the latest state after completion
        await reloadCircuitData();
        
        setSuccess(`Circuit completed successfully! ${response.message || ''}`);
        
        // Navigate back to circuit page after 2 seconds
        setTimeout(() => {
          navigate(`/league/${leagueId}/circuit/${circuitId}`);
        }, 2000);
      } catch (err) {
        console.error("Error completing circuit:", err);
        setError(err.message || 'Failed to complete the circuit');
      } finally {
        setSubmitting(false);
      }
    }
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
              const hasUpdate = updatedParticipants[participant.user.id];
              
              return (
                <TableRow 
                  key={participant.user.id} 
                  sx={{ 
                    bgcolor: isTopScore && hasTie ? 'rgba(139, 92, 246, 0.1)' : undefined,
                    animation: hasUpdate ? 'scoreHighlight 2s ease' : 'none',
                    transition: 'background-color 0.5s ease'
                  }}
                >
                  <TableCell sx={{ fontWeight: 'bold' }}>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={getProfileImageUrl(participant.user)} 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          mr: 1, 
                          fontSize: '0.8rem', 
                          bgcolor: '#8B5CF6',
                          ...(hasUpdate && {
                            animation: 'pulse 1.5s infinite',
                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                          })
                        }}
                      >
                        {participant.user.username ? participant.user.username[0].toUpperCase() : '?'}
                      </Avatar>
                      {participant.user.username}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    fontWeight: 'medium',
                    position: 'relative'
                  }}>
                    {participant.score}
                    {hasUpdate && (
                      <Box 
                        component="span" 
                        sx={{
                          position: 'absolute',
                          right: -40,
                          color: '#10B981',
                          animation: 'fadeInUp 2.5s forwards',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          textShadow: '0 0 5px rgba(16, 185, 129, 0.7)'
                        }}
                      >
                        +{hasUpdate.points}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {isTopScore && hasTie ? (
                      <Chip 
                        size="small" 
                        color="secondary" 
                        label="Tied for 1st" 
                        icon={<GavelIcon />} 
                        sx={{
                          animation: 'pulse 2s infinite',
                          background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.8), rgba(192, 132, 252, 0.8))',
                          fontWeight: 'bold',
                          boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            width: '200%',
                            height: '200%',
                            background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
                            transform: 'rotate(30deg)',
                            backgroundSize: '100% 100%',
                            animation: 'shine 3s infinite linear'
                          }
                        }}
                      />
                    ) : isTopScore ? (
                      <Chip 
                        size="small" 
                        color="success" 
                        label="Leader" 
                        icon={<EmojiEventsIcon />} 
                        sx={{
                          animation: 'pulse 2s infinite',
                          background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.8))',
                          fontWeight: 'bold',
                          boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            width: '200%',
                            height: '200%',
                            background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
                            transform: 'rotate(30deg)',
                            backgroundSize: '100% 100%',
                            animation: 'shine 3s infinite linear'
                          }
                        }}
                      />
                    ) : hasUpdate ? (
                      <Chip 
                        size="small" 
                        color="primary" 
                        label={`+${hasUpdate.points} Points!`}
                        sx={{ 
                          animation: 'pulse 1.5s infinite',
                          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.7), rgba(59, 130, 246, 0.7))',
                          fontWeight: 'bold',
                          boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            width: '200%',
                            height: '200%',
                            background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
                            transform: 'rotate(30deg)',
                            backgroundSize: '100% 100%',
                            animation: 'shine 2s infinite linear'
                          }
                        }}
                      />
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {lastCompletedEvent && Object.keys(updatedParticipants).length > 0 && (
          <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="body2" color="primary">
              <strong>{lastCompletedEvent.name}</strong> completed with outcome: <strong>{lastCompletedEvent.outcome}</strong> (x{lastCompletedEvent.weight} weight)
            </Typography>
            <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
              Points awarded to: {Object.entries(updatedParticipants).map(([id, data], i) => (
                <span key={id}>
                  {i > 0 ? ', ' : ''}
                  <strong>{data.username}</strong> (+{data.points})
                </span>
              ))}
            </Typography>
          </Box>
        )}
      </TableContainer>
    );
  };

  const renderEventCompletionStep = () => {
    if (!currentEvent) {
      // Check if all events are completed and if we need to proceed to final completion
      const allEventsCompleted = circuit && circuit.component_events && 
                                circuit.component_events.every(ce => ce.league_event.completed);
      const needsTiebreaker = circuit && circuit.tiebreaker_event && !circuit.tiebreaker_event.completed;
      const readyForFinalCompletion = allEventsCompleted && !needsTiebreaker;
      
      return (
        <Box sx={{ mt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            {needsTiebreaker
              ? "All regular events have been completed. Proceed to the tiebreaker phase to complete the circuit."
              : readyForFinalCompletion 
                ? "All events have been completed. Ready for final completion."
                : "No events need to be completed."}
          </Alert>
          
          {/* Button to proceed to tiebreaker phase if all regular events are completed */}
          {needsTiebreaker && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<GavelIcon />}
                onClick={() => setActiveStep(2)}
                sx={{
                  background: 'rgba(139, 92, 246, 0.8)',
                  '&:hover': { background: 'rgba(139, 92, 246, 0.9)' },
                  px: 3,
                  py: 1.5
                }}
              >
                Proceed to Tiebreaker
              </Button>
            </Box>
          )}
          
          {/* Button to proceed to final completion if all events are completed and no tiebreaker needed */}
          {readyForFinalCompletion && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<EmojiEventsIcon />}
                onClick={() => setActiveStep(3)}
                sx={{
                  background: 'rgba(16, 185, 129, 0.8)',
                  '&:hover': { background: 'rgba(16, 185, 129, 0.9)' },
                  px: 3,
                  py: 1.5
                }}
              >
                Proceed to Final Completion
              </Button>
            </Box>
          )}
        </Box>
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
    
    // Recalculate tied participants in case they weren't set correctly
    const getTiedParticipantsInfo = () => {
      if (circuit?.participants?.length > 0) {
        const sortedParticipants = [...circuit.participants].sort((a, b) => b.score - a.score);
        const topScore = sortedParticipants[0].score;
        const tied = sortedParticipants.filter(p => p.score === topScore);
        
        return {
          count: tied.length,
          score: topScore,
          participants: tied
        };
      }
      
      return {
        count: 0,
        score: 0,
        participants: []
      };
    };
    
    // Get current tied participants info
    const tiedInfo = getTiedParticipantsInfo();
    
    return (
      <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <GavelIcon sx={{ mr: 1 }} /> Tiebreaker Required
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            {tiedInfo.count > 1 ? 
              `${tiedInfo.count} participants are tied for first place with ${tiedInfo.score} points.` : 
              hasTie ? 
                'Participants are tied for first place.' :
                'Please complete the tiebreaker event to finalize the circuit.'
            } 
            Please enter the correct answer for the tiebreaker event to determine the winner.
          </Alert>
          
          {tiedInfo.count > 1 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tied Participants:
              </Typography>
              {tiedInfo.participants.map((p, index) => (
                <Chip
                  key={p.user.id}
                  avatar={<Avatar src={getProfileImageUrl(p.user)} />}
                  label={`${p.user.username} (${p.score} pts)`}
                  variant="outlined"
                  color="primary"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}
          
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