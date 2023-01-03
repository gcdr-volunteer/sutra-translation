export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SESSION_SECRET: string;
      ENV: 'test' | 'dev' | 'prod' | 'sirius' | 'uat';
      REGION: string;
      USER_TABLE: string;
      COMMENT_TABLE: string;
      TRANSLATION_TABLE: string;
      DEEPL_AUTHKEY: string;
      DEEPL_URL: string;
      TOPIC_ARN: string;
    }
  }
}
