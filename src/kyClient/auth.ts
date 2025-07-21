import ApiService from "./api";
import Cookies from "js-cookie";
import { ApiResponse, COOKIE_EXPIRES, User } from "./constants";

export interface VerifyOtpResponse {
  message: string;
  password_updated: boolean;
  first_name: string;
  last_name: string;
  sur_name: string;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
    token_type: string;
    user: {
      id: string;
      email: string;
      user_metadata: {
        email: string;
        email_verified: boolean;
        phone_verified: boolean;
        sub: string;
      };
    };
  };
}

class AuthService extends ApiService {
  private static instance: AuthService;

  private constructor() {
    super();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  setAuthData(token: string, user: User): void {
    Cookies.set("access_token", token, {
      expires: COOKIE_EXPIRES,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    Cookies.set("user", JSON.stringify(user), {
      expires: COOKIE_EXPIRES,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }

  logout(): void {
    Cookies.remove("access_token");
    Cookies.remove("user");
    Cookies.remove("refresh_token");
    Cookies.remove("password_updated");
    Cookies.remove("reset_password");
    Cookies.remove("locked");

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("password_updated");
    localStorage.removeItem("user");
    localStorage.removeItem("reset_password");
  }

  getCurrentUser(): User | null {
    const userCookie = Cookies.get("user");
    const userLocal = localStorage.getItem("user");

    if (userCookie) {
      return JSON.parse(userCookie);
    } else if (userLocal) {
      const user = JSON.parse(userLocal);
      const token = localStorage.getItem("access_token");

      if (token && user) {
        this.setAuthData(token, user);
      }

      return user;
    }

    return null;
  }

  async login(email: string, password: string): Promise<{ message: string }> {
    try {
      const response = await this.post<{ message: string }>("login", {
        email,
        password,
      });

      return response.data || { message: "OTP sent successfully" };
    } catch (error: any) {
      throw error.response._parsedData || "Login failed";
    }
  }

  async verifyPassword(password: string): Promise<{ message: string }> {
    try {
      const response = await this.post<{ message: string }>("verify-password", {
        password,
      });

      return response.data || { message: "Password Verified Successfully" };
    } catch (error: any) {
      throw error.response._parsedData || "Verification Failed";
    }
  }

  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<{ token: string; user: User; password_updated: boolean }> {
    try {
      const response = await this.post<VerifyOtpResponse>("verify-otp", {
        email,
        otp,
      });

      const apiResponse = response as VerifyOtpResponse;

      if (!apiResponse || !apiResponse.session) {
        throw new Error("Invalid response received from server");
      }

      const session = apiResponse?.session;

      if (!session.access_token || !session.user) {
        throw new Error("Invalid session data received");
      }

      const { access_token, user } = session;
      const userData: User = {
        id: user.id,
        email: user.email,
        first_name: apiResponse.first_name,
        last_name: apiResponse.last_name,
      };

      // Set in both cookies and localStorage
      this.setAuthData(access_token, userData);

      // Set refresh token
      Cookies.set("refresh_token", session.refresh_token, {
        expires: COOKIE_EXPIRES,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      Cookies.set("password_updated", `${apiResponse.password_updated}`, {
        expires: COOKIE_EXPIRES,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      localStorage.setItem("refresh_token", session.refresh_token);
      localStorage.setItem(
        "password_updated",
        `${apiResponse.password_updated}`,
      );

      return {
        token: access_token,
        user: userData,
        password_updated: apiResponse.password_updated || false,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to verify OTP");
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await this.post<{ message: string }>("reset-password", {
        email,
        redirect_to: "/forgot-reset-password",
      });
      Cookies.set("reset_password", `${true}`, {
        expires: COOKIE_EXPIRES,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      localStorage.setItem("reset_password", `${true}`);
      return response.data!;
    } catch (error: any) {
      throw new Error(error.message || "Failed to send reset password email");
    }
  }

  async updatePassword(
    access_token: string,
    new_password: string,
  ): Promise<{ message: string }> {
    try {
      const response = await this.post<{ message: string }>(
        "update-password",
        { new_password },
        {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      );

      Cookies.set("password_updated", `${true}`, {
        expires: COOKIE_EXPIRES,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      localStorage.setItem("password_updated", `${true}`);

      return response.data || { message: "Password set successfully" };
    } catch (error: any) {
      throw new Error(error.message || "Failed to update password");
    }
  }

  async getUser(): Promise<ApiResponse<User>> {
    try {
      const response = await this.get<User>("self");
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch user data");
    }
  }
}

export const authService = AuthService.getInstance();
