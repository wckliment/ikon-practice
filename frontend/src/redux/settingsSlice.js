import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Helper function to get auth token from the store
const getAuthHeader = (getState) => {
  const token = getState().auth.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch users

export const fetchUsers = createAsyncThunk("settings/fetchUsers", async (_, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.get("/api/users", { headers });



  // Ensure each user has location information
  const processedUsers = response.data.map(user => ({
    ...user,
    location_name: user.location_name || 'No Location',
    location_id: user.location_id || null
  }));

  return processedUsers;
});

export const updateUser = createAsyncThunk(
  "settings/updateUser",
  async ({ userId, userData }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeader(getState);
      const response = await axios.put(`/api/users/${userId}`, userData, { headers });
      return response.data;
    } catch (error) {
      console.error("Error in updateUser action:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeUser = createAsyncThunk(
  "settings/removeUser",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeader(getState);
      const response = await axios.delete(`/api/users/${userId}`, { headers });
      // Return both the response data and the original userId to ensure we can filter properly
      return { ...response.data, id: userId };
    } catch (error) {
      console.error("Error in removeUser action:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateUserColor = createAsyncThunk(
  "settings/updateUserColor",
  async ({ userId, appointmentColor }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeader(getState);
      const response = await axios.put(`/api/users/${userId}/color`, { appointmentColor }, { headers });
      return response.data;
    } catch (error) {
      console.error("Error in updateUserColor:", error);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);


export const fetchUsersByLocation = createAsyncThunk(
  "settings/fetchUsersByLocation",
  async (locationId, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeader(getState);
      console.log('THUNK: Fetching users for location ID:', locationId);

      const response = await axios.get(`/api/users/location/${locationId}`, { headers });

      console.log('THUNK: Users fetched:', response.data);

      // Ensure location details are processed
      const processedUsers = response.data.map(user => ({
        ...user,
        location_name: user.location_name || 'No Location',
        location_id: user.location_id || locationId
      }));

      return processedUsers;
    } catch (error) {
      console.error('THUNK: Error fetching users by location:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUserLocations = createAsyncThunk(
  "settings/fetchUserLocations",
  async (_, { getState }) => {
    const headers = getAuthHeader(getState);
    const userId = getState().auth.user.id;
    console.log(`Fetching locations for user ID: ${userId}`);

    const response = await axios.get(`/api/users/${userId}/locations`, { headers });
    console.log('Locations fetched:', response.data);

    return response.data;
  }
);

export const fetchUsersWithoutLocation = createAsyncThunk("settings/fetchUsersWithoutLocation", async (_, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.get("/api/users/no-location", { headers });
  return response.data;
});

export const inviteUser = createAsyncThunk("settings/inviteUser",
  async (userData, { getState, rejectWithValue }) => {
    try {
      console.log("inviteUser action called with:", userData);
      const headers = getAuthHeader(getState);

      // Make sure all required fields are present
      const completeUserData = {
        name: userData.name,
        email: userData.email,
        role: userData.role || "staff",
        location_id: userData.location_id || null,
        dob: userData.dob || null, // Use DOB from the form
        password: "password123" // Standard test password
      };

      console.log("Sending complete user data:", completeUserData);

      const response = await axios.post("/api/auth/register", completeUserData, { headers });
      console.log("Response received:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in inviteUser action:", error);
      if (error.response && error.response.data) {
        console.error("Error details:", error.response.data);
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateUserLocation = createAsyncThunk("settings/updateUserLocation", async ({userId, locationId}, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.put(`/api/users/${userId}/location`, { locationId }, { headers });
  return { userId, locationId };
});

export const fetchPracticeInfo = createAsyncThunk(
  "settings/fetchPracticeInfo",
  async (_, { getState }) => {
    const headers = getAuthHeader(getState);
    const user = getState().auth.user;

    console.log('Fetching practice info for location:', user?.location_id, user?.location_name);

    // Make sure to include the locationId as a query parameter
    const response = await axios.get("/api/practice", {
      headers,
      params: {
        locationId: user?.location_id,
        locationName: user?.location_name
      }
    });

    console.log('Practice API response:', response.data);
    return response.data;
  }
);

export const updatePracticeInfo = createAsyncThunk("settings/updatePracticeInfo", async (practiceData, { getState }) => {
  const headers = getAuthHeader(getState);
  const response = await axios.put("/api/practice", practiceData, { headers });
  return response.data;
});

export const fetchLocations = createAsyncThunk(
  "settings/fetchLocations",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();

      // Verbose logging for debugging
      console.log('Full Redux state:', state);
      console.log('Auth state:', state.auth);
      console.log('Auth user:', state.auth.user);

      // Ensure user exists and has an ID
      if (!state.auth.user || !state.auth.user.id) {
        console.error('THUNK: No authenticated user or user ID found');
        return rejectWithValue('No authenticated user');
      }

      const userId = state.auth.user.id;
      const userLocationId = state.auth.user.location_id; // Get location_id from auth state

      console.log(`THUNK: Fetching locations for user ID: ${userId}`);

      const headers = {
        Authorization: `Bearer ${state.auth.token}`
      };

      // Fetch locations from API
      const response = await axios.get(`/api/users/${userId}/locations`, {
        headers,
        timeout: 10000,
      });

      // Check if locations data is returned and log it
      if (!response.data || response.data.length === 0) {
        console.error('THUNK: No locations returned from API');
        return rejectWithValue('No locations available for the user.');
      }

      console.log('Locations fetched successfully:', response.data);

      // Return locations data and userLocationId
      return {
        locations: response.data,
        userLocationId: userLocationId
      };

    } catch (error) {
      // Catch and log any errors from the API call
      console.error('THUNK: Error fetching locations:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


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
  userLocations: {
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
    // In settingsSlice.js, when processing users
.addCase(fetchUsers.fulfilled, (state, action) => {
  state.users.status = "succeeded";
  state.users.data = action.payload.map(user => ({
    ...user,
    location_name: user.location_name || user.location || 'No Location',
    location_id: user.location_id || user.location_id || null
  }));
})
      .addCase(fetchUsers.rejected, (state, action) => {
        state.users.status = "failed";
        state.users.error = action.error.message;
      })

       // Update user cases
  .addCase(updateUser.pending, (state) => {
    state.users.status = "loading";
  })
  .addCase(updateUser.fulfilled, (state, action) => {
    state.users.status = "succeeded";

    // Update in the main users list
    const index = state.users.data.findIndex(user => user.id === action.payload.id);
    if (index !== -1) {
      state.users.data[index] = action.payload;
    }

    // Also update in the usersByLocation list if present
    if (state.usersByLocation.data && state.usersByLocation.data.length > 0) {
      const locationIndex = state.usersByLocation.data.findIndex(user => user.id === action.payload.id);
      if (locationIndex !== -1) {
        state.usersByLocation.data[locationIndex] = action.payload;
      }
    }
  })
  .addCase(updateUser.rejected, (state, action) => {
    state.users.status = "failed";
    state.users.error = action.payload || action.error.message;
  })

     // Update user color
.addCase(updateUserColor.fulfilled, (state, action) => {
  const updatedUser = action.payload;

  // Update in the main users list
  const index = state.users.data.findIndex(user => user.id === updatedUser.id);
  if (index !== -1) {
    state.users.data[index] = {
      ...state.users.data[index],
      appointment_color: updatedUser.appointment_color
    };
  }

  // Update in usersByLocation list if present
  const locIndex = state.usersByLocation.data.findIndex(user => user.id === updatedUser.id);
  if (locIndex !== -1) {
    state.usersByLocation.data[locIndex] = {
      ...state.usersByLocation.data[locIndex],
      appointment_color: updatedUser.appointment_color
    };
  }
})
.addCase(updateUserColor.rejected, (state, action) => {
  state.users.error = action.payload || action.error.message;
})

// Remove user cases
.addCase(removeUser.pending, (state) => {
  state.users.status = "loading";
})
.addCase(removeUser.fulfilled, (state, action) => {
  state.users.status = "succeeded";

  // Extract the user ID - either from the payload object or directly if it's just the ID
  const userId = action.payload.id || action.payload;
  console.log("Removing user with ID:", userId);

  // Remove from main users list
  state.users.data = state.users.data.filter(user => user.id !== userId);

  // Also remove from usersByLocation list if present
  if (state.usersByLocation.data && state.usersByLocation.data.length > 0) {
    state.usersByLocation.data = state.usersByLocation.data.filter(
      user => user.id !== userId
    );
  }
})
.addCase(removeUser.rejected, (state, action) => {
  state.users.status = "failed";
  state.users.error = action.payload || action.error.message;
})

      // User locations
      .addCase(fetchUserLocations.pending, (state) => {
        state.userLocations.status = "loading";
      })
      .addCase(fetchUserLocations.fulfilled, (state, action) => {
        state.userLocations.status = "succeeded";
        state.userLocations.data = action.payload;
      })
      .addCase(fetchUserLocations.rejected, (state, action) => {
        state.userLocations.status = "failed";
        state.userLocations.error = action.error.message;
      })

      // Users by location
      .addCase(fetchUsersByLocation.pending, (state) => {
        state.usersByLocation.status = "loading";
      })
      .addCase(fetchUsersByLocation.fulfilled, (state, action) => {
  state.usersByLocation.status = "succeeded";

  // Ensure location details are preserved
  const processedUsers = action.payload.map(user => ({
    ...user,
    location_name: user.location_name || user.location || 'No Location',
    location_id: user.location_id || user.location_id || null
  }));

  state.usersByLocation.data = processedUsers;
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
  console.log('Practice info fetch pending');
  state.practiceInfo.status = "loading";
})
.addCase(fetchPracticeInfo.fulfilled, (state, action) => {
  console.log('Practice info fetch successful:', action.payload);
  state.practiceInfo.status = "succeeded";
  state.practiceInfo.data = action.payload;
})
.addCase(fetchPracticeInfo.rejected, (state, action) => {
  console.log('Practice info fetch failed:', action.error);
  state.practiceInfo.status = "failed";
  state.practiceInfo.error = action.error.message;
})

    // Locations
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.locations.status = "loading";
      })

      .addCase(fetchLocations.fulfilled, (state, action) => {

  state.locations.status = "succeeded";

  // Get userLocationId from the action payload
  const { locations, userLocationId } = action.payload;

  // If the user has a location, filter to only that location
  if (userLocationId) {
    state.locations.data = locations.filter(location =>
      location.id === userLocationId
    );
  } else {
    // If no location is assigned or if the user's role allows all locations
    state.locations.data = locations;
  }
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
