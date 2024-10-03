/**
 * @swagger
 * /api/user/suggestions:
 *   get:
 *     summary: Get user or post suggestions for search
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: The username for suggestion
 *       - in: query
 *         name: post
 *         schema:
 *           type: string
 *         description: The post ID for suggestion
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 5
 *         description: The number of suggestions to return
 *     responses:
 *       200:
 *         description: A list of user or post suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggest:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - $ref: '#/components/schemas/ListUser'
 *                       - type: string
 *                 history:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["johndoe"]
 */

/**
 * @swagger
 * /api/user/search:
 *   get:
 *     summary: Search users or posts
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Username to search
 *       - in: query
 *         name: post
 *         schema:
 *           type: string
 *         description: Post content to search
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Maximum number of results per page (optional)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number (optional)
 *     responses:
 *       200:
 *         description: Search results for users or posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - $ref: '#/components/schemas/SearchUser'
 *                       - $ref: '#/components/schemas/Post'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 3
 *                     totalPage:
 *                       type: integer
 *                       example: 1
 */
