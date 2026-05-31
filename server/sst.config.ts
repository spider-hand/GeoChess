/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "geo-chess",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const api = new sst.aws.ApiGatewayV2("Api");

    api.route("GET /api/v1/health", {
      runtime: "python3.14",
      handler: "src/api/v1/health/handler.handler",
      environment: {
        ENVIRONMENT: $app.stage,
      },
    });

    return {
      api: api.url,
    };
  },
});
