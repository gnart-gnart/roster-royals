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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GavelIcon from '@mui/icons-material/Gavel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getCircuitDetail, getEventDetails, completeCircuitWithTiebreaker } from '../services/api';
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

  // Check if user is the captain
  const [isCaptain, setIsCaptain] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

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
        } else {
          setError('This circuit has no tiebreaker event configured');
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
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [circuitId, leagueId, currentUser.id]);

  const handleTiebreakerValueChange = (e) => {
    setTiebreakerValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    
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

    try {
      // Call API to complete circuit with tiebreaker
      const response = await completeCircuitWithTiebreaker(
        circuitId, 
        tiebreakerEvent.id, 
        tiebreakerValue
      );
      
      console.log('Circuit completion response:', response);
      
      // Show success message with winners information
      if (response.winners && response.winners.length > 1) {
        setSuccess(`Circuit has been completed! Winners: ${response.winners.map(w => w.username).join(', ')}. Each winner receives $${response.prize_per_winner}.`);
      } else if (response.winners && response.winners.length === 1) {
        setSuccess(`Circuit has been completed! Winner: ${response.winners[0].username}. Prize: $${response.total_prize}.`);
      } else {
        setSuccess('Circuit has been completed successfully!');
      }
      
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
                      <Avatar sx={{ width: 28, height: 28, mr: 1, fontSize: '0.8rem', bgcolor: '#8B5CF6' }}>
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

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Current Leaderboard
            </Typography>
            {renderParticipantsTable()}
          </Grid>

          {/* Tiebreaker Section - Only show if there's a tie */}
          {hasTie && tiedParticipants.length > 1 && (
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <GavelIcon sx={{ mr: 1 }} /> Tiebreaker Required
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    {tiedParticipants.length} participants are tied for first place with {tiedParticipants[0]?.score || 0} points. 
                    Please enter the correct answer for the tiebreaker event to determine the winner.
                  </Alert>
                  
                  {tiebreakerEvent ? (
                    <Box>
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
                      
                      <form onSubmit={handleSubmit}>
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
                            disabled={submitting}
                            startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                          >
                            {submitting ? 'Processing...' : 'Complete Circuit'}
                          </Button>
                        </Box>
                      </form>
                    </Box>
                  ) : (
                    <Alert severity="error">
                      No tiebreaker event is configured for this circuit.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {/* No Tie Section - Show when there's a clear winner */}
          {(!hasTie || tiedParticipants.length <= 1) && circuit?.participants?.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmojiEventsIcon sx={{ mr: 1, color: '#F59E0B' }} /> Complete Circuit
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    There is a clear winner for this circuit. You can complete it now to distribute the prize.
                  </Alert>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Winner: {circuit.participants.sort((a, b) => b.score - a.score)[0]?.user.username}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Score: {circuit.participants.sort((a, b) => b.score - a.score)[0]?.score} points
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
                      onClick={handleSubmit}
                    >
                      {submitting ? 'Processing...' : 'Complete Circuit'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
}

export default CompleteCircuitPage; 