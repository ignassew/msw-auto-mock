"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/openapi-types@12.1.0/node_modules/openapi-types/dist/index.js
var require_dist = __commonJS({
  "node_modules/.pnpm/openapi-types@12.1.0/node_modules/openapi-types/dist/index.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.OpenAPIV2 = exports.OpenAPIV3 = void 0;
    var OpenAPIV32;
    (function(OpenAPIV33) {
      var HttpMethods;
      (function(HttpMethods2) {
        HttpMethods2["GET"] = "get";
        HttpMethods2["PUT"] = "put";
        HttpMethods2["POST"] = "post";
        HttpMethods2["DELETE"] = "delete";
        HttpMethods2["OPTIONS"] = "options";
        HttpMethods2["HEAD"] = "head";
        HttpMethods2["PATCH"] = "patch";
        HttpMethods2["TRACE"] = "trace";
      })(HttpMethods = OpenAPIV33.HttpMethods || (OpenAPIV33.HttpMethods = {}));
    })(OpenAPIV32 = exports.OpenAPIV3 || (exports.OpenAPIV3 = {}));
    var OpenAPIV2;
    (function(OpenAPIV22) {
      var HttpMethods;
      (function(HttpMethods2) {
        HttpMethods2["GET"] = "get";
        HttpMethods2["PUT"] = "put";
        HttpMethods2["POST"] = "post";
        HttpMethods2["DELETE"] = "delete";
        HttpMethods2["OPTIONS"] = "options";
        HttpMethods2["HEAD"] = "head";
        HttpMethods2["PATCH"] = "patch";
      })(HttpMethods = OpenAPIV22.HttpMethods || (OpenAPIV22.HttpMethods = {}));
    })(OpenAPIV2 = exports.OpenAPIV2 || (exports.OpenAPIV2 = {}));
  }
});

// src/cli.ts
var import_cac = __toESM(require("cac"));

// src/generate.ts
var fs = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var import_generate = __toESM(require("oazapfts/lib/codegen/generate"));
var import_openapi_types = __toESM(require_dist());
var import_camelCase3 = __toESM(require("lodash/camelCase"));

// src/swagger.ts
var import_swagger_parser = __toESM(require("@apidevtools/swagger-parser"));
var import_swagger2openapi = __toESM(require("swagger2openapi"));
async function getV3Doc(spec) {
  const doc = await import_swagger_parser.default.bundle(spec);
  const isOpenApiV3 = "openapi" in doc && doc.openapi.startsWith("3");
  if (isOpenApiV3) {
    return doc;
  } else {
    const result = await import_swagger2openapi.default.convertObj(doc, {});
    return result.openapi;
  }
}

// src/utils.ts
var prettier = __toESM(require("prettier"));
var path = __toESM(require("path"));
var import_camelCase = __toESM(require("lodash/camelCase"));
var EXTENSION_TO_PARSER = {
  ts: "typescript",
  tsx: "typescript",
  js: "babel",
  jsx: "babel",
  "js.flow": "flow",
  flow: "flow",
  gql: "graphql",
  graphql: "graphql",
  css: "postcss",
  scss: "postcss",
  less: "postcss",
  stylus: "postcss",
  markdown: "markdown",
  md: "markdown",
  json: "json"
};
async function prettify(filePath, content) {
  let config = null;
  let parser = "typescript";
  if (filePath) {
    const fileExtension = path.extname(filePath).slice(1);
    parser = EXTENSION_TO_PARSER[fileExtension];
    config = await prettier.resolveConfig(process.cwd(), {
      useCache: true,
      editorconfig: true
    });
  }
  try {
    return prettier.format(content, {
      parser,
      ...config,
      plugins: []
    });
  } catch (e) {
    return content;
  }
}
var toExpressLikePath = (path3) => path3.replace(/{(.+?)}/g, (_match, p1) => `:${(0, import_camelCase.default)(p1)}`);

// src/transform.ts
var import_node_vm = __toESM(require("vm"));
var import_merge = __toESM(require("lodash/merge"));
var import_camelCase2 = __toESM(require("lodash/camelCase"));
var import_faker = require("@faker-js/faker");
function getResIdentifierName(res) {
  if (!res.id) {
    return "";
  }
  return (0, import_camelCase2.default)(`get ${res.id}${res.code}Response`);
}
function transformToGenerateResultFunctions(operationCollection, baseURL, options) {
  const context = {
    faker: import_faker.faker,
    MAX_ARRAY_LENGTH: options?.maxArrayLength ?? 20,
    baseURL: baseURL ?? "",
    result: null
  };
  import_node_vm.default.createContext(context);
  return operationCollection.map(
    (op) => op.response.map((r) => {
      const name = getResIdentifierName(r);
      if (!name) {
        return "";
      }
      const fakerResult = transformJSONSchemaToFakerCode(r.responses?.["application/json"]);
      if (options?.static) {
        import_node_vm.default.runInContext(`result = ${fakerResult};`, context);
      }
      return [
        `export function `,
        `${getResIdentifierName(r)}() { `,
        `return ${options?.static ? JSON.stringify(context.result) : fakerResult} `,
        `};
`
      ].join("");
    }).join("\n")
  ).join("\n");
}
function transformToHandlerCode(operationCollection) {
  return operationCollection.map((op) => {
    return `http.${op.verb}(\`\${baseURL}${op.path}\`, () => {
        const resultArray = [${op.response.map((response) => {
      const identifier = getResIdentifierName(response);
      return parseInt(response?.code) === 204 ? `[undefined, { status: ${parseInt(response?.code)} }]` : `[${identifier ? `${identifier}()` : "null"}, { status: ${parseInt(response?.code)} }]`;
    })}];

          return HttpResponse.json(...resultArray[next() % resultArray.length])
        }),
`;
  }).join("  ").trimEnd();
}
function transformJSONSchemaToFakerCode(jsonSchema, key) {
  if (!jsonSchema) {
    return "null";
  }
  if (jsonSchema.example) {
    return JSON.stringify(jsonSchema.example);
  }
  if (Array.isArray(jsonSchema.type)) {
    return `faker.helpers.arrayElement([${jsonSchema.type.map((type) => transformJSONSchemaToFakerCode({ ...jsonSchema, type })).join(",")}])`;
  }
  if (jsonSchema.enum) {
    return `faker.helpers.arrayElement(${JSON.stringify(jsonSchema.enum)})`;
  }
  if (jsonSchema.allOf) {
    const { allOf, ...rest } = jsonSchema;
    return transformJSONSchemaToFakerCode((0, import_merge.default)({}, ...allOf, rest));
  }
  if (jsonSchema.oneOf) {
    const schemas = jsonSchema.oneOf;
    return `faker.helpers.arrayElement([${schemas.map((i) => transformJSONSchemaToFakerCode(i))}])`;
  }
  if (jsonSchema.anyOf) {
    const schemas = jsonSchema.anyOf;
    return `faker.helpers.arrayElement([${schemas.map((i) => transformJSONSchemaToFakerCode(i))}])`;
  }
  switch (jsonSchema.type) {
    case "string":
      return transformStringBasedOnFormat(jsonSchema.format, key);
    case "number":
    case "integer":
      return `faker.number.int({ min: ${jsonSchema.minimum}, max: ${jsonSchema.maximum} })`;
    case "boolean":
      return `faker.datatype.boolean()`;
    case "object":
      if (!jsonSchema.properties && typeof jsonSchema.additionalProperties === "object") {
        return `[...new Array(5).keys()].map(_ => ({ [faker.lorem.word()]: ${transformJSONSchemaToFakerCode(
          jsonSchema.additionalProperties
        )} })).reduce((acc, next) => Object.assign(acc, next), {})`;
      }
      return `{
        ${Object.entries(jsonSchema.properties ?? {}).map(([k, v]) => {
        return `${JSON.stringify(k)}: ${transformJSONSchemaToFakerCode(v, k)}`;
      }).join(",\n")}
    }`;
    case "array":
      return `[...(new Array(faker.number.int({ min: ${jsonSchema.minLength ?? 1}, max: ${jsonSchema.maxLength ?? "MAX_ARRAY_LENGTH"} }))).keys()].map(_ => (${transformJSONSchemaToFakerCode(jsonSchema.items)}))`;
    default:
      return "null";
  }
}
function transformStringBasedOnFormat(format2, key) {
  if (["date-time", "date", "time"].includes(format2 ?? "") || key?.toLowerCase().endsWith("_at")) {
    return `faker.date.past()`;
  } else if (format2 === "uuid") {
    return `faker.datatype.uuid()`;
  } else if (["idn-email", "email"].includes(format2 ?? "") || key?.toLowerCase().endsWith("email")) {
    return `faker.internet.email()`;
  } else if (["hostname", "idn-hostname"].includes(format2 ?? "")) {
    return `faker.internet.domainName()`;
  } else if (format2 === "ipv4") {
    return `faker.internet.ip()`;
  } else if (format2 === "ipv6") {
    return `faker.internet.ipv6()`;
  } else if (["uri", "uri-reference", "iri", "iri-reference", "uri-template"].includes(format2 ?? "") || key?.toLowerCase().endsWith("url")) {
    if (["photo", "image", "picture"].some((image) => key?.toLowerCase().includes(image))) {
      return `faker.image.url()`;
    }
    return `faker.internet.url()`;
  } else if (key?.toLowerCase().endsWith("name")) {
    return `faker.person.fullName()`;
  } else {
    return `faker.lorem.slug(1)`;
  }
}

// src/template.ts
var getSetupCode = (options) => {
  if (options?.node || options?.reactNative) {
    return [`const server = setupServer(...handlers);`, `server.listen();`].join("\n");
  }
  return [`const worker = setupWorker(...handlers);`, `worker.start();`].join("\n");
};
var getImportsCode = (options) => {
  const imports = [`import { HttpResponse, http } from 'msw';`, `import { faker } from '@faker-js/faker';`];
  if (options?.node) {
    imports.push(`import { setupServer } from 'msw/node'`);
  } else if (options?.reactNative) {
    imports.push(`import { setupServer } from 'msw/native'`);
  } else {
    imports.push(`import { setupWorker } from 'msw/browser'`);
  }
  return imports.join("\n");
};
var mockTemplate = (operationCollection, baseURL, options) => `/**
* This file is AUTO GENERATED by [msw-auto-mock](https://github.com/zoubingwu/msw-auto-mock)
* Feel free to commit/edit it as you need.
*/
/* eslint-disable */
/* tslint:disable */
${getImportsCode(options)}

faker.seed(1);

const baseURL = '${baseURL}';
const MAX_ARRAY_LENGTH = ${options?.maxArrayLength ?? 20};

let i = 0;
const next = () => {
  if (i === Number.MAX_SAFE_INTEGER - 1) {
    i = 0;
  }
  return i++;
}

export const handlers = [
  ${transformToHandlerCode(operationCollection)}
];

${transformToGenerateResultFunctions(operationCollection, baseURL, options)}

// This configures a Service Worker with the given request handlers.
export const startWorker = () => {
  ${getSetupCode(options)}
}
`;

// src/generate.ts
function generateOperationCollection(apiDoc, options) {
  const apiGen = new import_generate.default(apiDoc, {});
  const operationDefinitions = getOperationDefinitions(apiDoc);
  return operationDefinitions.filter((op) => operationFilter(op, options)).map((op) => codeFilter(op, options)).map((definition) => toOperation(definition, apiGen));
}
async function generate(spec, options) {
  const { output: outputFile } = options;
  let code;
  const apiDoc = await getV3Doc(spec);
  const operationCollection = generateOperationCollection(apiDoc, options);
  let baseURL = "";
  if (options.baseUrl === true) {
    baseURL = getServerUrl(apiDoc);
  } else if (typeof options.baseUrl === "string") {
    baseURL = options.baseUrl;
  }
  code = mockTemplate(operationCollection, baseURL, options);
  if (outputFile) {
    fs.writeFileSync(path2.resolve(process.cwd(), outputFile), await prettify(outputFile, code));
  } else {
    console.log(await prettify(null, code));
  }
}
function getServerUrl(apiDoc) {
  let server = apiDoc.servers?.at(0);
  let url = "";
  if (server) {
    url = server.url;
  }
  if (server?.variables) {
    Object.entries(server.variables).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value.default);
    });
  }
  return url;
}
var operationKeys = Object.values(import_openapi_types.OpenAPIV3.HttpMethods);
function getOperationDefinitions(v3Doc) {
  return Object.entries(v3Doc.paths).flatMap(
    ([path3, pathItem]) => !pathItem ? [] : Object.entries(pathItem).filter((arg) => operationKeys.includes(arg[0])).map(([verb, operation]) => {
      const id = (0, import_camelCase3.default)(operation.operationId ?? verb + "/" + path3);
      return {
        path: path3,
        verb,
        id,
        responses: operation.responses
      };
    })
  );
}
function operationFilter(operation, options) {
  const includes = options?.includes?.split(",") ?? null;
  const excludes = options?.excludes?.split(",") ?? null;
  if (includes && !includes.includes(operation.path)) {
    return false;
  }
  if (excludes && excludes.includes(operation.path)) {
    return false;
  }
  return true;
}
function codeFilter(operation, options) {
  const codes = options?.codes?.split(",") ?? null;
  const responses = Object.entries(operation.responses).filter(([code]) => {
    if (codes && !codes.includes(code)) {
      return false;
    }
    return true;
  }).map(([code, response]) => ({
    [code]: response
  })).reduce((acc, curr) => ({ ...acc, ...curr }), {});
  return {
    ...operation,
    responses
  };
}
function toOperation(definition, apiGen) {
  const { verb, path: path3, responses, id } = definition;
  const responseMap = Object.entries(responses).map(([code, response]) => {
    const content = apiGen.resolve(response).content;
    if (!content) {
      return { code, id: "", responses: {} };
    }
    const resolvedResponse = Object.keys(content).reduce((resolved, type) => {
      const schema = content[type].schema;
      if (typeof schema !== "undefined") {
        resolved[type] = recursiveResolveSchema(schema, apiGen);
      }
      return resolved;
    }, {});
    return {
      code,
      id,
      responses: resolvedResponse
    };
  });
  return {
    verb,
    path: toExpressLikePath(path3),
    response: responseMap
  };
}
var resolvingRefs = [];
function autoPopRefs(cb) {
  const n = resolvingRefs.length;
  const res = cb();
  resolvingRefs.length = n;
  return res;
}
function resolve2(schema, apiGen) {
  if ((0, import_generate.isReference)(schema)) {
    if (resolvingRefs.includes(schema.$ref)) {
      console.warn(`circular reference for path ${[...resolvingRefs, schema.$ref].join(" -> ")} found`);
      return {};
    }
    resolvingRefs.push(schema.$ref);
  }
  return { ...apiGen.resolve(schema) };
}
function recursiveResolveSchema(schema, apiGen) {
  return autoPopRefs(() => {
    const resolvedSchema = resolve2(schema, apiGen);
    if (resolvedSchema.type === "array") {
      resolvedSchema.items = resolve2(resolvedSchema.items, apiGen);
      resolvedSchema.items = recursiveResolveSchema(resolvedSchema.items, apiGen);
    } else if (resolvedSchema.type === "object") {
      if (!resolvedSchema.properties && typeof resolvedSchema.additionalProperties === "object") {
        if ((0, import_generate.isReference)(resolvedSchema.additionalProperties)) {
          resolvedSchema.additionalProperties = recursiveResolveSchema(
            resolve2(resolvedSchema.additionalProperties, apiGen),
            apiGen
          );
        }
      }
      if (resolvedSchema.properties) {
        resolvedSchema.properties = Object.entries(resolvedSchema.properties).reduce((resolved, [key, value]) => {
          resolved[key] = recursiveResolveSchema(value, apiGen);
          return resolved;
        }, {});
      }
    } else if (resolvedSchema.allOf) {
      resolvedSchema.allOf = resolvedSchema.allOf.map((item) => recursiveResolveSchema(item, apiGen));
    } else if (resolvedSchema.oneOf) {
      resolvedSchema.oneOf = resolvedSchema.oneOf.map((item) => recursiveResolveSchema(item, apiGen));
    } else if (resolvedSchema.anyOf) {
      resolvedSchema.anyOf = resolvedSchema.anyOf.map((item) => recursiveResolveSchema(item, apiGen));
    }
    return resolvedSchema;
  });
}

// package.json
var version = "0.18.0";

// src/cli.ts
var cli = (0, import_cac.default)();
cli.command("<spec>", "Generating msw mock definitions with random fake data.").option("-o, --output <file>", `Output file path such as \`./mock.js\`, without it'll output to stdout.`).option("-m, --max-array-length <number>", `Max array length, default to 20.`).option("-t, --includes <keywords>", `Include the request path with given string, can be seperated with comma.`).option("-e, --excludes <keywords>", `Exclude the request path with given string, can be seperated with comma.`).option("--base-url [baseUrl]", `Use the one you specified or server url in OpenAPI description as base url.`).option("--static", "By default it will generate dynamic mocks, use this flag if you want generate static mocks.").option(
  "--node",
  `By default it will generate code for browser environment, use this flag if you want to use it in Node.js environment.`
).option(
  "--react-native",
  `By default it will generate code for browser environment, use this flag if you want to use it in React Native environment. Additionally you will need to add polyfills to patch the global environment by installing react-native-url-polyfill.`
).option("-c, --codes <keywords>", "Comma separated list of status codes to generate responses for").example("msw-auto-mock ./githubapi.yaml -o mock.js").example("msw-auto-mock ./githubapi.yaml -o mock.js -t /admin,/repo -m 30").action(async (spec, options) => {
  await generate(spec, options).catch(console.error);
});
cli.help();
cli.version(version);
cli.parse();
