export interface CommonMeta {
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  PK?: string;
  SK?: string;
  kind: Kind;
}

export enum Kind {
  USER = 'USER',
  TEAM = 'TEAM',
  COMMENT = 'COMMENT',
  LANG = 'LANG',
  SUTRA = 'SUTRA',
  ROLL = 'ROLL',
  PARAGRAPH = 'PARAGRAPH',
  GLOSSARY = 'GLOSSARY',
}

export enum Intent {
  READ_DEEPL = 'read_deepl',
  CREATE_TRANSLATION = 'create_translation',
  CREATE_GLOSSARY = 'create_glossary',
  CREATE_COMMENT = 'create_comment',
  CREATE_MESSAGE = 'create_message',
  CREATE_USER = 'create_user',
  CREATE_TEAM = 'create_team',
  CREATE_LANG = 'create_lang',
}
