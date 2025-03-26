import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API base URL - use full URL with port
const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to dynamically add the token to each request
api.interceptors.request.use(
  (config) => {
    // Get the current token from localStorage for each request
    const token = localStorage.getItem('token');
    console.log('Using token for request:', token);

    // Add the token to the headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add debugging interceptor to see what's actually being sent
api.interceptors.request.use(
  (config) => {
    console.log('Request config:', config);
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a final interceptor to check the complete request config
api.interceptors.request.use(
  (config) => {
    console.log('Final request config:', config);
    console.log('Final headers:', config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

// Function to check if token is expired - ADD THIS HERE
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // Extract the expiration time
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { exp } = JSON.parse(jsonPayload);

    // Get current time
    const currentTime = Math.floor(Date.now() / 1000);

    console.log('Token expiration time:', exp);
    console.log('Current time:', currentTime);
    console.log('Is token expired:', exp < currentTime);

    // Check if token is expired
    return exp < currentTime;
  } catch (e) {
    console.error('Error checking token expiration:', e);
    return true;
  }
};

// Add interceptor to check token expiration
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token && isTokenExpired(token)) {
      console.log('Token is expired, cancelling request');
      // You could dispatch a logout action here or redirect to login
      // For now, we'll just reject the request with a custom error
      return Promise.reject({ response: { data: { error: 'Token expired' } } });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Async thunks for API calls
export const fetchAllMessages = createAsyncThunk(
  'chat/fetchAllMessages',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (isTokenExpired(token)) {
        return rejectWithValue({ error: 'Token expired' });
      }

      console.log('Making API request to fetch messages from current location');
      // Location filtering is now handled server-side
      const response = await api.get('/messages/all');
      console.log('All user messages response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all user messages:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch messages');
    }
  }
);

export const fetchPatientCheckIns = createAsyncThunk(
  'chat/fetchPatientCheckIns',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (isTokenExpired(token)) {
        return rejectWithValue({ error: 'Token expired' });
      }

      console.log('Making API request to fetch patient check-ins from current location');
      // Location filtering is now handled server-side
      const response = await api.get('/messages/patient-check-ins');
      console.log('Patient check-in messages response data:', response.data);

      return response.data;
    } catch (error) {
      console.error('Error fetching patient check-in messages:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch patient check-ins');
    }
  }
);

// In chatSlice.js - Modify the fetchUsers function
export const fetchUsers = createAsyncThunk(
  'chat/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (isTokenExpired(token)) {
        console.log('Token is expired, need to refresh');
        return rejectWithValue({ error: 'Token expired' });
      }

      console.log('Making API request to fetch users from current location');
      // The location filtering is now handled server-side
      const response = await api.get('/users');
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return rejectWithValue(error.response?.data || { error: 'Network error' });
    }
  }
);

// The rest of the file remains unchanged
// UPDATED: Modified to accept an object with userId and conversationType
export const fetchConversation = createAsyncThunk(
  'chat/fetchConversation',
  async ({ userId, conversationType }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token is expired, need to refresh');
        return rejectWithValue({ error: 'Token expired' });
      }

      console.log('Making API request to:', `${API_URL}/messages/user/${userId}`, 'with type:', conversationType);
      const response = await api.get(`/messages/user/${userId}`, {
        params: { type: conversationType }
      });
      console.log('Conversation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return rejectWithValue(error.response?.data || { error: 'Network error' });
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ sender_id, receiver_id, message, type = 'general' }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token is expired, need to refresh');
        return rejectWithValue({ error: 'Token expired' });
      }

      console.log('Sending message to API:', { sender_id, receiver_id, message, type });
      const response = await api.post('/messages', {
        sender_id,
        receiver_id,
        message,
        type
      });
      console.log('Send message response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return rejectWithValue(error.response?.data || { error: 'Network error' });
    }
  }
);

// New: Send a patient check-in message
export const sendPatientCheckIn = createAsyncThunk(
  'chat/sendPatientCheckIn',
  async ({ sender_id, receiver_id, message }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token is expired, need to refresh');
        return rejectWithValue({ error: 'Token expired' });
      }

      console.log('Sending patient check-in to API:', { sender_id, receiver_id, message });
      const response = await api.post('/messages', {
        sender_id,
        receiver_id,
        message,
        type: 'patient-check-in'
      });
      console.log('Send patient check-in response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending patient check-in:', error);
      return rejectWithValue(error.response?.data || { error: 'Network error' });
    }
  }
);

// Add new action for Patient Check-In creation
export const createPatientCheckIn = createAsyncThunk(
  'chat/createPatientCheckIn',
  async ({ patientName, appointmentTime, doctorName, sender_id, additionalMessage }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token is expired, need to refresh');
        return rejectWithValue({ error: 'Token expired' });
      }

      console.log('Creating patient check-in:', { patientName, appointmentTime, doctorName, sender_id });

      const response = await api.post('/messages/patient-check-in', {
        patientName,
        appointmentTime,
        doctorName,
        sender_id,
        additionalMessage
      });

      console.log('Patient check-in response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating patient check-in:', error);
      return rejectWithValue(error.response?.data || { error: 'Failed to create patient check-in' });
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  'chat/markMessageAsRead',
  async (messageId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token is expired, need to refresh');
        return rejectWithValue({ error: 'Token expired' });
      }

      const response = await api.put(`/messages/${messageId}/read`);
      return { messageId, ...response.data };
    } catch (error) {
      console.error('Error marking message as read:', error);
      return rejectWithValue(error.response?.data || { error: 'Network error' });
    }
  }
);

// Add new toggle pin user action
export const togglePinUser = createAsyncThunk(
  'chat/togglePinUser',
  async ({ userId, isPinned }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token is expired, need to refresh');
        return rejectWithValue({ error: 'Token expired' });
      }

      console.log(`${isPinned ? 'Pinning' : 'Unpinning'} user:`, userId);
      const response = await api.patch(`/users/${userId}/pin`, { isPinned });
      console.log('Toggle pin response:', response.data);
      return { userId, isPinned };
    } catch (error) {
      console.error('Error toggling pin status:', error);
      return rejectWithValue(error.response?.data || { error: 'Failed to toggle pin status' });
    }
  }
);

export const createNewChat = createAsyncThunk(
  'chat/createNewChat',
  async ({ userId, type = 'general', message = null }, { dispatch, getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token is expired, need to refresh');
        return rejectWithValue({ error: 'Token expired' });
      }

      console.log('Creating new chat with type:', type, userId ? `and user ID: ${userId}` : 'for all users');

      const { auth } = getState();

      if (!auth.isAuthenticated || !auth.user) {
        throw new Error('User not authenticated');
      }

      // For patient check-ins (no specific user)
      if (type === 'patient-check-in' && !userId) {
        if (!message) {
          throw new Error('Patient check-in requires a message');
        }

        // Send the patient check-in message
        await dispatch(sendMessage({
          sender_id: auth.user.id,
          receiver_id: null, // Null receiver means broadcast to applicable users
          message: message,
          type: 'patient-check-in'
        }));

        // Return a null user but keep the type for the fulfilled case
        return { user: null, type };
      }

      // For general chats (specific user)
      // Find the user in the users list
      const { chat } = getState();
      const user = chat.users.find(u => u.id === userId);

      if (!user) {
        throw new Error('User not found');
      }

      // First, select the user
      dispatch(selectUser(user));

      // For general chats, we may not need an initial message
      // but we'll fetch the conversation if it exists
      await dispatch(fetchConversation({
        userId,
        conversationType: 'general'
      }));

      // Return the user and type for the fulfilled case
      return { user, type };
    } catch (error) {
      console.error('Error creating new chat:', error);
      throw error;
    }
  }
);

// Initial state - updated to include patientCheckIns
const initialState = {
  users: [],
  messages: [],
  allMessages: [],
  patientCheckIns: [], // New state for patient check-in messages
  selectedUser: null,
  loading: false,
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    selectUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      state.messages = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAllMessages reducers
      .addCase(fetchAllMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMessages.fulfilled, (state, action) => {
        state.allMessages = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchPatientCheckIns reducers
      .addCase(fetchPatientCheckIns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientCheckIns.fulfilled, (state, action) => {
        state.patientCheckIns = action.payload;
        state.loading = false;
      })
      .addCase(fetchPatientCheckIns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchUsers reducers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.error = action.payload || { error: 'Failed to fetch users' };
        state.loading = false;
      })

      // fetchConversation reducers
      .addCase(fetchConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.loading = false;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.error = action.payload || { error: 'Failed to fetch messages' };
        state.loading = false;
      })

      // sendMessage reducers - updated to handle message types
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages = [action.payload, ...state.messages];
        state.allMessages = [action.payload, ...state.allMessages];
        state.loading = false;

        // If it's a patient check-in message, add it to that collection
        if (action.payload.type === 'patient-check-in') {
          state.patientCheckIns = [action.payload, ...state.patientCheckIns];
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload || { error: 'Failed to send message' };
        state.loading = false;
      })

      // sendPatientCheckIn reducers
      .addCase(sendPatientCheckIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPatientCheckIn.fulfilled, (state, action) => {
        // Add to all message collections
        state.messages = [action.payload, ...state.messages];
        state.allMessages = [action.payload, ...state.allMessages];
        state.patientCheckIns = [action.payload, ...state.patientCheckIns];
        state.loading = false;
      })
      .addCase(sendPatientCheckIn.rejected, (state, action) => {
        state.error = action.payload || { error: 'Failed to send patient check-in' };
        state.loading = false;
      })

      // createPatientCheckIn reducers
      .addCase(createPatientCheckIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatientCheckIn.fulfilled, (state, action) => {
        state.loading = false;
        // Check if the response includes messages or a count of messages sent
        if (action.payload && action.payload.count) {
          console.log(`Successfully sent ${action.payload.count} patient check-in messages`);
        }
        // We'll rely on fetchPatientCheckIns to update the state with the new messages
      })
      .addCase(createPatientCheckIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { error: 'Failed to create patient check-in' };
      })

      // togglePinUser reducers
      .addCase(togglePinUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePinUser.fulfilled, (state, action) => {
        const { userId, isPinned } = action.payload;
        // Find the user and update their pinned status
        const userIndex = state.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          state.users[userIndex].pinned = isPinned;
        }
        state.loading = false;
      })
      .addCase(togglePinUser.rejected, (state, action) => {
        state.error = action.payload || { error: 'Failed to toggle pin status' };
        state.loading = false;
      })

      // NEW: createNewChat reducers
      .addCase(createNewChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewChat.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload.user;
        // Note: We don't need to update messages here since the fetchConversation
        // or sendMessage thunks dispatched inside createNewChat will handle that
      })
      .addCase(createNewChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create new chat';
      });
  }
});

export const { selectUser, clearSelectedUser } = chatSlice.actions;
export default chatSlice.reducer;
