export type User = {
  wallet_address?: string;
  username?: string;
  points?: number;
  referral_code?: string;
  referral_count?: number;
  referrals: Referral[];
  completed_tasks?: number[];
  task_history?: any[];
  telegram_user_id?: string;
  telegram_username?: string;
  telegram_photo_url?: string;
  x_user_id?: string;
  x_username?: string;
  x_oauth_token?: string;
};

export type Referral = {
  wallet_address: string;
  score: number;
};
