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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavBar from '../components/NavBar';

const SPORTS_LIST = ['NFL', 'NBA', 'MLB', 'Soccer', 'NHL', 'UFC'];

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
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/home')}
            sx={{
              mr: 2,
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#f8fafc',
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.6)',
              },
              borderRadius: 1,
            }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
            Create New Group
          </Typography>
        </Box>

        <Card sx={{
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          border: '1px solid rgba(139, 92, 246, 0.2)',
          overflow: 'visible',
        }}>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Box sx={{ 
                p: 2, 
                mb: 3, 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                borderRadius: 1,
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171'
              }}>
                {error}
              </Box>
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
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={value} 
                          sx={{ 
                            backgroundColor: 'rgba(139, 92, 246, 0.2)',
                            color: '#a78bfa',
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {SPORTS_LIST.map((sport) => (
                    <MenuItem key={sport} value={sport.toLowerCase()}>
                      {sport}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  p: 1.5,
                  backgroundColor: '#8b5cf6',
                  '&:hover': {
                    backgroundColor: '#7c3aed',
                  },
                  borderRadius: 1,
                  fontWeight: 'bold',
                }}
              >
                Create Group
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default CreateGroupPage;
