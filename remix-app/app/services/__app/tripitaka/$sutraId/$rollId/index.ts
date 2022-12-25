import { baseSchemaForCreate, schemaValidator } from '~/utils/schema_validator';
import * as yup from 'yup';
import { json } from '@remix-run/node';
import { logger } from '~/utils';
import { createNewComment } from '~/models/comment';
import { Comment } from '~/types/comment';

const newCommentSchema = () => {
  const baseSchema = baseSchemaForCreate();
  const translationSchema = baseSchema.shape({
    targets: yup
      .array()
      .of(yup.string())
      .transform((value) => {
        if (!value[0]) {
          return ['ALL'];
        }
      }),
    priority: yup.mixed().oneOf(['Low', 'Medium', 'High']).required('priority is required'),
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
  });
  return translationSchema;
};

export const handleNewComment = async (newComment: Comment) => {
  try {
    const result = await schemaValidator({
      schema: newCommentSchema(),
      obj: newComment,
    });
    await createNewComment(result);
    return json({ data: {}, intent: 'new_comment' });
  } catch (errors) {
    logger.error('handleNewComment', 'error', errors);
    return json({ errors: { errors } });
  }
};
