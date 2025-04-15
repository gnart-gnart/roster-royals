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
  ListItemIcon
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeague, getLeagueEvents, createCircuit } from '../services/api';
import NavBar from '../components/NavBar';

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
  }, [leagueId, currentUser.id]);

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

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <TextField
                  name="name"
                  label="Circuit Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                />
                <TextField
                  name="description"
                  label="Description (Optional)"
                  value={formData.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                />
                <TextField
                  name="entry_fee"
                  label="Entry Fee"
                  value={formData.entry_fee}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  type="number"
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                />
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>Timing (Optional)</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DateTimePicker
                        label="Start Date"
                        value={formData.start_date}
                        onChange={(date) => handleDateChange('start_date', date)}
                        slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DateTimePicker
                        label="End Date"
                        value={formData.end_date}
                        onChange={(date) => handleDateChange('end_date', date)}
                        slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                      />
                    </Grid>
                  </Grid>
                </LocalizationProvider>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Component Events</Typography>
                {availableEvents.length === 0 ? (
                  <Typography>No available events in this league to add.</Typography>
                ) : (
                  <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 3 }}>
                    <List dense>
                      {availableEvents.map((event) => {
                        const isSelected = selectedEvents.some(item => item.eventId === event.id);
                        const currentWeight = selectedEvents.find(item => item.eventId === event.id)?.weight || 0;
                        return (
                          <ListItem
                            key={event.id}
                            secondaryAction={
                              isSelected ? (
                                <Box display="flex" alignItems="center">
                                  <IconButton size="small" onClick={() => handleWeightChange(event.id, -1)} disabled={currentWeight <= 1}>
                                    <RemoveIcon fontSize="inherit"/>
                                  </IconButton>
                                  <Typography sx={{ mx: 1 }}>{currentWeight}</Typography>
                                  <IconButton size="small" onClick={() => handleWeightChange(event.id, 1)}>
                                    <AddIcon fontSize="inherit"/>
                                  </IconButton>
                                </Box>
                              ) : null
                            }
                            disablePadding
                          >
                            <ListItemIcon sx={{ minWidth: 0, mr: 1 }}>
                              <Checkbox
                                edge="start"
                                checked={isSelected}
                                onChange={() => handleEventSelection(event.id)}
                                tabIndex={-1}
                                disableRipple
                              />
                            </ListItemIcon>
                            <ListItemText primary={event.event_name} secondary={event.sport} />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>Tiebreaker Event (Optional)</Typography>
                 <FormControl fullWidth margin="normal" disabled={selectedEvents.length === 0}>
                    <InputLabel>Select Tiebreaker</InputLabel>
                    <Select
                        name="tiebreaker_event_id"
                        value={formData.tiebreaker_event_id}
                        onChange={handleInputChange}
                        label="Select Tiebreaker"
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {selectedEvents.map(selected => {
                            const eventDetail = availableEvents.find(ev => ev.id === selected.eventId);
                            if (eventDetail && eventDetail.betting_type !== 'standard') {
                                return (
                                    <MenuItem key={eventDetail.id} value={eventDetail.id}>
                                        {eventDetail.event_name}
                                    </MenuItem>
                                );
                            }
                            return null;
                        })}
                    </Select>
                    <Typography variant="caption" color="text.secondary" sx={{mt: 1}}>
                        Only selected component events with a tiebreaker betting type (e.g., Closest Guess) can be chosen.
                    </Typography>
                </FormControl>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(`/league/${leagueId}`)}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Circuit'}
            </Button>
          </Box>
        </form>
      </Container>
    </>
  );
}

export default CreateCircuitPage;
