/**
 * @swagger
 * /api/user/signin:
 *   post:
 *     tags: [Users]
 *     summary: User Login
 *     description: Authenticates a user and provides a token for further requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *               keepMeSignedIn:
 *                 type: boolean
 *                 description: If not provided defaults to false.
 *             required:
 *               - credential
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credential or password
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/signup:
 *   post:
 *     tags: [Users]
 *     summary: User Registration
 *     description: Creates a new user account with provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Username and/or email already in use
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/editprofile:
 *   post:
 *     tags: [Users]
 *     summary: Edit User Profile
 *     description: Updates the user's profile information including profile picture.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: User's first name
 *                 example: John
 *               lastname:
 *                 type: string
 *                 description: User's last name
 *                 example: Doe
 *               bio:
 *                 type: string
 *                 description: User's bio
 *                 example: Software Developer
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: johndoe@example.com
 *               profileStatus:
 *                 type: string
 *                 enum: [public, private]
 *                 description: User's profile visibility status
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture file
 *               password:
 *                 type: string
 *                 description: User's new password
 *             required:
 *               - email
 *               - profileStatus
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     firstname:
 *                       type: string
 *                       example: John
 *                     lastname:
 *                       type: string
 *                       example: Doe
 *                     bio:
 *                       type: string
 *                       example: Software Developer
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     profileStatus:
 *                       type: string
 *                       enum: [public, private]
 *                       example: public
 *                     profilePicture:
 *                       type: string
 *                       example: http://localhost:3000/api/images/profiles/profile.jpg
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/profileInfo:
 *   get:
 *     tags: [Users]
 *     summary: Get User Profile Information
 *     description: Retrieves the profile information of the logged-in user, including posts.
 *     responses:
 *       200:
 *         description: Profile information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/forgetpassword:
 *   post:
 *     tags: [Users]
 *     summary: Password Reset Request
 *     description: Initiates the password reset process by sending an email to the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Credential is required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/resetpassword:
 *   post:
 *     tags: [Users]
 *     summary: Reset Password
 *     description: Resets the user's password using a provided token and new password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPass:
 *                 type: string
 *                 example: NewStrongPassword123
 *               token:
 *                 type: string
 *                 example: token123
 *     responses:
 *       200:
 *         description: New password set
 *       400:
 *         description: Token and new password are required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/savepost/{postid}:
 *   post:
 *     tags: [Users]
 *     summary: Save and unsave a Post
 *     description: Saves a post to the authenticated user's saved posts list.
 *     parameters:
 *       - name: postid
 *         in: path
 *         required: true
 *         description: The ID of the post to be saved.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post successfully saved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post saved"
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Not Found.
 *       400:
 *         description: Bad Request. Post is already saved.
 */

/**
 * @swagger
 * /api/user/explore:
 *   get:
 *     tags: [Users]
 *     summary: Get explore page posts
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/notifications:
 *   get:
 *     tags: [Users]
 *     summary: Get notifications
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/followingsnotifications:
 *   get:
 *     tags: [Users]
 *     summary: Get followings notifications
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
