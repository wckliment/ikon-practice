import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchOperatories = createAsyncThunk(
  "operatories/fetchOperatories",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const locationCode = state.auth?.user?.location_code;

    console.log("📡 Fetching operatories for locationCode:", locationCode);

    if (!locationCode) {
      throw new Error("No location code found in user state");
    }

    // 🔥 Actual API call
    const response = await axios.get(`/api/operatories?locationCode=${locationCode}`);
    console.log("✅ Operatories API response:", response.data);

    // 🔐 Defensive fallback to handle both wrapped and raw array responses
    const operatories = response.data?.data || response.data;

    // 🧠 Final payload that will be returned to .fulfilled
    console.log("🧩 Returning operatories from thunk:", operatories);
    return operatories;
  }
);

const operatoriesSlice = createSlice({
  name: "operatories",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOperatories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOperatories.fulfilled, (state, action) => {
        console.log("🧩 Setting operatories to:", action.payload);
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchOperatories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default operatoriesSlice.reducer;
