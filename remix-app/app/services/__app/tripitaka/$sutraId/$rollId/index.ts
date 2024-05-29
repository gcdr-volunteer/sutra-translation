import { initialSchema, schemaValidator } from '~/utils/schema_validator';
import * as yup from 'yup';
import { type User } from '~/types';
import { json } from '@remix-run/node';
import { logger } from '~/utils';
import { createNewComment, createNewMessage, resolveComment } from '~/models/comment';
import { nanoid } from 'nanoid';
import { Intent } from '~/types/common';
import { created } from 'remix-utils';
import type { Comment, Message } from '~/types/comment';

const newCommentSchema = (user: User) => {
  const baseSchema = initialSchema();
  const id = nanoid();
  const translationSchema = baseSchema.noUnknown().shape({
    ping: yup.array().of(yup.mixed<string>().required()).required(),
    priority: yup.mixed().oneOf(['1', '2', '3']).required('priority is required'),
    comment: yup.string().trim().required('comment cannot be empty'),
    content: yup.string().required('select to highlight content cannot be empty'),
    path: yup.string().required('the path of the current roll is required'),
    sutraId: yup
      .string()
      .trim()
      .required('the sutra id cannot be empty')
      .transform((value) => value.replace(user.origin_lang, user.target_lang)),
    rollId: yup
      .string()
      .trim()
      .required('the roll id cannot be empty')
      .transform((value) => value.replace(user.origin_lang, user.target_lang)),
    paragraphId: yup
      .string()
      .trim()
      .required('the paragraph id cannot be empty')
      .transform((value) => value.replace(user.origin_lang, user.target_lang)),
    resolved: yup.mixed<0 | 1>().default(0),
    creatorAlias: yup.string().default(''),
    id: yup.string().default(id),
    parentId: yup.string().default(id),
    createdBy: yup.string(),
    updatedBy: yup.string(),
    kind: yup.mixed<'COMMENT'>().default('COMMENT'),
  });
  return translationSchema;
};

const newMessageSchema = (user: User) => {
  const baseSchema = initialSchema();
  const id = nanoid();
  return baseSchema.noUnknown().shape({
    comment: yup.string().trim().required('comment cannot be empty'),
    sutraId: yup
      .string()
      .trim()
      .required('the sutra id cannot be empty')
      .transform((value) => value.replace(user.origin_lang, user.target_lang)),
    rollId: yup
      .string()
      .trim()
      .required('the roll id cannot be empty')
      .transform((value) => value.replace(user.origin_lang, user.target_lang)),
    paragraphId: yup
      .string()
      .trim()
      .required('the paragraph id cannot be empty')
      .transform((value) => value.replace(user.origin_lang, user.target_lang)),
    content: yup.string().required('content cannot be empty'),
    creatorAlias: yup.string().default(''),
    id: yup.string().default(id),
    parentId: yup.string().required('parentId cannot be empty'),
    createdBy: yup.string().default(''),
    updatedBy: yup.string().default(''),
  });
};

const updateCommentSchema = (user: User) => {
  const baseSchema = initialSchema();
  return baseSchema.noUnknown().shape({
    before: yup.string().trim().required('previous content cannot be empty'),
    after: yup
      .string()
      .trim()
      .transform((value) => value.replace(/\n/g, ''))
      .required('modified content cannot be empty'),
    rollId: yup
      .string()
      .trim()
      .required('the roll id cannot be empty')
      .transform((value) => value.replace(user.origin_lang, user.target_lang)),
    paragraphId: yup
      .string()
      .trim()
      .required('the paragraph id cannot be empty')
      .transform((value) => value.replace(user.origin_lang, user.target_lang)),
    commentId: yup.string().required('commentId cannot be empty'),
  });
};

export const handleNewComment = async (newComment: Omit<Comment, 'kind'>, user: User) => {
  try {
    logger.log(handleNewComment.name, 'newComment', newComment);
    const result = await schemaValidator({
      schema: newCommentSchema(user),
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

export const handleNewMessage = async (newMessage: Message, user: User) => {
  try {
    logger.log(handleNewMessage.name, 'newMessage', newMessage);
    const result = await schemaValidator({
      schema: newMessageSchema(user),
      obj: newMessage,
    });
    await createNewMessage(result);
    return created({ data: {}, intent: Intent.CREATE_MESSAGE });
  } catch (error) {
    // TODO: handle failure case
    logger.error(handleNewMessage.name, 'error', error);
  }
};

export const handleResolveComment = async (
  newComment: {
    rollId: string;
    paragraphId: string;
    before: string;
    after: string;
    commentId: string;
    createdBy: string;
    updatedBy: string;
  },
  user: User
) => {
  try {
    logger.log(handleResolveComment.name, 'new comment', newComment);
    const result = await schemaValidator({
      schema: updateCommentSchema(user),
      obj: newComment,
    });
    logger.log(handleResolveComment.name, 'result', result);
    await resolveComment(result);
    return json({ data: {}, intent: Intent.UPDATE_COMMENT_AND_PARAGRAPH });
  } catch (error) {
    // TODO: handle failure case
    logger.error(handleResolveComment.name, 'error', error);
  }
};
