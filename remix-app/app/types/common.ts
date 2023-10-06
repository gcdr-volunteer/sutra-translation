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
  ASK_OPENAI = 'ask_openai',
  READ_OPENSEARCH = 'read_opensearch',
  MARK_ROLL_COMPLETE = 'mark_roll_complete',
  CREATE_TRANSLATION = 'create_translation',
  CREATE_REFERENCE = 'create_reference',
  UPDATE_REFERENCE = 'update_reference',
  CREATE_GLOSSARY = 'create_glossary',
  READ_GLOSSARY = 'read_glossary',
  SEARCH_GLOSSARY = 'search_glossary',
  UPDATE_GLOSSARY = 'update_glossary',
  BULK_CREATE_GLOSSARY = 'bulk_create_glossary',
  CREATE_FOOTNOTE = 'create_footnote',
  CREATE_COMMENT = 'create_comment',
  UPDATE_COMMENT_AND_PARAGRAPH = 'update_comment_and_paragraph',
  CREATE_MESSAGE = 'create_message',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  CREATE_TEAM = 'create_team',
  CREATE_LANG = 'create_lang',
  CREATE_REF_BOOK = 'create_ref_book',
  UPDATE_REF_BOOK = 'update_ref_book',
}
