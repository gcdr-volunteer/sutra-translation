import { CommonMeta } from './user';

export interface Team extends CommonMeta {
  /**
   * The name of a team, it's better to make it consistent, like TeamA, TeamB
   * Or Team1, Team2. The reason we have this value is that we don't really want
   * to show real team name (alias) to the end user
   */
  name: string;
  /**
   * The team leader name like Master Sure, Master Chi
   */
  alias: string;
}
