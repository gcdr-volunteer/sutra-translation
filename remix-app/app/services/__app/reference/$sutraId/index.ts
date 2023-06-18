import { json } from '@remix-run/node';
import { created } from 'remix-utils';
import { getRollsBySutraId, upsertRoll } from '~/models/roll';
import type { AsStr, Roll, User } from '~/types';
import { Intent } from '~/types/common';
import { logger } from '~/utils';
import { initialSchema, schemaValidator } from '~/utils/schema_validator';
import * as yup from 'yup';
import dayjs from 'dayjs';
import { composeIdForRoll } from '~/models/utils';

const newRollSchema = (user: User) => {
  const baseSchema = initialSchema();
  // TODO: using strict().noUnknown() to stop unknown params
  const sutraSchema = baseSchema.shape({
    PK: yup.string().optional().required('primary key cannot be empty'),
    SK: yup.string().required('SK cannot be empty'),
    category: yup.string().trim().required('category cannot be empty'),
    title: yup.string().trim().required('roll title cannot be empty'),
    subtitle: yup.string().trim().required('subtitle cannot be empty'),
    finish: yup.boolean().optional().default(true),
    kind: yup.mixed<'ROLL'>().default('ROLL'),
    intent: yup.string().strip(),
  });
  return sutraSchema;
};

export const handleCreateNewRoll = async ({
  roll,
  user,
}: {
  roll: AsStr<Partial<Roll>>;
  user: User;
}) => {
  try {
    logger.log(handleCreateNewRoll.name, 'new roll', roll);
    const allRolls = await getRollsBySutraId(roll?.PK || '');
    let SK = `${roll.PK}-R0000`;
    allRolls?.sort((a, b) => Number(dayjs(a.createdAt)) - Number(dayjs(b.createdAt)));
    if (allRolls.length) {
      const lastSK = allRolls[allRolls.length - 1].SK || '';
      const newRollId = parseInt(lastSK.slice(lastSK.length - 4)) + 1;

      SK = composeIdForRoll({ sutraId: roll.PK || '', id: newRollId });
    }
    const result = await schemaValidator({
      schema: newRollSchema(user),
      obj: { ...roll, SK },
    });
    logger.log(handleCreateNewRoll.name, 'result', result);
    await upsertRoll(result);
    return created({ data: {}, intent: Intent.CREATE_ROLL });
  } catch (errors) {
    logger.error(handleCreateNewRoll.name, 'error', errors);
    return json({ errors, intent: Intent.CREATE_ROLL });
  }
};
