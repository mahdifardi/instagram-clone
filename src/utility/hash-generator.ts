import bcrypt from "bcrypt";

const saltRounds = 10;

export const hashGenerator = async (password: string): Promise<string> => {
    return bcrypt
        .genSalt(saltRounds)
        .then((salt) => {
            return bcrypt.hash(password, salt);
        })
        .then((hash) => {
            return hash;
        })
        .catch((err) => {
            throw err;
        });
};
