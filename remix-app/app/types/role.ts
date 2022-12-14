import { CommonMeta } from './user';

export interface Role extends CommonMeta {
  name: 'Admin' | 'Editor' | 'Leader' | 'Viewer';
}
