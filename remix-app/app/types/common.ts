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
  CREATE_SUTRA = 'create_sutra',
  CREATE_SUTRA_META = 'create_sutra_meta',
  CREATE_ROLL_META = 'create_roll_meta',
  CREATE_ROLL = 'create_roll',
  UPDATE_PARAGRAPH = 'update_paragraph',
  CREATE_BULK_PARAGRAPH = 'create_bulk_paragraph',
  READ_DEEPL = 'read_deepl',
  READ_OPENAI = 'read_openai',
  UPDATE_OPENAI = 'update_openai',
  READ_OPENSEARCH = 'read_opensearch',
  MARK_ROLL_COMPLETE = 'mark_roll_complete',
  CREATE_TRANSLATION = 'create_translation',
  CREATE_REFERENCE = 'create_reference',
  CREATE_GLOSSARY = 'create_glossary',
  READ_GLOSSARY = 'read_glossary',
  UPDATE_GLOSSARY = 'update_glossary',
  CREATE_FOOTNOTE = 'create_footnote',
  CREATE_COMMENT = 'create_comment',
  UPDATE_COMMENT = 'update_comment',
  CREATE_MESSAGE = 'create_message',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  CREATE_TEAM = 'create_team',
  CREATE_LANG = 'create_lang',
  CREATE_REF_BOOK = 'create_ref_book',
}
