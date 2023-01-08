import type { CommonMeta } from './common';

export enum RoleType {
  /**
   * Admin has full access permission
   */
  Admin = 'Admin',
  /**
   * Leader has create | update | read | delete permission
   * Plus bulk update permission like update a word to another one
   * for entire sutra
   */
  Leader = 'Leader',
  /**
   * Editor has create | update | read permission
   */
  Editor = 'Editor',
  /**
   * Reviewer only has read | comment permission
   */
  Reviewer = 'Reviewer',
  /**
   * Reader can only read, and see translation tab
   */
  Reader = 'Reader',
  /**
   * The role is to help debug system issue, like view history to identify
   * issues
   */
  Debug = 'Debug',
}

export interface Role extends CommonMeta {
  /**
   * The name of the role
   */
  name: RoleType;
  /**
   * The helper type
   */
  kind: 'ROLE';
}
