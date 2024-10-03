import { UserService } from "../../src/modules/userHandler/user/user.service";
import bcrypt from "bcrypt";
import {
    BadRequestError,
    DuplicateError,
    HttpError,
    InvalidCredentialError,
    UnauthorizedError,
} from "../../src/utility/http-errors";
import { hashGenerator } from "../../src/utility/hash-generator";
import { createTestDb } from "../../src/utility/test-db";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import { ServiceFactory } from "../../src/utility/service-factory";

jest.mock("nodemailer");

describe("User service test suite", () => {
    let serviceFactory: ServiceFactory;
    let userService: UserService;

    let sendMailMock: jest.Mock;
    let emailContent: string | undefined;

    beforeEach(async () => {
        // jest.clearAllMocks();

        // sendMailMock = jest.fn().mockImplementation((mailOptions) => {
        //     emailContent = mailOptions.html;
        //     return Promise.resolve({});
        // });

        // (nodemailer.createTransport as jest.Mock).mockReturnValue({
        //     sendMail: sendMailMock,
        // });

        const dataSource = await createTestDb();
        serviceFactory = new ServiceFactory(dataSource);

        userService = serviceFactory.getUserService();

        await userService.createUser({
            username: "test",
            email: "test@gmail.com",
            password: "test",
        });
    });

    describe("Signup test", () => {
        it("should sign up a user", async () => {
            const user = await userService.createUser({
                username: "signup_test",
                email: "signup_test@gmail.com",
                password: "signup_test",
            });
            expect(user.email).toBe("signup_test@gmail.com");
            expect(user.username).toBe("signup_test");
            expect(
                await bcrypt.compare(
                    "signup_test",
                    await hashGenerator("signup_test")
                )
            ).toBe(true);
        });

        it("should fail to sign up if email or username is already in use", async () => {
            expect(
                userService.createUser({
                    username: "test",
                    email: "test@gmail.com",
                    password: "test",
                })
            ).rejects.toThrow(HttpError);
        });
    });

    // describe("login test", () => {
    //     it("should login with valid username", async () => {
    //         const response = await userService.login({
    //             credential: "test",
    //             password: "test",
    //             keepMeSignedIn: false,
    //         });
    //         expect(response.message).toBe("Login successfull");
    //     });

    //     it("should login with valid email", async () => {
    //         const response = await userService.login({
    //             credential: "test@gmail.com",
    //             password: "test",
    //             keepMeSignedIn: false,
    //         });
    //         expect(response.message).toBe("Login successfull");
    //     });

    //     it("should fail if password is not valid", async () => {
    //         expect(
    //             userService.login({
    //                 credential: "test@gmail.com",
    //                 password: "11111",
    //                 keepMeSignedIn: false,
    //             })
    //         ).rejects.toThrow(new InvalidCredentialError());
    //     });

    //     it("should fail if username is not valid", async () => {
    //         expect(
    //             userService.login({
    //                 credential: "testwrongusername",
    //                 password: "11111",
    //                 keepMeSignedIn: false,
    //             })
    //         ).rejects.toThrow(new InvalidCredentialError());
    //     });

    //     it("should fail if email is not valid", async () => {
    //         expect(
    //             userService.login({
    //                 credential: "testwrong@gmail.com",
    //                 password: "11111",
    //                 keepMeSignedIn: false,
    //             })
    //         ).rejects.toThrow(new InvalidCredentialError());
    //     });
    // });

    describe.skip("Reset password", () => {
        it("should send reset password email", async () => {
            const response = await userService.forgetPassword("test@gmail.com");

            expect(sendMailMock).toHaveBeenCalledTimes(1);
            expect(sendMailMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: "test@gmail.com",
                })
            );
            expect(response.message).toBe("Email successfully sent");
            expect(emailContent).toBeDefined();
            expect(emailContent).toContain(
                "http://37.32.6.230/reset-password/"
            );
        });

        it("should fail if credential is  empty", async () => {
            expect(userService.forgetPassword("")).rejects.toThrow(
                new BadRequestError()
            );
        });

        it("should fail if credential is not valid", async () => {
            expect(userService.forgetPassword("notvalid")).rejects.toThrow(
                new InvalidCredentialError()
            );
        });

        it("should reset password", async () => {
            await userService.forgetPassword("test@gmail.com");
            const emailContent = sendMailMock.mock.calls[0][0].html;
            const linkMatch = emailContent.match(
                /href="([^"]*reset-password\/[a-fA-F0-9-]+~[a-fA-F0-9-]+)"/
            );
            const resetLink = linkMatch ? linkMatch[1] : null;
            const tokenMatch = resetLink?.match(
                /reset-password\/([a-fA-F0-9-]+~[a-fA-F0-9-]+)$/
            );
            const token = tokenMatch ? tokenMatch[1] : null;

            const response = await userService.resetPassword(
                "reset test",
                token
            );
            expect(response.message).toBe("New password set");
        });

        it("should fail to reset password if token is expired or wrong", async () => {
            expect(
                userService.resetPassword(
                    "test",
                    `${randomUUID()}~${randomUUID()}`
                )
            ).rejects.toThrow(new UnauthorizedError());
        });
    });

    describe("Edit profile", () => {
        it("should update profile without image", async () => {
            const hashed_password = await hashGenerator("test");
            const user = await userService.getUserByUsername("test");
            const response = await userService.editProfile(
                user!,
                "",
                {
                    email: "changedemail@gmail.com",
                    firstname: "test",
                    lastname: "test",
                    profileStatus: "private",
                    bio: "test",
                    password: "newpass",
                },
                "http://localhost:3000"
            );
            expect(response.email).toBe("changedemail@gmail.com");
            expect(response.firstname).toBe("test");
            expect(response.profileStatus).toBe("private");
        });

        it("should fail if profile update causes a duplicate error", async () => {
            const user = await userService.getUserByUsername("test");

            // Simulate a duplicate email scenario
            jest.spyOn(
                userService["userRepo"],
                "updateProfile"
            ).mockImplementation(() => {
                throw new DuplicateError();
            });

            await expect(
                userService.editProfile(
                    user!,
                    "",
                    {
                        email: "test@gmail.com",
                        firstname: "test",
                        lastname: "test",
                        profileStatus: "private",
                        bio: "test",
                        password: "newpass",
                    },
                    "http://localhost:3000"
                )
            ).rejects.toThrow(DuplicateError);
        });
    });
});
