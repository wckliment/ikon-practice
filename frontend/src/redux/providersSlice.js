import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async action to fetch providers
export const fetchProviders = createAsyncThunk("providers/fetchProviders", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("/api/providers", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data);
  }
});

const providersSlice = createSlice({
  name: "providers",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch providers";
      });
  },
});

export default providersSlice.reducer;
