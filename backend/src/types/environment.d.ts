declare namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly SMTP_HOST: string;
      readonly SMTP_PORT: string;
      readonly SMTP_USER: string;
      readonly SMTP_PASS: string;
      // Adicione outras variáveis de ambiente aqui
    }
  }