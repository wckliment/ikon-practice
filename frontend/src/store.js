import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./redux/authSlice";
import chatReducer from "./redux/chatSlice";
import settingsReducer from "./redux/settingsSlice";
import providersReducer from "./redux/providersSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    settings: settingsReducer,
    providers: providersReducer,
  },
});

export default store;
