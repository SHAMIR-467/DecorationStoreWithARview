import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Base API URL
const API_URL = "http://localhost:5000/api/auth";

/**
 * ✅ Login Action
 */
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials, {
        withCredentials: true,
      });

      const { user, accessToken, refreshToken } = response.data.data;
      if (!user || !accessToken || !refreshToken) {
        throw new Error("Invalid server response");
      }

      // ✅ Store in local storage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      return { user, role: user.role, accessToken, refreshToken };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

/**
 * ✅ Register Action
 */
export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      const { user, accessToken, refreshToken } = response.data.data;
      if (!user || !accessToken || !refreshToken) {
        throw new Error("Missing authentication data");
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      return { user, role: user.role, accessToken, refreshToken };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    }
  }
);

/**
 * ✅ Check Authentication Action
 */
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No token found");

      const response = await axios.get(`${API_URL}/check-auth`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      return response.data.data;
    } catch (error) {
      localStorage.clear(); // ✅ Clears stored data on failure
      return rejectWithValue(error.response?.data?.message || "Authentication failed");
    }
  }
);

/**
 * ✅ Get Current User
 */
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No token found. Please log in again.");

      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      return { user: response.data.data, role: response.data.data.role, accessToken: token };
    } catch (error) {
      console.error(error);
      return rejectWithValue({
        isAuthenticated: false,
        user: null,
        role: null,
        accessToken: null,
        message: error.response?.data?.message || "Failed to authenticate user.",
      });
    }
  }
);

/**
 * ✅ Update Profile
 */
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Unauthorized request. Please log in again.");

      const response = await axios.put(`${API_URL}/update-profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.response?.data?.message || "Failed to update profile.");
    }
  }
);

/**
 * ✅ Change Password
 */
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Unauthorized request. Please log in again.");

      await axios.put(`${API_URL}/change-password`, passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return "Password changed successfully.";
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to change password.");
    }
  }
);

/**
 * ✅ Logout Action
 */
export const logout = createAsyncThunk("auth/logout", async (_, { dispatch, getState, rejectWithValue }) => {
  try {
    const { auth } = getState();
    const refreshToken = localStorage.getItem("refreshToken"); // ✅ Fetch from Local Storage

    if (!refreshToken) {
      return rejectWithValue("No refresh token found");
    }

    // ✅ Send logout request with credentials
   // await axios.post(`${API_URL}/logout`, { token: refreshToken }, { withCredentials: true });

    // ✅ Clear all storage (Redux store + Local Storage)
    localStorage.clear();
    sessionStorage.clear();
    dispatch(resetAuth());

    return null;
  } catch (error) {
    console.error("Logout error:", error);
    return rejectWithValue(error.response?.data?.message || "Logout failed. Please try again.");
  }
});



/**
 * ✅ Get Initial State from Local Storage
 */
const getInitialState = () => {
  try {
     
    const user = JSON.parse(localStorage.getItem("user")) || null;

    return {
      user,
      role: localStorage.getItem("role") || null,
      accessToken: localStorage.getItem("accessToken") || null,
      refreshToken: localStorage.getItem("refreshToken") || null,
      isAuthenticated: !!localStorage.getItem("accessToken"),
      isLoading: false,
      error: null,
    };
  } catch (error) {
    localStorage.clear();
    return {
      user: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }
};

/**
 * ✅ Redux Slice
 */
const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: () => getInitialState(),
  },
  extraReducers: (builder) => {
   builder
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      //.addCase(logout.fulfilled, () => getInitialState())
  




      // ✅ Register Reducers
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
      })
      // ✅ Get Current User
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.role = action.payload.role;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
      })

      // ✅ Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.successMessage = "Profile updated successfully.";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ✅ Change Password
      .addCase(changePassword.fulfilled, (state, action) => {
        state.successMessage = action.payload;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ✅ Check Auth Reducers
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.error = action.payload || "Authentication failed";
      });

      // ✅ Logout Reducers
     
  },
});




/**
 * ✅ Export Actions & Reducer
 */
export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;