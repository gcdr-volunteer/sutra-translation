import type { Lang } from './lang';
import type { Role } from './role';
import type { Team } from './team';
import type { CommonMeta } from './common';

export interface User extends CommonMeta {
  /**
   * full login name
   * If no username providered, we use email as username
   */
  username: string;
  /**
   * The email of a user, which can be used to login
   */
  email: string;
  /**
   * The role of the current user
   */
  roles: Role['name'][];
  /**
   * The team which this user belongs to (team name, not team alias)
   */
  team: Team['name'];
  /**
   * A translation happens from a origin language to a target language
   * this value will help to identify current user's origin language
   * which also useful to tell system which language sutras should show to
   * this user
   */
  origin_lang: Lang['name'];
  /**
   * A translation happens from a origin language to a target language
   * this value will help to identify current user's target language
   * which also useful to tell system which language sutras should show to
   * this user
   */
  target_lang: Lang['name'];
  /**
   * Since we system is invitation based. Admin will help to create user with
   * password first. When a user first time login, he/she will be redirect to
   * change password page to update their password
   */
  first_login: boolean;
  /**
   * a hashed password
   */
  password: string;
  /**
   * The base64 encoded user avatar image
   */
  avatar?: string;
  /**
   * The sutra the user is currently working on. Generally a user can working
   * on a sutra at a time and should match whatever his/her team working on
   * however, an assistor can working on different sutras
   */
  working_sutra?: string;
  /**
   * This is the time stamp when the user's reset password link will be expired
   */
  linkValidUtil?: string;
  /**
   * The helper type
   */
  kind: 'USER';
}
