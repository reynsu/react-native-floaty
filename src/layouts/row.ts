import type { LayoutModule } from './types';

export const rowLayout: LayoutModule = {
  barStyle: () => ({
    flexDirection: 'row',
    alignItems: 'center',
  }),
  actionStyle: () => ({}),
};
