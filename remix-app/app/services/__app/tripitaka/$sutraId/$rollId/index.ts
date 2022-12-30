import { baseSchemaFor, schemaValidator } from '~/utils/schema_validator';
import * as yup from 'yup';
import { json } from '@remix-run/node';
import { logger } from '~/utils';
import { createNewComment, resolveComment } from '~/models/comment';
import { Comment } from '~/types/comment';
import { nanoid } from 'nanoid';
import { Intent, Kind } from '~/types/common';
import { created } from 'remix-utils';

const newCommentSchema = () => {
  const baseSchema = baseSchemaFor(Kind.COMMENT);
  const id = nanoid();
  const translationSchema = baseSchema.noUnknown().shape({
    targets: yup
      .array()
      .of(yup.string())
      .transform((value) => {
        if (!value[0]) {
          return ['ALL'];
        }
        return value;
      }),
    priority: yup.mixed().oneOf(['1', '2', '3']).required('priority is required'),
    comment: yup.string().trim().required('comment cannot be empty'),
    start: yup.number().required('start index of the selected content is required'),
    end: yup.number().required('end index of the selected content is required'),
    content: yup.string().required('selet to highlight content cannot be empty'),
    path: yup.string().required('the path of the current roll is required'),
    sutraId: yup
      .string()
      .trim()
      .required('the sutra id cannot be empty')
      .transform((value) => value.replace('ZH', 'EN')),
    rollId: yup
      .string()
      .trim()
      .required('the roll id cannot be empty')
      .transform((value) => value.replace('ZH', 'EN')),
    paragraphId: yup
      .string()
      .trim()
      .required('the paragraph id cannot be empty')
      .transform((value) => value.replace('ZH', 'EN')),
    resolved: yup.mixed<0 | 1>().default(0),
    creatorAlias: yup.string().default(''),
    id: yup.string().default(id),
    parentId: yup.string().default(id),
    createdBy: yup.string(),
    updatedBy: yup.string(),
  });
  return translationSchema;
};

export const handleNewComment = async (newComment: Omit<Comment, 'kind'>) => {
  try {
    logger.log(handleNewComment.name, 'newComment', newComment);
    const result = await schemaValidator({
      schema: newCommentSchema(),
      obj: newComment,
    });
    logger.log(handleNewComment.name, 'result', result);
    await createNewComment(result);
    return created({ data: {}, intent: Intent.CREATE_COMMENT });
  } catch (errors) {
    logger.error(handleNewComment.name, 'error', errors);
    return json({ errors: { errors } });
  }
};

export const handleResolveComment = async (SK: string) => {
  try {
    logger.log(handleNewComment.name, 'SK', SK);
    await resolveComment(SK);
    return json({ data: {}, intent: Intent.CREATE_MESSAGE });
  } catch (error) {
    // TODO: handle failure case
    logger.error(handleResolveComment.name, 'error', error);
  }
};
