import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Checkbox,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createCustomEvent, getLeague } from '../services/api';
import NavBar from '../components/NavBar';

const SPORT_OPTIONS = [
  'Test Event',
  'American Football',
  'Basketball',
  'Baseball',
  'Hockey',
  'Soccer',
  'MMA',
  'Boxing',
  'Tennis',
  'Golf',
  'Esports',
  'Other',
];

function CreateEventPage() {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [league, setLeague] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [simpleMode, setSimpleMode] = useState(true);
  const [formData, setFormData] = useState({
    eventName: 'Test Event',
    sport: 'Test Event',
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    commenceTime: new Date(Date.now() + 3600000), // Default to 1 hour from now
    endTime: new Date(Date.now() + 86400000), // Default to 24 hours from now
    homeAmericanOdds: -110,
    awayAmericanOdds: +110,
    oddsType: 'moneyline',  // 'moneyline' or 'spread'
    homeSpread: -3.5,
    awaySpread: +3.5,
  });

  // Check if user is the league captain
  const [isCaptain, setIsCaptain] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchLeague = async () => {
      try {
        setLoading(true);
        const data = await getLeague(leagueId);
        setLeague(data);
        
        // Check if current user is the captain
        if (data.captain.id === currentUser.id) {
          setIsCaptain(true);
        } else {
          setError('Only league captains can create events');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load league details');
        setLoading(false);
      }
    };

    fetchLeague();
  }, [leagueId, currentUser.id]);

  // Convert American odds to decimal for the backend
  const americanToDecimal = (american) => {
    if (!american) return 2.0;
    let decimal;
    if (american > 0) {
      decimal = (american / 100) + 1;
    } else {
      decimal = (100 / Math.abs(american)) + 1;
    }
    return parseFloat(decimal.toFixed(2));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form data
    if (!formData.eventName) {
      setError('Please provide an event name');
      return;
    }

    try {
      // Convert American odds to decimal for the backend
      const homeDecimalOdds = americanToDecimal(parseInt(formData.homeAmericanOdds));
      const awayDecimalOdds = americanToDecimal(parseInt(formData.awayAmericanOdds));
      
      // Prepare market data based on odds type
      let marketData;
      
      if (formData.oddsType === 'spread') {
        marketData = {
          key: 'spreads',
          outcomes: [
            { 
              name: 'home', 
              price: homeDecimalOdds,
              point: parseFloat(formData.homeSpread)
            },
            { 
              name: 'away', 
              price: awayDecimalOdds,
              point: parseFloat(formData.awaySpread)
            }
          ]
        };
      } else {
        // Default to moneyline (h2h)
        marketData = {
          key: 'h2h',
          outcomes: [
            { name: 'home', price: homeDecimalOdds },
            { name: 'away', price: awayDecimalOdds }
          ]
        };
      }

      // Create the event
      const eventData = {
        league_id: leagueId,
        event_name: formData.eventName,
        sport: formData.sport || 'Test Event',
        home_team: formData.homeTeam || 'Team A',
        away_team: formData.awayTeam || 'Team B',
        commence_time: formData.commenceTime.toISOString(),
        end_time: formData.endTime.toISOString(),
        market_data: marketData
      };

      const response = await createCustomEvent(eventData);
      setSuccess('Event created successfully!');
      
      // Redirect to league page after a short delay
      setTimeout(() => {
        navigate(`/league/${leagueId}`);
      }, 2000);
      
    } catch (err) {
      setError(`Error creating custom event: ${err.message}`);
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

  if (!isCaptain) {
    return (
      <>
        <NavBar />
        <Container sx={{ mt: 4 }}>
          <Alert severity="error">
            {error || 'Only league captains can create events'}
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/league/${leagueId}`)}
              variant="outlined"
            >
              Back to League
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
            onClick={() => navigate(`/league/${leagueId}`)}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Back to League
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom>
            Create Test Event
          </Typography>
          
          {league && (
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              For League: {league.name}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent>
            <FormControlLabel
              control={
                <Checkbox
                  checked={simpleMode}
                  onChange={(e) => setSimpleMode(e.target.checked)}
                />
              }
              label="Simple mode (quick setup for testing)"
            />

            <form onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Basic Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    name="eventName"
                    label="Event Name"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    placeholder="e.g., Test Match"
                  />
                </Grid>
                
                {!simpleMode && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Sport</InputLabel>
                        <Select
                          name="sport"
                          value={formData.sport}
                          onChange={handleInputChange}
                          label="Sport"
                        >
                          {SPORT_OPTIONS.map((sport) => (
                            <MenuItem key={sport} value={sport}>
                              {sport}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="homeTeam"
                        label="Home Team"
                        value={formData.homeTeam}
                        onChange={handleInputChange}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="awayTeam"
                        label="Away Team"
                        value={formData.awayTeam}
                        onChange={handleInputChange}
                        fullWidth
                      />
                    </Grid>
                  </>
                )}
              </Grid>

              {!simpleMode && (
                <>
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Timing
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                          label="Start Time"
                          value={formData.commenceTime}
                          onChange={(date) => handleDateChange('commenceTime', date)}
                          slotProps={{ 
                            textField: { 
                              fullWidth: true
                            } 
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                          label="End Time"
                          value={formData.endTime}
                          onChange={(date) => handleDateChange('endTime', date)}
                          slotProps={{ 
                            textField: { 
                              fullWidth: true
                            } 
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                </>
              )}

              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Betting Odds
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Odds Type</InputLabel>
                    <Select
                      name="oddsType"
                      value={formData.oddsType}
                      onChange={handleInputChange}
                      label="Odds Type"
                    >
                      <MenuItem value="moneyline">Moneyline (Winner Only)</MenuItem>
                      <MenuItem value="spread">Point Spread</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="homeAmericanOdds"
                    label="Home Team Odds"
                    value={formData.homeAmericanOdds}
                    onChange={handleInputChange}
                    fullWidth
                    type="number"
                    required
                    helperText="Negative value for favorites (e.g., -110)"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{formData.homeAmericanOdds < 0 ? "-" : "+"}</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="awayAmericanOdds"
                    label="Away Team Odds"
                    value={formData.awayAmericanOdds}
                    onChange={handleInputChange}
                    fullWidth
                    type="number"
                    required
                    helperText="Positive value for underdogs (e.g., +110)"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{formData.awayAmericanOdds < 0 ? "-" : "+"}</InputAdornment>,
                    }}
                  />
                </Grid>
                
                {formData.oddsType === 'spread' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="homeSpread"
                        label="Home Team Spread"
                        value={formData.homeSpread}
                        onChange={handleInputChange}
                        fullWidth
                        type="number"
                        required
                        helperText="Use negative for favorites (e.g., -3.5)"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">{formData.homeSpread < 0 ? "-" : "+"}</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="awaySpread"
                        label="Away Team Spread"
                        value={formData.awaySpread}
                        onChange={handleInputChange}
                        fullWidth
                        type="number"
                        required
                        helperText="Use positive for underdogs (e.g., +3.5)"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">{formData.awaySpread < 0 ? "-" : "+"}</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate(`/league/${leagueId}`)}
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Create Event
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

export default CreateEventPage; 