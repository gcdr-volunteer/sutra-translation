export const roles = ['Admin', 'Leader', 'Editor', 'Viewer'] as const;
export const langs = ['ZH', 'EN'] as const;
type RoleTuple = typeof roles;
type LangTuple = typeof langs;
export type Role = RoleTuple[number];
interface CommonMeta {
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}
export type Lang = LangTuple[number];
export enum Team {
  TEAM0001 = 'Master Sure',
  TEAM0002 = 'Master Chi',
}
export interface User extends CommonMeta {
  username: string;
  email: string;
  roles: Role[];
  team: Team;
  origin_lang: Lang;
  target_lang: Lang;
  first_login: boolean;
}
