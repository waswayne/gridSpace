// Simple test script for authentication API endpoints
// Run with: node test-auth-api.js

const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/auth";

// Test data
const testUser = {
  fullname: "Test User",
  email: "test@example.com",
  password: "password123",
  phonenumber: "+1234567890",
};

let authToken = "";

async function testAPI() {
  try {
    console.log("🧪 Testing GridSpace Authentication API\n");

    // Test 1: User Registration
    console.log("1. Testing User Registration...");
    try {
      const signupResponse = await axios.post(`${BASE_URL}/signup`, testUser);
      console.log("✅ Registration successful:", signupResponse.data.message);
      authToken = signupResponse.data.token;
    } catch (error) {
      console.log(
        "❌ Registration failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test 2: User Login
    console.log("\n2. Testing User Login...");
    try {
      const loginResponse = await axios.post(`${BASE_URL}/signin`, {
        email: testUser.email,
        password: testUser.password,
      });
      console.log("✅ Login successful:", loginResponse.data.message);
      authToken = loginResponse.data.token;
    } catch (error) {
      console.log(
        "❌ Login failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test 3: Get Profile
    console.log("\n3. Testing Get Profile...");
    try {
      const profileResponse = await axios.get(`${BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log("✅ Profile retrieved:", profileResponse.data.message);
    } catch (error) {
      console.log(
        "❌ Get profile failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test 4: Update Profile
    console.log("\n4. Testing Update Profile...");
    try {
      const updateResponse = await axios.put(
        `${BASE_URL}/profile`,
        {
          fullname: "Updated Test User",
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log("✅ Profile updated:", updateResponse.data.message);
    } catch (error) {
      console.log(
        "❌ Update profile failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test 5: Change Password
    console.log("\n5. Testing Change Password...");
    try {
      const changePasswordResponse = await axios.put(
        `${BASE_URL}/change-password`,
        {
          currentPassword: testUser.password,
          newPassword: "newpassword123",
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log("✅ Password changed:", changePasswordResponse.data.message);
    } catch (error) {
      console.log(
        "❌ Change password failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test 6: Request Password Reset
    console.log("\n6. Testing Request Password Reset...");
    try {
      const resetRequestResponse = await axios.post(
        `${BASE_URL}/request-password-reset`,
        {
          email: testUser.email,
        }
      );
      console.log(
        "✅ Password reset requested:",
        resetRequestResponse.data.message
      );
    } catch (error) {
      console.log(
        "❌ Password reset request failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test 7: Request Email Verification
    console.log("\n7. Testing Request Email Verification...");
    try {
      const emailVerificationResponse = await axios.post(
        `${BASE_URL}/request-email-verification`,
        {
          email: testUser.email,
        }
      );
      console.log(
        "✅ Email verification requested:",
        emailVerificationResponse.data.message
      );
    } catch (error) {
      console.log(
        "❌ Email verification request failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test 8: Refresh Token
    console.log("\n8. Testing Refresh Token...");
    try {
      const refreshResponse = await axios.post(
        `${BASE_URL}/refresh-token`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log("✅ Token refreshed:", refreshResponse.data.message);
      authToken = refreshResponse.data.token;
    } catch (error) {
      console.log(
        "❌ Token refresh failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test 9: Logout
    console.log("\n9. Testing Logout...");
    try {
      const logoutResponse = await axios.post(
        `${BASE_URL}/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log("✅ Logout successful:", logoutResponse.data.message);
    } catch (error) {
      console.log(
        "❌ Logout failed:",
        error.response?.data?.message || error.message
      );
    }

    console.log("\n🎉 API testing completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
