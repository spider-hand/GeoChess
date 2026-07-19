/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "geochess",
      removal: input?.stage === "prod" ? "retain" : "remove",
      protect: ["prod"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    const api = new sst.aws.ApiGatewayV2("Api");
    const aiGameMoveDlq = new sst.aws.Queue("AiGameMoveDLQ");
    const aiGameMoveQueue = new sst.aws.Queue("AiGameMove", {
      delay: "5 seconds",
      dlq: {
        queue: aiGameMoveDlq.arn,
        retry: 3,
      },
    });
    const aiGameTimeoutDlq = new sst.aws.Queue("AiGameTimeoutDLQ");
    const aiGameTimeoutQueue = new sst.aws.Queue("AiGameTimeout", {
      delay: "60 seconds",
      dlq: {
        queue: aiGameTimeoutDlq.arn,
        retry: 3,
      },
    });
    const withFriendsGameStartDlq = new sst.aws.Queue("WithFriendsGameStartDLQ");
    const withFriendsGameStartQueue = new sst.aws.Queue(
      "WithFriendsGameStart",
      {
        delay: "5 seconds",
        dlq: {
          queue: withFriendsGameStartDlq.arn,
          retry: 3,
        },
      },
    );
    const withFriendsGameTimeoutDlq = new sst.aws.Queue(
      "WithFriendsGameTimeoutDLQ",
    );
    const withFriendsGameTimeoutQueue = new sst.aws.Queue(
      "WithFriendsGameTimeout",
      {
        delay: "60 seconds",
        dlq: {
          queue: withFriendsGameTimeoutDlq.arn,
          retry: 3,
        },
      },
    );
    const appSecretArn = `arn:aws:secretsmanager:*:*:secret:geochess-${$app.stage}*`;
    const databasePermissions = [
      sst.aws.permission({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [appSecretArn],
      }),
    ];
    const aiGameMoveQueueSendPermission = sst.aws.permission({
      actions: ["sqs:SendMessage"],
      resources: [aiGameMoveQueue.arn],
    });
    const aiGameTimeoutQueueSendPermission = sst.aws.permission({
      actions: ["sqs:SendMessage"],
      resources: [aiGameTimeoutQueue.arn],
    });
    const withFriendsGameStartQueueSendPermission = sst.aws.permission({
      actions: ["sqs:SendMessage"],
      resources: [withFriendsGameStartQueue.arn],
    });
    const withFriendsGameTimeoutQueueSendPermission = sst.aws.permission({
      actions: ["sqs:SendMessage"],
      resources: [withFriendsGameTimeoutQueue.arn],
    });
    const queueReceiveActions = [
      "sqs:ChangeMessageVisibility",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:GetQueueUrl",
      "sqs:ReceiveMessage",
    ];
    const aiGameMoveQueueReceivePermission = sst.aws.permission({
      actions: queueReceiveActions,
      resources: [aiGameMoveQueue.arn],
    });
    const aiGameTimeoutQueueReceivePermission = sst.aws.permission({
      actions: queueReceiveActions,
      resources: [aiGameTimeoutQueue.arn],
    });
    const withFriendsGameStartQueueReceivePermission = sst.aws.permission({
      actions: queueReceiveActions,
      resources: [withFriendsGameStartQueue.arn],
    });
    const withFriendsGameTimeoutQueueReceivePermission = sst.aws.permission({
      actions: queueReceiveActions,
      resources: [withFriendsGameTimeoutQueue.arn],
    });
    const cleanupAiGames = new sst.aws.Function("CleanupAiGames", {
      architecture: "arm64",
      runtime: "python3.14",
      handler: "src/jobs/cleanup_expired_ai_games.cleanup_expired_ai_games",
      environment: {
        ENVIRONMENT: $app.stage,
      },
      permissions: databasePermissions,
    });
    const cleanupFriendsGames = new sst.aws.Function("CleanupFriendsGames", {
      architecture: "arm64",
      runtime: "python3.14",
      handler:
        "src/jobs/cleanup_expired_with_friends_games.cleanup_expired_with_friends_games",
      environment: {
        ENVIRONMENT: $app.stage,
      },
      permissions: databasePermissions,
    });
    const aiMoveWorker = new sst.aws.Function("AiMoveWorker", {
      architecture: "arm64",
      runtime: "python3.14",
      handler: "src/jobs/process_ai_game_move.process_ai_game_move",
      environment: {
        ENVIRONMENT: $app.stage,
        AI_GAME_TIMEOUT_QUEUE_URL: aiGameTimeoutQueue.url,
      },
      permissions: [
        ...databasePermissions,
        aiGameMoveQueueReceivePermission,
        aiGameTimeoutQueueSendPermission,
      ],
    });
    const aiTimeoutWorker = new sst.aws.Function("AiTimeoutWorker", {
      architecture: "arm64",
      runtime: "python3.14",
      handler: "src/jobs/process_ai_game_timeout.process_ai_game_timeout",
      environment: {
        ENVIRONMENT: $app.stage,
      },
      permissions: [...databasePermissions, aiGameTimeoutQueueReceivePermission],
    });
    const friendsStartWorker = new sst.aws.Function("FriendsStartWorker", {
      architecture: "arm64",
      runtime: "python3.14",
      handler:
        "src/jobs/process_with_friends_game_start.process_with_friends_game_start",
      environment: {
        ENVIRONMENT: $app.stage,
        WITH_FRIENDS_GAME_TIMEOUT_QUEUE_URL: withFriendsGameTimeoutQueue.url,
      },
      permissions: [
        ...databasePermissions,
        withFriendsGameStartQueueReceivePermission,
        withFriendsGameTimeoutQueueSendPermission,
      ],
    });
    const friendsTimeoutWorker = new sst.aws.Function("FriendsTimeoutWorker", {
      architecture: "arm64",
      runtime: "python3.14",
      handler:
        "src/jobs/process_with_friends_game_timeout.process_with_friends_game_timeout",
      environment: {
        ENVIRONMENT: $app.stage,
      },
      permissions: [
        ...databasePermissions,
        withFriendsGameTimeoutQueueReceivePermission,
      ],
    });
    const firebaseAuthorizer = api.addAuthorizer({
      name: "firebaseAuthorizer",
      lambda: {
        function: {
          architecture: "arm64",
          runtime: "python3.14",
          handler: "src/core/auth.lambda_handler",
          environment: {
            ENVIRONMENT: $app.stage,
          },
          permissions: [
            sst.aws.permission({
              actions: ["secretsmanager:GetSecretValue"],
              resources: [appSecretArn],
            }),
          ],
        },
        identitySources: ["$request.header.Authorization"],
        payload: "2.0",
        response: "simple",
        ttl: "0 seconds",
      },
    });

    api.route("GET /api/v1/health", {
      architecture: "arm64",
      runtime: "python3.14",
      handler: "src/api/v1/health/handler.handler",
      environment: {
        ENVIRONMENT: $app.stage,
      },
    });

    api.route(
      "POST /api/v1/ai-games",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/ai_games/handler.create_ai_game",
        environment: {
          ENVIRONMENT: $app.stage,
          AI_GAME_MOVE_QUEUE_URL: aiGameMoveQueue.url,
          AI_GAME_TIMEOUT_QUEUE_URL: aiGameTimeoutQueue.url,
        },
        permissions: [
          ...databasePermissions,
          aiGameMoveQueueSendPermission,
          aiGameTimeoutQueueSendPermission,
        ],
      },
      {
        auth: {
          lambda: firebaseAuthorizer.id,
        },
      },
    );

    api.route(
      "GET /api/v1/ai-games",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/ai_games/handler.get_ai_games",
        environment: { ENVIRONMENT: $app.stage },
        permissions: databasePermissions,
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "POST /api/v1/ai-games/{gameId}/moves",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/ai_games/moves/handler.create_ai_game_move",
        environment: {
          ENVIRONMENT: $app.stage,
          AI_GAME_MOVE_QUEUE_URL: aiGameMoveQueue.url,
          AI_GAME_TIMEOUT_QUEUE_URL: aiGameTimeoutQueue.url,
        },
        permissions: [
          ...databasePermissions,
          aiGameMoveQueueSendPermission,
          aiGameTimeoutQueueSendPermission,
        ],
      },
      {
        auth: {
          lambda: firebaseAuthorizer.id,
        },
      },
    );

    api.route(
      "GET /api/v1/users/{userId}",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/users/handler.get_user",
        environment: {
          ENVIRONMENT: $app.stage,
        },
        permissions: databasePermissions,
      },
      {
        auth: {
          lambda: firebaseAuthorizer.id,
        },
      },
    );

    api.route(
      "POST /api/v1/with-friends-games",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/with_friends_games/handler.create_with_friends_game",
        environment: {
          ENVIRONMENT: $app.stage,
        },
        permissions: databasePermissions,
      },
      {
        auth: {
          lambda: firebaseAuthorizer.id,
        },
      },
    );

    api.route(
      "GET /api/v1/with-friends-games",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/with_friends_games/handler.get_with_friends_games",
        environment: { ENVIRONMENT: $app.stage },
        permissions: databasePermissions,
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "GET /api/v1/with-friends-games/stats",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/with_friends_games/handler.get_with_friends_game_stats",
        environment: { ENVIRONMENT: $app.stage },
        permissions: databasePermissions,
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "POST /api/v1/with-friends-games/join",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/with_friends_games/join/handler.join_with_friends_game",
        environment: {
          ENVIRONMENT: $app.stage,
          WITH_FRIENDS_GAME_START_QUEUE_URL: withFriendsGameStartQueue.url,
        },
        permissions: [
          ...databasePermissions,
          withFriendsGameStartQueueSendPermission,
        ],
      },
      {
        auth: {
          lambda: firebaseAuthorizer.id,
        },
      },
    );

    api.route(
      "POST /api/v1/with-friends-games/{gameId}/moves",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/with_friends_games/moves/handler.create_with_friends_game_move",
        environment: {
          ENVIRONMENT: $app.stage,
          WITH_FRIENDS_GAME_TIMEOUT_QUEUE_URL: withFriendsGameTimeoutQueue.url,
        },
        permissions: [
          ...databasePermissions,
          withFriendsGameTimeoutQueueSendPermission,
        ],
      },
      {
        auth: {
          lambda: firebaseAuthorizer.id,
        },
      },
    );

    api.route(
      "GET /api/v1/users/me",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/users/handler.get_current_user",
        environment: {
          ENVIRONMENT: $app.stage,
        },
        permissions: databasePermissions,
      },
      {
        auth: {
          lambda: firebaseAuthorizer.id,
        },
      },
    );

    api.route(
      "POST /api/v1/users/me",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/users/handler.create_user",
        environment: {
          ENVIRONMENT: $app.stage,
        },
        permissions: databasePermissions,
      },
      {
        auth: {
          lambda: firebaseAuthorizer.id,
        },
      },
    );

    api.route(
      "PATCH /api/v1/users/me",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/users/handler.update_user",
        environment: {
          ENVIRONMENT: $app.stage,
        },
        permissions: databasePermissions,
      },
      {
        auth: {
          lambda: firebaseAuthorizer.id,
        },
      },
    );

    api.route(
      "DELETE /api/v1/users/me",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/users/handler.delete_user",
        environment: {
          ENVIRONMENT: $app.stage,
        },
        permissions: databasePermissions,
      },
      {
        auth: {
          lambda: firebaseAuthorizer.id,
        },
      },
    );

    new sst.aws.CronV2("DeleteExpiredAiGames", {
      schedule: "cron(0 0 * * ? *)",
      function: cleanupAiGames,
    });

    new sst.aws.CronV2("DeleteExpiredWithFriendsGames", {
      schedule: "cron(0 0 1 * ? *)",
      function: cleanupFriendsGames,
    });

    aiGameMoveQueue.subscribe(aiMoveWorker);
    aiGameTimeoutQueue.subscribe(aiTimeoutWorker);
    withFriendsGameStartQueue.subscribe(friendsStartWorker);
    withFriendsGameTimeoutQueue.subscribe(friendsTimeoutWorker);

    return {
      api: api.url,
    };
  },
});
