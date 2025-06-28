import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Logout,
  Add,
  Person,
  TrendingUp,
} from '@mui/icons-material';

// Mock data for demonstration
const mockAthletes = [
  { id: 1, name: 'John Smith', readiness: 'green', lastHRV: 52, lastDate: '2024-01-07' },
  { id: 2, name: 'Sarah Johnson', readiness: 'yellow', lastHRV: 38, lastDate: '2024-01-07' },
  { id: 3, name: 'Mike Davis', readiness: 'red', lastHRV: 35, lastDate: '2024-01-06' },
  { id: 4, name: 'Emma Wilson', readiness: 'green', lastHRV: 48, lastDate: '2024-01-07' },
  { id: 5, name: 'Alex Brown', readiness: 'yellow', lastHRV: 41, lastDate: '2024-01-06' },
];

const CoachDashboard = () => {
  const [athletes, setAthletes] = useState(mockAthletes);
  const [openDialog, setOpenDialog] = useState(false);
  const [newAthleteName, setNewAthleteName] = useState('');
  const navigate = useNavigate();

  const getReadinessColor = (readiness) => {
    switch (readiness) {
      case 'green': return '#4caf50';
      case 'yellow': return '#ff9800';
      case 'red': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getReadinessText = (readiness) => {
    switch (readiness) {
      case 'green': return 'Ready';
      case 'yellow': return 'Moderate';
      case 'red': return 'Recovery';
      default: return 'No Data';
    }
  };

  const handleAddAthlete = () => {
    if (newAthleteName.trim()) {
      const newAthlete = {
        id: athletes.length + 1,
        name: newAthleteName,
        readiness: 'green',
        lastHRV: 0,
        lastDate: 'No data',
      };
      setAthletes([...athletes, newAthlete]);
      setNewAthleteName('');
      setOpenDialog(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Coach Dashboard
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{ mr: 2 }}
          >
            Add Athlete
          </Button>
          <IconButton onClick={() => navigate('/login')}>
            <Logout />
          </IconButton>
        </Box>
      </Box>

      {/* Athletes List */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          Athletes ({athletes.length})
        </Typography>
        <List>
          {athletes.map((athlete) => (
            <ListItem
              key={athlete.id}
              button
              onClick={() => navigate(`/coach/athlete/${athlete.id}`)}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 1,
                '&:last-child': { mb: 0 },
                '&:hover': {
                  bgcolor: '#f5f5f5',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getReadinessColor(athlete.readiness) }}>
                  <Person />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {athlete.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={getReadinessText(athlete.readiness)}
                        size="small"
                        sx={{
                          bgcolor: getReadinessColor(athlete.readiness),
                          color: 'white',
                        }}
                      />
                      {athlete.lastHRV > 0 && (
                        <Chip
                          label={`${athlete.lastHRV} ms`}
                          size="small"
                          variant="outlined"
                          icon={<TrendingUp />}
                        />
                      )}
                    </Box>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    Last HRV: {athlete.lastDate}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Add Athlete Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Athlete</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Athlete Name"
            fullWidth
            variant="outlined"
            value={newAthleteName}
            onChange={(e) => setNewAthleteName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddAthlete()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddAthlete} variant="contained">
            Add Athlete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CoachDashboard; 