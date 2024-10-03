declare namespace NodeJS {
    interface ProcessEnv {
        // data-source.ts
        DB_PORT: number;
        DB_HOST: string;
        DB_USER: string;
        DB_PASS: string;
        DB_NAME: string;
        // swagget-options.ts
        SWAGGER_SERVER: string;
        SWAGGER_PATH: string;
        // main.ts
        APP_PORT: number;
        // email.service.ts
        EMAIL_USER: string;
        EMAIL_PASS: string;
        // forgetPassword.service.ts
        RESET_PASS_LINK: string;
        // upload.middleware.ts
        PROFILE_PATH: string;
        POST_PATH: string;
        //save-image.ts
        IMG_MSG_PATH: string;
    }
}
