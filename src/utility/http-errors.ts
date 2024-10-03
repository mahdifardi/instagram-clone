export class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export class ForbiddenError extends HttpError {
    constructor() {
        super(403, "Forbidden");
    }
}

export class NotFoundError extends HttpError {
    constructor() {
        super(404, "Not Found");
    }
}

export class UnauthorizedError extends HttpError {
    constructor() {
        super(401, "Unauthorized");
    }
}

export class DuplicateError extends HttpError {
    constructor() {
        super(403, "Username and/or email already in use");
    }
}

export class InvalidCredentialError extends HttpError {
    constructor() {
        super(401, "Invalid credentials");
    }
}

export class BadRequestError extends HttpError {
    constructor() {
        super(400, "Bad Request");
    }
}

export class AuthenticationFailError extends HttpError {
    constructor() {
        super(401, "Authentication failed")
    }
}
