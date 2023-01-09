export interface CommonMeta {
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  PK?: string;
  SK?: string;
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
  READ_OPENSEARCH = 'read_opensearch',
  CREATE_TRANSLATION = 'create_translation',
  CREATE_GLOSSARY = 'create_glossary',
  CREATE_FOOTNOTE = 'create_footnote',
  CREATE_COMMENT = 'create_comment',
  CREATE_MESSAGE = 'create_message',
  CREATE_USER = 'create_user',
  CREATE_TEAM = 'create_team',
  CREATE_LANG = 'create_lang',
}
