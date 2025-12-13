import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export const emailVerificationService = {
  /**
   * Send verification code to email
   */
  async sendVerificationCode(email: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_URL}/auth/send-verification-code`, {
      email,
    });
    return response.data;
  },

  /**
   * Verify email with code
   */
  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_URL}/auth/verify-email`, {
      email,
      code,
    });
    return response.data;
  },
};
