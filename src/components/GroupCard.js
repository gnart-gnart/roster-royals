import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import GroupIcon from '@mui/icons-material/Group';

const sportIcons = {
  nfl: SportsFootballIcon,
  nba: SportsBasketballIcon,
  mlb: SportsBaseballIcon,
  soccer: SportsSoccerIcon,
};

function GroupCard({ group, onClick }) {
  // Handle both old and new data structure
  const displaySports = () => {
    if (!group) return [];
    if (group.sports && Array.isArray(group.sports)) {
      return group.sports;
    }
    // Fallback for old data structure
    return group.sport ? [group.sport] : [];
  };

  return (
    <Card 
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(96, 165, 250, 0.2)',
        '&:hover': {
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          border: '1px solid rgba(96, 165, 250, 0.4)',
          transition: 'all 0.2s ease-in-out',
        },
      }}
    >
      <CardContent>
        <Typography variant="h6" component="div" color="primary">
          {group.name}
        </Typography>
        
        {/* Sports tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1, mb: 1 }}>
          {displaySports().map((sport) => (
            <Chip
              key={sport}
              label={sport.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                color: '#f8fafc',
              }}
            />
          ))}
        </Box>

        {/* Truncated description */}
        {group.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {group.description}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {group.members?.length || 0} members
        </Typography>
      </CardContent>
    </Card>
  );
}

export default GroupCard; 