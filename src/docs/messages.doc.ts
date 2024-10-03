/**
 * @swagger
 * /api/user/messages:
 *   get:
 *     summary: Get list of user messages
 *     tags: [Messages]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number (optional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of messages per page (optional)
 *     responses:
 *       200:
 *         description: A list of user messages with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Thread'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 */
