import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Helper function to get auth token from the store
const getAuthHeader = (getState) => {
  const token = getState().auth.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchUsers = createAsyncThunk("settings/fetchUsers", async (_, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.get("/api/users", { headers });
  return response.data;
});

export const fetchUsersByLocation = createAsyncThunk("settings/fetchUsersByLocation", async (locationId, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.get(`/api/users/location/${locationId}`, { headers });
  return response.data;
});

export const fetchUsersWithoutLocation = createAsyncThunk("settings/fetchUsersWithoutLocation", async (_, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.get("/api/users/no-location", { headers });
  return response.data;
});

export const inviteUser = createAsyncThunk("settings/inviteUser", async (userData, { getState }) => {
  const headers = getAuthHeader(getState);
  // This might need to be adjusted based on your auth routes
  const response = await axios.post("/api/auth/register", userData, { headers });
  return response.data;
});

export const updateUserLocation = createAsyncThunk("settings/updateUserLocation", async ({userId, locationId}, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.put(`/api/users/${userId}/location`, { locationId }, { headers });
  return { userId, locationId };
});

export const fetchPracticeInfo = createAsyncThunk("settings/fetchPracticeInfo", async (_, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.get("/api/practice", { headers });
  return response.data;
});

export const updatePracticeInfo = createAsyncThunk("settings/updatePracticeInfo", async (practiceData, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.put("/api/practice", practiceData, { headers });
  return response.data;
});

export const fetchLocations = createAsyncThunk("settings/fetchLocations", async (_, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.get("/api/locations", { headers });
  return response.data;
});

export const updateLocation = createAsyncThunk("settings/updateLocation", async ({ id, locationData }, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.put(`/api/locations/${id}`, locationData, { headers });
  return response.data;
});

export const createLocation = createAsyncThunk("settings/createLocation", async (locationData, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.post("/api/locations", locationData, { headers });
  return response.data;
});

export const deleteLocation = createAsyncThunk("settings/deleteLocation", async (id, { getState }) => {
  const headers = getAuthHeader(getState);
  await axios.delete(`/api/locations/${id}`, { headers });
  return id;
});

export const updateOpenDentalKeys = createAsyncThunk(
  "settings/updateOpenDentalKeys",
  async ({ locationId, customerKey, developerKey }, { getState }) => {
    const headers = getAuthHeader(getState);
    const response = await axios.put(`/api/locations/${locationId}/openDentalKeys`, {
      openDentalCustomerKey: customerKey,
      openDentalDeveloperKey: developerKey
    }, { headers });
    return response.data;
  }
);

export const fetchApiKeys = createAsyncThunk("settings/fetchApiKeys", async (_, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.get("/api/apikeys", { headers });
  return response.data;
});

export const generateApiKey = createAsyncThunk("settings/generateApiKey", async (keyType, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.post("/api/apikeys", { type: keyType }, { headers });
  return response.data;
});

export const revokeApiKey = createAsyncThunk("settings/revokeApiKey", async (id, { getState }) => {
  const headers = getAuthHeader(getState);
  await axios.delete(`/api/apikeys/${id}`, { headers });
  return id;
});

// Initial state
const initialState = {
  users: {
    data: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  usersByLocation: {
    data: [],
    status: "idle",
    error: null
  },
  practiceInfo: {
    data: null,
    status: "idle",
    error: null
  },
  locations: {
    data: [],
    status: "idle",
    error: null
  },
  apiKeys: {
    data: [],
    status: "idle",
    error: null
  },
  systemPreferences: {
    theme: "light",
    dashboardLayout: "standard",
    businessHours: {
      open: "9:00 AM",
      close: "5:00 PM"
    },
    appointmentSettings: {
      defaultDuration: 30,
      bookingNotice: 24,
      allowOnlineBooking: true
    }
  }
};

// Create slice
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSystemPreferences: (state, action) => {
      state.systemPreferences = {
        ...state.systemPreferences,
        ...action.payload
      };
    }
  },
  extraReducers: (builder) => {
    // Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.users.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users.status = "succeeded";
        state.users.data = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.users.status = "failed";
        state.users.error = action.error.message;
      })

      // Users by location
      .addCase(fetchUsersByLocation.pending, (state) => {
        state.usersByLocation.status = "loading";
      })
      .addCase(fetchUsersByLocation.fulfilled, (state, action) => {
        state.usersByLocation.status = "succeeded";
        state.usersByLocation.data = action.payload;
      })
      .addCase(fetchUsersByLocation.rejected, (state, action) => {
        state.usersByLocation.status = "failed";
        state.usersByLocation.error = action.error.message;
      })

      // Users without location
      .addCase(fetchUsersWithoutLocation.fulfilled, (state, action) => {
        state.usersByLocation.status = "succeeded";
        state.usersByLocation.data = action.payload;
      })

      .addCase(inviteUser.fulfilled, (state, action) => {
        state.users.data.push(action.payload);
      })

      .addCase(updateUserLocation.fulfilled, (state, action) => {
        // Update user location in both user lists
        const { userId, locationId } = action.payload;

        // Update in users list
        const userIndex = state.users.data.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          state.users.data[userIndex].location_id = locationId;
        }

        // Remove from usersByLocation if they were moved to a different location
        state.usersByLocation.data = state.usersByLocation.data.filter(user => user.id !== userId);
      });

    // Practice Info
    builder
      .addCase(fetchPracticeInfo.pending, (state) => {
        state.practiceInfo.status = "loading";
      })
      .addCase(fetchPracticeInfo.fulfilled, (state, action) => {
        state.practiceInfo.status = "succeeded";
        state.practiceInfo.data = action.payload;
      })
      .addCase(fetchPracticeInfo.rejected, (state, action) => {
        state.practiceInfo.status = "failed";
        state.practiceInfo.error = action.error.message;
      })
      .addCase(updatePracticeInfo.fulfilled, (state, action) => {
        state.practiceInfo.data = action.payload;
      });

    // Locations
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.locations.status = "loading";
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.locations.status = "succeeded";
        state.locations.data = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.locations.status = "failed";
        state.locations.error = action.error.message;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        const index = state.locations.data.findIndex(loc => loc.id === action.payload.id);
        if (index !== -1) {
          state.locations.data[index] = action.payload;
        }
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.locations.data.push(action.payload);
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.locations.data = state.locations.data.filter(loc => loc.id !== action.payload);
      })
      .addCase(updateOpenDentalKeys.fulfilled, (state, action) => {
        const index = state.locations.data.findIndex(loc => loc.id === action.payload.id);
        if (index !== -1) {
          state.locations.data[index] = action.payload;
        }
      });

    // API Keys
    builder
      .addCase(fetchApiKeys.pending, (state) => {
        state.apiKeys.status = "loading";
      })
      .addCase(fetchApiKeys.fulfilled, (state, action) => {
        state.apiKeys.status = "succeeded";
        state.apiKeys.data = action.payload;
      })
      .addCase(fetchApiKeys.rejected, (state, action) => {
        state.apiKeys.status = "failed";
        state.apiKeys.error = action.error.message;
      })
      .addCase(generateApiKey.fulfilled, (state, action) => {
        state.apiKeys.data.push(action.payload);
      })
      .addCase(revokeApiKey.fulfilled, (state, action) => {
        state.apiKeys.data = state.apiKeys.data.filter(key => key.id !== action.payload);
      });
  }
});

export const { updateSystemPreferences } = settingsSlice.actions;

export default settingsSlice.reducer;
