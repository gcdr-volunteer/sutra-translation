import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import type { SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { logger } from '../../utils';

const sesClient = () => new SESv2Client({ region: process.env.REGION });

const getRegistrationTemplate = (username: string) => `
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
    <p style="font-size: 16px; margin-bottom: 20px;">Dear ${username},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Thank you for joining our community! Your registration was successful.</p>
    <a href="https://www.example.com" style="display: inline-block; background-color: #BF8A54; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; border: none; cursor: pointer;">Explore Our Website</a>
</div>

<div style="position: absolute; bottom: 0; width: 100%; background-color: #BF8A54; color: #ffffff; text-align: center; padding: 10px; border-top: 1px solid #dee2e6;">
    <p style="margin: 0; font-size: 14px;">If you have any questions, feel free to contact us at <a href="mailto:kumarajiva.translation@gmail.com" style="color: #ffffff; text-decoration: underline;">info@example.com</a>.</p>
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
        'arn:aws:ses:ap-southeast-2:649946320078:identity/kumarajiva.translation@gmail.com',
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
              Data: getRegistrationTemplate(username),
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
