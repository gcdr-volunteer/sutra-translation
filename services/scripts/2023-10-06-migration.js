// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require('aws-sdk');

// Initialize the AWS SDK with your configuration
AWS.config.update({ region: 'ap-southeast-2' }); // Replace with your AWS region

// Create a DynamoDB Document Client
const docClient = new AWS.DynamoDB.DocumentClient();

const TableName = 'prod-sutra-translation-TRANSLATION'; // Replace with your DynamoDB table name

async function migrateTable() {
  const params = {
    TableName,
    Limit: 20,
  };

  let lastEvaluatedKey = null;
  let scannedCount = 0;

  do {
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }

    const result = await docClient.scan(params).promise();

    // Process the retrieved records and add the new field
    for (const item of result.Items) {
      if (item.kind === 'PARAGRAPH' && !item?.oringinPK) {
        const updateParams = {
          TableName,
          Key: { PK: item.PK, SK: item.SK },
          UpdateExpression: `SET originPK = :originPK, originSK = :originSK`,
          ExpressionAttributeValues: {
            ':originPK': item.PK.startsWith('ZH') ? item.PK : item.PK.replace('ZH', 'EN'),
            ':originSK': item.SK.startsWith('ZH') ? item.SK : item.SK.replace('ZH', 'EN'),
          }, // Replace with the value for the new field
        };

        await docClient.update(updateParams).promise();
      }
      //   const id = item.id; // Assuming 'id' is the primary key
    }

    lastEvaluatedKey = result.LastEvaluatedKey;
    scannedCount += result.Count;
  } while (lastEvaluatedKey);

  console.log(`Updated ${scannedCount} records.`);
}

migrateTable();
