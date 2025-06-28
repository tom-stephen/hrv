import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { FitnessCenter, Person } from '@mui/icons-material';

const Login = () => {
  const [userType, setUserType] = useState('athlete');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'athlete',
  });
  const [signUpError, setSignUpError] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, userType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Navigate based on user type
      if (data.user.userType === 'athlete') {
        navigate('/athlete');
      } else {
        navigate('/coach');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpOpen = () => {
    setShowSignUp(true);
    setSignUpError('');
    setSignUpData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: 'athlete',
    });
  };

  const handleSignUpClose = () => {
    setShowSignUp(false);
    setSignUpError('');
    setSignUpLoading(false);
  };

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpError('');
    setSignUpLoading(true);
    if (signUpData.password !== signUpData.confirmPassword) {
      setSignUpError('Passwords do not match');
      setSignUpLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signUpData.name,
          email: signUpData.email,
          password: signUpData.password,
          userType: signUpData.userType,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed');
      }
      // Auto-login after sign up
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setShowSignUp(false);
      if (data.user.userType === 'athlete') {
        navigate('/athlete');
      } else {
        navigate('/coach');
      }
    } catch (err) {
      setSignUpError(err.message);
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            HRV Tracker
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your heart rate variability for optimal performance
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <ToggleButtonGroup
          value={userType}
          exclusive
          onChange={(e, newValue) => newValue && setUserType(newValue)}
          sx={{ width: '100%', mb: 3 }}
        >
          <ToggleButton value="athlete" sx={{ flex: 1 }}>
            <FitnessCenter sx={{ mr: 1 }} />
            Athlete
          </ToggleButton>
          <ToggleButton value="coach" sx={{ flex: 1 }}>
            <Person sx={{ mr: 1 }} />
            Coach
          </ToggleButton>
        </ToggleButtonGroup>

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            variant="outlined"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          size="large"
          sx={{ mb: 2 }}
          onClick={handleSignUpOpen}
        >
          Sign Up
        </Button>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Test accounts:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Athlete: athlete@test.com / password123
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Coach: coach@test.com / password123
          </Typography>
        </Box>
      </Paper>

      {/* Sign Up Dialog */}
      <Dialog open={showSignUp} onClose={handleSignUpClose} fullWidth maxWidth="xs">
        <DialogTitle>Sign Up</DialogTitle>
        <DialogContent>
          {signUpError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {signUpError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSignUp} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={signUpData.name}
              onChange={handleSignUpChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={signUpData.email}
              onChange={handleSignUpChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={signUpData.password}
              onChange={handleSignUpChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={signUpData.confirmPassword}
              onChange={handleSignUpChange}
              margin="normal"
              required
            />
            <ToggleButtonGroup
              value={signUpData.userType}
              exclusive
              onChange={(e, newValue) => newValue && setSignUpData((prev) => ({ ...prev, userType: newValue }))}
              sx={{ width: '100%', mt: 2, mb: 2 }}
            >
              <ToggleButton value="athlete" sx={{ flex: 1 }}>
                <FitnessCenter sx={{ mr: 1 }} />
                Athlete
              </ToggleButton>
              <ToggleButton value="coach" sx={{ flex: 1 }}>
                <Person sx={{ mr: 1 }} />
                Coach
              </ToggleButton>
            </ToggleButtonGroup>
            <DialogActions>
              <Button onClick={handleSignUpClose} color="secondary">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={signUpLoading}
              >
                {signUpLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Login; 