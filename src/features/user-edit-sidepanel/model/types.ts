import type { DTOs } from '@/shared/api';

export interface UserEditSidepanelProps {
  action: 'create' | 'update';
  user: DTOs.User;
  onSubmitSuccess?: () => void;
}
