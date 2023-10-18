import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import type { SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { logger } from '../../utils';

const sesClient = () => new SESv2Client({ region: process.env.REGION });

const getRegistrationTemplate = (username: string, email: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome - Registration Successful</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; position: relative; min-height: 100vh;">

<div style="background-color: #BF8A54; color: #ffffff; text-align: center; padding: 20px;">
    <h1 style="margin: 0; font-size: 24px;">Welcome - Registration Successful</h1>
</div>

<div style="padding: 20px; text-align: center;">
    <p style="font-size: 16px; margin-bottom: 20px;">Dear <span style="font-weight: bold;">${username}</span></p>
    <p style="font-size: 16px; margin-bottom: 20px;">Thank you for joining our community! Your registration was successful.</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Your initial login credential is:</p>
    <p style="font-size: 16px; margin-bottom: 20px;">
    <span>username:</span>
    <span style="font-weight: bold;">${email}</span><br />
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
    <span>password:</span>
    <span style="font-weight: bold;">123456789</span><br />
    </p>
    <a href="https://btts-kumarajiva.org" style="display: inline-block; background-color: #BF8A54; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; border: none; cursor: pointer;">Explore Our Website</a>
</div>

<div style="position: absolute; bottom: 0; width: 100%; background-color: #BF8A54; color: #ffffff; text-align: center; padding: 10px; border-top: 1px solid #dee2e6;">
    <p style="margin: 0; font-size: 14px;">If you have any questions, feel free to contact us at <a href="mailto:kumarajiva.translation@gmail.com" style="color: #ffffff; text-decoration: underline;">kumarajiva.translation@gmail.com</a>.</p>
</div>

</body>
</html>
`;
export const sendRegistrationEmail = async ({
  email,
  username,
}: {
  email: string;
  username: string;
}) => {
  try {
    const senderAddress = 'kumarajiva.translation@gmail.com';
    const input: SendEmailCommandInput = {
      FromEmailAddress: senderAddress,
      FromEmailAddressIdentityArn:
        process.env.ENV === 'prod'
          ? 'arn:aws:ses:ap-southeast-2:737505490804:identity/kumarajiva.translation@gmail.com'
          : 'arn:aws:ses:ap-southeast-2:649946320078:identity/kumarajiva.translation@gmail.com',
      Destination: {
        ToAddresses: [email],
        BccAddresses: [senderAddress],
      },
      FeedbackForwardingEmailAddress: senderAddress,
      Content: {
        Simple: {
          Subject: {
            Data: 'Welcome to Kumarajiva translation platform',
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: getRegistrationTemplate(username, email),
              Charset: 'UTF-8',
            },
          },
        },
      },
    };

    const result = await sesClient().send(new SendEmailCommand(input));
    logger.log(sendRegistrationEmail.name, 'result', result);
  } catch (error) {
    logger.error(sendRegistrationEmail.name, 'error', error);
  }
};

const getResetPasswordLinkTemplate = (link: string, email: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; position: relative; min-height: 100vh;">

<div style="background-color: #BF8A54; color: #ffffff; text-align: center; padding: 20px;">
    <h1 style="margin: 0; font-size: 24px;">Reset Password</h1>
</div>

<div style="padding: 20px; text-align: center;">
    <p style="font-size: 16px; margin-bottom: 20px;">Here is your reset password <a href=${link}>${link}</a></p>
    <p>This link will be expire in 30 minutes</p>
</div>

<div style="position: absolute; bottom: 0; width: 100%; background-color: #BF8A54; color: #ffffff; text-align: center; padding: 10px; border-top: 1px solid #dee2e6;">
    <p style="margin: 0; font-size: 14px;">If you have any questions, feel free to contact us at <a href="mailto:kumarajiva.translation@gmail.com" style="color: #ffffff; text-decoration: underline;">kumarajiva.translation@gmail.com</a>.</p>
</div>

</body>
</html>
`;
export const sendResetPasswordLinkEmail = async ({
  email,
  link,
}: {
  email: string;
  link: string;
}) => {
  try {
    const senderAddress = 'kumarajiva.translation@gmail.com';
    const input: SendEmailCommandInput = {
      FromEmailAddress: senderAddress,
      FromEmailAddressIdentityArn:
        process.env.ENV === 'prod'
          ? 'arn:aws:ses:ap-southeast-2:737505490804:identity/kumarajiva.translation@gmail.com'
          : 'arn:aws:ses:ap-southeast-2:649946320078:identity/kumarajiva.translation@gmail.com',
      Destination: {
        ToAddresses: [email],
        BccAddresses: [senderAddress],
      },
      FeedbackForwardingEmailAddress: senderAddress,
      Content: {
        Simple: {
          Subject: {
            Data: 'Reset password',
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: getResetPasswordLinkTemplate(email, link),
              Charset: 'UTF-8',
            },
          },
        },
      },
    };

    const result = await sesClient().send(new SendEmailCommand(input));
    logger.log(sendRegistrationEmail.name, 'result', result);
  } catch (error) {
    logger.error(sendRegistrationEmail.name, 'error', error);
  }
};
