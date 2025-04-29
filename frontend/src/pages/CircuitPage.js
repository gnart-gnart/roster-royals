import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // Leaderboard icon
import EventIcon from '@mui/icons-material/Event'; // Events icon
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; // Entry fee icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Completed icon
import PlayCircleIcon from '@mui/icons-material/PlayCircle'; // Active icon
import FunctionsIcon from '@mui/icons-material/Functions'; // Weight/Multiplier icon
import GavelIcon from '@mui/icons-material/Gavel'; // Tiebreaker icon
import DoneIcon from '@mui/icons-material/Done'; // For events already bet on
import { getCircuitDetail, joinCircuit, getCircuitCompletedBets } from '../services/api';
import NavBar from '../components/NavBar';
import { format } from 'date-fns'; // For date formatting
import Confetti from 'react-confetti';

function CircuitPage() {
  const { leagueId, circuitId } = useParams(); // Get both leagueId and circuitId
  const navigate = useNavigate();
  const [circuit, setCircuit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [isCaptain, setIsCaptain] = useState(false);
  const [hasJoined, setHasJoined] = useState(false); // User has joined the circuit
  const [joiningCircuit, setJoiningCircuit] = useState(false); // Loading state for join button
  const [showConfetti, setShowConfetti] = useState(false); // Control confetti animation
  const [userBets, setUserBets] = useState({}); // Map of eventId -> userHasBet
  const [loadingBets, setLoadingBets] = useState(false); // Loading state for user bets

  // Function to reload just the user bets
  const reloadUserBets = async () => {
    try {
      setLoadingBets(true);
      console.log('[reloadUserBets] Fetching completed bets for circuit', circuitId);
      const completedBets = await getCircuitCompletedBets(circuitId);
      
      // Build a map of event ID to whether user has bet on it
      const betsMap = {};
      
      // Process all completed events and log them clearly
      console.log(`[reloadUserBets] Found ${completedBets.length} completed bets for current user`);
      
      // Map each event ID to true in the bets map
      completedBets.forEach(eventId => {
        if (eventId) {
          console.log(`[reloadUserBets] User has completed bet for event ${eventId}`);
          betsMap[eventId] = true;
        }
      });
      
      console.log('[reloadUserBets] Final bets map:', betsMap);
      setUserBets(betsMap);
    } catch (err) {
      console.error('[reloadUserBets] Failed to reload user bets:', err);
      // Don't reset userBets on error to keep any existing data
    } finally {
      setLoadingBets(false);
    }
  };

  // Reload user bets when navigating back to this page
  useEffect(() => {
    // Only reload if the circuit is loaded and user has joined
    if (circuit && hasJoined) {
      reloadUserBets();
    }
  }, [circuit, hasJoined]);

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
    const fetchCircuit = async () => {
      try {
        setLoading(true);
        const data = await getCircuitDetail(circuitId);
        setCircuit(data);
        setError('');
        const captainCheck = data.captain?.id === currentUser.id;
        setIsCaptain(captainCheck);

        // Check if current user is a participant
        const isParticipant = data.participants?.some(p => p.user.id === currentUser.id);
        setHasJoined(isParticipant);

        // Fetch user's completed bets using the new endpoint
        if (isParticipant) {
          try {
            console.log('[fetchCircuit] Fetching completed bets for circuit', circuitId);
            const completedBets = await getCircuitCompletedBets(circuitId);
            
            // Build a map of event ID to whether user has bet on it
            const betsMap = {};
            
            // Process all completed events and log them clearly
            console.log(`[fetchCircuit] Found ${completedBets.length} completed bets for current user`);
            
            // Map each event ID to true in the bets map
            completedBets.forEach(eventId => {
              if (eventId) {
                console.log(`[fetchCircuit] User has completed bet for event ${eventId}`);
                betsMap[eventId] = true;
              }
            });
            
            console.log('[fetchCircuit] Final bets map:', betsMap);
            setUserBets(betsMap);
          } catch (betErr) {
            console.error('[fetchCircuit] Error fetching completed bets:', betErr);
            // Don't fail the whole circuit load if bets can't be loaded
            setUserBets({});
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load circuit details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCircuit();
  }, [circuitId, currentUser.id]);

  const handleJoinCircuit = async () => {
    setJoiningCircuit(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await joinCircuit(circuitId);
      
      // Show success message and confetti
      setSuccess('Successfully joined circuit!');
      setHasJoined(true);
      setShowConfetti(true);
      
      // Update circuit data to include the user as a participant
      setCircuit(prev => {
        // Create a new participant entry for the current user
        const newParticipant = {
          user: currentUser,
          score: 0,
          paid_entry: true
        };
        
        // Add the new participant to the list
        return {
          ...prev,
          participants: [...(prev.participants || []), newParticipant]
        };
      });
      
      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
    } catch (err) {
      setError(err.message || 'Failed to join circuit. Please try again.');
    } finally {
      setJoiningCircuit(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <PlayCircleIcon color="success" />;
      case 'completed': return <CheckCircleIcon color="action" />;
      default: return <PlayCircleIcon color="warning" />;
    }
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

  if (error) {
    return (
      <>
        <NavBar />
        <Container sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
           <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/league/${leagueId}`)} // Use leagueId for back navigation
            sx={{ mt: 2 }}
          >
            Back to League
          </Button>
        </Container>
      </>
    );
  }

  if (!circuit) {
    return (
      <>
        <NavBar />
        <Container sx={{ mt: 4 }}>
          <Typography>Circuit not found.</Typography>
           <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/league/${leagueId}`)} // Use leagueId for back navigation
            sx={{ mt: 2 }}
          >
            Back to League
          </Button>
        </Container>
      </>
    );
  }

  // Sort participants by score descending
  const sortedParticipants = [...(circuit.participants || [])].sort((a, b) => b.score - a.score);

  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh', pb: 4 }}>
      {/* Confetti effect when user joins */}
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Success message */}
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}
        
        {/* Error message */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
             <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/league/${leagueId}`)}
                variant="outlined"
            >
                Back to League
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              {circuit.name}
            </Typography>
            <Chip
              icon={getStatusIcon(circuit.status)}
              label={circuit.status.charAt(0).toUpperCase() + circuit.status.slice(1)}
              color={circuit.status === 'active' ? 'success' : 'warning'}
              variant="outlined"
              size="small"
            />
          </Box>
           {/* Action Buttons */}
           <Box sx={{ display: 'flex', gap: 2 }}>
             {/* Complete Circuit Button - Visible only to captains for active circuits */}
             {isCaptain && circuit.status === 'active' && (
               <Button
                 variant="contained"
                 color="primary"
                 onClick={() => navigate(`/league/${leagueId}/circuit/${circuitId}/complete`)}
                 startIcon={<CheckCircleIcon />}
                 sx={{
                  background: 'rgba(16, 185, 129, 0.8)',
                  borderRadius: '8px',
                  fontWeight: 'medium',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                  '&:hover': {
                    background: 'rgba(16, 185, 129, 0.9)',
                    boxShadow: '0 3px 6px rgba(16, 185, 129, 0.3)',
                  },
                 }}
               >
                 Complete Circuit
               </Button>
             )}
             {/* Join Circuit Button */}
             {hasJoined ? (
               <Button variant="contained" color="success" startIcon={<CheckCircleIcon />}>
                 Joined
               </Button>
             ) : (
               <Button 
                 variant="contained" 
                 color="primary"
                 onClick={handleJoinCircuit}
                 disabled={circuit.status !== 'active' || joiningCircuit}
               >
                 {joiningCircuit ? <CircularProgress size={24} /> : `Join Circuit ($${circuit.entry_fee})`}
               </Button>
             )}
           </Box>
        </Box>

        {/* Description */}
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {circuit.description || 'No description provided.'}
        </Typography>

        {/* Key Info Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
                 <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', textAlign: 'center', height: '100%' }}>
                    <CardContent>
                        <AttachMoneyIcon sx={{ fontSize: 40, color: '#10B981', mb: 1 }} />
                        <Typography sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>${circuit.entry_fee}</Typography>
                        <Typography variant="body2" color="text.secondary">Entry Fee</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
                 <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', textAlign: 'center', height: '100%' }}>
                    <CardContent>
                         <EmojiEventsIcon sx={{ fontSize: 40, color: '#F59E0B', mb: 1 }} />
                        <Typography sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{circuit.participants?.length || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">Participants</Typography>
                    </CardContent>
                </Card>
            </Grid>
             <Grid item xs={6} sm={3}>
                 <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', textAlign: 'center', height: '100%' }}>
                    <CardContent>
                        <EventIcon sx={{ fontSize: 40, color: '#60A5FA', mb: 1 }} />
                        <Typography sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{circuit.component_events?.length || 0}</Typography>
                         <Typography variant="body2" color="text.secondary">Events</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
                <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', textAlign: 'center', height: '100%' }}>
                    <CardContent>
                        {circuit.tiebreaker_event ? (
                             <GavelIcon sx={{ fontSize: 40, color: '#A78BFA', mb: 1 }} />
                        ) : (
                            <Box sx={{ height: 40, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <Typography sx={{ fontSize: 40, color: '#6B7280' }}>?</Typography>
                            </Box>
                        )}
                        <Typography sx={{ fontWeight: 'bold', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                           {circuit.tiebreaker_event?.event_name || 'None'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Tiebreaker</Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>


        <Grid container spacing={3}>
          {/* Left Column: Component Events */}
          <Grid item xs={12} md={7}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Events
            </Typography>
            {!hasJoined && circuit.status !== 'completed' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You must join this circuit to place bets on these events.
              </Alert>
            )}
            <Paper sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', p: 1 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Sport</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell align="center">Weight</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {circuit.component_events && circuit.component_events.length > 0 ? (
                      circuit.component_events.map(({ league_event, weight }) => (
                        <TableRow 
                          key={league_event.id}
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            backgroundColor: userBets[league_event.id] ? 'rgba(16, 185, 129, 0.1)' : 'inherit',
                            border: userBets[league_event.id] ? '1px solid rgba(16, 185, 129, 0.3)' : 'inherit',
                          }}
                        >
                          <TableCell component="th" scope="row">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {userBets[league_event.id] && (
                                <DoneIcon color="success" sx={{ mr: 1 }} />
                              )}
                              {league_event.event_name}
                            </Box>
                          </TableCell>
                          <TableCell>{league_event.sport}</TableCell>
                          <TableCell>
                             {league_event.commence_time ? format(new Date(league_event.commence_time), 'P p') : 'N/A'}
                           </TableCell>
                          <TableCell align="center">
                            <Chip
                                icon={<FunctionsIcon fontSize='small'/>}
                                label={`x${weight}`}
                                size="small"
                                variant='outlined'
                                sx={{borderColor: 'rgba(139, 92, 246, 0.5)', color: '#A78BFA'}}
                                />
                           </TableCell>
                          <TableCell align="right">
                            {userBets[league_event.id] ? (
                              // User has placed a bet on this event
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                startIcon={<DoneIcon />}
                                onClick={() => navigate(`/league/${leagueId}/circuit/${circuitId}/event/${league_event.id}/place-bet`)} 
                                sx={{ ml: 1 }}
                              >
                                Bet Placed
                              </Button>
                            ) : league_event.completed ? (
                              // Event is completed but user has no bet
                              <Button
                                size="small"
                                variant="outlined"
                                disabled
                                sx={{ ml: 1 }}
                              >
                                Event Completed
                              </Button>
                            ) : (
                              // Event is not completed and user has no bet
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => navigate(`/league/${leagueId}/circuit/${circuitId}/event/${league_event.id}/place-bet`)} 
                                disabled={!hasJoined || circuit.status === 'completed'} 
                                sx={{ ml: 1 }}
                              >
                                Place Bet
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No component events found for this circuit.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Right Column: Leaderboard */}
          <Grid item xs={12} md={5}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Leaderboard
            </Typography>
             <Paper sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)' }}>
               <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell align="right">Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedParticipants.length > 0 ? (
                      sortedParticipants.map((p, index) => (
                        <TableRow hover key={p.user.id}>
                          <TableCell sx={{ width: 50, fontWeight: 'bold', color: index < 3 ? '#F59E0B' : 'inherit' }}>{index + 1}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                src={getProfileImageUrl(p.user)}
                                sx={{ width: 28, height: 28, mr: 1, fontSize: '0.8rem', bgcolor: '#8B5CF6' }}
                              >
                                {p.user.username ? p.user.username[0].toUpperCase() : '?'}
                              </Avatar>
                              {p.user.username}
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'medium' }}>{p.score}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                       <TableRow>
                        <TableCell colSpan={3} align="center">
                          No participants have joined yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
             </Paper>
              {/* Winner Display */}
              {circuit.winner && (
                <Alert severity="success" icon={<EmojiEventsIcon />} sx={{ mt: 2 }}>
                    Winner: {circuit.winner.username}
                </Alert>
              )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default CircuitPage;