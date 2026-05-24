import type { ReactNode } from 'react';

import type { LucideProps } from 'lucide-react';

import type { SchemaFilesystemContent } from '@/entities/file-manager/rules/schema';

import type { ViewMode } from '@/features/file-manager-sidepanel/rules/types';

export interface FilesystemBrowserProps {
  viewMode: ViewMode;
  contents: SchemaFilesystemContent[];
  searchQuery: string;
  selectedItem?: SchemaFilesystemContent | null;
  onClickBackground?: () => void;
  onItemClick?: (
    content: SchemaFilesystemContent,
    target: HTMLButtonElement,
  ) => void;
  onItemDoubleClick?: (
    content: SchemaFilesystemContent,
    target: HTMLButtonElement,
  ) => void;
}

export interface RowItemProps {
  isSelected?: boolean;
  isOdd?: boolean;
  onClick?: (target: HTMLButtonElement) => void;
  onDoubleClick?: (target: HTMLButtonElement) => void;

  icon: (props: LucideProps) => ReactNode;

  contentName: string;
  contentFileSizeFormatted?: string;
  contentFileExtension: string;
  contentLastUpdated: Date;
}

export interface GridItemProps {
  isSelected?: boolean;
  onClick?: (target: HTMLButtonElement) => void;
  onDoubleClick?: (target: HTMLButtonElement) => void;
  icon: (props: LucideProps) => ReactNode;

  contentName: string;
}

export type BaseButtonProps = {
  className?: string;
  children: ReactNode;
  onClick?: (target: HTMLButtonElement) => void;
  onDoubleClick?: (target: HTMLButtonElement) => void;
  [key: `data-${string}`]: string;
};
