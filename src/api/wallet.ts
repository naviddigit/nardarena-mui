import axios from 'axios';
import { API_BASE_URL } from 'src/config/api.config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('jwt_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------------------------------------------------

export interface WalletData {
  id: string;
  userId: string;
  network: 'TRC20' | 'BSC';
  address: string;
  balance: string;
  lastCheckedAt: string;
  createdAt: string;
}

export interface DepositData {
  id: string;
  userId: string;
  walletId: string;
  network: 'TRC20' | 'BSC';
  txHash: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'completed';
  confirmedAt?: string;
  createdAt: string;
}

export interface WithdrawalData {
  id: string;
  userId: string;
  network: 'TRC20' | 'BSC';
  toAddress: string;
  amount: string;
  networkFee: string;
  serviceFee: string;
  totalFee: string;
  txHash?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
}

export interface FeeCalculation {
  network: 'TRC20' | 'BSC';
  amount: number;
  networkFee: number;
  serviceFee: number;
  totalFee: number;
  youReceive: number;
}

// ----------------------------------------------------------------------

// Generate or get wallet for specific network
export async function generateWallet(network: 'TRC20' | 'BSC'): Promise<WalletData> {
  const response = await axiosInstance.post('/wallet/generate', { network });
  return response.data;
}

// Get wallet by network
export async function getWallet(network: 'TRC20' | 'BSC'): Promise<WalletData> {
  const response = await axiosInstance.get(`/wallet/${network}`);
  return response.data;
}

// Get all user wallets
export async function getAllWallets(): Promise<WalletData[]> {
  const response = await axiosInstance.get('/wallet');
  return response.data;
}

// Check wallet balance
export async function checkBalance(network: 'TRC20' | 'BSC'): Promise<WalletData> {
  const response = await axiosInstance.post('/wallet/check-balance', { network });
  return response.data;
}

// Notify deposit detected (client-side)
export async function notifyDeposit(data: {
  walletId: string;
  txHash: string;
  amount: number;
}): Promise<DepositData> {
  const response = await axiosInstance.post('/wallet/notify-deposit', data);
  return response.data;
}

// Request withdrawal
export async function requestWithdrawal(data: {
  network: 'TRC20' | 'BSC';
  toAddress: string;
  amount: number;
}): Promise<WithdrawalData> {
  const response = await axiosInstance.post('/wallet/withdraw', data);
  return response.data;
}

// Get user deposits
export async function getUserDeposits(params?: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'confirmed' | 'completed';
}): Promise<{ data: DepositData[]; total: number; page: number; limit: number }> {
  const response = await axiosInstance.get('/wallet/transactions/deposits', { params });
  return response.data;
}

// Get user withdrawals
export async function getUserWithdrawals(params?: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}): Promise<{ data: WithdrawalData[]; total: number; page: number; limit: number }> {
  const response = await axiosInstance.get('/wallet/transactions/withdrawals', { params });
  return response.data;
}

// Get fee calculation example
export async function getFeeCalculation(
  network: 'TRC20' | 'BSC',
  amount: number
): Promise<FeeCalculation> {
  const response = await axiosInstance.get('/settings/fee/example', {
    params: { network, amount },
  });
  return response.data[network.toLowerCase()];
}

// Get all settings (admin only)
export async function getAllSettings(): Promise<Record<string, any>> {
  const response = await axiosInstance.get('/settings');
  return response.data;
}

// Update setting (admin only)
export async function updateSetting(key: string, value: any): Promise<void> {
  await axiosInstance.put(`/settings/${key}`, { value });
}

// Update multiple settings (admin only)
export async function updateMultipleSettings(
  settings: Record<string, any>
): Promise<void> {
  await axiosInstance.put('/settings', settings);
}
