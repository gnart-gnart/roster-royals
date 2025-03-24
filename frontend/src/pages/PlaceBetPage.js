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
  CircularProgress
} from '@mui/material';
import NavBar from '../components/NavBar';
import { placeBet, getCompetitionEvents } from '../services/api';

function PlaceBetPage() {
  const { groupId, eventKey } = useParams();
  const navigate = useNavigate();

  // Define state variables for the form fields
  const [marketKey, setMarketKey] = useState('moneyline');
  const [outcomeKey, setOutcomeKey] = useState('home');
  const [amount, setAmount] = useState('');
  const [odds, setOdds] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [eventDetails, setEventDetails] = useState(null);

  // Fetch event details if possible
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // This is a simplified approach - in a real implementation, 
        // you would have an endpoint to get a specific event by key
        setFetchingEvent(true);
        
        // For now, this remains as a placeholder
        // In a real implementation, you would call an API like:
        // const event = await getEventDetails(eventKey);
        
        // Instead we'll simulate finding the event in a collection
        setEventDetails({
          key: eventKey,
          name: "Sample Event", // This would come from the API
          sport: "Basketball", // This would come from the API
          markets: {
            "moneyline": {
              name: "Moneyline",
              odds: 2.5
            },
            "spread": {
              name: "Spread",
              odds: 1.95
            }
          },
          outcomes: ["home", "away", "draw"]
        });
        
        // Set default odds based on event
        setOdds('2.5');
      } catch (err) {
        console.error('Failed to fetch event details:', err);
      } finally {
        setFetchingEvent(false);
      }
    };

    fetchEventDetails();
  }, [eventKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const betData = {
        groupId: parseInt(groupId, 10),
        eventKey: eventKey,
        marketKey: marketKey,
        outcomeKey: outcomeKey,
        amount: parseFloat(amount),
        odds: parseFloat(odds)
      };
      const result = await placeBet(betData);
      setSuccessMsg('Bet added to group successfully! Bet ID: ' + result.betId);
      
      // After successful bet placement, clear form
      setAmount('');
      
      // Optionally navigate to group page after short delay
      setTimeout(() => {
        navigate(`/group/${groupId}`);
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place bet.');
    }
    setLoading(false);
  };

  // Define market options
  const marketOptions = [
    { value: 'moneyline', label: 'Moneyline' },
    { value: 'spread', label: 'Spread' },
    { value: 'total', label: 'Total Points' },
  ];

  // Define outcome options
  const outcomeOptions = [
    { value: 'home', label: 'Home Team' },
    { value: 'away', label: 'Away Team' },
    { value: 'draw', label: 'Draw' },
  ];

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
            Add Bet to Group
          </Typography>
        </Box>

        <Card sx={{ 
          bgcolor: 'rgba(22, 28, 36, 0.6)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)', 
          mb: 3 
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 2 }}>
              Event Details
            </Typography>
            
            {fetchingEvent ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} sx={{ color: '#8B5CF6' }} />
              </Box>
            ) : (
              <>
                <Typography variant="body1" sx={{ color: '#CBD5E1', mb: 1 }}>
                  Event: {eventDetails?.name || eventKey}
                </Typography>
                <Typography variant="body1" sx={{ color: '#CBD5E1', mb: 1 }}>
                  Sport: {eventDetails?.sport || 'Not specified'}
                </Typography>
                <Typography variant="body1" sx={{ color: '#CBD5E1' }}>
                  Group ID: {groupId}
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

        <Card sx={{ 
          bgcolor: 'rgba(22, 28, 36, 0.6)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 3 }}>
              Bet Details
            </Typography>

            <form onSubmit={handleSubmit}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="market-select-label">Market Type</InputLabel>
                <Select
                  labelId="market-select-label"
                  value={marketKey}
                  onChange={(e) => setMarketKey(e.target.value)}
                  label="Market Type"
                >
                  {marketOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="outcome-select-label">Outcome</InputLabel>
                <Select
                  labelId="outcome-select-label"
                  value={outcomeKey}
                  onChange={(e) => setOutcomeKey(e.target.value)}
                  label="Outcome"
                >
                  {outcomeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Odds"
                type="number"
                value={odds}
                onChange={(e) => setOdds(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">@</InputAdornment>,
                }}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Amount (USD)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ mb: 3 }}
              />

              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center' 
              }}>
                {amount && odds && (
                  <Typography sx={{ color: '#CBD5E1' }}>
                    Potential Winnings: ${(parseFloat(amount) * parseFloat(odds)).toFixed(2)}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading || !amount || !odds}
                  sx={{
                    bgcolor: '#8B5CF6',
                    borderRadius: '20px',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 'medium',
                    px: 3,
                    '&:hover': {
                      backgroundColor: '#7C3AED',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'rgba(139, 92, 246, 0.3)',
                    },
                  }}
                >
                  {loading ? 'Adding bet...' : 'Add Bet to Group'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default PlaceBetPage;