import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Divider,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  ListItemIcon,
  Radio
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // Leaderboard icon
import EventIcon from '@mui/icons-material/Event'; // Events icon
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; // Entry fee icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Completed icon
import PlayCircleIcon from '@mui/icons-material/PlayCircle'; // Active icon
import ScheduleIcon from '@mui/icons-material/Schedule'; // Upcoming icon
import FunctionsIcon from '@mui/icons-material/Functions'; // Weight/Multiplier icon
import GavelIcon from '@mui/icons-material/Gavel'; // Tiebreaker icon
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsHockeyIcon from '@mui/icons-material/SportsHockey';
import SportsIcon from '@mui/icons-material/Sports';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import SportsGolfIcon from '@mui/icons-material/SportsGolf';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import { getCircuitDetail, getLeague, createCircuit, browseMarket, getAvailableSportEvents } from '../services/api';
import NavBar from '../components/NavBar';
import { format } from 'date-fns'; // For date formatting
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const steps = ['Select Events', 'Configure Circuit'];

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`circuit-tabpanel-${index}`}
      aria-labelledby={`circuit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `circuit-tab-${index}`,
    'aria-controls': `circuit-tabpanel-${index}`,
  };
}

function getSportIcon(sport) {
  if (!sport || typeof sport !== 'string') {
    return { icon: <SportsIcon />, color: '#8B5CF6' };
  }
  let iconComponent = <SportsIcon />;
  const color = '#8B5CF6';
  switch (sport.toLowerCase()) {
    case 'basketball': iconComponent = <SportsBasketballIcon />; break;
    case 'soccer': iconComponent = <SportsSoccerIcon />; break;
    case 'american football': case 'football': iconComponent = <SportsFootballIcon />; break;
    case 'baseball': iconComponent = <SportsBaseballIcon />; break;
    case 'hockey': case 'ice hockey': iconComponent = <SportsHockeyIcon />; break;
    case 'tennis': iconComponent = <SportsTennisIcon />; break;
    case 'golf': iconComponent = <SportsGolfIcon />; break;
    case 'mixed martial arts': case 'mma': case 'boxing': iconComponent = <SportsMmaIcon />; break;
    default: break;
  }
  return { icon: iconComponent, color: color };
}

function CircuitPage() {
  const { leagueId, circuitId } = useParams(); // Get both leagueId and circuitId
  const navigate = useNavigate();
  const [circuit, setCircuit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Step Control
  const [activeStep, setActiveStep] = useState(0);

  // Step 1 State (Event Selection)
  const [selectedEvents, setSelectedEvents] = useState([]); // Holds full event objects
  const [tabValue, setTabValue] = useState(0); // For Market/Custom tabs
  // Market Event State
  const [sportsGroups, setSportsGroups] = useState({});
  const [allSports, setAllSports] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [marketEvents, setMarketEvents] = useState([]);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [marketError, setMarketError] = useState('');
  const [addingEventId, setAddingEventId] = useState(null); // To show loading on add button
  const [searchTerm, setSearchTerm] = useState('');
  const [viewState, setViewState] = useState('groups'); // For Market tab navigation
  // Custom Event State
  const [customEvent, setCustomEvent] = useState({
    name: '',
    sport: '',
    homeTeam: '', // Context only
    awayTeam: '', // Context only
    startTime: new Date(Date.now() + 86400000),
    answerType: 'number',
    answerOptionsString: '',
  });

  // Step 2 State (Configuration)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    entry_fee: '0.00',
    start_date: null,
    end_date: null,
    tiebreaker_event_id: '', // Store the ID of the selected tiebreaker
  });
  // Note: Weights will be stored directly within the selectedEvents objects in Step 2

  const [isCaptain, setIsCaptain] = useState(false);

  useEffect(() => {
    const fetchCircuit = async () => {
      try {
        setLoading(true);
        const data = await getCircuitDetail(circuitId);
        setCircuit(data);
        setError('');
        const captainCheck = data.captain?.id === currentUser.id;
        setIsCaptain(captainCheck);
      } catch (err) {
        setError(err.message || 'Failed to load circuit details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCircuit();
  }, [circuitId, currentUser.id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <PlayCircleIcon color="success" />;
      case 'completed': return <CheckCircleIcon color="action" />;
      case 'upcoming': return <ScheduleIcon color="warning" />;
      default: return <ScheduleIcon color="disabled" />;
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

  // === Handlers ===

  // --- Step Navigation ---
  const handleNext = () => {
    if (activeStep === 0 && selectedEvents.length === 0) {
        setError("Please select at least one event before proceeding.");
        return;
    }
    setError(''); // Clear error on step change
    // If moving from step 0 to 1, ensure weights are initialized if not already present
    if (activeStep === 0) {
        setSelectedEvents(prev => prev.map(ev => ({ ...ev, weight: ev.weight || 1 })));
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setError(''); // Clear error on step change
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // --- Event Selection/Modification (Step 1 & 2) ---

   const handleAddMarketEvent = (event) => {
    // Prevent duplicates
    if (selectedEvents.some(item => item.id === event.id)) {
        setError('This event is already added.');
        return;
    }
     setError('');
    const newEvent = {
        id: event.id, // Use the API's event ID
        event_name: `${event.away_team} @ ${event.home_team}`,
        sport: event.sport_key || event.sport,
        home_team: event.home_team,
        away_team: event.away_team,
        commence_time: event.commence_time,
        event_key: event.id, // Store original key if needed later
        custom: false, // Mark as market event
        answerType: 'market', // Special type for market events
        answerOptions: [],
        // Include market data if available (may need for betting later)
        bookmakers: event.bookmakers,
        weight: 1 // Default weight
    };
    setSelectedEvents(prev => [...prev, newEvent]);
    setError(`${newEvent.event_name} added.`); // Feedback
    setTimeout(() => setError(''), 3000); // Clear feedback
  };

  const handleAddCustomEvent = () => {
     // Reset errors/success
     setError('');
     setError('');

    // Validation
    if (!customEvent.name || !customEvent.sport || !customEvent.answerType) {
      setError('Please provide a title/question, category, and answer type.');
      return;
    }

    let answerOptions = [];
    if (customEvent.answerType === 'multipleChoice') {
      if (!customEvent.answerOptionsString.trim()) {
        setError('Please provide the options for the multiple choice event.');
        return;
      }
      answerOptions = customEvent.answerOptionsString.split(',').map(opt => opt.trim()).filter(opt => opt !== '');
      if (answerOptions.length < 2) {
          setError('Please provide at least two valid options for multiple choice.');
          return;
      }
    }

    const customId = `custom-${Date.now()}`;
    const newEvent = {
      id: customId,
      event_name: customEvent.name,
      sport: customEvent.sport,
      home_team: customEvent.homeTeam,
      away_team: customEvent.awayTeam,
      commence_time: customEvent.startTime.toISOString(),
      event_key: customId,
      custom: true,
      answerType: customEvent.answerType,
      answerOptions: answerOptions,
      weight: 1 // Default weight
    };

    setSelectedEvents(prev => [...prev, newEvent]);
    setError(`Custom event "${customEvent.name}" added.`);

    // Reset the custom event form
    setCustomEvent({
      name: '', sport: '', homeTeam: '', awayTeam: '',
      startTime: new Date(Date.now() + 86400000),
      answerType: 'number', answerOptionsString: '',
    });
  };

  const handleRemoveEvent = (eventId) => {
    setSelectedEvents(prev => prev.filter(event => event.id !== eventId));
    // If the removed event was the tiebreaker, reset it
    if (formData.tiebreaker_event_id === eventId) {
        setFormData(prev => ({ ...prev, tiebreaker_event_id: '' }));
    }
  };

  // --- Configuration (Step 2) ---
   const handleWeightChange = (eventId, newWeight) => {
    const weight = Math.max(1, parseInt(newWeight, 10) || 1); // Ensure weight is at least 1
    setSelectedEvents(prev =>
      prev.map(event =>
        event.id === eventId ? { ...event, weight: weight } : event
      )
    );
  };

  const handleTiebreakerSelect = (eventId) => {
    setFormData(prev => ({ ...prev, tiebreaker_event_id: eventId }));
  };

   const handleInputChange = (e) => { // For Step 2 form fields
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (name, date) => { // For Step 2 form fields
    setFormData({ ...formData, [name]: date });
  };

  const handleTabChange = (event, newValue) => { // For Step 1 Tabs
    setTabValue(newValue);
    if (newValue === 0 && Object.keys(sportsGroups).length === 0) { loadMarketData(); }
  };

  // --- API Calls ---
  const loadMarketData = async () => {
    if (loadingMarket) return; setLoadingMarket(true); setMarketError('');
    try {
      const marketData = await browseMarket();
      if (marketData?.data?.grouped_sports) {
        setSportsGroups(marketData.data.grouped_sports);
        setAllSports(marketData.data.sports || []);
      } else {
        setMarketError('Failed to load market data or format invalid.'); setSportsGroups({}); setAllSports([]);
      }
    } catch (err) {
      setMarketError('Failed to load market data: ' + (err.message || 'Unknown error'));
    } finally { setLoadingMarket(false); }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group); setViewState('sports'); setSelectedSport(null); setMarketEvents([]); setSearchTerm('');
  };

  const handleSportSelect = async (sport) => {
    if (!sport || !sport.key) { setMarketError('Invalid sport selected.'); return; }
    setSelectedSport(sport); setViewState('events'); setLoadingMarket(true);
    setMarketEvents([]); setSearchTerm(''); setMarketError('');
    try {
      const formattedKey = sport.key.replace(/ /g, '_').toLowerCase();
      const events = await getAvailableSportEvents(formattedKey);
      const validEvents = Array.isArray(events) ? events : [];
      setMarketEvents(validEvents);
      if(validEvents.length === 0) { setMarketError(`No upcoming events found for ${sport.title}.`); }
    } catch (err) {
      setMarketError(`Failed to load events for ${sport.title}: ` + (err.message || 'Unknown error')); setMarketEvents([]);
    } finally { setLoadingMarket(false); }
  };

  // === Render Functions ===

  // Placeholder for Step 1 Content
  const renderStep1Content = () => {
      return (
          <Box>
             <Typography variant="h6">Step 1: Select Events</Typography>
             {/* TODO: Implement Tabs (Market/Custom) here */}
             <Typography>Market Tab Placeholder</Typography>
             <Typography>Custom Event Tab Placeholder</Typography>
             <pre>{JSON.stringify(selectedEvents, null, 2)}</pre> {/* Debug: Show selected */}
          </Box>
      );
  };

  // Placeholder for Step 2 Content
  const renderStep2Content = () => {
      return (
          <Box>
              <Typography variant="h6">Step 2: Configure Circuit</Typography>
              {/* TODO: Implement Event List w/ Weights & Tiebreaker */}
              <Typography>Selected Events List Placeholder</Typography>
              <pre>{JSON.stringify(selectedEvents, null, 2)}</pre> {/* Debug: Show selected */}

              {/* TODO: Implement Config Fields (Name, Desc, Fee, Dates) */}
               <Typography>Config Fields Placeholder</Typography>
          </Box>
      );
  };

  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh', pb: 4 }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
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
              color={circuit.status === 'active' ? 'success' : circuit.status === 'completed' ? 'default' : 'warning'}
              variant="outlined"
              size="small"
            />
          </Box>
           {/* Add Join/View Bets Button Here - Logic needed */}
           {/* Example Button: */}
           <Button variant="contained" disabled={circuit.status !== 'upcoming' && circuit.status !== 'active'}>
            {/* Logic needed: Show "Join Circuit ($X)" or "View Your Bets" */}
            Join Circuit (${circuit.entry_fee})
           </Button>
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
              Component Events
            </Typography>
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
                        <TableRow hover key={league_event.id}>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                             <Tooltip title={league_event.id === circuit.tiebreaker_event?.id ? "Tiebreaker Event" : ""}>
                                <Box display="flex" alignItems="center">
                                    {league_event.id === circuit.tiebreaker_event?.id && <GavelIcon fontSize="inherit" sx={{ mr: 0.5, color: '#A78BFA' }} />}
                                    {league_event.event_name}
                                </Box>
                            </Tooltip>
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
                             <Button
                                size="small"
                                variant="outlined"
                                onClick={() => navigate(`/league/${leagueId}/event/${league_event.id}/place-user-bet`)} // Navigate to standard bet page for this event
                                disabled={league_event.completed || circuit.status === 'completed'} // Disable if event or circuit is done
                                sx={{ ml: 1 }}
                              >
                                Place Bet
                              </Button>
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
                              <Avatar sx={{ width: 28, height: 28, mr: 1, fontSize: '0.8rem', bgcolor: '#8B5CF6' }}>
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

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Alerts */}
        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

        {/* Content Area */}
        <Box sx={{ mb: 4 }}>
            {activeStep === 0 && renderStep1Content()}
            {activeStep === 1 && renderStep2Content()}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {activeStep !== 0 && (
            <Button
              onClick={handleBack}
              sx={{ mr: 1 }}
              disabled={loading} // Disable if submitting
            >
              Back
            </Button>
          )}
          {activeStep === 0 && (
             <Button
                variant="contained"
                onClick={handleNext}
                disabled={selectedEvents.length === 0} // Disable if no events selected
            >
                Next
             </Button>
          )}
          {activeStep === steps.length - 1 && (
            <Button
                variant="contained"
                color="primary"
                onClick={() => {}} // Placeholder for submission
                disabled={loading} // Disable while submitting
            >
              {loading ? <CircularProgress size={24} /> : 'Create Circuit'}
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default CircuitPage;