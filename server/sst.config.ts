/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "geochess",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
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
    const aiGameMoveQueue = new sst.aws.Queue("AiGameMoveQueue", {
      delay: "5 seconds",
      dlq: {
        queue: aiGameMoveDlq.arn,
        retry: 3,
      },
    });
    const aiGameTimeoutDlq = new sst.aws.Queue("AiGameTimeoutDLQ");
    const aiGameTimeoutQueue = new sst.aws.Queue("AiGameTimeoutQueue", {
      delay: "60 seconds",
      dlq: {
        queue: aiGameTimeoutDlq.arn,
        retry: 3,
      },
    });
    const withFriendsGameStartDlq = new sst.aws.Queue("WithFriendsGameStartDLQ");
    const withFriendsGameStartQueue = new sst.aws.Queue(
      "WithFriendsGameStartQueue",
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
      "WithFriendsGameTimeoutQueue",
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
    const firebaseAuthorizer = api.addAuthorizer({
      name: "firebaseAuthorizer",
      lambda: {
        function: {
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
      runtime: "python3.14",
      handler: "src/api/v1/health/handler.handler",
      environment: {
        ENVIRONMENT: $app.stage,
      },
    });

    api.route(
      "POST /api/v1/ai-games",
      {
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
      "POST /api/v1/ai-games/{gameId}/moves",
      {
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
      "POST /api/v1/with-friends-games/join",
      {
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
      function: {
        runtime: "python3.14",
        handler: "src/jobs/cleanup_expired_ai_games.cleanup_expired_ai_games",
        environment: {
          ENVIRONMENT: $app.stage,
        },
        permissions: databasePermissions,
      },
    });

    new sst.aws.CronV2("DeleteExpiredWithFriendsGames", {
      schedule: "cron(0 0 1 * ? *)",
      function: {
        runtime: "python3.14",
        handler:
          "src/jobs/cleanup_expired_with_friends_games.cleanup_expired_with_friends_games",
        environment: {
          ENVIRONMENT: $app.stage,
        },
        permissions: databasePermissions,
      },
    });

    aiGameMoveQueue.subscribe({
      handler: "src/jobs/process_ai_game_move.process_ai_game_move",
      runtime: "python3.14",
      environment: {
        ENVIRONMENT: $app.stage,
        AI_GAME_TIMEOUT_QUEUE_URL: aiGameTimeoutQueue.url,
      },
      permissions: [...databasePermissions, aiGameTimeoutQueueSendPermission],
    });

    aiGameTimeoutQueue.subscribe({
      handler: "src/jobs/process_ai_game_timeout.process_ai_game_timeout",
      runtime: "python3.14",
      environment: {
        ENVIRONMENT: $app.stage,
      },
      permissions: databasePermissions,
    });

    withFriendsGameStartQueue.subscribe({
      handler: "src/jobs/process_with_friends_game_start.process_with_friends_game_start",
      runtime: "python3.14",
      environment: {
        ENVIRONMENT: $app.stage,
        WITH_FRIENDS_GAME_TIMEOUT_QUEUE_URL: withFriendsGameTimeoutQueue.url,
      },
      permissions: [
        ...databasePermissions,
        withFriendsGameTimeoutQueueSendPermission,
      ],
    });

    withFriendsGameTimeoutQueue.subscribe({
      handler: "src/jobs/process_with_friends_game_timeout.process_with_friends_game_timeout",
      runtime: "python3.14",
      environment: {
        ENVIRONMENT: $app.stage,
      },
      permissions: databasePermissions,
    });

    return {
      api: api.url,
    };
  },
});
