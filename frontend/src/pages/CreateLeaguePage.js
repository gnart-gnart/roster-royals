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
import { createLeague } from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageCropper from '../components/ImageCropper';

const SPORTS_LIST = ['NFL', 'NBA', 'MLB', 'Soccer', 'NHL', 'UFC'];

function CreateLeaguePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sports: [],
    image: null
  });
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('League name is required');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('sports', JSON.stringify(formData.sports));
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await createLeague(formDataToSend);
      navigate(`/league/${response.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create league');
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setShowCropper(true);
    }
  };

  const handleCropComplete = (croppedImage) => {
    setFormData({
      ...formData,
      image: croppedImage
    });
    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setSelectedImage(null);
    setShowCropper(false);
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
            Create New League
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="League Name"
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

            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                mt: 2,
                borderColor: '#8B5CF6',
                color: '#8B5CF6',
                '&:hover': {
                  borderColor: '#7C3AED',
                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                },
              }}
            >
              Upload League Image (Optional)
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>

            {formData.image && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <img
                  src={URL.createObjectURL(formData.image)}
                  alt="League preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            )}

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
              Create League
            </Button>
          </form>
        </Card>
      </Box>

      {showCropper && selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </Container>
  );
}

export default CreateLeaguePage; 