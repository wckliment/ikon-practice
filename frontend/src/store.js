import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./redux/authSlice";
import chatReducer from "./redux/chatSlice";
import settingsReducer from "./redux/settingsSlice";
import providersReducer from "./redux/providersSlice";
import operatoriesReducer from "./redux/operatoriesSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    settings: settingsReducer,
    providers: providersReducer,
    operatories: operatoriesReducer,
  },
});

export default store;
