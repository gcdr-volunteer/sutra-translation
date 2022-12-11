import { StackContext, RemixSite } from "@serverless-stack/resources";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";

export function RemixStack({ stack }: StackContext) {
  const userTable = new Table(stack, "UserTable", {
    tableName: `${process.env.ENV}-USER-TABLE`,
    partitionKey: {
      name: "PK",
      type: AttributeType.STRING,
    },
    sortKey: {
      name: "SK",
      type: AttributeType.STRING,
    },
  });

  const site = new RemixSite(stack, `${process.env.ENV}-Site`, {
    path: "remix-app/",
    environment: {
      SESSION_SECRET: process.env.SESSION_SECRET!,
      USER_TABLE: userTable.tableName,
      REGION: process.env.REGION!,
    },
  });
  site.attachPermissions([userTable]);

  stack.addOutputs({
    URL: site.url,
  });
}
