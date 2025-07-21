import Cookies from "js-cookie";
import ky, { KyResponse } from "ky";
import { ApiResponse, COOKIE_EXPIRES, User } from "./constants";
import { Config } from "@/config";

class ApiService {
  private client;

  constructor() {
    this.client = ky.create({
      prefixUrl: Config.backend.url,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 60000,
      hooks: {
        beforeRequest: [
          (request) => {
            const token =
              typeof window !== "undefined"
                ? localStorage.getItem("access_token")
                : null;
            if (token) {
              request.headers.set("Authorization", `Bearer ${token}`);
            }
            return request;
          },
        ],
        afterResponse: [
          async (request, options, response: KyResponse) => {
            try {
              const data = (await response.json()) as ApiResponse;

              if (response.status === 401) {
                const refreshToken = localStorage.getItem("refresh_token");
                if (refreshToken) {
                  try {
                    const refreshResponse = await this.client.post(
                      "/refresh-token",
                      {
                        json: { refresh_token: refreshToken },
                      },
                    );
                    const refreshData =
                      (await refreshResponse.json()) as ApiResponse;

                    if (refreshResponse.ok) {
                      const session = refreshData?.data.session;
                      const { access_token, user } = session;
                      const userData: User = {
                        id: user.id,
                        email: user.email,
                        first_name: refreshData?.data.first_name,
                        last_name: refreshData?.data.last_name,
                      };
                      Cookies.set("refresh_token", session.refresh_token, {
                        expires: COOKIE_EXPIRES,
                        sameSite: "strict",
                        secure: process.env.NODE_ENV === "production",
                      });

                      Cookies.set("access_token", access_token, {
                        expires: COOKIE_EXPIRES,
                        sameSite: "strict",
                        secure: process.env.NODE_ENV === "production",
                      });

                      Cookies.set("user", JSON.stringify(userData), {
                        expires: COOKIE_EXPIRES,
                        sameSite: "strict",
                        secure: process.env.NODE_ENV === "production",
                      });

                      localStorage.setItem(
                        "refresh_token",
                        session.refresh_token,
                      );

                      request.headers.set(
                        "Authorization",
                        `Bearer ${access_token}`,
                      );
                      return this.client(request);
                    }
                  } catch (error) {
                    this.redirectToLogin();
                  }
                }
              } else if (!response.ok) {
                const error = new Error(
                  data.message || "API request failed",
                ) as any;
                error.response = response;
                error.status = response.status;
                throw error;
              }

              // Store the parsed data in a custom property
              (response as any)._parsedData = data;
              return response;
            } catch (error) {
              if (error instanceof Error) {
                const apiError = error as any;
                apiError.response = response;
                apiError.status = response.status;
              }
              throw error;
            }
          },
        ],
      },
    });
  }

  protected async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(endpoint, {
        searchParams: params,
      });
      return (response as any)._parsedData;
    } catch (error: any) {
      if (error.response?.status === 405) {
        throw new Error(`GET method not allowed for endpoint: ${endpoint}`);
      }
      throw error;
    }
  }

  protected async post<T = any>(
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    try {
      const options: any = { json: data };
      if (customHeaders) {
        options.headers = customHeaders;
      }
      const response = await this.client.post(endpoint, options);
      return (response as any)._parsedData;
    } catch (error: any) {
      if (error.response?.status === 405) {
        throw new Error(`POST method not allowed for endpoint: ${endpoint}`);
      }
      throw error;
    }
  }

  protected async put<T = any>(
    endpoint: string,
    data?: any,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(endpoint, { json: data });
      return (response as any)._parsedData;
    } catch (error: any) {
      if (error.response?.status === 405) {
        throw new Error(`PUT method not allowed for endpoint: ${endpoint}`);
      }
      throw error;
    }
  }

  protected async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(endpoint);
      return (response as any)._parsedData;
    } catch (error: any) {
      if (error.response?.status === 405) {
        throw new Error(`DELETE method not allowed for endpoint: ${endpoint}`);
      }
      throw error;
    }
  }

  redirectToLogin(): void {
    Cookies.remove("access_token");
    Cookies.remove("user");
    Cookies.remove("refresh_token");
    Cookies.remove("password_updated");
    Cookies.remove("reset_password");

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("password_updated");
    localStorage.removeItem("user");
    localStorage.removeItem("reset_password");

    if (window) {
      window.location.href = "/login";
    }
  }
}

export default ApiService;
