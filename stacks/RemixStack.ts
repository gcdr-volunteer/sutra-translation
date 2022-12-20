import { StackContext, RemixSite } from "@serverless-stack/resources";
import {
  createUserTable,
  createCommentTable,
  createTranslationTable,
} from "./database";

export async function RemixStack({ stack }: StackContext) {
  const userTable = await createUserTable(stack);
  const commentTable = await createCommentTable(stack);
  const translationTable = await createTranslationTable(stack);
  const site = new RemixSite(stack, `${process.env.ENV}-Site`, {
    path: "remix-app/",
    environment: {
      SESSION_SECRET: process.env.SESSION_SECRET!,
      USER_TABLE: userTable.tableName,
      COMMENT_TABLE: commentTable.tableName,
      TRANSLATION_TABLE: translationTable.tableName,
      REGION: process.env.REGION!,
      ENV: process.env.ENV!,
    },
  });
  site.attachPermissions([userTable, commentTable, translationTable]);

  stack.addOutputs({
    URL: site.url,
  });
}
