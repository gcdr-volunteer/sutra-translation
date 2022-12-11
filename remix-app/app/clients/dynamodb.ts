import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
export const dbClient = new DynamoDBClient({ region: 'ap-southeast-2' });
