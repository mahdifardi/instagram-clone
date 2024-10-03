/**
 * @swagger
 * /api/user/{username}:
 *   get:
 *     tags: [UserRelations]
 *     summary: Get User Profile by Username
 *     description: Retrieves the profile information of a user by their username.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnotherUserProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/user/follow/{username}:
 *   post:
 *     tags: [UserRelations]
 *     summary: Follow a User
 *     description: Allows the logged-in user to follow another user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to follow
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: User followed successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/user/unfollow/{username}:
 *   post:
 *     tags: [UserRelations]
 *     summary: Unfollow a User
 *     description: Allows the logged-in user to unfollow another user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to unfollow
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/user/deletefollower/{username}:
 *   post:
 *     tags: [UserRelations]
 *     summary: Delete a follower from follower list
 *     description: Allows the logged-in user to delete a follower.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to delete from followers
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: Follower deleted
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/user/acceptrequest/{username}:
 *   post:
 *     tags: [UserRelations]
 *     summary: Accept a follow request
 *     description: Allows the logged-in user to accept a follow request.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user whose follow request is being accepted
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: Request accepted
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/user/rejectrequest/{username}:
 *   post:
 *     tags: [UserRelations]
 *     summary: Reject a follow request
 *     description: Allows the logged-in user to reject a follow request.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user whose follow request is being rejected
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: Request rejected
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/user/followers/{username}:
 *   get:
 *     tags: [UserRelations]
 *     summary: Get Followers
 *     description: Retrieves a list of followers for a specified user.
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         description: The username of the user whose followers are being fetched.
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         required: false
 *         description: The page number for pagination. Defaults to 1.
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: The number of followers to return per page. Defaults to 10.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A list of followers for the specified user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ListUser'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/user/followings/{username}:
 *   get:
 *     tags: [UserRelations]
 *     summary: Get Followings
 *     description: Retrieves a list of users that the specified user is following.
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         description: The username of the user whose followings are being fetched.
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         required: false
 *         description: The page number for pagination. Defaults to 1.
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: The number of followings to return per page. Defaults to 10.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A list of users that the specified user is following.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ListUser'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/user/block/{username}:
 *   post:
 *     tags: [UserRelations]
 *     summary: Block and unblock a user
 *     description: Allows the logged-in user to block or unblock another user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to block or unblock
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: User blocked or unblocked
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/user/addclosefriend/{username}:
 *   post:
 *     tags: [UserRelations]
 *     summary: Add or remove a user from close friends
 *     description: Allows the logged-in user to add or remove another user from their close friends list.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to add or remove from close friends
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: User added to or removed from close friends
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/user/closefriendlist:
 *   get:
 *     tags: [UserRelations]
 *     summary: Get close friends list
 *     description: Retrieves the list of close friends for the logged-in user.
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: The page number for pagination. Defaults to 1.
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: The number of close friends to return per page. Defaults to 10.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A list of close friends for the logged-in user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ListUser'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/user/blocklist:
 *   get:
 *     tags: [UserRelations]
 *     summary: Get block list
 *     description: Retrieves the list of users blocked by the logged-in user.
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: The page number for pagination. Defaults to 1.
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: The number of blocked users to return per page. Defaults to 10.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A list of blocked users for the logged-in user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ListUser'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
