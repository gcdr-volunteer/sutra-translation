import { SNSClient } from '@aws-sdk/client-sns';
export const msgClient = () => new SNSClient({ region: process.env.REGION });
