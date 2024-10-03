import { DataSource } from "typeorm";
import { UserRepository } from "../modules/userHandler/user/user.repository";
import { PasswordResetTokenRepository } from "../modules/userHandler/forgetPassword/forgetPassword.repository";
import { EmailService } from "../modules/email/email.service";
import { ForgetPasswordService } from "../modules/userHandler/forgetPassword/forgetPassword.service";
import { UserRelationRepository } from "../modules/userHandler/userRelation/userRelation.repository";
import { UserService } from "../modules/userHandler/user/user.service";
import { UserRelationService } from "../modules/userHandler/userRelation/userRelation.service";
import { SavedPostRepository } from "../modules/userHandler/savedPost/savedPost.repository";
import { SavedPostService } from "../modules/userHandler/savedPost/savedPost.service";
import { PostRepository } from "../modules/postHandler/post/post.repository";
import { PostService } from "../modules/postHandler/post/post.service";
import { CommentRepository } from "../modules/postHandler/comment/comment.repository";
import { CommentService } from "../modules/postHandler/comment/comment.service";
import { PostLikeRepository } from "../modules/postHandler/postLike/postLike.repository";
import { PostLikeService } from "../modules/postHandler/postLike/postLike.service";
import { CommentLikeRepository } from "../modules/postHandler/commentLike/commentLike.repository";
import { CommentLikeService } from "../modules/postHandler/commentLike/commentLike.service";
import { PostHandler } from "../modules/postHandler/postHandler";
import { UserHandler } from "../modules/userHandler/userHandler";
import { NotificationRepository } from "../modules/userHandler/notification/notification.repository";
import { NotificationService } from "../modules/userHandler/notification/notification.service";
import { PostLikeSubscriber } from "../modules/userHandler/notification/subscribers/postLike.subscriber";
import { CommentSubscriber } from "../modules/userHandler/notification/subscribers/comment.subscriber";
import { UserRelationSubscriber } from "../modules/userHandler/notification/subscribers/userRelation.subscriber";
import { PostSubscriber } from "../modules/userHandler/notification/subscribers/post.subscriber";
import { UserNotificationRepository } from "../modules/userHandler/notification/userNotification/userNotification.repository";
import { UserNotificationService } from "../modules/userHandler/notification/userNotification/userNotification.service";
import { MessageRepository } from "../modules/userHandler/message/message.repository";
import { MessageService } from "../modules/userHandler/message/message.service";
import { ThreadRepository } from "../modules/userHandler/thread/thread.repository";
import { ThreadService } from "../modules/userHandler/thread/thread.service";
import { UserSearchHistoryRepository } from "../modules/userHandler/userSearchHistory/userSearchHistory.repository";
import { UserSearchHistoryService } from "../modules/userHandler/userSearchHistory/userSearchHistory.service";
import { PostSearchHistoryRepository } from "../modules/postHandler/postSearchHistory/postSearchHistory.repository";
import { PostSearchHistoryService } from "../modules/postHandler/postSearchHistory/postSearchHistory.service";

export class ServiceFactory {
    private dataSource: DataSource;

    private userRepository: UserRepository;
    private passwordResetTokenRepository: PasswordResetTokenRepository;
    private emailService: EmailService;
    private forgetPasswordService: ForgetPasswordService;
    private userRelationRepository: UserRelationRepository;
    private userService: UserService;
    private userRelationService: UserRelationService;
    private postRepository: PostRepository;
    private postService: PostService;
    private commentRepository: CommentRepository;
    private commentService: CommentService;
    private savedPostRepo: SavedPostRepository;
    private savedPostService: SavedPostService;
    private postLikeRepo: PostLikeRepository;
    private postLikeService: PostLikeService;
    private commentLikeRepo: CommentLikeRepository;
    private commentLikeService: CommentLikeService;

    private notificationRepo: NotificationRepository;
    private notificationService: NotificationService;

    private postHandler: PostHandler;
    private userHandler: UserHandler;

    private postLikeSub: PostLikeSubscriber;
    private commentSub: CommentSubscriber;
    private userRelationSub: UserRelationSubscriber;
    private postSub: PostSubscriber;

    private userNotificationRepo: UserNotificationRepository;
    private userNotificationsService: UserNotificationService;

    private messageRepo: MessageRepository;
    private messageService: MessageService;

    private threadRepo: ThreadRepository;
    private ThreadService: ThreadService;

    private userSearchHistoryRepo: UserSearchHistoryRepository;
    private userSearchHistoryService: UserSearchHistoryService;

    private postSearchHistoryRepo: PostSearchHistoryRepository;
    private postSearchHistoryService: PostSearchHistoryService;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;

        this.userRepository = new UserRepository(this.dataSource);
        this.passwordResetTokenRepository = new PasswordResetTokenRepository(
            this.dataSource
        );
        this.emailService = new EmailService();
        this.forgetPasswordService = new ForgetPasswordService(
            this.passwordResetTokenRepository,
            this.emailService
        );
        this.userRelationRepository = new UserRelationRepository(
            this.dataSource
        );

        this.userSearchHistoryRepo = new UserSearchHistoryRepository(
            this.dataSource
        );

        this.userSearchHistoryService = new UserSearchHistoryService(
            this.userSearchHistoryRepo
        );

        this.postSearchHistoryRepo = new PostSearchHistoryRepository(
            this.dataSource
        );

        this.postSearchHistoryService = new PostSearchHistoryService(
            this.postSearchHistoryRepo
        );

        this.userService = new UserService(
            this.userRepository,
            this.forgetPasswordService,
            this.userSearchHistoryService
        );
        this.userRelationService = new UserRelationService(
            this.userRelationRepository,
            this.userService
        );
        this.postRepository = new PostRepository(this.dataSource);
        this.postService = new PostService(
            this.postRepository,
            this.userService,
            this.userRelationService,
            this.postSearchHistoryService
        );
        this.commentRepository = new CommentRepository(this.dataSource);
        this.commentService = new CommentService(
            this.commentRepository,
            this.postService
        );

        this.savedPostRepo = new SavedPostRepository(this.dataSource);
        this.savedPostService = new SavedPostService(
            this.savedPostRepo,
            this.postService
        );

        this.postLikeRepo = new PostLikeRepository(this.dataSource);
        this.postLikeService = new PostLikeService(
            this.postLikeRepo,
            this.postService
        );
        this.commentLikeRepo = new CommentLikeRepository(this.dataSource);
        this.commentLikeService = new CommentLikeService(
            this.commentLikeRepo,
            this.commentService
        );

        this.userNotificationRepo = new UserNotificationRepository(
            this.dataSource
        );
        this.userNotificationsService = new UserNotificationService(
            this.userNotificationRepo,
            this.userService,
            this.userRelationService
        );

        this.postHandler = new PostHandler(
            this.postService,
            this.savedPostService,
            this.commentService,
            this.postLikeService,
            this.commentLikeService,
            this.userRelationService
        );

        this.notificationRepo = new NotificationRepository(dataSource);
        this.notificationService = new NotificationService(
            this.notificationRepo,
            this.userRelationService,
            this.userNotificationsService
        );

        this.messageRepo = new MessageRepository(dataSource);
        this.messageService = new MessageService(this.messageRepo);

        this.threadRepo = new ThreadRepository(dataSource);
        this.ThreadService = new ThreadService(
            this.threadRepo,
            this.messageService,
            this.userService
        );

        this.userHandler = new UserHandler(
            this.userService,
            this.userRelationService,
            this.savedPostService,
            this.notificationService,
            this.postHandler,
            this.ThreadService,
            this.messageService
        );

        this.postLikeSub = new PostLikeSubscriber(
            this.userNotificationsService
        );
        dataSource.subscribers.push(this.postLikeSub);

        this.commentSub = new CommentSubscriber(this.userNotificationsService);
        dataSource.subscribers.push(this.commentSub);

        this.userRelationSub = new UserRelationSubscriber(
            this.userNotificationsService
        );

        dataSource.subscribers.push(this.userRelationSub);

        this.postSub = new PostSubscriber(
            this.notificationService,
            this.userService,
            this.userNotificationsService
        );
        dataSource.subscribers.push(this.postSub);
    }

    getUserService(): UserService {
        return this.userService;
    }

    getUserRelationService(): UserRelationService {
        return this.userRelationService;
    }

    getPostService(): PostService {
        return this.postService;
    }

    getCommentService(): CommentService {
        return this.commentService;
    }

    getPostLikeService(): PostLikeService {
        return this.postLikeService;
    }

    getCommentLikeService(): CommentLikeService {
        return this.commentLikeService;
    }

    getSavedPostService(): SavedPostService {
        return this.savedPostService;
    }

    getNotificationService(): NotificationService {
        return this.notificationService;
    }

    getMessageService(): MessageService {
        return this.messageService;
    }

    getThreadService(): ThreadService {
        return this.ThreadService;
    }

    getPostHandler(): PostHandler {
        return this.postHandler;
    }

    getUserHandler(): UserHandler {
        return this.userHandler;
    }
}
