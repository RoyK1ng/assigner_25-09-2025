export interface User {
  id: string;
  username: string;
  is_admin: boolean;
  status: 'FREE' | 'BUSY';
  last_free_time: string;
  created_at: string;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  assigned_to: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  created_at: string;
  completed_at: string | null;
}