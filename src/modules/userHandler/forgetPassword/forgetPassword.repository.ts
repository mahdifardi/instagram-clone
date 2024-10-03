import { DataSource, Repository } from "typeorm";
import { PasswordResetTokenEntity } from "./entity/forgetPassword.entity";
import { ForgetPassword } from "./model/forgetPassword.model";

export class PasswordResetTokenRepository {
    private passwordResetTokenRepo: Repository<PasswordResetTokenEntity>;

    constructor(appDataSource: DataSource) {
        this.passwordResetTokenRepo = appDataSource.getRepository(
            PasswordResetTokenEntity
        );
    }

    public create(
        forgetPassword: ForgetPassword
    ): Promise<PasswordResetTokenEntity> {
        return this.passwordResetTokenRepo.save(forgetPassword);
    }

    public findById(id: string): Promise<PasswordResetTokenEntity | null> {
        return this.passwordResetTokenRepo.findOne({
            where: { id },
        });
    }

    public async delete(id: string): Promise<void> {
        await this.passwordResetTokenRepo.softDelete({ id });
    }
}
