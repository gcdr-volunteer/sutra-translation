import type { Lang } from './lang';
import type { Paragraph } from './paragraph';
import type { Roll } from './roll';
import type { Sutra } from './sutra';
import type { Comment, Message } from './comment';
import type { Glossary } from './glossary';
import type { Team } from './team';
import type { Role } from './role';
import type { User } from './user';
import type { Footnote } from './footnote';
import type { RefBook, Reference } from './reference';

export * from './comment';
export * from './error';
export * from './lang';
export * from './role';
export * from './team';
export * from './user';
export * from './sutra';
export * from './roll';
export * from './glossary';
export * from './paragraph';
export * from './footnote';
export * from './reference';

export type AsStr<T> = {
  [K in keyof T]: string;
};

export type Key = {
  SK: string;
  PK: string;
};

export type MetaData = {
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type UpdateType<T> = Partial<T> & Required<Key> & MetaData;
export type UpdatedType<T> = T & Key & MetaData;
export type CreateType<T> = T & MetaData & Key;
export type CreatedType<T> = CreateType<T>;
export type Doc =
  | Omit<Sutra, 'kind'>
  | Omit<Roll, 'kind'>
  | Omit<Paragraph, 'kind'>
  | Omit<Comment, 'kind'>
  | Omit<Glossary, 'kind'>
  | Omit<Lang, 'kind'>
  | Omit<Team, 'kind'>
  | Omit<User, 'kind'>
  | Omit<Role, 'kind'>
  | Omit<Footnote, 'kind'>
  | Omit<Reference, 'kind'>
  | Omit<Message, 'kind'>
  | Omit<RefBook, 'kind'>;
