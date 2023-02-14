import type { CreateType, Key, Roll, UpdateType } from '~/types';
import {
  dbGetByKey,
  dbGetByPartitionKey,
  dbInsert,
  dbUpdate,
} from '~/models/external_services/dynamodb';

export const getRollsBySutraId = async (PK: string): Promise<Roll[]> => {
  return await dbGetByPartitionKey(PK);
};

export const getRollByPrimaryKey = async (key: Key): Promise<Roll | undefined> => {
  return await dbGetByKey({ tableName: process.env.TRANSLATION_TABLE, key });
};

const createRoll = async (roll: CreateType<Roll>) => {
  return await dbInsert({ tableName: process.env.TRANSLATION_TABLE, doc: roll });
};

const updateRoll = async (roll: UpdateType<Roll>) => {
  return await dbUpdate({ tableName: process.env.TRANSLATION_TABLE, doc: roll });
};

export const upsertRoll = async (roll: CreateType<Roll> | UpdateType<Roll>) => {
  const prevRoll = await getRollByPrimaryKey({ PK: roll.PK, SK: roll.SK });
  if (prevRoll) {
    const newRoll = {
      ...prevRoll,
      ...roll,
    };
    return await updateRoll(newRoll);
  }
  return await createRoll(roll as CreateType<Roll>);
};
