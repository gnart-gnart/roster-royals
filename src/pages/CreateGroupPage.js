import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Card,
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
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/home')}
          sx={{
            mb: 2,
            backgroundColor: 'rgba(96, 165, 250, 0.1)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            color: '#f8fafc',
            '&:hover': {
              backgroundColor: 'rgba(96, 165, 250, 0.2)',
              border: '1px solid rgba(96, 165, 250, 0.6)',
            },
          }}
        >
          Back
        </Button>

        <Card sx={{
          p: 3,
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(96, 165, 250, 0.2)',
        }}>
          <Typography variant="h5" gutterBottom>
            Create New Group
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Group Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              margin="normal"
              error={!!error && !formData.name}
              helperText={error && !formData.name ? error : ''}
            />

            <TextField
              fullWidth
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Sports (Optional)</InputLabel>
              <Select
                multiple
                value={formData.sports}
                onChange={(e) => setFormData({ ...formData, sports: e.target.value })}
                input={<OutlinedInput label="Sports (Optional)" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {SPORTS_LIST.map((sport) => (
                  <MenuItem key={sport} value={sport}>
                    {sport}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
            >
              Create Group
            </Button>
          </form>
        </Card>
      </Box>
    </Container>
  );
}

export default CreateGroupPage;
