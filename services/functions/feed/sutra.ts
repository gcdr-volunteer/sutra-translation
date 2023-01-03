import { SNSEvent } from 'aws-lambda';
export const handler = async (event: SNSEvent) => {
  // TODO: add feed for different sutras and chapters
  console.log(event.Records[0].Sns.Message);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: 'ok',
  };
};
