import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Logout, TrendingUp } from '@mui/icons-material';

// Mock data for demonstration
const mockHRVData = [
  { date: '2024-01-01', hrv: 45, readiness: 'green' },
  { date: '2024-01-02', hrv: 52, readiness: 'green' },
  { date: '2024-01-03', hrv: 38, readiness: 'yellow' },
  { date: '2024-01-04', hrv: 41, readiness: 'yellow' },
  { date: '2024-01-05', hrv: 35, readiness: 'red' },
  { date: '2024-01-06', hrv: 48, readiness: 'green' },
  { date: '2024-01-07', hrv: 50, readiness: 'green' },
];

const mockHRVLog = [
  { id: 1, date: '2024-01-07', hrv: 50, readiness: 'green', time: '07:30' },
  { id: 2, date: '2024-01-06', hrv: 48, readiness: 'green', time: '07:15' },
  { id: 3, date: '2024-01-05', hrv: 35, readiness: 'red', time: '07:45' },
  { id: 4, date: '2024-01-04', hrv: 41, readiness: 'yellow', time: '07:20' },
  { id: 5, date: '2024-01-03', hrv: 38, readiness: 'yellow', time: '07:30' },
];

const AthleteDashboard = () => {
  const [timeRange, setTimeRange] = useState(7);
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

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
      case 'green': return 'Ready to Train';
      case 'yellow': return 'Moderate Recovery';
      case 'red': return 'Need Recovery';
      default: return 'No Data';
    }
  };

  const currentReadiness = mockHRVData[mockHRVData.length - 1]?.readiness || 'green';

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5 }}>
            {user ? `Welcome, ${user.name}` : ''}
          </Typography>
          <Typography variant="h4" component="h1">
            HRV Dashboard
          </Typography>
        </Box>
        <IconButton onClick={() => navigate('/login')}>
          <Logout />
        </IconButton>
      </Box>

      {/* Readiness Indicator */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: getReadinessColor(currentReadiness),
              mr: 2,
            }}
          >
            <TrendingUp />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h2">
              {getReadinessText(currentReadiness)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Latest HRV: {mockHRVData[mockHRVData.length - 1]?.hrv || 'N/A'} ms
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* HRV Graph */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h3">
            HRV Trend
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value={7}>7 Days</MenuItem>
              <MenuItem value={14}>14 Days</MenuItem>
              <MenuItem value={30}>30 Days</MenuItem>
              <MenuItem value={60}>60 Days</MenuItem>
              <MenuItem value={90}>90 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockHRVData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="hrv"
                stroke="#1976d2"
                strokeWidth={2}
                dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* HRV Log */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          HRV History
        </Typography>
        <List>
          {mockHRVLog.map((record) => (
            <ListItem
              key={record.id}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 1,
                '&:last-child': { mb: 0 },
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getReadinessColor(record.readiness) }}>
                  <TrendingUp />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">
                      {record.date} at {record.time}
                    </Typography>
                    <Chip
                      label={`${record.hrv} ms`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Chip
                    label={getReadinessText(record.readiness)}
                    size="small"
                    sx={{
                      bgcolor: getReadinessColor(record.readiness),
                      color: 'white',
                      mt: 1,
                    }}
                  />
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default AthleteDashboard; 