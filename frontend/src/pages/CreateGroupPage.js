import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavBar from '../components/NavBar';
import { PrimaryButton, SecondaryButton } from '../components/ButtonBase';
import { SPORT_CONFIG } from '../styles/constants';

// Transform SPORT_CONFIG to a list format required by the form
const SPORTS_LIST = Object.keys(SPORT_CONFIG).map(key => ({
  key,
  name: SPORT_CONFIG[key].displayName
}));

function CreateGroupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sports: [],
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      const response = await createGroup(formData);
      // Navigate to the new group's page
      navigate(`/group/${response.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create group');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#0f0f13',
      pb: 8 
    }}>
      <NavBar />
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <SecondaryButton
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/home')}
            sx={{ mr: 2 }}
          >
            Back
          </SecondaryButton>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
            Create New Group
          </Typography>
        </Box>

        <Card sx={{
          backgroundColor: 'rgba(25, 25, 35, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'visible',
        }}>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  '& .MuiAlert-icon': {
                    color: '#f87171'
                  }
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Group Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }
                }}
              />

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }
                }}
              />

              <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel id="sports-label">Sports</InputLabel>
                <Select
                  labelId="sports-label"
                  multiple
                  value={formData.sports}
                  onChange={(e) => setFormData({ ...formData, sports: e.target.value })}
                  input={<OutlinedInput label="Sports" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const sportColor = SPORT_CONFIG[value]?.color || '#8b5cf6';
                        return (
                          <Chip 
                            key={value} 
                            label={value.toUpperCase()} 
                            sx={{ 
                              backgroundColor: `${sportColor}20`,
                              color: sportColor,
                              borderRadius: 1,
                              fontWeight: 'medium',
                              fontSize: '0.75rem',
                              border: `1px solid ${sportColor}40`,
                            }}
                          />
                        );
                      })}
                    </Box>
                  )}
                  sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {SPORTS_LIST.map((sport) => (
                    <MenuItem key={sport.key} value={sport.key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {SPORT_CONFIG[sport.key] && React.createElement(
                          SPORT_CONFIG[sport.key].icon, 
                          { sx: { color: SPORT_CONFIG[sport.key].color, fontSize: 20 } }
                        )}
                        {sport.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <PrimaryButton
                type="submit"
                fullWidth
                sx={{ p: 1.5 }}
              >
                Create Group
              </PrimaryButton>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default CreateGroupPage;
