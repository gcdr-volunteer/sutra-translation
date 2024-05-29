import type { AsStr, Sutra, User } from '~/types';
import { LangCode } from '~/types';
import { json } from '@remix-run/node';
import { Intent } from '~/types/common';
import { initialSchema, schemaValidator } from '~/utils/schema_validator';
import * as yup from 'yup';
import { logger } from '~/utils';
import { getSutrasByLang, upsertSutra } from '~/models/sutra';
import dayjs from 'dayjs';
import { composeIdForSutra } from '~/models/utils';
import { created } from 'remix-utils';

const newSutraSchema = (user: User) => {
  const baseSchema = initialSchema();
  // TODO: using strict().noUnknown() to stop unknown params
  const sutraSchema = baseSchema.shape({
    PK: yup.string().optional().default('TRIPITAKA'),
    SK: yup.string().required('SK cannot be empty'),
    category: yup.string().trim().required('category cannot be empty'),
    title: yup.string().trim().required('sutra name cannot be empty'),
    translator: yup.string().trim().required('translator name cannot be empty'),
    origin_lang: yup
      .mixed<LangCode>()
      .optional()
      .default(user.origin_lang ?? LangCode.ZH),
    roll_count: yup.number().required('num of rolls cannot be empty'),
    roll_start: yup.number().required('start of roll cannot be empty'),
    time_from: yup.number().required('start of year cannot be empty'),
    time_to: yup.number().required('end of year cannot be empty'),
    num_chars: yup.number().required('num of characters cannot be empty'),
    dynasty: yup.string().trim().required('dynasty cannot be empty'),
    lang: yup.mixed<LangCode>().optional().default(user.origin_lang),
    finish: yup.boolean().optional().default(true),
    kind: yup.mixed<'SUTRA'>().default('SUTRA'),
    intent: yup.string().strip(),
  });
  return sutraSchema;
};
export const handleCreateNewSutra = async ({
  sutra,
  user,
}: {
  sutra: AsStr<Partial<Sutra>>;
  user: User;
}) => {
  try {
    logger.log(handleCreateNewSutra.name, 'new sutra', sutra);
    const allSutras = await getSutrasByLang(user.origin_lang);
    let SK = `${user.origin_lang}-V1-S0000`;
    allSutras.sort((a, b) => Number(dayjs(a.createdAt)) - Number(dayjs(b.createdAt)));
    if (allSutras.length) {
      const lastSK = allSutras[allSutras.length - 1].SK;
      const newSutraId = parseInt(lastSK.slice(lastSK.length - 4)) + 1;

      SK = composeIdForSutra({ lang: user.origin_lang, id: newSutraId, version: 'V1' });
    }
    const result = await schemaValidator({
      schema: newSutraSchema(user),
      obj: { ...sutra, SK },
    });
    logger.log(handleCreateNewSutra.name, 'result', result);
    await upsertSutra(result);
    return created({ data: {}, intent: Intent.CREATE_SUTRA });
  } catch (errors) {
    logger.error(handleCreateNewSutra.name, 'error', errors);
    return json({ errors, intent: Intent.CREATE_SUTRA });
  }
};
