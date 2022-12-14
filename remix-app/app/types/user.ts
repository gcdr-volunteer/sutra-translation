import { Lang } from './lang';
import { Role } from './role';
import { Team } from './team';

export interface CommonMeta {
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  PK?: string;
  SK?: string;
}
export interface User extends CommonMeta {
  username: string;
  email: string;
  roles: Role['name'][];
  team: Team;
  origin_lang: Lang['name'];
  target_lang: Lang['name'];
  first_login: boolean;
  password?: string;
}
