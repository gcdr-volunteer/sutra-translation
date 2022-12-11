import { UserError } from '~/domains/custom_errors';
export const roles = ['Admin', 'Leader', 'Editor', 'Viewer'] as const;
type RoleTuple = typeof roles;
export type Role = RoleTuple[number];
export type Lang = 'ZH' | 'EN';
export const enum Team {
  TEAM0001 = 'Master Sure',
  TEAM0002 = 'Master Chi',
}
export interface CommonMeta {
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}
export interface TUser {
  username: string;
  password: string;
  email: `${string}@${string}`;
  role: Role;
  source_lang: Lang;
  target_lang: Lang;
  team_name: Team;
}
export interface TDBUser extends TUser, CommonMeta {
  PK: `USER-${string}`;
}
interface IDbctx {
  user: {
    addUser(user: TDBUser): Promise<void>;
    updateUser(user: Partial<TDBUser>): Promise<void>;
  };
}
export class User {
  username: string;
  password: string;
  email: `${string}@${string}`;
  role: Role;
  source_lang: Lang;
  target_lang: Lang;
  team_name: Team;
  user_table: IDbctx['user'];
  constructor(
    { username, password, email, role, source_lang, target_lang, team_name }: TUser,
    ctx: IDbctx
  ) {
    if (!username) {
      throw new UserError('username is not defined');
    }
    if (!password) {
      throw new UserError('password is not defined');
    }
    if (!email) {
      throw new UserError('email is not defined');
    }
    if (!source_lang) {
      throw new UserError('source language is not defined');
    }
    if (!target_lang) {
      throw new UserError('target language is not defined');
    }
    if (!ctx.user) {
      throw new Error('user table is not created');
    }
    this.username = username;
    this.password = password;
    this.email = email;
    this.role = role ?? 'Viewer';
    this.source_lang = source_lang;
    this.target_lang = target_lang;
    this.team_name = team_name ?? Team.TEAM0001;
    this.user_table = ctx.user;
  }
  async addUser(user: TUser): Promise<TUser> {
    await this.user_table.addUser({
      ...user,
      PK: `USER-value`,
      createdBy: this.username,
      updatedBy: this.username,
    });
    return user;
  }
  async updateUser(user: Partial<Omit<TUser, 'role | team_name'>>): Promise<void> {
    await this.user_table.updateUser(user);
  }
  async updateRole(role: Role): Promise<void> {
    if (this.role !== 'Admin') {
      throw new UserError('you dont have permission to update role');
    }
    await this.user_table.updateUser({ role });
  }
}
