import { StackContext, RemixSite } from "@serverless-stack/resources";

export function RemixStack({ stack }: StackContext) {
  const site = new RemixSite(stack, "Site", {
    path: "remix-app/",
    environment: {
      SESSION_SECRET: "K828GErmj0OjisqIl#d1u!YoW$O0",
    },
  });

  stack.addOutputs({
    URL: site.url,
  });
}
