import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
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
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  Paper,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Radio,
  FormControlLabel,
  CheckCircleIcon,
  GavelIcon
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsHockeyIcon from '@mui/icons-material/SportsHockey';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import SportsGolfIcon from '@mui/icons-material/SportsGolf';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import SportsRugbyIcon from '@mui/icons-material/SportsRugby';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import SportsIcon from '@mui/icons-material/Sports';
import SearchIcon from '@mui/icons-material/Search';
import { SvgIcon } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeague, getLeagueEvents, createCircuit, browseMarket, getAvailableSportEvents } from '../services/api';
import NavBar from '../components/NavBar';
import { format } from 'date-fns';

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

function getSportIcon(sportGroup) {
  let icon;
  const color = '#8B5CF6';

  if (!sportGroup || typeof sportGroup !== 'string') {
    return { icon: <SportsIcon />, color };
  }

  switch (sportGroup.toLowerCase()) {
    case 'soccer':
      icon = <SportsSoccerIcon />;
      break;
    case 'basketball':
      icon = <SportsBasketballIcon />;
      break;
    case 'american football':
    case 'football':
      icon = <SportsFootballIcon />;
      break;
    case 'baseball':
      icon = <SportsBaseballIcon />;
      break;
    case 'hockey':
    case 'ice hockey':
      icon = <SportsHockeyIcon />;
      break;
    case 'tennis':
      icon = <SportsTennisIcon />;
      break;
    case 'golf':
      icon = <SportsGolfIcon />;
      break;
    case 'mixed martial arts':
    case 'mma':
    case 'boxing':
      icon = <SportsMmaIcon />;
      break;
    case 'rugby league':
      icon = <SportsRugbyIcon />;
      break;
    case 'aussie rules':
      icon = <SportsKabaddiIcon />;
      break;
    case 'cricket':
      icon = <CricketIcon />;
      break;
    case 'lacrosse':
      icon = <LacrosseIcon />;
      break;
    case 'politics':
      icon = <HowToVoteIcon />;
      break;
    default:
      icon = <SportsIcon />;
      break;
  }

  return { icon, color };
}

const steps = ['Select Events', 'Configure Circuit'];

function CreateCircuitPage() {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [league, setLeague] = useState(null);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    entry_fee: '0.00',
    start_date: null,
    end_date: null,
    tiebreaker_event_id: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [sportsGroups, setSportsGroups] = useState({});
  const [allSports, setAllSports] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [marketEvents, setMarketEvents] = useState([]);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [marketError, setMarketError] = useState('');
  const [addingEventId, setAddingEventId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewState, setViewState] = useState('groups');
  const [customEvent, setCustomEvent] = useState({
    name: '', sport: '', homeTeam: '', awayTeam: '',
    startTime: new Date(Date.now() + 86400000),
    answerType: 'number', answerOptionsString: '',
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [isCaptain, setIsCaptain] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const leagueData = await getLeague(leagueId);
        setLeague(leagueData);
        setIsCaptain(leagueData.captain?.id === currentUser.id);

        if (leagueData.captain?.id === currentUser.id) {
          const eventsData = await getLeagueEvents(leagueId);
          setAvailableEvents(eventsData.filter(event => !event.completed) || []);
          
          // Load market data if on market tab
          if (tabValue === 0) {
            loadMarketData();
          }
        } else {
          setError('Only the league captain can create circuits.');
        }
      } catch (err) {
        setError('Failed to load required data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [leagueId, currentUser.id, tabValue]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleEventSelection = (eventId) => {
    setSelectedEvents(prev => {
      const exists = prev.some(item => item.eventId === eventId);
      if (exists) {
        if (formData.tiebreaker_event_id === eventId) {
          setFormData({ ...formData, tiebreaker_event_id: '' });
        }
        return prev.filter(item => item.eventId !== eventId);
      } else {
        return [...prev, { eventId: eventId, weight: 1 }];
      }
    });
  };

  const handleWeightChange = (eventId, increment) => {
    setSelectedEvents(prev =>
      prev.map(item =>
        item.eventId === eventId
          ? { ...item, weight: Math.max(1, item.weight + increment) }
          : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedEvents.length === 0) {
      setError('Please select at least one component event.');
      return;
    }
    if (formData.tiebreaker_event_id && !selectedEvents.some(item => item.eventId === formData.tiebreaker_event_id)) {
        setError('The selected tiebreaker must be one of the component events.');
        return;
    }
    const tiebreakerEvent = availableEvents.find(event => event.id === formData.tiebreaker_event_id);
    if (tiebreakerEvent && tiebreakerEvent.betting_type === 'standard') {
        setError('The selected tiebreaker event must have a specific tiebreaker betting type (e.g., Closest Guess).');
        return;
    }

    const circuitData = {
      ...formData,
      entry_fee: parseFloat(formData.entry_fee).toFixed(2),
      start_date: formData.start_date ? formData.start_date.toISOString() : null,
      end_date: formData.end_date ? formData.end_date.toISOString() : null,
      component_events_data: selectedEvents.map(item => ({
        league_event_id: item.eventId,
        weight: item.weight,
      })),
      tiebreaker_event_id: formData.tiebreaker_event_id || null,
    };

    if (!circuitData.tiebreaker_event_id) {
        delete circuitData.tiebreaker_event_id;
    }

    try {
      setLoading(true);
      await createCircuit(leagueId, circuitData);
      setSuccess('Circuit created successfully!');
      setTimeout(() => navigate(`/league/${leagueId}`), 2000);
    } catch (err) {
      setError(err.message || 'Failed to create circuit.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && selectedEvents.length === 0) {
        setError("Please select at least one event before proceeding.");
        return;
    }
    setError('');
    if (activeStep === 0) {
        setSelectedEvents(prev => prev.map(ev => ({ ...ev, weight: ev.weight || 1 })));
        if (!formData.name && league) setFormData(prev => ({...prev, name: `${league.name} Circuit ${new Date().toLocaleDateString()}`}));
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAddMarketEvent = (event) => {
    if (selectedEvents.some(item => item.id === event.id)) {
        setSuccess('');
        setError('This event is already added.');
        setTimeout(() => setError(''), 3000);
        return;
    }
     setError('');
    const newEvent = {
        id: event.id,
        event_name: `${event.away_team} @ ${event.home_team}`,
        sport: event.sport_key || event.sport,
        home_team: event.home_team,
        away_team: event.away_team,
        commence_time: event.commence_time,
        event_key: event.id,
        custom: false,
        answerType: 'market',
        answerOptions: [],
        bookmakers: event.bookmakers,
        weight: 1
    };
    setSelectedEvents(prev => [...prev, newEvent]);
    setSuccess(`${newEvent.event_name} added.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddCustomEvent = () => {
     setError('');
     setSuccess('');
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
      id: customId, event_name: customEvent.name, sport: customEvent.sport,
      home_team: customEvent.homeTeam, away_team: customEvent.awayTeam,
      commence_time: customEvent.startTime.toISOString(), event_key: customId,
      custom: true, answerType: customEvent.answerType, answerOptions: answerOptions,
      weight: 1
    };
    setSelectedEvents(prev => [...prev, newEvent]);
    setSuccess(`Custom event "${customEvent.name}" added.`);
    setCustomEvent({
      name: '', sport: '', homeTeam: '', awayTeam: '',
      startTime: new Date(Date.now() + 86400000),
      answerType: 'number', answerOptionsString: '',
    });
     setTimeout(() => setSuccess(''), 3000);
  };

  const handleRemoveEvent = (eventId) => {
    setSelectedEvents(prev => prev.filter(event => event.id !== eventId));
    if (formData.tiebreaker_event_id === eventId) {
        setFormData(prev => ({ ...prev, tiebreaker_event_id: '' }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0 && Object.keys(sportsGroups).length === 0) {
      loadMarketData();
    }
  };

  const loadMarketData = async () => {
    if (loadingMarket) return;
    setLoadingMarket(true);
    setMarketError('');
    try {
      console.log('Calling browseMarket API');
      const marketData = await browseMarket();
      console.log('Market data received:', marketData);
      if (marketData?.data?.grouped_sports) {
        setSportsGroups(marketData.data.grouped_sports);
        setAllSports(marketData.data.sports || []);
      } else {
        console.error('Market data format invalid:', marketData);
        setMarketError('Failed to load market data or format invalid.');
        setSportsGroups({});
        setAllSports([]);
      }
    } catch (err) {
      console.error('Error loading market data:', err);
      setMarketError('Failed to load market data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoadingMarket(false);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setViewState('sports');
    setSelectedSport(null);
    setMarketEvents([]);
    setSearchTerm('');
  };

  const handleSportSelect = async (sport) => {
     if (!sport || !sport.key) {
      console.error('Invalid sport object passed to handleSportSelect:', sport);
      setMarketError('Invalid sport selected.');
      return;
    }
    setSelectedSport(sport);
    setViewState('events');
    setLoadingMarket(true);
    setMarketEvents([]);
    setSearchTerm('');
    setMarketError('');
    try {
      console.log(`Calling getAvailableSportEvents API for sport key: ${sport.key}`);
      const formattedKey = sport.key.replace(/ /g, '_').toLowerCase();
      const events = await getAvailableSportEvents(formattedKey);
      console.log('Events received for sport:', events);
      const validEvents = Array.isArray(events) ? events : [];
      setMarketEvents(validEvents);
      if(validEvents.length === 0) {
        setMarketError(`No upcoming events found for ${sport.title}.`);
      }
    } catch (err) {
      console.error(`Failed to load events for ${sport.title}:`, err);
      setMarketError(`Failed to load events for ${sport.title}: ` + (err.message || 'Unknown error'));
       setMarketEvents([]);
    } finally {
      setLoadingMarket(false);
    }
  };

  // === Render Functions ===

  // --- Step 1 Render Functions ---
  const renderMarketSportsGroups = () => {
    return (
      <Grid container spacing={3}>
        {Object.keys(sportsGroups).map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group}>
            <Card 
              onClick={() => handleGroupSelect(group)}
              sx={{
                cursor: 'pointer',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                borderRadius: '12px',
                borderTop: '3px solid #8B5CF6',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(139, 92, 246, 0.2)',
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.9))',
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      color: '#8B5CF6',
                      '& > *': { fontSize: '1.8rem' },
                    }}
                  >
                    {getSportIcon(group).icon}
                  </Box>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {group}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {sportsGroups[group].length} sports available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderMarketSports = () => {
    if (!selectedGroup || !sportsGroups[selectedGroup]) return null;
    
    return (
      <>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => setViewState('groups')}
            sx={{ mr: 2 }}
          >
            Back to Categories
          </Button>
          <Typography variant="h5" component="div">
            Sports in {selectedGroup}
          </Typography>
        </Box>
        
        <List component={Paper} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', borderRadius: '12px' }}>
          {sportsGroups[selectedGroup].map((sport) => (
            <ListItem 
              key={sport.key} 
              button 
              onClick={() => handleSportSelect(sport)}
              divider
              sx={{ 
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(51, 65, 85, 0.8)' }
              }}
            >
              <ListItemText 
                primary={sport.title} 
                secondary={sport.description} 
              />
              {sport.active && (
                <Chip 
                  label="Active" 
                  size="small" 
                  color="success" 
                  variant="outlined" 
                  sx={{ ml: 1 }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </>
    );
  };

  const renderMarketEvents = () => {
    if (!selectedSport) return null;
    
    const formatDate = (dateString) => {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Filter events based on searchTerm
    const filteredEvents = marketEvents.filter(event => 
      event.home_team?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.away_team?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => setViewState('sports')}
            sx={{ mr: 2 }}
          >
            Back to Sports
          </Button>
          <Typography variant="h5" component="div">
            Events for {selectedSport.title}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search events by team name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loadingMarket ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : marketError ? (
          <Alert severity="info" sx={{ my: 2 }}>{marketError}</Alert>
        ) : filteredEvents.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 3, textAlign: 'center' }}>
            {searchTerm ? "No events found matching your search." : "No events found for this sport."}
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', borderRadius: '12px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow 
                    key={event.id}
                    sx={{ 
                      '&:hover': { bgcolor: 'rgba(51, 65, 85, 0.8)' },
                    }}
                  >
                    <TableCell>{event.away_team} @ {event.home_team}</TableCell>
                    <TableCell>{formatDate(event.commence_time)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        variant="outlined"
                        onClick={() => handleAddMarketEvent(event)}
                        disabled={selectedEvents.some(item => item.id === event.id)}
                      >
                        {selectedEvents.some(item => item.id === event.id) ? 'Added' : 'Add Event'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </>
    );
  };

  const renderMarketContent = () => {
    if (loadingMarket) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (marketError && Object.keys(sportsGroups).length === 0) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography color="error" variant="body1">{marketError}</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={loadMarketData}
          >
            Retry Loading
          </Button>
        </Box>
      );
    }

    switch (viewState) {
      case 'sports':
        return renderMarketSports();
      case 'events':
        return renderMarketEvents();
      case 'groups':
      default:
        return Object.keys(sportsGroups).length === 0 ? (
          <Alert severity="info">No sports groups found. Try refreshing the page.</Alert>
        ) : renderMarketSportsGroups();
    }
  };

  // --- Step 1 Content (Define the function here) ---
  const renderStep1Content = () => (
      <Card variant="outlined">
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="event selection tabs">
              <Tab label="Market Events" {...a11yProps(0)} />
              <Tab label="Create Custom Event" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>{renderMarketContent()}</TabPanel>
          <TabPanel value={tabValue} index={1}>
            <Box component="div">
              <Typography variant="h6" gutterBottom>Create Custom Event</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Event Title / Question" name="name" value={customEvent.name} onChange={(e) => setCustomEvent(prev => ({...prev, name: e.target.value}))} required size="small" /></Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required size="small">
                    <InputLabel>Category</InputLabel>
                    <Select label="Category" name="sport" value={customEvent.sport} onChange={(e) => setCustomEvent(prev => ({...prev, sport: e.target.value}))}>
                        <MenuItem value="General">General</MenuItem><MenuItem value="Trivia">Trivia</MenuItem><MenuItem value="American Football">American Football</MenuItem><MenuItem value="Basketball">Basketball</MenuItem><MenuItem value="Baseball">Baseball</MenuItem><MenuItem value="Hockey">Hockey</MenuItem><MenuItem value="Soccer">Soccer</MenuItem><MenuItem value="MMA">MMA</MenuItem><MenuItem value="Boxing">Boxing</MenuItem><MenuItem value="Tennis">Tennis</MenuItem><MenuItem value="Golf">Golf</MenuItem><MenuItem value="Politics">Politics</MenuItem><MenuItem value="Entertainment">Entertainment</MenuItem><MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker label="End Time" value={customEvent.startTime} onChange={(d) => setCustomEvent(prev => ({...prev, startTime: d}))} slotProps={{ textField: { fullWidth: true, required: true, size: 'small' } }} />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Context 1 (Optional)" name="homeTeam" value={customEvent.homeTeam} onChange={(e) => setCustomEvent(prev => ({...prev, homeTeam: e.target.value}))} size="small" /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Context 2 (Optional)" name="awayTeam" value={customEvent.awayTeam} onChange={(e) => setCustomEvent(prev => ({...prev, awayTeam: e.target.value}))} size="small" /></Grid>
                <Grid item xs={12}><Divider sx={{ my: 1 }}><Typography variant="caption">Answer</Typography></Divider></Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required size="small">
                    <InputLabel>Answer Type</InputLabel>
                    <Select label="Answer Type" name="answerType" value={customEvent.answerType} onChange={(e) => setCustomEvent(prev => ({...prev, answerType: e.target.value}))}>
                      <MenuItem value="number">Number</MenuItem><MenuItem value="yesNo">Yes / No</MenuItem><MenuItem value="multipleChoice">Multiple Choice</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {customEvent.answerType === 'multipleChoice' && (
                  <Grid item xs={12} sm={6}><TextField fullWidth required label="Options (comma-separated)" name="answerOptionsString" value={customEvent.answerOptionsString} onChange={(e) => setCustomEvent(prev => ({...prev, answerOptionsString: e.target.value}))} placeholder="Option A, Option B" helperText="Min. 2 options" size="small" /></Grid>
                )}
                <Grid item xs={12}>
                  <Button variant="contained" color="secondary" onClick={handleAddCustomEvent} startIcon={<AddIcon />}>Add Custom Event</Button>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
          <Divider />
           <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', bgcolor: 'grey.100' }}>
             <Typography variant="body2" sx={{ mr: 2, fontWeight: 'medium' }}>Selected Events: {selectedEvents.length}</Typography>
           </Box>
      </Card>
  );

  // --- Step 2 Content (Define the function here) ---
  const renderStep2Content = () => (
    <Grid container spacing={3}>
        {/* Left Side: Event Configuration */}
        <Grid item xs={12} md={7}>
            <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Configure Selected Events ({selectedEvents.length})</Typography>
                    {selectedEvents.length === 0 ? ( <Alert severity="warning">No events selected. Go back to Step 1.</Alert> )
                    : (
                        <Paper variant="outlined" sx={{ maxHeight: 450, overflow: 'auto' }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{pl:1}}>Event</TableCell>
                                        <TableCell align="center" sx={{width: '80px'}}>Weight</TableCell>
                                        <TableCell align="center" sx={{width: '100px'}}>Tiebreaker</TableCell>
                                        <TableCell align="right" sx={{pr:1, width: '50px'}}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedEvents.map((event) => {
                                        const isTiebreakerEligible = event.custom && event.answerType === 'number';
                                        return (
                                            <TableRow key={event.id} hover>
                                                <TableCell sx={{pl:1}}>
                                                    <Tooltip title={event.event_name} placement="top-start">
                                                        <Typography noWrap variant="body2" sx={{maxWidth: '280px'}}>{event.event_name}</Typography>
                                                    </Tooltip>
                                                    <Typography variant="caption" color="text.secondary" component="div">
                                                        {event.custom ? `Custom (${event.answerType})` : `Market (${event.sport})`}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <TextField type="number" size="small" value={event.weight} onChange={(e) => handleWeightChange(event.id, e.target.value)} inputProps={{ min: 1, style: { textAlign: 'center', width: '35px', height: '20px' } }} sx={{ '& .MuiInputBase-root': {height: '30px'} }}/>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title={isTiebreakerEligible ? "Set as tiebreaker" : "Only custom events asking for a number can be tiebreakers"}>
                                                        <span>
                                                        <Radio checked={formData.tiebreaker_event_id === event.id} onChange={() => handleTiebreakerSelect(event.id)} value={event.id} name="tiebreaker-radio" disabled={!isTiebreakerEligible} size="small" sx={{ p: 0 }}/>
                                                        </span>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell align="right" sx={{pr:1}}>
                                                    <IconButton size="small" onClick={() => handleRemoveEvent(event.id)} color="error"><RemoveIcon fontSize="inherit" /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );})}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        </Paper>
                    )}
                </CardContent>
            </Card>
        </Grid>
        {/* Right Side: Circuit Details Form */}
        <Grid item xs={12} md={5}>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>Circuit Details</Typography>
                    <TextField name="name" label="Circuit Name" value={formData.name} onChange={handleInputChange} fullWidth required margin="dense" size="small"/>
                    <TextField name="description" label="Description (Optional)" value={formData.description} onChange={handleInputChange} fullWidth multiline rows={3} margin="dense" size="small"/>
                    <TextField name="entry_fee" label="Entry Fee" value={formData.entry_fee} onChange={handleInputChange} fullWidth required type="number" margin="dense" size="small" InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, inputProps: { min: 0, step: 0.01 } }} />
                    <Divider sx={{ my: 2 }} light><Typography variant="caption">Timing (Optional)</Typography></Divider>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}><DateTimePicker label="Start Date" value={formData.start_date} onChange={(d) => handleDateChange('start_date', d)} slotProps={{ textField: { fullWidth: true, margin: 'none', size: 'small' } }} /></Grid>
                            <Grid item xs={12} sm={6}><DateTimePicker label="End Date" value={formData.end_date} onChange={(d) => handleDateChange('end_date', d)} slotProps={{ textField: { fullWidth: true, margin: 'none', size: 'small' } }} /></Grid>
                        </Grid>
                    </LocalizationProvider>
                </CardContent>
            </Card>
        </Grid>
    </Grid>
  );

  if (loading && !league) {
    return <NavBar />
  }

  if (!isCaptain) {
    return (
        <>
            <NavBar />
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error || 'Permission denied.'}</Alert>
                <Button onClick={() => navigate(`/league/${leagueId}`)} sx={{ mt: 2 }}>Back to League</Button>
            </Container>
        </>
    );
  }

  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/league/${leagueId}`)}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Back to League
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Circuit
          </Typography>
          {league && (
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              For League: {league.name}
            </Typography>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mb: 4 }}>
          {activeStep === 0 && renderStep1Content()}
          {activeStep === 1 && renderStep2Content()}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {activeStep !== 0 && (<Button onClick={handleBack} disabled={loading}>Back</Button>)}
          {activeStep === 0 && (<Button variant="contained" onClick={handleNext} disabled={selectedEvents.length === 0}>Next</Button>)}
          {activeStep === steps.length - 1 && (<Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading || selectedEvents.length === 0}>{loading ? <CircularProgress size={24} /> : 'Create Circuit'}</Button>)}
        </Box>
      </Container>
    </>
  );
}

export default CreateCircuitPage;
