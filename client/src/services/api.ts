interface SignupData {
  fullname: string;
  email: string;
  password: string;
  phonenumber: string;
  profilePic?: File;
}

interface SigninCredentials {
  email: string;
  password: string;
}

interface ProfileData {
  fullname?: string;
  phonenumber?: string;
  profilePic?: File;
}

interface PasswordData {
  oldPassword: string;
  newPassword: string;
}

interface ResetData {
  token: string;
  password: string;
}

interface ApiResponse<T = any> {
  message?: string;
  [key: string]: any;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Helper method to handle responses
  private async handleResponse<T>(response: Response): Promise<T> {
    let responseText: string;
    
    try {
      // First get the raw text of the response
      responseText = await response.text();
      
      // Try to parse it as JSON
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        console.error('Failed to parse JSON response:', responseText);
        throw new Error('Invalid response format from server');
      }

      // Log the response for debugging
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        data: data
      });

      // Handle unsuccessful responses
      if (!response.ok) {
        const errorMessage = data?.message || data?.error || responseText || 
      `${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return data as T;
    } catch (error: any) {
      // Log detailed error information
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        responseText: responseText,
        error: error.message
      });

      // Throw a user-friendly error
      if (!response.ok) {
        throw new Error(error.message || 'Server error occurred');
      }
      throw new Error('Failed to process server response');
    }
  }

  // Auth endpoints
  async signup(userData: SignupData): Promise<ApiResponse> {
    console.log('Signup request:', { ...userData, password: '***' });
    console.log('API URL:', `${this.baseURL}/auth/signup`);
    
    const response = await fetch(`${this.baseURL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullname: userData.fullname,
        email: userData.email,
        password: userData.password,
        phonenumber: userData.phonenumber,
      }),
    });

    return this.handleResponse(response);
  }

  async signin(credentials: SigninCredentials): Promise<ApiResponse> {
    try {
      console.log('Signin request:', { 
        url: `${this.baseURL}/auth/signin`,
        email: credentials.email,
        hasPassword: !!credentials.password 
      });

      const response = await fetch(`${this.baseURL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      console.log('Raw signin response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      return this.handleResponse(response);
    } catch (networkError) {
      console.error('Network error during signin:', networkError);
      throw new Error('Failed to connect to the server. Please check your internet connection.');
    }
  }

  async getProfile(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async updateProfile(profileData: ProfileData): Promise<ApiResponse> {
    const formData = new FormData();

    if (profileData.fullname) formData.append("fullname", profileData.fullname);
    if (profileData.phonenumber)
      formData.append("phonenumber", profileData.phonenumber);
    if (profileData.profilePic)
      formData.append("profilePic", profileData.profilePic);

    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: "PUT",
      headers: {
        ...(localStorage.getItem("authToken") && {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        }),
      },
      body: formData,
    });

    return this.handleResponse(response);
  }

  async changePassword(passwordData: PasswordData): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/auth/change-password`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });

    return this.handleResponse(response);
  }

  async requestPasswordReset(email: string): Promise<ApiResponse> {
    const response = await fetch(
      `${this.baseURL}/auth/request-password-reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    return this.handleResponse(response);
  }

  async resetPassword(resetData: ResetData): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resetData),
    });

    return this.handleResponse(response);
  }

  async requestEmailVerification(email: string): Promise<ApiResponse> {
    const response = await fetch(
      `${this.baseURL}/auth/request-email-verification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    return this.handleResponse(response);
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    return this.handleResponse(response);
  }

  async refreshToken(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async logout(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async deleteAccount(password: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/auth/account`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    return this.handleResponse(response);
  }
}

export default new ApiService();