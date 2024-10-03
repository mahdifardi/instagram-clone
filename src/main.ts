require("dotenv").config();
import { makeApp } from "./api";
import { AppDataSource } from "./data-source";
import { User } from "./modules/userHandler/user/model/user.model";
import { ServiceFactory } from "./utility/service-factory";

declare global {
    namespace Express {
        interface Request {
            user: User;
            token: string;
            base_url: string;
            auth: { token: string };
        }
    }
}

declare module "http" {
    interface IncomingMessage {
        user: User;
        token: string;
        base_url: string;
        auth: { token: string };
    }
}

const run = async () => {
    const PORT = Number(process.env.APP_PORT) || 3000;

    const dataSource = await AppDataSource.initialize();
    const serviceFactory = new ServiceFactory(dataSource);

    const app = makeApp(
        dataSource,
        serviceFactory.getUserHandler(),
        serviceFactory.getPostHandler()
    );

    app.listen(PORT, () => {
        console.log("Listening on Port " + PORT);
    });

    process.on("SIGINT", () => {
        console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
        process.exit(0);
    });
};

run();
