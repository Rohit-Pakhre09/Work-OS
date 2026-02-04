import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => {
  const authData = localStorage.getItem("auth");
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return {
        user: parsed.user,
        accessToken: parsed.accessToken || null,
        refreshToken: parsed.refreshToken || null,
        isAuthenticated: parsed.isAuthenticated || false,
        loading: false,
        error: null,
      };
    } catch (error) {
      console.log("Error in the authSlice.js: ", error);
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    }
  }
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { data } = action.payload;

      state.loading = false;
      state.user = data.user;
      state.accessToken = data.accessToken;
      state.refreshToken = data.refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem(
        "auth",
        JSON.stringify({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        })
      );
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signupStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signupSuccess: (state, action) => {
      const { data } = action.payload;
      state.loading = false;
      state.user = data.user;
      state.accessToken = data.accessToken;
      state.refreshToken = data.refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem(
        "auth",
        JSON.stringify({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        })
      );
    },
    signupFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth");
    },
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  logout,
  setUser,
} = authSlice.actions;
export default authSlice.reducer;