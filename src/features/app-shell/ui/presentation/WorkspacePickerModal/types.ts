import type { WorkspacePickerItem } from '@/features/app-shell/rules/types';

export type WorkspacePickerTab = 'all' | 'personal' | 'teams';

export interface WorkspacePickerModalProps {
  open: boolean;
  selectedWorkspaceId?: string | null;
  workspaces: WorkspacePickerItem[];
  searchQuery: string;
  pagination?: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSearchQueryChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onClickCreateWorkspace: () => void;
  onClickWorkspace: (workspace: WorkspacePickerItem) => void;
  onClickWorkspaceDetails: (workspace: WorkspacePickerItem) => void;
}
