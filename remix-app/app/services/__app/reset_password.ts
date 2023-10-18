import { getUserByEmail, updateUser } from '~/models/user';
import { initialSchema, schemaValidator } from '~/utils/schema_validator';
import * as yup from 'yup';
import crypto from 'crypto';
import { sendResetPasswordLinkEmail } from '~/models/external_services/ses';
import { rawUtc } from '../../utils';

export const generateResetPasswordToken = (password: string) => {
  return crypto.createHash('sha512').update(password).digest('hex');
};
const emailSchema = () => {
  const baseSchema = initialSchema();
  const schema = baseSchema.shape({
    email: yup.string().email().required(),
  });
  return schema;
};
export const sendResetPasswordEmail = async (email: string) => {
  try {
    const result = await schemaValidator({
      schema: emailSchema(),
      obj: { email },
    });
    const user = await getUserByEmail(result.email);
    if (user) {
      const hash = generateResetPasswordToken(user.password);
      const url =
        process.env.ENV === 'prod' ? 'https://btts-kumarajiva.org' : 'http://localhost:3000';
      const link = `${url}/update_password?email=${result.email}&hash=${hash}`;
      const linkValidUtil = rawUtc().add(30, 'minutes').format();
      await updateUser({ PK: user.PK, SK: user.SK, linkValidUtil });
      await sendResetPasswordLinkEmail({ email: result.email, link });
    }
    return undefined;
  } catch (error) {
    return undefined;
  }
};
