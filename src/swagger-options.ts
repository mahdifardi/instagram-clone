import swaggerJsDoc from "swagger-jsdoc";

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Collegegram API documentation",
            version: "1.0.0",
            description: "API description",
        },
        servers: [
            {
                url: process.env.SWAGGER_SERVER,
            },
        ],
    },
    apis: [process.env.SWAGGER_PATH || "/src/app/dist/src/docs/*.js"],
};

export default swaggerJsDoc(swaggerOptions);
