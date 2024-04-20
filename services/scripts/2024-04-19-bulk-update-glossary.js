// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require('aws-sdk');

// Initialize the AWS SDK with your configuration
AWS.config.update({ region: 'ap-southeast-2' }); // Replace with your AWS region

// Create a DynamoDB Document Client
const docClient = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const TableName =
  process.env.ENV === 'sirius'
    ? 'sirius-sutra-translation-REFERENCE'
    : 'prod-sutra-translation-REFERENCE'; // Replace with your DynamoDB table name

const main = async () => {
  let lastEvaluatedKey = undefined;

  do {
    const params = {
      TableName,
      Limit: 100,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: 'GLOSSARY' },
      },
      ExclusiveStartKey: lastEvaluatedKey,
    };
    const { Items, LastEvaluatedKey } = await docClient.query(params).promise();
    // Process the retrieved records and add the new field

    let transactionItems = [];
    for await (const item of Items) {
      transactionItems = [
        ...transactionItems,
        {
          Update: {
            ExpressionAttributeValues: {
              ':updatedAt': {
                S: new Date().toISOString(),
              },
            },
            UpdateExpression: `set updatedAt = :updatedAt`,
            TableName,
            Key: {
              PK: {
                S: item.PK.S,
              },
              SK: {
                S: item.SK.S,
              },
            },
            ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
          },
        },
      ];
    }
    const transactWriteParams = {
      TransactItems: [...transactionItems],
    };
    const response = await docClient.transactWriteItems(transactWriteParams).promise();
    console.log(response);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    lastEvaluatedKey = LastEvaluatedKey;
    // scannedCount += result.Count;
  } while (lastEvaluatedKey);
};

main();
