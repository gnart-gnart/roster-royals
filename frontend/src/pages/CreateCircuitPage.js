import React, { useState, useEffect, useCallback } from 'react';
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
  SvgIcon
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
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsRugbyIcon from '@mui/icons-material/SportsRugby';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import SportsIcon from '@mui/icons-material/Sports';
import SearchIcon from '@mui/icons-material/Search';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeague, getLeagueEvents, createCircuit, browseMarket, getAvailableSportEvents, placeBet, createCustomEvent } from '../services/api';
import NavBar from '../components/NavBar';
import { format } from 'date-fns';
import { getAllMarketEvents, getAvailableSports } from '../services/api';

// Custom Cricket Icon
const CricketIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M5,8L7,8L7,16L5,16L5,8M9,8L11,8L11,16L9,16L9,8M13,8L17,8L17,16L13,16L13,8Z" />
  </SvgIcon>
);

// Custom Boxing Icon
const BoxingIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M19,3H15V1H19M11,3H5V1H11M19,19H15V21H19M11,19H5V21H11M19,7H15V5H19M11,7H5V5H11M19,11H15V9H19M11,11H5V9H11M19,15H15V13H19M11,15H5V13H11M15,17H13V23H15M9,17H7V23H9M13,17H11V23H13M5,17H3V23H5M17,17H15V23H17" />
  </SvgIcon>
);

// Custom GavelIcon (Politics) component
const GavelIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M5.2496 8.0688L2.5616 5.3808L5.2576 2.6848L13.5616 10.9888L10.8656 13.6848L8.1776 10.9968C7.6736 13.4688 8.3296 16.1168 10.1936 18.0128C10.9936 18.8128 11.9456 19.3688 12.9456 19.7328L10.0576 22.6208C8.9016 23.7768 7.0536 23.7768 5.8976 22.6208C4.7936 21.4848 4.7936 19.7648 5.8976 18.6608L7.8176 16.7408C6.8856 15.2368 6.4536 13.4488 6.6056 11.6248L3.9456 8.9248L2.4216 10.4688C2.0296 10.8608 1.3976 10.8608 1.0056 10.4688C0.6136 10.0768 0.6136 9.4448 1.0056 9.0528L5.2496 4.8088C5.6416 4.4168 6.2736 4.4168 6.6656 4.8088C7.0576 5.2008 7.0576 5.8328 6.6656 6.2248L5.2496 8.0688ZM15.7926 4.2448C17.1886 2.8488 19.4566 2.8488 20.8526 4.2448C22.2486 5.6408 22.2486 7.9088 20.8526 9.3048L19.4486 10.7088L17.0966 8.3568C16.7046 7.9648 16.0726 7.9648 15.6806 8.3568C15.2886 8.7488 15.2886 9.3808 15.6806 9.7728L18.0326 12.1248L13.9766 16.1808L10.0966 12.3008L15.7926 6.6048L14.3766 5.1888L15.7926 4.2448Z" />
  </SvgIcon>
);

// Function to get the icon for a sport group
const getSportIcon = (sportGroup) => {
  const iconMapping = {
    'Soccer': <SportsSoccerIcon fontSize="large" />,
    'Basketball': <SportsBasketballIcon fontSize="large" />,
    'American Football': <SportsFootballIcon fontSize="large" />,
    'Baseball': <SportsBaseballIcon fontSize="large" />,
    'Hockey': <SportsHockeyIcon fontSize="large" />,
    'Tennis': <SportsTennisIcon fontSize="large" />,
    'Golf': <SportsGolfIcon fontSize="large" />,
    'MMA': <SportsMmaIcon fontSize="large" />,
    'Boxing': <BoxingIcon fontSize="large" />,
    'Rugby': <SportsRugbyIcon fontSize="large" />,
    'Cricket': <CricketIcon fontSize="large" />,
    'Politics': <GavelIcon fontSize="large" />
  };
  
  return iconMapping[sportGroup] || <SportsIcon fontSize="large" />;
};

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

  // Move loadMarketData function definition before useEffect
  const loadMarketData = useCallback(async () => {
    if (loadingMarket) {
      console.log('Already loading market data, skipping duplicate call');
      return;
    }
    
    setLoadingMarket(true);
    setMarketError(null);
    console.log('Fetching market data...');
    
    try {
      const marketData = await browseMarket();
      console.log('Market data received:', marketData);
      
      if (!marketData || typeof marketData !== 'object') {
        throw new Error('Invalid market data format');
      }
      
      // Check if the data contains grouped_sports in the expected format
      if (marketData?.data?.grouped_sports) {
        console.log('Found grouped_sports data:', marketData.data.grouped_sports);
        setSportsGroups(marketData.data.grouped_sports);
        setAllSports(marketData.data.sports || []);
      } else {
        console.warn('No grouped_sports found in market data');
        setSportsGroups({});
        setAllSports([]);
        setMarketError('No sports available at the moment');
      }
    } catch (error) {
      console.error('Error loading market data:', error);
      setSportsGroups({});
      setAllSports([]);
      setMarketError(`Failed to load sports: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingMarket(false);
    }
  }, [loadingMarket]);

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
          
          // Always load market data on mount
          if (!Object.keys(sportsGroups).length) {
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
  }, [leagueId, currentUser.id, loadMarketData, sportsGroups]);

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

  const handleTiebreakerSelect = (eventId) => {
    // Allow any event to be selected as a tiebreaker
    setFormData(prev => ({ ...prev, tiebreaker_event_id: eventId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedEvents.length === 0) {
      setError('Please select at least one component event.');
      return;
    }
    
    // Validate that the tiebreaker event is one of the component events if provided
    if (formData.tiebreaker_event_id && !selectedEvents.some(item => 
      item.id === formData.tiebreaker_event_id || item.eventId === formData.tiebreaker_event_id)) {
        setError('The selected tiebreaker must be one of the component events.');
        return;
    }

    try {
      setLoading(true);
      
      // Prepare the circuit data for the API - format according to what the backend expects
      const circuitData = {
        name: formData.name,
        description: formData.description || '',
        entry_fee: parseFloat(formData.entry_fee).toFixed(2),
        component_events_data: selectedEvents.map(item => ({
          league_event_id: item.id || item.eventId, // Use the ID from the database
          weight: item.weight || 1, // Ensure weight is at least 1
        })),
        tiebreaker_event_id: formData.tiebreaker_event_id || null,
      };

      // Add optional date fields if provided
      if (formData.start_date) {
        circuitData.start_date = formData.start_date.toISOString();
      }
      if (formData.end_date) {
        circuitData.end_date = formData.end_date.toISOString();
      }

      console.log('Creating circuit with data:', circuitData);

      // Call the API to create the circuit
      await createCircuit(leagueId, circuitData);
      setSuccess('Circuit created successfully!');
      
      // Navigate back to the league page after a short delay
      setTimeout(() => navigate(`/league/${leagueId}`), 2000);
    } catch (err) {
      console.error('Error creating circuit:', err);
      setError(err.message || 'Failed to create circuit. Please try again.');
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
    // Check if this event is already added to the selected events
    if (selectedEvents.some(item => 
      item.id === event.id || 
      item.eventId === event.id || 
      (item.event_key === event.id && item.event_name === `${event.away_team} @ ${event.home_team}`)
    )) {
      setSuccess('');
      setError('This event is already added to your circuit.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setError('');
    setLoadingMarket(true);
    
    // First check if this event already exists in the league's events
    getLeagueEvents(leagueId)
      .then(existingEvents => {
        // Try to find if this event already exists in the league
        const existingEvent = existingEvents.find(e => 
          e.event_key === event.id || 
          (e.home_team === event.home_team && 
           e.away_team === event.away_team && 
           new Date(e.commence_time).toDateString() === new Date(event.commence_time).toDateString())
        );
        
        if (existingEvent) {
          console.log('Event already exists in the league, using existing event:', existingEvent);
          // Use the existing event
          const newEvent = {
            id: existingEvent.id,
            eventId: existingEvent.id,
            event_name: existingEvent.event_name,
            sport: existingEvent.sport,
            home_team: existingEvent.home_team,
            away_team: existingEvent.away_team,
            commence_time: existingEvent.commence_time,
            event_key: existingEvent.event_key,
            custom: false,
            answerType: 'market',
            weight: 1
          };
          setSelectedEvents(prev => [...prev, newEvent]);
          setSuccess(`${newEvent.event_name} added to circuit.`);
          setTimeout(() => setSuccess(''), 3000);
          setLoadingMarket(false);
        } else {
          // Event doesn't exist, create a new one
          // Prepare data for the API
          const eventData = {
            leagueId: leagueId,
            eventKey: event.id,
            eventId: event.id,
            eventName: `${event.away_team} @ ${event.home_team}`,
            sport: event.sport_key || event.sport,
            commenceTime: event.commence_time,
            homeTeam: event.home_team,
            awayTeam: event.away_team,
            // Include market data if available
            marketData: event.bookmakers && event.bookmakers.length > 0 
              ? { bookmaker: event.bookmakers[0].key, markets: event.bookmakers[0].markets }
              : {}
          };
          
          // Call the API to add this event to the league
          return placeBet(eventData);
        }
      })
      .then(response => {
        if (!response) return; // Skip if we used an existing event
        
        // Once the event is saved to the database, add it to the local state
        const newEvent = {
          id: response.id || response.event?.id || event.id, // Use the returned ID if available
          eventId: response.id || response.event?.id || event.id,
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
        setSuccess(`${newEvent.event_name} added to circuit.`);
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(error => {
        console.error('Error adding market event:', error);
        setError(`Failed to add event: ${error.message || 'Unknown error'}`);
        setTimeout(() => setError(''), 5000);
      })
      .finally(() => {
        setLoadingMarket(false);
      });
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
    
    setLoading(true);
    
    // Determine the betting type based on the answer type
    let betting_type = 'standard';
    
    // Prepare data for the API
    const eventData = {
      league_id: leagueId,
      event_name: customEvent.name,
      sport: customEvent.sport,
      home_team: customEvent.homeTeam || '',
      away_team: customEvent.awayTeam || '',
      commence_time: customEvent.startTime.toISOString(),
      betting_type: betting_type,
      market_data: {
        custom: true,
        answerType: customEvent.answerType,
        answerOptions: answerOptions
      }
    };
    
    // Call the API to create the custom event
    createCustomEvent(eventData)
      .then(response => {
        // Once the event is created in the database, add it to the local state
        const newEvent = {
          id: response.event.id,
          eventId: response.event.id,
          event_name: response.event.event_name,
          sport: response.event.sport,
          home_team: response.event.home_team,
          away_team: response.event.away_team,
          commence_time: response.event.commence_time,
          event_key: response.event.event_key,
          custom: true,
          answerType: customEvent.answerType,
          answerOptions: answerOptions,
          weight: 1,
          betting_type: betting_type
        };
        setSelectedEvents(prev => [...prev, newEvent]);
        setSuccess(`Custom event "${customEvent.name}" created successfully.`);
        
        // Reset the form
        setCustomEvent({
          name: '', sport: '', homeTeam: '', awayTeam: '',
          startTime: new Date(Date.now() + 86400000),
          answerType: 'number', answerOptionsString: '',
        });
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(error => {
        console.error('Error creating custom event:', error);
        setError(`Failed to create custom event: ${error.message || 'Unknown error'}`);
        setTimeout(() => setError(''), 5000);
      })
      .finally(() => {
        setLoading(false);
      });
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

  const handleGroupSelect = useCallback((group) => {
    console.log('Group selected:', group);
    setSelectedGroup(group);
    setViewState('sports');
  }, []);

  const handleSportSelect = useCallback((sport) => {
    console.log('Sport selected:', sport);
    
    if (!sport || typeof sport !== 'string' || sport.trim() === '') {
      console.error('Invalid sport selected:', sport);
      setMarketError('Invalid sport selection');
      return;
    }
    
    // Format sport for API call - lowercase and replace spaces with underscores
    const formattedSport = sport.toLowerCase().replace(/\s+/g, '_');
    console.log('Formatted sport for API:', formattedSport);
    
    setSelectedSport(sport);
    setViewState('events');
    setLoadingMarket(true);
    setMarketError(null);
    
    getAvailableSportEvents(formattedSport)
      .then(events => {
        console.log('Received events:', events);
        if (Array.isArray(events)) {
          // More robust filtering of valid events
          const validEvents = events.filter(event => {
            if (!event || typeof event !== 'object') return false;
            // Check for required properties
            if (!event.id || !event.home_team || !event.away_team || !event.commence_time) {
              console.warn('Skipping event with missing properties:', event);
              return false;
            }
            return true;
          });
          console.log(`Found ${validEvents.length} valid events to display out of ${events.length} total`);
          setMarketEvents(validEvents);
          setSearchTerm('');
        } else {
          console.error('Expected events array but got:', events);
          setMarketEvents([]);
          setMarketError('No events available for this sport');
        }
      })
      .catch(error => {
        console.error('Failed to load events for sport:', sport, error);
        setMarketEvents([]);
        setMarketError(`Error loading events: ${error.message || 'Unknown error'}`);
      })
      .finally(() => {
        setLoadingMarket(false);
      });
  }, []);

  const handleBackToGroups = useCallback(() => {
    setViewState('groups');
    setSelectedGroup(null);
  }, []);

  const handleBackToSports = useCallback(() => {
    setViewState('sports');
    setSelectedSport(null);
    setMarketEvents([]);
  }, []);

  // === Render Functions ===

  // --- Step 1 Render Functions ---
  const renderMarketSportsGroups = () => {
    if (loadingMarket) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (marketError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="body1">
            {marketError}
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }} 
            onClick={() => {
              setMarketError(null);
              loadMarketData();
            }}
          >
            Retry
          </Button>
        </Box>
      );
    }

    // Check if sportsGroups is an object with keys
    const groups = Object.keys(sportsGroups);
    if (!groups || groups.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No sports groups found.</Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3} sx={{ p: 3 }}>
        {groups.map((group) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={group}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: 6,
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '150px',
              }}
              onClick={() => handleGroupSelect(group)}
            >
              <Box sx={{ mb: 2 }}>
                {getSportIcon(group)}
              </Box>
              <Typography variant="h6">{group}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderMarketSports = () => {
    if (!selectedGroup || !sportsGroups[selectedGroup]) return null;
    
    const sports = sportsGroups[selectedGroup];
    if (!Array.isArray(sports) || sports.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No sports found in this category.</Typography>
          <Button 
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToGroups}
            sx={{ mt: 2 }}
          >
            Back to Categories
          </Button>
        </Box>
      );
    }
    
    return (
      <>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackToGroups}
            sx={{ mr: 2 }}
          >
            Back to Categories
          </Button>
          <Typography variant="h5" component="div">
            Sports in {selectedGroup}
          </Typography>
        </Box>
        
        <List component={Paper} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', borderRadius: '12px' }}>
          {sports.map((sport) => (
            <ListItem 
              key={sport.key} 
              button 
              onClick={() => handleSportSelect(sport.key)}
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

    // Helper function to check if an event is already in selectedEvents
    const isEventAdded = (event) => {
      return selectedEvents.some(item => 
        item.id === event.id || 
        item.eventId === event.id || 
        item.event_key === event.id ||
        (item.home_team === event.home_team && 
         item.away_team === event.away_team &&
         new Date(item.commence_time).toDateString() === new Date(event.commence_time).toDateString())
      );
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
            onClick={handleBackToSports}
            sx={{ mr: 2 }}
          >
            Back to Sports
          </Button>
          <Typography variant="h5" component="div">
            Events for {selectedSport}
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
                {filteredEvents.map((event) => {
                  const added = isEventAdded(event);
                  return (
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
                          disabled={added}
                        >
                          {added ? 'Added' : 'Add Event'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
            <Box component="div" sx={{ p: 3 }}>
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
                  <Button variant="contained" color="primary" onClick={handleAddCustomEvent} startIcon={<AddIcon />}>Add Custom Event</Button>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
          <Divider />
           <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', bgcolor: 'background.paper' }}>
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
                                                    <TextField 
                                                      type="number" 
                                                      size="small" 
                                                      value={event.weight} 
                                                      onChange={(e) => {
                                                        const value = parseInt(e.target.value) || 1;
                                                        setSelectedEvents(prev => 
                                                          prev.map(item => 
                                                            item.id === event.id ? { ...item, weight: Math.max(1, value) } : item
                                                          )
                                                        );
                                                      }} 
                                                      inputProps={{ min: 1, style: { textAlign: 'center', width: '35px', height: '20px' } }} 
                                                      sx={{ '& .MuiInputBase-root': {height: '30px'} }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Select as tiebreaker event">
                                                        <span>
                                                        <Radio 
                                                          checked={formData.tiebreaker_event_id === event.id} 
                                                          onChange={() => handleTiebreakerSelect(event.id)} 
                                                          value={event.id} 
                                                          name="tiebreaker-radio" 
                                                          size="small" 
                                                          sx={{ p: 0 }}
                                                        />
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
