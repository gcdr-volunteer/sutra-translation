import { DynamoDB, ApiGatewayManagementApi } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { OpenAI } from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30 * 1000 /* 30 seconds */,
  maxRetries: 0,
});
const TableName = process.env.WEBSOCKET_TABLE_NAME ?? '';
const dynamoDb = new DynamoDB.DocumentClient();

export const main: APIGatewayProxyHandler = async (event) => {
  let messageData = '';
  if (event.body) {
    messageData = JSON.parse(event.body).data;
  }
  const { stage, domainName } = event.requestContext;

  // Get all the connections
  const connections = await dynamoDb.scan({ TableName, ProjectionExpression: 'id' }).promise();

  const apiG = new ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`,
  });

  const postToConnection = async function ({ id }: { id: string }) {
    try {
      // Send the message to the given client
      const stream = await client.chat.completions.create(
        {
          model: 'gpt-4-0613',
          stream: true,
          messages: [
            {
              role: 'system',
              content: 'You are a professional Chinese to English translator',
            },
            {
              role: 'user',
              content: messageData,
            },
          ],
        },
        {
          timeout: 30 * 1000 /* 30 seconds timeout*/,
          maxRetries: 2,
        }
      );
      let buffer = [];
      for await (const chunk of stream) {
        const content = chunk?.choices[0]?.delta?.content || '';
        if (buffer.length < 20) {
          buffer.push(content);
        } else {
          buffer.push(content);
          const data = buffer.join('');
          console.log(data);
          await apiG.postToConnection({ ConnectionId: id, Data: data }).promise();
          buffer = [];
        }
      }
      if (buffer.length) {
        const data = buffer.join('');
        console.log(data);
        await apiG.postToConnection({ ConnectionId: id, Data: data }).promise();
        buffer = [];
      }
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (e.statusCode === 410) {
        // Remove stale connections
        await dynamoDb.delete({ TableName, Key: { id } }).promise();
      }
      console.error(e);
    }
  };

  // Iterate through all the connections
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await Promise.all(connections.Items?.map(postToConnection));

  return { statusCode: 200, body: 'Message sent' };
};
