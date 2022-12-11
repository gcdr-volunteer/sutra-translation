export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SESSION_SECRET: string;
      ENV: 'test' | 'dev' | 'prod' | 'sirius';
      REGION: string;
      USER_TABLE: string;
    }
  }
}
