import type { CreateType, Footnote, Key, UpdateType } from '~/types';
import { dbGetByKey, dbInsert, dbUpdate } from '~/models/external_services/dynamodb';

export const getFootnoteByPrimaryKey = async (key: Key): Promise<Footnote | undefined> => {
  return await dbGetByKey({ tableName: process.env.COMMENT_TABLE, key });
};

const createFootnote = async (footnote: CreateType<Footnote>) => {
  return await dbInsert({ tableName: process.env.COMMENT_TABLE, doc: footnote });
};

const updateFootnote = async (footnote: UpdateType<Footnote>) => {
  return await dbUpdate({ tableName: process.env.COMMENT_TABLE, doc: footnote });
};

export const upsertFootnote = async (footnote: CreateType<Footnote> | UpdateType<Footnote>) => {
  const prevFootnote = await getFootnoteByPrimaryKey({ PK: footnote.PK, SK: footnote.SK });
  if (prevFootnote) {
    const newFootnote = {
      ...prevFootnote,
      ...footnote,
    };
    return await updateFootnote(newFootnote);
  }
  return await createFootnote(footnote as CreateType<Footnote>);
};
