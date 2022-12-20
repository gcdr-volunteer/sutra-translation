import { StackContext } from "@serverless-stack/resources";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
export const createUserTable = async (stack: StackContext["stack"]) => {
  return new Table(stack, "UserTable", {
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
};

export const createCommentTable = async (stack: StackContext["stack"]) => {
  const commentTable = new Table(stack, "CommentTable", {
    tableName: `${process.env.ENV}-COMMENT-TABLE`,
    partitionKey: {
      name: "PK",
      type: AttributeType.STRING,
    },
    sortKey: {
      name: "SK",
      type: AttributeType.STRING,
    },
  });

  commentTable.addLocalSecondaryIndex({
    indexName: "sutraId-index",
    sortKey: {
      name: "sutraId",
      type: AttributeType.STRING,
    },
  });

  commentTable.addLocalSecondaryIndex({
    indexName: "rollId-index",
    sortKey: {
      name: "rollId",
      type: AttributeType.STRING,
    },
  });

  commentTable.addLocalSecondaryIndex({
    indexName: "paragraphId-index",
    sortKey: {
      name: "paragraphId",
      type: AttributeType.STRING,
    },
  });

  commentTable.addLocalSecondaryIndex({
    indexName: "resolved-index",
    sortKey: {
      name: "resolved",
      type: AttributeType.NUMBER,
    },
  });
  return commentTable;
};

export const createTranslationTable = async (stack: StackContext["stack"]) => {
  const translationTable = new Table(stack, "TranslationTable", {
    tableName: `${process.env.ENV}-TRANSLATION-TABLE`,
    partitionKey: {
      name: "PK",
      type: AttributeType.STRING,
    },
    sortKey: {
      name: "SK",
      type: AttributeType.STRING,
    },
  });
  translationTable.addLocalSecondaryIndex({
    indexName: "kind-index",
    sortKey: {
      name: "kind",
      type: AttributeType.STRING,
    },
  });
  return translationTable;
};
