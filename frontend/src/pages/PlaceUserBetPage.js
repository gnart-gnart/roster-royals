import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  CircularProgress,
  Divider
} from '@mui/material';
import NavBar from '../components/NavBar';
import { getGroup, getGroupEvents } from '../services/api';

function PlaceUserBetPage() {
  const { groupId, eventKey } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});

  // State for the bet
  const [amount, setAmount] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [eventDetails, setEventDetails] = useState(null);
  const [group, setGroup] = useState(null);

  // Fetch event details from the group events
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingEvent(true);
        
        // Get group details
        const groupData = await getGroup(groupId);
        setGroup(groupData);

        // Get events from the group
        const eventsData = await getGroupEvents(groupId);
        if (eventsData && Array.isArray(eventsData)) {
          // Find the matching event
          const event = eventsData.find(e => e.event_key === eventKey);
          if (event) {
            setEventDetails({
              id: event.id,
              key: event.event_key,
              name: event.event_name,
              sport: event.sport,
              marketKey: event.market_data?.marketKey || 'moneyline',
              outcomeKey: event.market_data?.outcomeKey,
              odds: event.market_data?.odds || 2.5,
              amount: event.market_data?.amount,
              status: 'ACTIVE',
              created_at: event.created_at
            });
          } else {
            setErrorMsg('Event not found in this group');
          }
        }
      } catch (err) {
        console.error('Failed to fetch event details:', err);
        setErrorMsg('Failed to load event details. Please try again later.');
      } finally {
        setFetchingEvent(false);
      }
    };

    fetchData();
  }, [groupId, eventKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    
    try {
      // Ensure we have valid numeric values
      const betAmount = parseFloat(amount);
      const currentMoney = parseFloat(user.money || 0);
      
      // Check if user has enough money
      if (betAmount > currentMoney) {
        throw new Error('Insufficient funds to place this bet');
      }

      // Mock API call for now - we'll implement the actual API later
      // In a real implementation, you would call an API to place the user's bet
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Update user's money in localStorage (temporary - will be replaced with proper API)
      const updatedMoney = currentMoney - betAmount;
      const updatedUser = { 
        ...user, 
        money: parseFloat(updatedMoney.toFixed(2))
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSuccessMsg('Your bet has been placed successfully!');
      
      // After successful bet placement, clear form
      setAmount('');
      
      // Navigate to group page after short delay
      setTimeout(() => {
        navigate(`/group/${groupId}`);
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place bet.');
    }
    
    setLoading(false);
  };

  // Generate outcome options based on the market type
  const getOutcomeOptions = () => {
    const marketKey = eventDetails?.marketKey || 'moneyline';
    
    switch(marketKey) {
      case 'moneyline':
        return [
          { value: 'home', label: 'Home Team' },
          { value: 'away', label: 'Away Team' },
          { value: 'draw', label: 'Draw' }
        ];
      case 'spread':
        return [
          { value: 'home', label: 'Home Team (with spread)' },
          { value: 'away', label: 'Away Team (with spread)' }
        ];
      case 'total':
        return [
          { value: 'over', label: 'Over' },
          { value: 'under', label: 'Under' }
        ];
      default:
        return [
          { value: 'home', label: 'Home Team' },
          { value: 'away', label: 'Away Team' }
        ];
    }
  };

  // Calculate potential winnings
  const calculatePotentialWinnings = () => {
    if (!amount || !eventDetails?.odds) return '0.00';
    
    try {
      const betAmount = parseFloat(amount);
      const oddsValue = parseFloat(eventDetails.odds);
      
      if (isNaN(betAmount) || isNaN(oddsValue)) return '0.00';
      
      return (betAmount * oddsValue).toFixed(2);
    } catch (error) {
      console.error('Error calculating winnings:', error);
      return '0.00';
    }
  };

  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
      <NavBar />
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Button
            variant="text"
            onClick={() => navigate(-1)}
            sx={{
              color: '#f8fafc',
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
            Place Your Bet
          </Typography>
        </Box>

        {/* User Money Display */}
        <Card sx={{ 
          bgcolor: 'rgba(22, 28, 36, 0.6)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)', 
          mb: 3 
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 2 }}>
              Your Balance
            </Typography>
            <Typography variant="h4" sx={{ color: '#10B981', fontWeight: 'bold', mb: 1 }}>
              ${typeof user.money === 'number' ? user.money.toFixed(2) : '0.00'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
              Available for betting
            </Typography>
          </CardContent>
        </Card>

        {/* Event Details Card */}
        <Card sx={{ 
          bgcolor: 'rgba(22, 28, 36, 0.6)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)', 
          mb: 3 
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 2 }}>
              Bet Details
            </Typography>
            
            {fetchingEvent ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} sx={{ color: '#8B5CF6' }} />
              </Box>
            ) : !eventDetails ? (
              <Typography variant="body1" sx={{ color: '#CBD5E1' }}>
                Event not found
              </Typography>
            ) : (
              <>
                <Typography variant="body1" sx={{ color: '#CBD5E1', mb: 1 }}>
                  Event: {eventDetails.name}
                </Typography>
                <Typography variant="body1" sx={{ color: '#CBD5E1', mb: 1 }}>
                  Sport: {eventDetails.sport}
                </Typography>
                <Typography variant="body1" sx={{ color: '#CBD5E1', mb: 1 }}>
                  Market: {eventDetails.marketKey === 'moneyline' ? 'Moneyline' : 
                           eventDetails.marketKey === 'spread' ? 'Spread' : 
                           eventDetails.marketKey === 'total' ? 'Total Points' : 
                           eventDetails.marketKey}
                </Typography>
                <Typography variant="body1" sx={{ color: '#CBD5E1', mb: 1 }}>
                  Odds: {eventDetails.odds}
                </Typography>
                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                  Group: {group?.name || groupId}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        {/* Place Bet Form */}
        <Card sx={{ 
          bgcolor: 'rgba(22, 28, 36, 0.6)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 3 }}>
              Place Your Bet
            </Typography>

            <form onSubmit={handleSubmit}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="outcome-select-label">Choose Outcome</InputLabel>
                <Select
                  labelId="outcome-select-label"
                  value={selectedOutcome}
                  onChange={(e) => setSelectedOutcome(e.target.value)}
                  label="Choose Outcome"
                  disabled={fetchingEvent || !eventDetails}
                >
                  {getOutcomeOptions().map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Amount to Bet (USD)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                disabled={fetchingEvent || !eventDetails}
                sx={{ mb: 3 }}
              />

              <Box sx={{ 
                bgcolor: 'rgba(16, 185, 129, 0.1)', 
                p: 2, 
                borderRadius: '8px',
                mb: 3,
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 'medium', mb: 1 }}>
                  Potential Winnings
                </Typography>
                <Typography variant="h5" sx={{ color: '#10B981', fontWeight: 'bold' }}>
                  ${calculatePotentialWinnings()}
                </Typography>
              </Box>

              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={loading || !amount || !selectedOutcome || fetchingEvent || !eventDetails}
                sx={{
                  bgcolor: '#8B5CF6',
                  color: 'white',
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 'medium',
                  '&:hover': {
                    backgroundColor: '#7C3AED',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(139, 92, 246, 0.3)',
                  },
                }}
              >
                {loading ? 'Processing...' : 'Place Bet'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default PlaceUserBetPage; 