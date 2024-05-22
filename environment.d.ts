export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SESSION_SECRET: string;
      ENV: 'test' | 'dev' | 'prod' | 'sirius' | 'uat';
      REGION: string;
      USER_TABLE: string;
      REFERENCE_TABLE: string;
      HISTORY_TABLE: string;
      TRANSLATION_TABLE: string;
      DEEPL_URL: string;
      TOPIC_ARN: string;
      ES_URL: string;
      OPENAI_API_KEY: string;
    }
  }
}
