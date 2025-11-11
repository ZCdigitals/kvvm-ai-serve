const fs = require("fs");
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  failOnErrors: true,
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KVVM AI API",
      version: process.env.npm_package_version,
    },
  },
  // scan from controller files
  apis: ["src/packages/**/*.ts"],
};

// build swagger json
const specification = swaggerJSDoc(options);

// write swagger json to file
fs.writeFileSync(
  "public/swagger.json",
  JSON.stringify(specification, null, 2),
);
