const path = require("path");
const { SERVER_BASE_ROUTE, BACKEND_URL } = require("./envConfig");
const options = {
  definition: {
    openapi: "3.0.0",
    servers: [
      {
        url: SERVER_BASE_ROUTE,
        description: "Server",
      },
    ],
    info: {
      title: "Nexus API Docs",
      version: "1.0.0",
      description: "Nexus API documentation",
    },
    components: {
      securitySchemes: {
        xAccessToken: {
          type: "apiKey",
          in: "header",
          name: "x-access-token",
        },
      },
    },
    security: [{ xAccessToken: [] }],
  },
  apis: [path.join(__dirname, "..", "swaggerDocs", "*.js")],
};

module.exports = options;
