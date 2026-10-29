import { createRouter } from '@tanstack/react-router';

import { installStaleChunkReload } from '@/shared/libs/browser/stale-chunk-reload';

import { routeTree } from './routeTree.gen';

// Create a new router instance
export const getRouter = () => {
  if (typeof window !== 'undefined') installStaleChunkReload();

  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
};
