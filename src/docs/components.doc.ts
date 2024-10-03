/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         firstname:
 *           type: string
 *         lastname:
 *           type: string
 *         profileStatus:
 *           type: string
 *           enum: [public, private]
 *         bio:
 *           type: string
 *         profilePicture:
 *           type: string
 *         follower_count:
 *           type: integer
 *         following_count:
 *           type: integer
 *         post_count:
 *           type: integer
 *         unreadNotifications:
 *           type: integer
 *         unreadUserNotifications:
 *           type: integer
 *         unreadUserFollowingNotifications:
 *           type: integer
 *         unreadMessages:
 *           type: integer
 *         posts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PostWithLikeAndSaveStatus'
 *     AnotherUserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         firstname:
 *           type: string
 *         lastname:
 *           type: string
 *         profileStatus:
 *           type: string
 *           enum:
 *             - public
 *             - private
 *         bio:
 *           type: string
 *         follower_count:
 *           type: integer
 *         following_count:
 *           type: integer
 *         post_count:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         profilePicture:
 *           type: string
 *         posts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PostWithLikeAndSaveStatus'
 *         followStatus:
 *           type: string
 *           enum:
 *             - followed
 *             - not followed
 *             - requested
 *             - blocked
 *         reverseFollowStatus:
 *           type: string
 *           enum:
 *             - followed
 *             - not followed
 *             - requested
 *             - blocked
 *             - close friend
 *     ListUser:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         profilePicture:
 *           type: string
 *         firstname:
 *           type: string
 *         lastname:
 *           type: string
 *         follower_count:
 *           type: integer
 *         following_count:
 *           type: integer
 *     SearchUser:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         profilePicture:
 *           type: string
 *         firstname:
 *           type: string
 *         lastname:
 *           type: string
 *         follower_count:
 *           type: integer
 *         following_count:
 *           type: integer
 *         followStatus:
 *           type: string
 *           enum:
 *             - followed
 *             - not followed
 *             - requested
 *             - blocked
 *         reverseFollowStatus:
 *           type: string
 *           enum:
 *             - followed
 *             - not followed
 *             - requested
 *             - blocked
 *             - close friend
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         profilePicture:
 *           type: string
 *           description: URL of the user's profile picture
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs for the post.
 *         caption:
 *           type: string
 *           description: Caption for the post, including hashtags.
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: List of tags associated with the post.
 *         mentions:
 *           type: array
 *           items:
 *             type: string
 *           description: List of users mentioned in the post.
 *         like_count:
 *           type: integer
 *           description: Number of likes the post has received.
 *         comment_count:
 *           type: integer
 *           description: Number of comments on the post.
 *         saved_count:
 *           type: integer
 *           description: Number of times the post has been saved by users.
 *         close_status:
 *           type: string
 *           enum:
 *             - normal
 *             - close
 *           description: Visibility status of the post.
 *         like_status:
 *           type: boolean
 *           description: Whether the post is liked by the current user.
 *         save_status:
 *           type: boolean
 *           description: Whether the post is saved by the current user.
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true          
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         postId:
 *           type: string
 *         text:
 *           type: string
 *           description: The content of the comment.
 *         commentId:
 *           type: string
 *           description: ID of the parent comment (if nested).
 *         like_count:
 *           type: integer
 *           description: Number of likes the comment has received.
 *         username:
 *           type: string
 *           description: The username of the commenter.
 *         profilePicture:
 *           type: string
 *           description: URL of the commenter's profile picture.
 *         firstname:
 *           type: string
 *           description: Commenter’s first name.
 *         lastname:
 *           type: string
 *           description: Commenter’s last name.
 *         like_status:
 *           type: boolean
 *           description: Whether the comment is liked by the current user.
 *         children:
 *           type: array
 *           items:
 *             type: object
 *           description: Nested comments (replies).
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     Notification:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum:
 *             - followed
 *             - followRequest
 *             - requestAccepted
 *             - like
 *             - mention
 *             - comment
 *         isRead:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *         recipient:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             profilePicture:
 *               type: string
 *             firstname:
 *               type: string
 *             lastname:
 *               type: string
 *         sender:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             profilePicture:
 *               type: string
 *             firstname:
 *               type: string
 *             lastname:
 *               type: string
 *         post:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             images:
 *               type: string
 *         comment:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             text:
 *               type: string
 *         followStatus:
 *           type: string
 *           enum:
 *             - followed
 *             - not followed
 *             - requested
 *             - blocked
 *         reverseFollowStatus:
 *           type: string
 *           enum:
 *             - followed
 *             - not followed
 *             - requested
 *             - blocked
 *             - close friend
 *     Thread:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         firstname:
 *           type: string
 *         lastname:
 *           type: string
 *         profilePicture:
 *           type: string
 *         unreadMessages:
 *           type: integer
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         lastMessageSenderUsername:
 *           type: string
 *         lastMessageType:
 *           type: string
 *           enum: [text, image]
 *         lastMessageText:
 *           type: string
 *           example: "hello world"
 *           description: The last text message sent. If the last message type is not text, this field is optional.
 *     Meta:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         totalPage:
 *           type: integer
 *         limit:
 *           type: integer
 *   responses:
 *     BadRequest:
 *       description: Bad request
 *     Unauthorized:
 *       description: Unauthorized
 *     Forbidden:
 *       description: Forbidden
 *     NotFound:
 *       description: Not Found
 *     InternalServerError:
 *       description: Internal server error
 */
