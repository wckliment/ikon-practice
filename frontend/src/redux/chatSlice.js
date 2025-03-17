import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API base URL - use full URL with port
const API_URL = 'http://localhost:5000/api';

// Add auth token to requests
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add interceptor to include token in every request
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Async thunks for API calls
export const fetchUsers = createAsyncThunk(
  'chat/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Making API request to:', `${API_URL}/users`);
      const response = await api.get('/users');
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return rejectWithValue(error.response?.data || { error: 'Network error' });
    }
  }
);

export const fetchConversation = createAsyncThunk(
  'chat/fetchConversation',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('Making API request to:', `${API_URL}/messages/user/${userId}`);
      const response = await api.get(`/messages/user/${userId}`);
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
  async ({ sender_id, receiver_id, message }, { rejectWithValue }) => {
    try {
      console.log('Sending message to API:', { sender_id, receiver_id, message });
      const response = await api.post('/messages', {
        sender_id,
        receiver_id,
        message
      });
      console.log('Send message response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return rejectWithValue(error.response?.data || { error: 'Network error' });
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  'chat/markMessageAsRead',
  async (messageId, { rejectWithValue }) => {
    try {
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

// Initial state
const initialState = {
  users: [],
  messages: [],
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

      // sendMessage reducers
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages = [action.payload, ...state.messages];
        state.loading = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload || { error: 'Failed to send message' };
        state.loading = false;
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
  }
});

export const { selectUser, clearSelectedUser } = chatSlice.actions;
export default chatSlice.reducer;
