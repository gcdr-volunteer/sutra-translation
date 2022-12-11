var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __copyProps = (to, from, except, desc) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: !0 }) : target,
  mod
)), __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: !0 }), mod);

// <stdin>
var stdin_exports = {};
__export(stdin_exports, {
  assets: () => assets_manifest_default,
  assetsBuildDirectory: () => assetsBuildDirectory,
  entry: () => entry,
  future: () => future,
  publicPath: () => publicPath,
  routes: () => routes
});
module.exports = __toCommonJS(stdin_exports);

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest
});
var import_server = require("react-dom/server"), import_react2 = require("@emotion/react"), import_create_instance = __toESM(require("@emotion/server/create-instance")), import_react3 = require("@remix-run/react");

// app/context.tsx
var import_react = require("react"), ServerStyleContext = (0, import_react.createContext)(null), ClientStyleContext = (0, import_react.createContext)(null);

// app/createEmotionCache.ts
var import_cache = __toESM(require("@emotion/cache")), defaultCache = createEmotionCache();
function createEmotionCache() {
  return (0, import_cache.default)({ key: "cha" });
}

// app/entry.server.tsx
var import_jsx_dev_runtime = require("react/jsx-dev-runtime");
function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  let cache = createEmotionCache(), { extractCriticalToChunks } = (0, import_create_instance.default)(cache), html = (0, import_server.renderToString)(
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ServerStyleContext.Provider, {
      value: null,
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_react2.CacheProvider, {
        value: cache,
        children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_react3.RemixServer, {
          context: remixContext,
          url: request.url
        }, void 0, !1, {
          fileName: "app/entry.server.tsx",
          lineNumber: 23,
          columnNumber: 9
        }, this)
      }, void 0, !1, {
        fileName: "app/entry.server.tsx",
        lineNumber: 22,
        columnNumber: 7
      }, this)
    }, void 0, !1, {
      fileName: "app/entry.server.tsx",
      lineNumber: 21,
      columnNumber: 5
    }, this)
  ), chunks = extractCriticalToChunks(html), markup = (0, import_server.renderToString)(
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ServerStyleContext.Provider, {
      value: chunks.styles,
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_react2.CacheProvider, {
        value: cache,
        children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_react3.RemixServer, {
          context: remixContext,
          url: request.url
        }, void 0, !1, {
          fileName: "app/entry.server.tsx",
          lineNumber: 33,
          columnNumber: 9
        }, this)
      }, void 0, !1, {
        fileName: "app/entry.server.tsx",
        lineNumber: 32,
        columnNumber: 7
      }, this)
    }, void 0, !1, {
      fileName: "app/entry.server.tsx",
      lineNumber: 31,
      columnNumber: 5
    }, this)
  );
  return responseHeaders.set("Content-Type", "text/html"), new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  default: () => App,
  links: () => links,
  loader: () => loader,
  meta: () => meta
});
var import_react4 = require("react"), import_react5 = require("@emotion/react"), import_react6 = require("@chakra-ui/react"), import_react7 = require("@remix-run/react");

// app/theme/breakpoints.ts
var breakpoints = {
  sm: "320px",
  md: "768px",
  lg: "960px",
  xl: "1200px"
};

// app/theme/colors.ts
var colors = {
  colors: {
    brand: {
      900: "#1a365d",
      800: "#153e75",
      700: "#2a69ac"
    },
    primary: {
      300: "#c98749",
      800: "#3c3b4b"
    },
    secondary: {
      300: "#FEFCF6",
      500: "#F5F3F4",
      800: "#DCD9DA"
    },
    iconButton: {
      500: "#BF8A54"
    }
  }
};

// app/theme/index.ts
var customTheme = {
  ...colors,
  ...breakpoints
};

// app/root.tsx
var import_jsx_dev_runtime2 = require("react/jsx-dev-runtime"), loader = async ({ request }) => request.headers.get("cookie") ?? "", meta = () => ({
  charset: "utf-8",
  title: "Sutra Translation",
  viewport: "width=device-width,initial-scale=1"
}), links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
  }
], Document = (0, import_react5.withEmotionCache)(({ children }, emotionCache) => {
  let serverStyleData = (0, import_react4.useContext)(ServerStyleContext), clientStyleData = (0, import_react4.useContext)(ClientStyleContext);
  return (0, import_react4.useEffect)(() => {
    emotionCache.sheet.container = document.head;
    let tags = emotionCache.sheet.tags;
    emotionCache.sheet.flush(), tags.forEach((tag) => {
      emotionCache.sheet._insertTag(tag);
    }), clientStyleData == null || clientStyleData.reset();
  }, []), /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("html", {
    lang: "en",
    children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("head", {
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react7.Meta, {}, void 0, !1, {
            fileName: "app/root.tsx",
            lineNumber: 66,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react7.Links, {}, void 0, !1, {
            fileName: "app/root.tsx",
            lineNumber: 67,
            columnNumber: 9
          }, this),
          serverStyleData == null ? void 0 : serverStyleData.map(({ key, ids, css }) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("style", {
            "data-emotion": `${key} ${ids.join(" ")}`,
            dangerouslySetInnerHTML: { __html: css }
          }, key, !1, {
            fileName: "app/root.tsx",
            lineNumber: 69,
            columnNumber: 11
          }, this))
        ]
      }, void 0, !0, {
        fileName: "app/root.tsx",
        lineNumber: 65,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("body", {
        children: [
          children,
          /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react7.ScrollRestoration, {}, void 0, !1, {
            fileName: "app/root.tsx",
            lineNumber: 78,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react7.Scripts, {}, void 0, !1, {
            fileName: "app/root.tsx",
            lineNumber: 79,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react7.LiveReload, {}, void 0, !1, {
            fileName: "app/root.tsx",
            lineNumber: 80,
            columnNumber: 9
          }, this)
        ]
      }, void 0, !0, {
        fileName: "app/root.tsx",
        lineNumber: 76,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 64,
    columnNumber: 5
  }, this);
}), theme = (0, import_react6.extendTheme)({ ...customTheme });
function App() {
  let cookies = (0, import_react7.useLoaderData)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Document, {
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react6.ChakraProvider, {
      colorModeManager: (0, import_react6.cookieStorageManagerSSR)(cookies),
      resetCSS: !0,
      theme,
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react7.Outlet, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 93,
        columnNumber: 9
      }, this)
    }, void 0, !1, {
      fileName: "app/root.tsx",
      lineNumber: 92,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/root.tsx",
    lineNumber: 91,
    columnNumber: 5
  }, this);
}

// app/routes/update_password.tsx
var update_password_exports = {};
__export(update_password_exports, {
  action: () => action,
  default: () => UpdatePasswordRoute,
  loader: () => loader2
});
var import_react8 = require("@chakra-ui/react"), import_node2 = require("@remix-run/node"), import_react9 = require("@remix-run/react");

// app/auth.server.ts
var import_remix_auth = require("remix-auth");

// app/session.server.ts
var import_node = require("@remix-run/node"), sessionStorage = (0, import_node.createCookieSessionStorage)({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: !0,
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.ENV === "prod"
  }
}), { getSession, commitSession, destroySession } = sessionStorage;

// app/auth.server.ts
var import_remix_auth_form = require("remix-auth-form"), import_bcryptjs2 = __toESM(require("bcryptjs"));

// app/clients/dynamodb.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb"), dbClient = new import_client_dynamodb.DynamoDBClient({ region: "ap-southeast-2" });

// app/models/user.ts
var import_util_dynamodb2 = require("@aws-sdk/util-dynamodb"), import_client_dynamodb3 = require("@aws-sdk/client-dynamodb");

// app/models/utils.ts
var import_util_dynamodb = require("@aws-sdk/util-dynamodb"), import_client_dynamodb2 = require("@aws-sdk/client-dynamodb");
var composeIdForUser = ({ email }) => `USER-${email}`;

// app/types/user.ts
var roles = ["Admin", "Leader", "Editor", "Viewer"], langs = ["ZH", "EN"], Team = /* @__PURE__ */ ((Team2) => (Team2.TEAM0001 = "Master Sure", Team2.TEAM0002 = "Master Chi", Team2))(Team || {});

// app/models/user.ts
var import_bcryptjs = __toESM(require("bcryptjs")), import_dayjs = __toESM(require("dayjs")), import_utc = __toESM(require("dayjs/plugin/utc"));
import_dayjs.default.extend(import_utc.default);
var _isAdminUserExist = async () => {
  let params = {
    TableName: process.env.USER_TABLE,
    Key: (0, import_util_dynamodb2.marshall)({
      PK: "TEAM",
      SK: "USER-pttdev123@gmail.com"
    })
  }, { Item } = await dbClient.send(new import_client_dynamodb3.GetItemCommand(params));
  return Boolean(Item);
}, _createAdminUser = async () => {
  let adminUser = {
    username: "Terry Pan",
    password: "0987654321",
    team: "Master Sure" /* TEAM0001 */,
    origin_lang: "ZH",
    target_lang: "EN",
    roles: ["Admin"],
    email: "pttdev123@gmail.com",
    first_login: !0
  };
  await createNewUser(adminUser);
}, onlyCreateAdminUserWhenFirstSystemUp = async () => {
  await _isAdminUserExist() || await _createAdminUser();
}, getUserByEmail = async (email) => {
  let SK = composeIdForUser({ email }), params = {
    TableName: process.env.USER_TABLE,
    Key: (0, import_util_dynamodb2.marshall)({
      PK: "TEAM",
      SK
    })
  }, { Item } = await dbClient.send(new import_client_dynamodb3.GetItemCommand(params));
  if (Item)
    return (0, import_util_dynamodb2.unmarshall)(Item);
}, updateUserPassword = async ({
  email,
  password
}) => {
  console.log("caller name", updateUserPassword.caller);
  let SK = composeIdForUser({ email }), salt = await import_bcryptjs.default.genSalt(15), hashedPassword = await import_bcryptjs.default.hash(password, salt), params = {
    TableName: process.env.USER_TABLE,
    Key: (0, import_util_dynamodb2.marshall)({
      PK: "TEAM",
      SK
    }),
    ConditionExpression: "attribute_exists(#SK)",
    ExpressionAttributeNames: {
      "#SK": "SK",
      "#password": "password"
    },
    ExpressionAttributeValues: (0, import_util_dynamodb2.marshall)({
      ":password": hashedPassword,
      ":first_login": !1
    }),
    UpdateExpression: "Set #password = :password, first_login = :first_login"
  };
  await dbClient.send(new import_client_dynamodb3.UpdateItemCommand(params));
}, createNewUser = async (user) => {
  let {
    password,
    email,
    createdAt = import_dayjs.default.utc().format(),
    createdBy = "Admin",
    updatedAt = import_dayjs.default.utc().format(),
    updatedBy = "Admin",
    ...rest
  } = user, salt = await import_bcryptjs.default.genSalt(15), hashedPassword = await import_bcryptjs.default.hash(password, salt), sortKey = composeIdForUser({ email }), params = {
    TableName: process.env.USER_TABLE,
    Item: (0, import_util_dynamodb2.marshall)({
      PK: "TEAM",
      SK: sortKey,
      email,
      password: hashedPassword,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      ...rest
    }),
    ConditionExpression: "attribute_not_exists(#SK)",
    ExpressionAttributeNames: {
      "#SK": "SK"
    },
    ReturnValues: import_client_dynamodb3.ReturnValue.ALL_OLD
  };
  return await dbClient.send(new import_client_dynamodb3.PutItemCommand(params));
};

// app/auth.server.ts
var authenticator = new import_remix_auth.Authenticator(sessionStorage);
authenticator.use(
  new import_remix_auth_form.FormStrategy(async ({ form, context }) => {
    let username = form.get("username"), password = form.get("password"), user = await getUserByEmail(username);
    if (user) {
      if (await import_bcryptjs2.default.compare(password, user.password)) {
        let { password: password2, ...rest } = user;
        return rest;
      }
      return;
    }
  })
);
var assertAuthUser = async (request) => await authenticator.isAuthenticated(request, {
  failureRedirect: "/login"
});

// app/routes/update_password.tsx
var import_jsx_dev_runtime3 = require("react/jsx-dev-runtime"), loader2 = async ({ request }) => (await assertAuthUser(request), (0, import_node2.json)({}));
async function action({ request }) {
  try {
    let clonedRequest = request.clone(), form = await clonedRequest.formData(), newPass = form.get("new_pass"), confirmPass = form.get("confirm_pass");
    if (!newPass || !confirmPass)
      return (0, import_node2.json)({ password: "password cannot be empty" }, { status: 400 });
    if (newPass !== confirmPass)
      return (0, import_node2.json)({ password: "two passwords are not equal" }, { status: 400 });
    let user = await authenticator.isAuthenticated(request);
    if (user) {
      await updateUserPassword({ email: user.email, password: confirmPass });
      let session = await getSession(clonedRequest.headers.get("cookie")), headers = new Headers({ "Set-Cookie": await commitSession(session) });
      return (0, import_node2.redirect)("/", { headers });
    }
    return (0, import_node2.redirect)("/login");
  } catch {
    return (0, import_node2.json)({ password: "Internal Server Error" }, { status: 500 });
  }
}
function UpdatePasswordRoute() {
  let actionData = (0, import_react9.useActionData)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.Flex, {
    minHeight: "100vh",
    width: "full",
    align: "center",
    justifyContent: "center",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.Box, {
      borderWidth: 1,
      px: 4,
      width: "full",
      maxWidth: "500px",
      borderRadius: 4,
      textAlign: "center",
      boxShadow: "lg",
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.Box, {
        p: 4,
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(UpdatePasswordHeader, {}, void 0, !1, {
            fileName: "app/routes/update_password.tsx",
            lineNumber: 64,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(UpdatePasswordForm, {
            actionData
          }, void 0, !1, {
            fileName: "app/routes/update_password.tsx",
            lineNumber: 65,
            columnNumber: 11
          }, this)
        ]
      }, void 0, !0, {
        fileName: "app/routes/update_password.tsx",
        lineNumber: 63,
        columnNumber: 9
      }, this)
    }, void 0, !1, {
      fileName: "app/routes/update_password.tsx",
      lineNumber: 54,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/update_password.tsx",
    lineNumber: 53,
    columnNumber: 5
  }, this);
}
var UpdatePasswordHeader = () => /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.Box, {
  textAlign: "center",
  children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.Heading, {
    children: "Update Your Password"
  }, void 0, !1, {
    fileName: "app/routes/update_password.tsx",
    lineNumber: 74,
    columnNumber: 7
  }, this)
}, void 0, !1, {
  fileName: "app/routes/update_password.tsx",
  lineNumber: 73,
  columnNumber: 5
}, this), UpdatePasswordForm = (props) => {
  let transition = (0, import_react9.useTransition)(), isLoading = Boolean(transition.submission), { password } = props.actionData || {};
  return /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.Box, {
    my: 8,
    textAlign: "left",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react9.Form, {
      method: "post",
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.FormControl, {
          isInvalid: Boolean(password),
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.FormLabel, {
              children: "New Password"
            }, void 0, !1, {
              fileName: "app/routes/update_password.tsx",
              lineNumber: 92,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.Input, {
              type: "password",
              placeholder: "Enter your new password",
              name: "new_pass"
            }, void 0, !1, {
              fileName: "app/routes/update_password.tsx",
              lineNumber: 93,
              columnNumber: 11
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/routes/update_password.tsx",
          lineNumber: 91,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.FormControl, {
          mt: 4,
          isInvalid: Boolean(password),
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.FormLabel, {
              children: "Confirm Password"
            }, void 0, !1, {
              fileName: "app/routes/update_password.tsx",
              lineNumber: 97,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.Input, {
              type: "password",
              placeholder: "Confirm your new password",
              name: "confirm_pass"
            }, void 0, !1, {
              fileName: "app/routes/update_password.tsx",
              lineNumber: 98,
              columnNumber: 11
            }, this),
            password ? /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.FormErrorMessage, {
              children: password
            }, void 0, !1, {
              fileName: "app/routes/update_password.tsx",
              lineNumber: 99,
              columnNumber: 23
            }, this) : null
          ]
        }, void 0, !0, {
          fileName: "app/routes/update_password.tsx",
          lineNumber: 96,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.Button, {
          colorScheme: "iconButton",
          width: "full",
          mt: 4,
          type: "submit",
          disabled: isLoading,
          children: isLoading ? /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react8.Spinner, {}, void 0, !1, {
            fileName: "app/routes/update_password.tsx",
            lineNumber: 103,
            columnNumber: 24
          }, this) : "Save"
        }, void 0, !1, {
          fileName: "app/routes/update_password.tsx",
          lineNumber: 102,
          columnNumber: 9
        }, this)
      ]
    }, void 0, !0, {
      fileName: "app/routes/update_password.tsx",
      lineNumber: 90,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/update_password.tsx",
    lineNumber: 89,
    columnNumber: 5
  }, this);
};

// app/routes/__app.tsx
var app_exports = {};
__export(app_exports, {
  UserContext: () => UserContext,
  default: () => AppRoute,
  loader: () => loader3
});
var import_react14 = require("@chakra-ui/react"), import_node3 = require("@remix-run/node"), import_react15 = require("@remix-run/react");

// app/components/common/sidebar.tsx
var import_react12 = require("@chakra-ui/react"), import_icons = require("@chakra-ui/icons"), import_react13 = require("@remix-run/react"), import_fi = require("react-icons/fi"), import_ai = require("react-icons/ai");

// app/authorisation/ability.ts
var import_ability = require("@casl/ability"), defineAbilityFor = (user) => {
  let { can, cannot, build } = new import_ability.AbilityBuilder(import_ability.PureAbility);
  return user.roles.includes("Admin") && (can("Read", "Administration"), can("Create", "Sutra")), build();
};

// app/authorisation/can.ts
var import_react10 = require("react"), import_react11 = require("@casl/react"), AbilityContext = (0, import_react10.createContext)(null), Can = (0, import_react11.createContextualCan)(AbilityContext.Consumer);

// app/components/common/sidebar.tsx
var import_jsx_dev_runtime4 = require("react/jsx-dev-runtime"), Sidebar = () => {
  let [toggle, setToggle] = (0, import_react12.useBoolean)(!0), {
    colors: { primary, secondary }
  } = (0, import_react12.useTheme)(), activeLinkColor = {
    color: primary[300]
  }, nonActiveLinkColor = {
    color: secondary[500]
  };
  return toggle ? /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Box, {
    w: "250px",
    background: "primary.800",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Flex, {
      px: "5%",
      pos: "sticky",
      top: "0",
      left: "0",
      h: "100vh",
      w: "250px",
      flexDir: "column",
      justifyContent: "space-between",
      boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.05)",
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.VStack, {
          spacing: 4,
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.VStack, {
              pt: 6,
              w: "100%",
              children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react13.NavLink, {
                  to: ".",
                  style: { textAlign: "center", marginBottom: "0.2rem" },
                  children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Text, {
                    as: "b",
                    fontSize: "3xl",
                    color: "secondary.300",
                    children: "Kum\u0101raj\u012Bva"
                  }, void 0, !1, {
                    fileName: "app/components/common/sidebar.tsx",
                    lineNumber: 49,
                    columnNumber: 17
                  }, this)
                }, void 0, !1, {
                  fileName: "app/components/common/sidebar.tsx",
                  lineNumber: 48,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Divider, {
                  borderColor: "primary.300"
                }, void 0, !1, {
                  fileName: "app/components/common/sidebar.tsx",
                  lineNumber: 53,
                  columnNumber: 15
                }, this)
              ]
            }, void 0, !0, {
              fileName: "app/components/common/sidebar.tsx",
              lineNumber: 47,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Flex, {
              w: "70%",
              flexDir: "column",
              justifyContent: "space-between",
              children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Box, {
                  px: 6,
                  py: 2,
                  _hover: {
                    color: "secondary.500",
                    background: "whiteAlpha.300",
                    borderRadius: 8
                  },
                  children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react13.NavLink, {
                    to: "dashboard",
                    style: ({ isActive }) => isActive ? activeLinkColor : nonActiveLinkColor,
                    children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.HStack, {
                      justifyContent: "flex-start",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Icon, {
                          as: import_fi.FiHome
                        }, void 0, !1, {
                          fileName: "app/components/common/sidebar.tsx",
                          lineNumber: 71,
                          columnNumber: 21
                        }, this),
                        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Text, {
                          as: "b",
                          children: "Home"
                        }, void 0, !1, {
                          fileName: "app/components/common/sidebar.tsx",
                          lineNumber: 72,
                          columnNumber: 21
                        }, this)
                      ]
                    }, void 0, !0, {
                      fileName: "app/components/common/sidebar.tsx",
                      lineNumber: 70,
                      columnNumber: 19
                    }, this)
                  }, void 0, !1, {
                    fileName: "app/components/common/sidebar.tsx",
                    lineNumber: 66,
                    columnNumber: 17
                  }, this)
                }, void 0, !1, {
                  fileName: "app/components/common/sidebar.tsx",
                  lineNumber: 57,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Box, {
                  px: 6,
                  py: 2,
                  _hover: {
                    color: "secondary.500",
                    background: "whiteAlpha.300",
                    borderRadius: 8
                  },
                  children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react13.NavLink, {
                    to: "tripitaka",
                    style: ({ isActive }) => isActive ? activeLinkColor : nonActiveLinkColor,
                    children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.HStack, {
                      justifyContent: "flex-start",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Icon, {
                          as: import_ai.AiOutlineBook
                        }, void 0, !1, {
                          fileName: "app/components/common/sidebar.tsx",
                          lineNumber: 90,
                          columnNumber: 21
                        }, this),
                        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Text, {
                          as: "b",
                          children: "Sutra"
                        }, void 0, !1, {
                          fileName: "app/components/common/sidebar.tsx",
                          lineNumber: 91,
                          columnNumber: 21
                        }, this)
                      ]
                    }, void 0, !0, {
                      fileName: "app/components/common/sidebar.tsx",
                      lineNumber: 89,
                      columnNumber: 19
                    }, this)
                  }, void 0, !1, {
                    fileName: "app/components/common/sidebar.tsx",
                    lineNumber: 85,
                    columnNumber: 17
                  }, this)
                }, void 0, !1, {
                  fileName: "app/components/common/sidebar.tsx",
                  lineNumber: 76,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Box, {
                  px: 6,
                  py: 2,
                  _hover: {
                    color: "secondary.500",
                    background: "whiteAlpha.300",
                    borderRadius: 8
                  },
                  children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react13.NavLink, {
                    to: "translation",
                    style: ({ isActive }) => isActive ? activeLinkColor : nonActiveLinkColor,
                    children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.HStack, {
                      justifyContent: "flex-start",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Icon, {
                          as: import_ai.AiOutlineTranslation
                        }, void 0, !1, {
                          fileName: "app/components/common/sidebar.tsx",
                          lineNumber: 109,
                          columnNumber: 21
                        }, this),
                        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Text, {
                          as: "b",
                          children: "Translation"
                        }, void 0, !1, {
                          fileName: "app/components/common/sidebar.tsx",
                          lineNumber: 110,
                          columnNumber: 21
                        }, this)
                      ]
                    }, void 0, !0, {
                      fileName: "app/components/common/sidebar.tsx",
                      lineNumber: 108,
                      columnNumber: 19
                    }, this)
                  }, void 0, !1, {
                    fileName: "app/components/common/sidebar.tsx",
                    lineNumber: 104,
                    columnNumber: 17
                  }, this)
                }, void 0, !1, {
                  fileName: "app/components/common/sidebar.tsx",
                  lineNumber: 95,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Can, {
                  I: "Read",
                  this: "Administration",
                  children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Box, {
                    px: 6,
                    py: 2,
                    _hover: {
                      color: "secondary.500",
                      background: "whiteAlpha.300",
                      borderRadius: 8
                    },
                    children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react13.NavLink, {
                      to: "admin",
                      style: ({ isActive }) => isActive ? activeLinkColor : nonActiveLinkColor,
                      children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.HStack, {
                        justifyContent: "flex-start",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Icon, {
                            as: import_ai.AiOutlineSetting
                          }, void 0, !1, {
                            fileName: "app/components/common/sidebar.tsx",
                            lineNumber: 129,
                            columnNumber: 23
                          }, this),
                          /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Text, {
                            as: "b",
                            children: "Admin"
                          }, void 0, !1, {
                            fileName: "app/components/common/sidebar.tsx",
                            lineNumber: 130,
                            columnNumber: 23
                          }, this)
                        ]
                      }, void 0, !0, {
                        fileName: "app/components/common/sidebar.tsx",
                        lineNumber: 128,
                        columnNumber: 21
                      }, this)
                    }, void 0, !1, {
                      fileName: "app/components/common/sidebar.tsx",
                      lineNumber: 124,
                      columnNumber: 19
                    }, this)
                  }, void 0, !1, {
                    fileName: "app/components/common/sidebar.tsx",
                    lineNumber: 115,
                    columnNumber: 17
                  }, this)
                }, void 0, !1, {
                  fileName: "app/components/common/sidebar.tsx",
                  lineNumber: 114,
                  columnNumber: 15
                }, this)
              ]
            }, void 0, !0, {
              fileName: "app/components/common/sidebar.tsx",
              lineNumber: 56,
              columnNumber: 13
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/components/common/sidebar.tsx",
          lineNumber: 45,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Flex, {
          flexDir: "column",
          w: "100%",
          alignItems: "center",
          mb: 4,
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Divider, {
              borderColor: "primary.300"
            }, void 0, !1, {
              fileName: "app/components/common/sidebar.tsx",
              lineNumber: 139,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Flex, {
              mt: 4,
              alignItems: "center",
              flexDir: "row",
              justifyContent: "space-between",
              children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Avatar, {
                  size: "sm",
                  name: "Terry Pan",
                  src: "https://bit.ly/broken-link"
                }, void 0, !1, {
                  fileName: "app/components/common/sidebar.tsx",
                  lineNumber: 141,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Flex, {
                  flexDir: "column",
                  ml: 4,
                  children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react13.NavLink, {
                    to: "setting",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Heading, {
                        as: "h3",
                        size: "sm",
                        color: "secondary.500",
                        children: "Terry Pan"
                      }, void 0, !1, {
                        fileName: "app/components/common/sidebar.tsx",
                        lineNumber: 144,
                        columnNumber: 19
                      }, this),
                      /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.Text, {
                        color: "secondary.500",
                        children: "Admin"
                      }, void 0, !1, {
                        fileName: "app/components/common/sidebar.tsx",
                        lineNumber: 147,
                        columnNumber: 19
                      }, this)
                    ]
                  }, void 0, !0, {
                    fileName: "app/components/common/sidebar.tsx",
                    lineNumber: 143,
                    columnNumber: 17
                  }, this)
                }, void 0, !1, {
                  fileName: "app/components/common/sidebar.tsx",
                  lineNumber: 142,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.IconButton, {
                  background: "none",
                  _hover: { background: "none" },
                  "aria-label": "menu-bar",
                  icon: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_icons.ArrowLeftIcon, {}, void 0, !1, {
                    fileName: "app/components/common/sidebar.tsx",
                    lineNumber: 154,
                    columnNumber: 23
                  }, this),
                  onClick: setToggle.toggle
                }, void 0, !1, {
                  fileName: "app/components/common/sidebar.tsx",
                  lineNumber: 150,
                  columnNumber: 15
                }, this)
              ]
            }, void 0, !0, {
              fileName: "app/components/common/sidebar.tsx",
              lineNumber: 140,
              columnNumber: 13
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/components/common/sidebar.tsx",
          lineNumber: 138,
          columnNumber: 11
        }, this)
      ]
    }, void 0, !0, {
      fileName: "app/components/common/sidebar.tsx",
      lineNumber: 34,
      columnNumber: 9
    }, this)
  }, void 0, !1, {
    fileName: "app/components/common/sidebar.tsx",
    lineNumber: 33,
    columnNumber: 7
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react12.IconButton, {
    pos: "fixed",
    bottom: 8,
    left: 8,
    w: 12,
    h: 12,
    "aria-label": "sidebar-menu-button",
    isRound: !0,
    icon: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_icons.ArrowRightIcon, {}, void 0, !1, {
      fileName: "app/components/common/sidebar.tsx",
      lineNumber: 172,
      columnNumber: 15
    }, this),
    onClick: setToggle.toggle
  }, void 0, !1, {
    fileName: "app/components/common/sidebar.tsx",
    lineNumber: 164,
    columnNumber: 7
  }, this);
};

// app/routes/__app.tsx
var import_react16 = require("react");
var import_jsx_dev_runtime5 = require("react/jsx-dev-runtime"), loader3 = async ({ request }) => {
  let user = await assertAuthUser(request);
  return (0, import_node3.json)(user);
}, UserContext = (0, import_react16.createContext)({
  username: "",
  email: "admin@gmail.com",
  roles: ["Viewer"],
  origin_lang: "ZH",
  target_lang: "EN",
  team: "Master Sure" /* TEAM0001 */,
  first_login: !1
});
function AppRoute() {
  let user = (0, import_react15.useLoaderData)(), ability = defineAbilityFor(user);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(AbilityContext.Provider, {
    value: ability,
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(UserContext.Provider, {
      value: user || void 0,
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react14.Flex, {
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(Sidebar, {}, void 0, !1, {
            fileName: "app/routes/__app.tsx",
            lineNumber: 30,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react15.Outlet, {}, void 0, !1, {
            fileName: "app/routes/__app.tsx",
            lineNumber: 31,
            columnNumber: 11
          }, this)
        ]
      }, void 0, !0, {
        fileName: "app/routes/__app.tsx",
        lineNumber: 29,
        columnNumber: 9
      }, this)
    }, void 0, !1, {
      fileName: "app/routes/__app.tsx",
      lineNumber: 28,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/__app.tsx",
    lineNumber: 27,
    columnNumber: 5
  }, this);
}

// app/routes/__app/translation.tsx
var translation_exports = {};
__export(translation_exports, {
  default: () => TranslationRoute
});
var import_react23 = require("@chakra-ui/react"), import_react24 = require("@remix-run/react");

// app/components/common/modal.tsx
var import_react17 = require("@chakra-ui/react"), import_jsx_dev_runtime6 = require("react/jsx-dev-runtime");
var FormModal = (props) => {
  let { header, body, modalSize, isOpen, onClose, name } = props;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_react17.Modal, {
    isOpen,
    onClose,
    size: modalSize ?? "2xl",
    children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_react17.ModalOverlay, {}, void 0, !1, {
        fileName: "app/components/common/modal.tsx",
        lineNumber: 52,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_react17.ModalContent, {
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_react17.ModalHeader, {
            children: header
          }, void 0, !1, {
            fileName: "app/components/common/modal.tsx",
            lineNumber: 54,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_react17.ModalCloseButton, {}, void 0, !1, {
            fileName: "app/components/common/modal.tsx",
            lineNumber: 55,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_react17.ModalBody, {
            pb: 6,
            children: body
          }, void 0, !1, {
            fileName: "app/components/common/modal.tsx",
            lineNumber: 56,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_react17.ModalFooter, {
            children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_react17.Button, {
                colorScheme: "iconButton",
                mr: 3,
                type: "submit",
                name,
                children: "Save"
              }, void 0, !1, {
                fileName: "app/components/common/modal.tsx",
                lineNumber: 59,
                columnNumber: 11
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_react17.Button, {
                onClick: onClose,
                children: "Cancel"
              }, void 0, !1, {
                fileName: "app/components/common/modal.tsx",
                lineNumber: 62,
                columnNumber: 11
              }, this)
            ]
          }, void 0, !0, {
            fileName: "app/components/common/modal.tsx",
            lineNumber: 58,
            columnNumber: 9
          }, this)
        ]
      }, void 0, !0, {
        fileName: "app/components/common/modal.tsx",
        lineNumber: 53,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/components/common/modal.tsx",
    lineNumber: 51,
    columnNumber: 5
  }, this);
};

// app/components/common/breadcrumb.tsx
var import_react18 = require("@chakra-ui/react"), import_icons2 = require("@chakra-ui/icons"), import_react19 = require("@remix-run/react"), import_jsx_dev_runtime7 = require("react/jsx-dev-runtime"), BreadCrumb = () => {
  let location = (0, import_react19.useLocation)(), tempPath = location == null ? void 0 : location.pathname, names = ["TRIPITAKA", "SUTRA", "ROLL", "STAGING"], breadcrumbComp = tempPath.split("/").filter(Boolean).map((_, index, arr) => {
    let href = `/${arr.slice(0, index + 1).join("/")}`;
    return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(import_react18.BreadcrumbItem, {
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(import_react18.LinkBox, {
        as: "article",
        children: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(import_react19.Link, {
          to: href,
          children: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(import_react18.Text, {
            as: "b",
            children: names[index]
          }, void 0, !1, {
            fileName: "app/components/common/breadcrumb.tsx",
            lineNumber: 26,
            columnNumber: 15
          }, this)
        }, void 0, !1, {
          fileName: "app/components/common/breadcrumb.tsx",
          lineNumber: 25,
          columnNumber: 13
        }, this)
      }, void 0, !1, {
        fileName: "app/components/common/breadcrumb.tsx",
        lineNumber: 24,
        columnNumber: 11
      }, this)
    }, href, !1, {
      fileName: "app/components/common/breadcrumb.tsx",
      lineNumber: 23,
      columnNumber: 9
    }, this);
  });
  return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(import_react18.Flex, {
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(import_react18.Breadcrumb, {
      spacing: 2,
      separator: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(import_icons2.ChevronRightIcon, {
        color: "gray.500"
      }, void 0, !1, {
        fileName: "app/components/common/breadcrumb.tsx",
        lineNumber: 35,
        columnNumber: 42
      }, this),
      children: breadcrumbComp
    }, void 0, !1, {
      fileName: "app/components/common/breadcrumb.tsx",
      lineNumber: 35,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/components/common/breadcrumb.tsx",
    lineNumber: 34,
    columnNumber: 5
  }, this);
};

// app/components/common/paragraph.tsx
var import_react20 = require("@chakra-ui/react"), import_jsx_dev_runtime8 = require("react/jsx-dev-runtime"), Paragraph = ({
  origin,
  target,
  index,
  disabled,
  checkedParagraphs,
  finish,
  footnotes
}) => {
  let [toggle, setToggle] = (0, import_react20.useBoolean)(!1);
  toggle ? checkedParagraphs.current.add(index) : checkedParagraphs.current.delete(index);
  let textWithFootNote = footnotes.length ? footnotes.map((footnote, index2, arr) => {
    var _a;
    let { num, offset, content } = footnote, nextOffset = ((_a = arr[index2 + 1]) == null ? void 0 : _a.offset) ?? -1;
    return /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("span", {
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_react20.Text, {
          as: "span",
          children: origin.slice(0, offset)
        }, void 0, !1, {
          fileName: "app/components/common/paragraph.tsx",
          lineNumber: 38,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_react20.Tooltip, {
          label: content,
          "aria-label": "footnote tooltip",
          children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("span", {
            style: { paddingLeft: 4, paddingRight: 4, color: "blue" },
            children: [
              "[",
              num,
              "]"
            ]
          }, void 0, !0, {
            fileName: "app/components/common/paragraph.tsx",
            lineNumber: 40,
            columnNumber: 15
          }, this)
        }, void 0, !1, {
          fileName: "app/components/common/paragraph.tsx",
          lineNumber: 39,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_react20.Text, {
          as: "span",
          children: origin.slice(offset, nextOffset)
        }, void 0, !1, {
          fileName: "app/components/common/paragraph.tsx",
          lineNumber: 42,
          columnNumber: 13
        }, this)
      ]
    }, num, !0, {
      fileName: "app/components/common/paragraph.tsx",
      lineNumber: 37,
      columnNumber: 11
    }, this);
  }) : origin;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_react20.Flex, {
    w: finish ? "50%" : "90%",
    flexDir: "row",
    alignItems: "flex-start",
    children: finish ? /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_react20.Flex, {
      background: toggle ? "primary.300" : "inherit",
      pl: 4,
      borderRadius: toggle ? 12 : 0,
      flexDir: "row",
      gap: 8,
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_react20.Text, {
        fontSize: "xl",
        children: textWithFootNote
      }, void 0, !1, {
        fileName: "app/components/common/paragraph.tsx",
        lineNumber: 57,
        columnNumber: 11
      }, this)
    }, void 0, !1, {
      fileName: "app/components/common/paragraph.tsx",
      lineNumber: 50,
      columnNumber: 9
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_react20.Checkbox, {
      borderColor: "primary.300",
      onChange: setToggle.toggle,
      disabled,
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_react20.Flex, {
        background: toggle ? "primary.300" : "inherit",
        pl: 4,
        borderRadius: toggle ? 12 : 0,
        flexDir: "row",
        gap: 8,
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_react20.Text, {
            flex: 1,
            color: toggle ? "white" : "inherit",
            lineHeight: 1.8,
            fontSize: "xl",
            fontFamily: "Noto Sans TC",
            children: origin
          }, void 0, !1, {
            fileName: "app/components/common/paragraph.tsx",
            lineNumber: 68,
            columnNumber: 13
          }, this),
          target ? /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_react20.Text, {
            flex: 1,
            color: toggle ? "white" : "inherit",
            lineHeight: 1.8,
            fontSize: "xl",
            fontFamily: "Noto Sans TC",
            children: target
          }, void 0, !1, {
            fileName: "app/components/common/paragraph.tsx",
            lineNumber: 78,
            columnNumber: 15
          }, this) : null
        ]
      }, void 0, !0, {
        fileName: "app/components/common/paragraph.tsx",
        lineNumber: 61,
        columnNumber: 11
      }, this)
    }, void 0, !1, {
      fileName: "app/components/common/paragraph.tsx",
      lineNumber: 60,
      columnNumber: 9
    }, this)
  }, void 0, !1, {
    fileName: "app/components/common/paragraph.tsx",
    lineNumber: 48,
    columnNumber: 5
  }, this);
};

// app/components/common/sutra.tsx
var import_react21 = require("@chakra-ui/react"), import_react22 = require("@remix-run/react"), import_jsx_dev_runtime9 = require("react/jsx-dev-runtime");
function Sutra(props) {
  let { slug, category, title, translator } = props;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_react21.LinkBox, {
    as: "article",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_react21.Card, {
      background: "secondary.500",
      w: 300,
      h: 250,
      borderRadius: 12,
      boxShadow: "0 12px 12px 0 rgba(0, 0, 0, 0.05)",
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_react21.CardHeader, {
          children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_react21.Heading, {
            size: "lg",
            children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_react21.Badge, {
              colorScheme: "green",
              variant: "solid",
              children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_react21.Text, {
                fontSize: "md",
                children: category
              }, void 0, !1, {
                fileName: "app/components/common/sutra.tsx",
                lineNumber: 33,
                columnNumber: 15
              }, this)
            }, void 0, !1, {
              fileName: "app/components/common/sutra.tsx",
              lineNumber: 32,
              columnNumber: 13
            }, this)
          }, void 0, !1, {
            fileName: "app/components/common/sutra.tsx",
            lineNumber: 31,
            columnNumber: 11
          }, this)
        }, void 0, !1, {
          fileName: "app/components/common/sutra.tsx",
          lineNumber: 30,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_react21.CardBody, {
          children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_react21.LinkOverlay, {
            as: import_react22.Link,
            to: slug,
            children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_react21.Text, {
              as: "b",
              fontSize: "3xl",
              children: title
            }, void 0, !1, {
              fileName: "app/components/common/sutra.tsx",
              lineNumber: 39,
              columnNumber: 13
            }, this)
          }, void 0, !1, {
            fileName: "app/components/common/sutra.tsx",
            lineNumber: 38,
            columnNumber: 11
          }, this)
        }, void 0, !1, {
          fileName: "app/components/common/sutra.tsx",
          lineNumber: 37,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_react21.CardFooter, {
          children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_react21.Text, {
            children: translator
          }, void 0, !1, {
            fileName: "app/components/common/sutra.tsx",
            lineNumber: 45,
            columnNumber: 11
          }, this)
        }, void 0, !1, {
          fileName: "app/components/common/sutra.tsx",
          lineNumber: 44,
          columnNumber: 9
        }, this)
      ]
    }, void 0, !0, {
      fileName: "app/components/common/sutra.tsx",
      lineNumber: 23,
      columnNumber: 7
    }, this)
  }, slug, !1, {
    fileName: "app/components/common/sutra.tsx",
    lineNumber: 22,
    columnNumber: 5
  }, this);
}

// app/routes/__app/translation.tsx
var import_jsx_dev_runtime10 = require("react/jsx-dev-runtime");
function TranslationRoute() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(import_react23.Flex, {
    p: 10,
    background: "secondary.800",
    w: "100%",
    flexDir: "column",
    children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(BreadCrumb, {}, void 0, !1, {
        fileName: "app/routes/__app/translation.tsx",
        lineNumber: 9,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(import_react23.Divider, {
        mt: 4,
        mb: 4,
        borderColor: "primary.300"
      }, void 0, !1, {
        fileName: "app/routes/__app/translation.tsx",
        lineNumber: 10,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(import_react24.Outlet, {}, void 0, !1, {
        fileName: "app/routes/__app/translation.tsx",
        lineNumber: 11,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/routes/__app/translation.tsx",
    lineNumber: 8,
    columnNumber: 5
  }, this);
}

// app/routes/__app/translation/$sutraId/$rollId/index.tsx
var rollId_exports = {};
__export(rollId_exports, {
  default: () => RollRoute,
  loader: () => loader4
});
var import_node4 = require("@remix-run/node"), import_react25 = require("@remix-run/react"), import_react26 = require("@chakra-ui/react"), import_react27 = require("react");
var import_jsx_dev_runtime11 = require("react/jsx-dev-runtime"), loader4 = async ({ params }) => (0, import_node4.json)({
  footnotes: [
    {
      paragraphId: "0001",
      offset: 10,
      num: 1,
      content: "Etiam porttitor. Class aptent. Nulla facilisi."
    },
    {
      paragraphId: "0001",
      offset: 80,
      num: 2,
      content: "Etiam porttitor. Class aptent. Nulla facilisi."
    },
    {
      paragraphId: "0001",
      offset: 140,
      num: 3,
      content: "Etiam porttitor. Class aptent. Nulla facilisi."
    },
    {
      paragraphId: "0002",
      offset: 20,
      num: 4,
      content: "Donec non. :Praesent malesuada. Curabitur rutrum."
    },
    {
      paragraphId: "0003",
      offset: 20,
      num: 5,
      content: "Donec non. :Praesent malesuada. Curabitur rutrum."
    }
  ],
  paragraphs: [
    {
      finish: !0,
      num: "0001",
      content: "Aliquam commodo fringilla neque, sit amet condimentum risus commodo in. Quisque porta mi arcu, eget condimentum nunc mollis ac. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed ut cursus nulla. Curabitur ut nunc in est sollicitudin feugiat non at odio. Nullam in accumsan purus, non congue risus. Suspendisse hendrerit non eros ac mattis. Maecenas ornare pellentesque augue non venenatis. Sed tincidunt blandit nibh vel rhoncus. Etiam vitae sagittis risus. Praesent in nisl urna. Suspendisse pharetra eros ut diam malesuada gravida. Aliquam ornare scelerisque enim, sit amet ultricies urna consectetur non. Maecenas in odio malesuada, sagittis erat a, suscipit eros. Proin sodales rhoncus metus, sed placerat ipsum consequat a. Nam quis accumsan arcu. Quisque egestas fringilla lectus, interdum vehicula quam porta ac. Integer magna ligula, porta quis elementum eget, ornare ac purus. Duis lobortis euismod neque sed pellentesque."
    },
    {
      finish: !0,
      num: "0002",
      content: "Nam et pharetra ex. Quisque faucibus sed erat ut auctor. Nulla molestie maximus purus sit amet ornare. Duis vitae ex sollicitudin, tincidunt mi sit amet, mattis nunc. Proin interdum ipsum nec eros consequat mattis. Proin odio mauris, iaculis id diam sit amet, tristique pulvinar turpis. Curabitur eu cursus risus, quis placerat dolor. Vivamus erat massa, sodales sit amet risus et, pellentesque mattis ex."
    },
    {
      finish: !0,
      num: "0003",
      content: "Pellentesque finibus eget augue et semper. Vivamus cursus mauris ac ligula pulvinar, non viverra metus imperdiet. Sed interdum ipsum id gravida lacinia. Curabitur vel diam ut ex blandit elementum. Donec euismod interdum sollicitudin. Maecenas sit amet aliquet urna. Vestibulum elementum faucibus condimentum."
    }
  ]
});
function RollRoute() {
  let { paragraphs, footnotes } = (0, import_react25.useLoaderData)(), navigate = (0, import_react25.useNavigate)(), checkedParagraphs = (0, import_react27.useRef)(/* @__PURE__ */ new Set()), paragraphsComp = paragraphs.map((paragraph, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)(Paragraph, {
    origin: paragraph.content,
    target: "",
    index,
    checkedParagraphs,
    disabled: paragraph.finish,
    finish: paragraph.finish,
    footnotes: footnotes.filter(({ paragraphId }) => paragraphId === paragraph.num)
  }, paragraph.num, !1, {
    fileName: "app/routes/__app/translation/$sutraId/$rollId/index.tsx",
    lineNumber: 70,
    columnNumber: 5
  }, this));
  return paragraphs.length ? /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)(import_react26.Flex, {
    w: "100%",
    flexDir: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 4,
    mt: 10,
    children: [
      paragraphsComp,
      footnotes.length ? /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)(import_react26.Flex, {
        flexDir: "column",
        justifyContent: "flex-start",
        w: "48%",
        children: footnotes.map((footnote) => /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)(import_react26.Text, {
          fontSize: "lg",
          children: [
            "[",
            footnote.num,
            "]",
            footnote.content
          ]
        }, footnote.num, !0, {
          fileName: "app/routes/__app/translation/$sutraId/$rollId/index.tsx",
          lineNumber: 96,
          columnNumber: 17
        }, this))
      }, void 0, !1, {
        fileName: "app/routes/__app/translation/$sutraId/$rollId/index.tsx",
        lineNumber: 93,
        columnNumber: 11
      }, this) : null
    ]
  }, void 0, !0, {
    fileName: "app/routes/__app/translation/$sutraId/$rollId/index.tsx",
    lineNumber: 83,
    columnNumber: 7
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("div", {
    children: "Roll"
  }, void 0, !1, {
    fileName: "app/routes/__app/translation/$sutraId/$rollId/index.tsx",
    lineNumber: 106,
    columnNumber: 10
  }, this);
}

// app/routes/__app/translation/$sutraId/index.tsx
var sutraId_exports = {};
__export(sutraId_exports, {
  default: () => SutraSlug,
  loader: () => loader5
});
var import_node5 = require("@remix-run/node"), import_react30 = require("@remix-run/react"), import_react31 = require("@chakra-ui/react");

// app/components/common/roll.tsx
var import_react28 = require("@chakra-ui/react"), import_react29 = require("@remix-run/react"), import_jsx_dev_runtime12 = require("react/jsx-dev-runtime");
function Roll(props) {
  let { slug, roll_num, title } = props;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(import_react28.LinkBox, {
    as: "article",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(import_react28.Card, {
      background: "secondary.500",
      w: 200,
      borderRadius: 12,
      boxShadow: "0 12px 12px 0 rgba(0, 0, 0, 0.05)",
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(import_react28.CardHeader, {
          children: /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(import_react28.Heading, {
            size: "lg",
            children: roll_num
          }, void 0, !1, {
            fileName: "app/components/common/roll.tsx",
            lineNumber: 19,
            columnNumber: 11
          }, this)
        }, void 0, !1, {
          fileName: "app/components/common/roll.tsx",
          lineNumber: 18,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(import_react28.CardBody, {
          children: /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(import_react28.LinkOverlay, {
            as: import_react29.Link,
            to: slug,
            children: /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(import_react28.Text, {
              children: title
            }, void 0, !1, {
              fileName: "app/components/common/roll.tsx",
              lineNumber: 23,
              columnNumber: 13
            }, this)
          }, void 0, !1, {
            fileName: "app/components/common/roll.tsx",
            lineNumber: 22,
            columnNumber: 11
          }, this)
        }, void 0, !1, {
          fileName: "app/components/common/roll.tsx",
          lineNumber: 21,
          columnNumber: 9
        }, this)
      ]
    }, void 0, !0, {
      fileName: "app/components/common/roll.tsx",
      lineNumber: 12,
      columnNumber: 7
    }, this)
  }, slug, !1, {
    fileName: "app/components/common/roll.tsx",
    lineNumber: 11,
    columnNumber: 5
  }, this);
}

// app/routes/__app/translation/$sutraId/index.tsx
var import_jsx_dev_runtime13 = require("react/jsx-dev-runtime"), loader5 = async ({ params }) => {
  let { sutraId } = params;
  switch (sutraId) {
    case "EN-SUTRA-V1-0001":
      return (0, import_node5.json)({
        rolls: [
          {
            title: "Chapter One: Wondrous Adornments of World-Rulers",
            slug: "EN-ROLL-V1-0001",
            roll_num: "Roll one",
            finish: !0
          },
          {
            title: "Chapter One: Wondrous Adornments of World-Rulers",
            slug: "EN-ROLL-V1-0002",
            roll_num: "Roll two",
            finish: !0
          }
        ]
      });
    case "EN-SUTRA-V1-0002":
      return (0, import_node5.json)({
        rolls: [
          {
            title: "Chapter One: Wondrous Adornments of World-Rulers",
            slug: "EN-ROLL-V1-0001",
            roll_num: "Roll one",
            finish: !0
          },
          {
            title: "Chapter One: Wondrous Adornments of World-Rulers",
            slug: "EN-ROLL-V1-0002",
            roll_num: "Roll two",
            finish: !0
          }
        ]
      });
    case "EN-SUTRA-V1-0003":
      return (0, import_node5.json)({
        rolls: [
          {
            title: "Chapter One: Wondrous Adornments of World-Rulers",
            slug: "EN-ROLL-V1-0001",
            roll_num: "Roll one",
            finish: !0
          },
          {
            title: "Chapter One: Wondrous Adornments of World-Rulers",
            slug: "EN-ROLL-V1-0002",
            roll_num: "Roll two",
            finish: !0
          }
        ]
      });
    default:
      throw new Error("We dont support this yet");
  }
};
function SutraSlug() {
  let { rolls } = (0, import_react30.useLoaderData)(), rollsComp = rolls.map((roll) => /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(Roll, {
    ...roll
  }, roll.slug, !1, {
    fileName: "app/routes/__app/translation/$sutraId/index.tsx",
    lineNumber: 66,
    columnNumber: 41
  }, this));
  return rolls.length ? /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(import_react31.Box, {
    p: 10,
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(import_react31.Flex, {
      gap: 8,
      children: rollsComp
    }, void 0, !1, {
      fileName: "app/routes/__app/translation/$sutraId/index.tsx",
      lineNumber: 70,
      columnNumber: 9
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/__app/translation/$sutraId/index.tsx",
    lineNumber: 69,
    columnNumber: 7
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(import_react31.Box, {
    children: "No roll for this sutra"
  }, void 0, !1, {
    fileName: "app/routes/__app/translation/$sutraId/index.tsx",
    lineNumber: 74,
    columnNumber: 12
  }, this);
}

// app/routes/__app/translation/index.tsx
var translation_exports2 = {};
__export(translation_exports2, {
  default: () => TripitakaRoute,
  loader: () => loader6
});
var import_react32 = require("@chakra-ui/react"), import_node6 = require("@remix-run/node"), import_react33 = require("@remix-run/react");
var import_jsx_dev_runtime14 = require("react/jsx-dev-runtime"), loader6 = async () => (0, import_node6.json)({
  sutras: [
    {
      slug: "EN-SUTRA-V1-0001",
      title: "Avatamsaka",
      category: "Avatamsaka",
      roll_count: 80,
      num_chars: 593144,
      translator: "Translated by Shikonanda, Tang Dynasty",
      dynasty: "Tang",
      time_from: 695,
      time_to: 699
    },
    {
      slug: "EN-SUTRA-V1-0002",
      title: "The Lotus Sutra",
      category: "Avatamsaka",
      roll_count: 80,
      num_chars: 593144,
      translator: "Translated by Shikonanda, Tang Dynasty",
      dynasty: "Tang",
      time_from: 695,
      time_to: 699
    },
    {
      slug: "EN-SUTRA-V1-0003",
      title: "Diamond Sutra",
      category: "Avatamsaka",
      roll_count: 80,
      num_chars: 593144,
      translator: "Translated by Shikonanda, Tang Dynasty",
      dynasty: "Tang",
      time_from: 695,
      time_to: 699
    }
  ]
});
function TripitakaRoute() {
  let { sutras } = (0, import_react33.useLoaderData)(), sutraComp = sutras.map((sutra) => /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(Sutra, {
    ...sutra
  }, sutra.slug, !1, {
    fileName: "app/routes/__app/translation/index.tsx",
    lineNumber: 47,
    columnNumber: 43
  }, this));
  return /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(import_react32.Box, {
    p: 10,
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(import_react32.Flex, {
      gap: 8,
      children: sutraComp
    }, void 0, !1, {
      fileName: "app/routes/__app/translation/index.tsx",
      lineNumber: 50,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/__app/translation/index.tsx",
    lineNumber: 49,
    columnNumber: 5
  }, this);
}

// app/routes/__app/dashboard.tsx
var dashboard_exports = {};
__export(dashboard_exports, {
  default: () => TripitakaRoute2
});
var import_react34 = require("@chakra-ui/react"), import_jsx_dev_runtime15 = require("react/jsx-dev-runtime");
function TripitakaRoute2() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(import_react34.Flex, {
    p: 10,
    background: "secondary.800",
    w: "100%",
    flexDir: "column",
    children: "Home"
  }, void 0, !1, {
    fileName: "app/routes/__app/dashboard.tsx",
    lineNumber: 5,
    columnNumber: 5
  }, this);
}

// app/routes/__app/tripitaka.tsx
var tripitaka_exports = {};
__export(tripitaka_exports, {
  default: () => TripitakaRoute3
});
var import_react35 = require("@chakra-ui/react"), import_react36 = require("@remix-run/react");
var import_jsx_dev_runtime16 = require("react/jsx-dev-runtime");
function TripitakaRoute3() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(import_react35.Flex, {
    p: 10,
    background: "secondary.800",
    w: "100%",
    flexDir: "column",
    children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(BreadCrumb, {}, void 0, !1, {
        fileName: "app/routes/__app/tripitaka.tsx",
        lineNumber: 10,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(import_react35.Divider, {
        mt: 4,
        mb: 4,
        borderColor: "primary.300"
      }, void 0, !1, {
        fileName: "app/routes/__app/tripitaka.tsx",
        lineNumber: 11,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(import_react36.Outlet, {}, void 0, !1, {
        fileName: "app/routes/__app/tripitaka.tsx",
        lineNumber: 12,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/routes/__app/tripitaka.tsx",
    lineNumber: 9,
    columnNumber: 5
  }, this);
}

// app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx
var staging_exports = {};
__export(staging_exports, {
  default: () => StagingRoute,
  loader: () => loader7
});
var import_react40 = require("@remix-run/react"), import_react41 = require("@chakra-ui/react"), import_icons6 = require("@chakra-ui/icons"), import_react42 = require("react"), import_node7 = require("@remix-run/node"), import_bi = require("react-icons/bi");

// app/components/common/errors/error.tsx
var import_react37 = require("@chakra-ui/react"), import_icons3 = require("@chakra-ui/icons"), import_jsx_dev_runtime17 = require("react/jsx-dev-runtime");

// app/components/common/errors/info.tsx
var import_react38 = require("@chakra-ui/react"), import_icons4 = require("@chakra-ui/icons"), import_jsx_dev_runtime18 = require("react/jsx-dev-runtime");

// app/components/common/errors/warn.tsx
var import_react39 = require("@chakra-ui/react"), import_icons5 = require("@chakra-ui/icons"), import_jsx_dev_runtime19 = require("react/jsx-dev-runtime"), Warning = (props) => {
  let { heading, content } = props;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(import_react39.Box, {
    textAlign: "center",
    py: 10,
    px: 6,
    children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(import_icons5.WarningTwoIcon, {
        boxSize: "50px",
        color: "orange.300"
      }, void 0, !1, {
        fileName: "app/components/common/errors/warn.tsx",
        lineNumber: 8,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(import_react39.Heading, {
        as: "h2",
        size: "xl",
        mt: 6,
        mb: 2,
        children: heading ?? "General Warning"
      }, void 0, !1, {
        fileName: "app/components/common/errors/warn.tsx",
        lineNumber: 9,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(import_react39.Text, {
        color: "gray.500",
        children: content
      }, void 0, !1, {
        fileName: "app/components/common/errors/warn.tsx",
        lineNumber: 12,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/components/common/errors/warn.tsx",
    lineNumber: 7,
    columnNumber: 5
  }, this);
};

// app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx
var import_jsx_dev_runtime20 = require("react/jsx-dev-runtime"), loader7 = async () => (0, import_node7.json)({});
function StagingRoute() {
  var _a;
  let paragraphs = (_a = (0, import_react40.useLocation)().state) == null ? void 0 : _a.paragraphs, paragraphsComp = paragraphs == null ? void 0 : paragraphs.map((paragraph, index, arr) => /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Box, {
    children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(TranlationWorkspace, {
        origin: paragraph.origin,
        translation: "Mauris nisi lectus, bibendum id cursus auctor, aliquet sit amet ante. Pellentesque id libero urna. Cras egestas dolor sed fringilla imperdiet. Donec pellentesque lacus non libero euismod interdum. Sed placerat cursus nisl. Duis nec erat feugiat, accumsan quam et, ullamcorper purus. Integer ac molestie ex, eu egestas sapien. Duis maximus viverra urna a consectetur. Praesent rutrum tortor a euismod venenatis.",
        reference: "Quisque gravida quis sapien sit amet auctor. In hac habitasse platea dictumst. Pellentesque in viverra risus, et pharetra sapien. Sed facilisis orci rhoncus erat ultricies, nec tempor sapien accumsan. Vivamus vel lectus ut mi ornare consectetur eget non nisl. Mauris rutrum dui augue, a sollicitudin risus elementum facilisis. Sed blandit lectus quam, dictum congue turpis venenatis vel. Integer rhoncus luctus consectetur."
      }, void 0, !1, {
        fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
        lineNumber: 54,
        columnNumber: 7
      }, this),
      index !== arr.length - 1 ? /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Divider, {
        mt: 4,
        mb: 4
      }, void 0, !1, {
        fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
        lineNumber: 59,
        columnNumber: 35
      }, this) : null
    ]
  }, index, !0, {
    fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
    lineNumber: 53,
    columnNumber: 5
  }, this));
  return paragraphs != null && paragraphs.length ? /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Box, {
    p: 8,
    children: paragraphsComp
  }, void 0, !1, {
    fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
    lineNumber: 63,
    columnNumber: 12
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(Warning, {
    content: "Please select at least one paragraph from the roll"
  }, void 0, !1, {
    fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
    lineNumber: 65,
    columnNumber: 12
  }, this);
}
function TranlationWorkspace({ origin, translation, reference }) {
  let [content, setContent] = (0, import_react42.useState)(""), [glossary, setGlossary] = (0, import_react41.useBoolean)(!1), [note, setNote] = (0, import_react42.useState)(""), { isOpen: isOpenNote, onOpen: onOpenNote, onClose: onCloseNote } = (0, import_react41.useDisclosure)(), { isOpen: isOpenSearch, onOpen: onOpenSearch, onClose: onCloseSearch } = (0, import_react41.useDisclosure)(), {
    isOpen: isOpenFootnote,
    onOpen: onOpenFootnote,
    onClose: onCloseFootnote
  } = (0, import_react41.useDisclosure)(), initialRef = (0, import_react42.useRef)(null), textareaRef = (0, import_react42.useRef)(null), getCurrentCursorText = () => {
    var _a;
    let cursorPos = (_a = textareaRef.current) == null ? void 0 : _a.selectionStart;
    if (cursorPos) {
      let textBeforeCursor = content.slice(0, cursorPos - 1), textAfterCursor = content.slice(cursorPos + 1), indexBeforeCursor = textBeforeCursor.lastIndexOf(" "), indexAfterCursor = textAfterCursor.indexOf(" ");
      return content.slice(
        indexBeforeCursor >= 0 ? indexBeforeCursor : 0,
        indexAfterCursor >= 0 ? indexAfterCursor + cursorPos : -1
      );
    }
    return "You forget to put your cursor in text";
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Flex, {
    gap: 4,
    flexDir: "row",
    justifyContent: "space-between",
    children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.VStack, {
        flex: 1,
        spacing: 4,
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Card, {
            background: "secondary.500",
            borderRadius: 12,
            children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.CardHeader, {
                children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Heading, {
                  size: "sm",
                  children: "Origin"
                }, void 0, !1, {
                  fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                  lineNumber: 108,
                  columnNumber: 13
                }, this)
              }, void 0, !1, {
                fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                lineNumber: 107,
                columnNumber: 11
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.CardBody, {
                children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Text, {
                  fontSize: "xl",
                  children: origin
                }, void 0, !1, {
                  fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                  lineNumber: 111,
                  columnNumber: 13
                }, this)
              }, void 0, !1, {
                fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                lineNumber: 110,
                columnNumber: 11
              }, this)
            ]
          }, void 0, !0, {
            fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
            lineNumber: 106,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Card, {
            background: "secondary.500",
            borderRadius: 12,
            children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.CardHeader, {
                as: import_react41.Flex,
                justifyContent: "space-between",
                alignItems: "center",
                children: [
                  /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Heading, {
                    size: "sm",
                    children: "DeepL"
                  }, void 0, !1, {
                    fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                    lineNumber: 116,
                    columnNumber: 13
                  }, this),
                  /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ButtonGroup, {
                    variant: "outline",
                    spacing: "6",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.IconButton, {
                        icon: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_icons6.RepeatIcon, {}, void 0, !1, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 118,
                          columnNumber: 33
                        }, this),
                        "aria-label": "refresh"
                      }, void 0, !1, {
                        fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                        lineNumber: 118,
                        columnNumber: 15
                      }, this),
                      /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.IconButton, {
                        icon: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_icons6.CopyIcon, {}, void 0, !1, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 120,
                          columnNumber: 23
                        }, this),
                        "aria-label": "copy",
                        onClick: () => setContent(translation)
                      }, void 0, !1, {
                        fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                        lineNumber: 119,
                        columnNumber: 15
                      }, this)
                    ]
                  }, void 0, !0, {
                    fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                    lineNumber: 117,
                    columnNumber: 13
                  }, this)
                ]
              }, void 0, !0, {
                fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                lineNumber: 115,
                columnNumber: 11
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.CardBody, {
                children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Text, {
                  fontSize: "xl",
                  children: translation
                }, void 0, !1, {
                  fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                  lineNumber: 127,
                  columnNumber: 13
                }, this)
              }, void 0, !1, {
                fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                lineNumber: 126,
                columnNumber: 11
              }, this)
            ]
          }, void 0, !0, {
            fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
            lineNumber: 114,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Card, {
            background: "secondary.500",
            borderRadius: 12,
            children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.CardHeader, {
                as: import_react41.Flex,
                justifyContent: "space-between",
                alignItems: "center",
                children: [
                  /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Heading, {
                    size: "sm",
                    children: "Reference"
                  }, void 0, !1, {
                    fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                    lineNumber: 132,
                    columnNumber: 13
                  }, this),
                  /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ButtonGroup, {
                    variant: "outline",
                    spacing: "6",
                    children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.IconButton, {
                      icon: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_icons6.CopyIcon, {}, void 0, !1, {
                        fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                        lineNumber: 135,
                        columnNumber: 23
                      }, this),
                      "aria-label": "copy",
                      onClick: () => setContent(reference)
                    }, void 0, !1, {
                      fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                      lineNumber: 134,
                      columnNumber: 15
                    }, this)
                  }, void 0, !1, {
                    fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                    lineNumber: 133,
                    columnNumber: 13
                  }, this)
                ]
              }, void 0, !0, {
                fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                lineNumber: 131,
                columnNumber: 11
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.CardBody, {
                children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Text, {
                  fontSize: "xl",
                  children: reference
                }, void 0, !1, {
                  fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                  lineNumber: 142,
                  columnNumber: 13
                }, this)
              }, void 0, !1, {
                fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                lineNumber: 141,
                columnNumber: 11
              }, this)
            ]
          }, void 0, !0, {
            fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
            lineNumber: 130,
            columnNumber: 9
          }, this)
        ]
      }, void 0, !0, {
        fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
        lineNumber: 105,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Flex, {
        flex: 1,
        justifyContent: "stretch",
        alignSelf: "stretch",
        children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Card, {
          background: "secondary.500",
          w: "100%",
          borderRadius: 12,
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.CardHeader, {
              as: import_react41.Flex,
              justifyContent: "space-between",
              alignItems: "center",
              children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Heading, {
                size: "sm",
                children: "Workspace"
              }, void 0, !1, {
                fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                lineNumber: 149,
                columnNumber: 13
              }, this)
            }, void 0, !1, {
              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
              lineNumber: 148,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.CardBody, {
              children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ButtonGroup, {
                  colorScheme: "iconButton",
                  variant: "outline",
                  p: 4,
                  mb: 2,
                  children: [
                    /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Tooltip, {
                      label: "open glossary",
                      openDelay: 1e3,
                      children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.IconButton, {
                        disabled: !Boolean(content),
                        onClick: setGlossary.on,
                        icon: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_bi.BiTable, {}, void 0, !1, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 157,
                          columnNumber: 25
                        }, this),
                        "aria-label": "glossary button"
                      }, void 0, !1, {
                        fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                        lineNumber: 154,
                        columnNumber: 17
                      }, this)
                    }, void 0, !1, {
                      fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                      lineNumber: 153,
                      columnNumber: 15
                    }, this),
                    /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Tooltip, {
                      label: "add footnote",
                      openDelay: 1e3,
                      closeDelay: 1e3,
                      children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.IconButton, {
                        disabled: !Boolean(content),
                        onClick: onOpenFootnote,
                        icon: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_bi.BiNote, {}, void 0, !1, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 165,
                          columnNumber: 25
                        }, this),
                        "aria-label": "footnote button"
                      }, void 0, !1, {
                        fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                        lineNumber: 162,
                        columnNumber: 17
                      }, this)
                    }, void 0, !1, {
                      fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                      lineNumber: 161,
                      columnNumber: 15
                    }, this),
                    /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Tooltip, {
                      label: "open searchbar",
                      openDelay: 1e3,
                      children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.IconButton, {
                        onClick: onOpenSearch,
                        icon: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_bi.BiSearch, {}, void 0, !1, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 170,
                          columnNumber: 58
                        }, this),
                        "aria-label": "search button"
                      }, void 0, !1, {
                        fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                        lineNumber: 170,
                        columnNumber: 17
                      }, this)
                    }, void 0, !1, {
                      fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                      lineNumber: 169,
                      columnNumber: 15
                    }, this)
                  ]
                }, void 0, !0, {
                  fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                  lineNumber: 152,
                  columnNumber: 13
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Modal, {
                  isOpen: isOpenFootnote,
                  onClose: onCloseFootnote,
                  size: "2xl",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ModalOverlay, {}, void 0, !1, {
                      fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                      lineNumber: 174,
                      columnNumber: 15
                    }, this),
                    /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ModalContent, {
                      children: [
                        /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ModalHeader, {
                          children: "Add footnote"
                        }, void 0, !1, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 176,
                          columnNumber: 17
                        }, this),
                        /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ModalCloseButton, {}, void 0, !1, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 177,
                          columnNumber: 17
                        }, this),
                        /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ModalBody, {
                          pb: 6,
                          children: [
                            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Text, {
                              children: [
                                "Your cursor is between",
                                /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Tag, {
                                  children: getCurrentCursorText()
                                }, void 0, !1, {
                                  fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                                  lineNumber: 181,
                                  columnNumber: 21
                                }, this)
                              ]
                            }, void 0, !0, {
                              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                              lineNumber: 179,
                              columnNumber: 19
                            }, this),
                            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Text, {
                              mb: 8,
                              children: "Make sure put your cursor at the correct location where you want to put footnote"
                            }, void 0, !1, {
                              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                              lineNumber: 183,
                              columnNumber: 19
                            }, this),
                            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Textarea, {
                              _focus: { outline: "none" },
                              placeholder: "glossary note",
                              onChange: (e) => {
                              }
                            }, void 0, !1, {
                              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                              lineNumber: 186,
                              columnNumber: 19
                            }, this)
                          ]
                        }, void 0, !0, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 178,
                          columnNumber: 17
                        }, this),
                        /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ModalFooter, {
                          children: [
                            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Button, {
                              colorScheme: "iconButton",
                              mr: 3,
                              children: "Save"
                            }, void 0, !1, {
                              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                              lineNumber: 194,
                              columnNumber: 19
                            }, this),
                            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Button, {
                              onClick: onCloseFootnote,
                              children: "Cancel"
                            }, void 0, !1, {
                              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                              lineNumber: 197,
                              columnNumber: 19
                            }, this)
                          ]
                        }, void 0, !0, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 193,
                          columnNumber: 17
                        }, this)
                      ]
                    }, void 0, !0, {
                      fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                      lineNumber: 175,
                      columnNumber: 15
                    }, this)
                  ]
                }, void 0, !0, {
                  fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                  lineNumber: 173,
                  columnNumber: 13
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Modal, {
                  isOpen: isOpenSearch,
                  onClose: onCloseSearch,
                  size: "2xl",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ModalOverlay, {}, void 0, !1, {
                      fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                      lineNumber: 202,
                      columnNumber: 15
                    }, this),
                    /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ModalContent, {
                      children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.HStack, {
                        children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.InputGroup, {
                          children: [
                            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.InputLeftElement, {
                              pointerEvents: "none",
                              children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_icons6.SearchIcon, {
                                color: "gray.300"
                              }, void 0, !1, {
                                fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                                lineNumber: 208,
                                columnNumber: 33
                              }, this)
                            }, void 0, !1, {
                              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                              lineNumber: 206,
                              columnNumber: 21
                            }, this),
                            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Input, {
                              _focus: { outline: "none" },
                              variant: "filled",
                              boxShadow: "none",
                              size: "lg",
                              type: "text",
                              placeholder: "Search"
                            }, void 0, !1, {
                              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                              lineNumber: 210,
                              columnNumber: 21
                            }, this)
                          ]
                        }, void 0, !0, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 205,
                          columnNumber: 19
                        }, this)
                      }, void 0, !1, {
                        fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                        lineNumber: 204,
                        columnNumber: 17
                      }, this)
                    }, void 0, !1, {
                      fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                      lineNumber: 203,
                      columnNumber: 15
                    }, this)
                  ]
                }, void 0, !0, {
                  fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                  lineNumber: 201,
                  columnNumber: 13
                }, this),
                glossary ? /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.HStack, {
                  mb: 4,
                  children: [
                    /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.InputGroup, {
                      _focus: { outline: "none" },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Input, {
                          type: "text",
                          placeholder: "origin",
                          mr: 4
                        }, void 0, !1, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 225,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Input, {
                          type: "text",
                          placeholder: "target"
                        }, void 0, !1, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 226,
                          columnNumber: 19
                        }, this)
                      ]
                    }, void 0, !0, {
                      fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                      lineNumber: 224,
                      columnNumber: 17
                    }, this),
                    /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ButtonGroup, {
                      colorScheme: "iconButton",
                      variant: "outline",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.IconButton, {
                          onClick: onOpenNote,
                          icon: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_bi.BiNote, {}, void 0, !1, {
                            fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                            lineNumber: 229,
                            columnNumber: 58
                          }, this),
                          "aria-label": "glossary note"
                        }, void 0, !1, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 229,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.IconButton, {
                          onClick: setGlossary.off,
                          icon: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_bi.BiCheck, {}, void 0, !1, {
                            fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                            lineNumber: 232,
                            columnNumber: 27
                          }, this),
                          "aria-label": "submit glossary"
                        }, void 0, !1, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 230,
                          columnNumber: 19
                        }, this)
                      ]
                    }, void 0, !0, {
                      fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                      lineNumber: 228,
                      columnNumber: 17
                    }, this),
                    /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Modal, {
                      initialFocusRef: initialRef,
                      isOpen: isOpenNote,
                      onClose: onCloseNote,
                      children: [
                        /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ModalOverlay, {}, void 0, !1, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 237,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ModalContent, {
                          children: [
                            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ModalHeader, {
                              children: "Add note to glossary"
                            }, void 0, !1, {
                              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                              lineNumber: 239,
                              columnNumber: 21
                            }, this),
                            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ModalCloseButton, {}, void 0, !1, {
                              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                              lineNumber: 240,
                              columnNumber: 21
                            }, this),
                            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ModalBody, {
                              pb: 6,
                              children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Textarea, {
                                _focus: { outline: "none" },
                                placeholder: "glossary note",
                                onChange: (e) => {
                                }
                              }, void 0, !1, {
                                fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                                lineNumber: 242,
                                columnNumber: 23
                              }, this)
                            }, void 0, !1, {
                              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                              lineNumber: 241,
                              columnNumber: 21
                            }, this),
                            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.ModalFooter, {
                              children: [
                                /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Button, {
                                  colorScheme: "iconButton",
                                  mr: 3,
                                  children: "Save"
                                }, void 0, !1, {
                                  fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                                  lineNumber: 250,
                                  columnNumber: 23
                                }, this),
                                /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Button, {
                                  onClick: onCloseNote,
                                  children: "Cancel"
                                }, void 0, !1, {
                                  fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                                  lineNumber: 253,
                                  columnNumber: 23
                                }, this)
                              ]
                            }, void 0, !0, {
                              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                              lineNumber: 249,
                              columnNumber: 21
                            }, this)
                          ]
                        }, void 0, !0, {
                          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                          lineNumber: 238,
                          columnNumber: 19
                        }, this)
                      ]
                    }, void 0, !0, {
                      fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                      lineNumber: 236,
                      columnNumber: 17
                    }, this)
                  ]
                }, void 0, !0, {
                  fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                  lineNumber: 223,
                  columnNumber: 15
                }, this) : null,
                /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Textarea, {
                  ref: textareaRef,
                  height: glossary ? "82%" : "90%",
                  placeholder: "Here is a sample placeholder",
                  value: content,
                  onChange: (e) => setContent(e.target.value)
                }, void 0, !1, {
                  fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                  lineNumber: 259,
                  columnNumber: 13
                }, this)
              ]
            }, void 0, !0, {
              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
              lineNumber: 151,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Divider, {}, void 0, !1, {
              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
              lineNumber: 267,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.CardFooter, {
              children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(import_react41.Button, {
                colorScheme: "iconButton",
                children: "Submit"
              }, void 0, !1, {
                fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
                lineNumber: 269,
                columnNumber: 13
              }, this)
            }, void 0, !1, {
              fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
              lineNumber: 268,
              columnNumber: 11
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
          lineNumber: 147,
          columnNumber: 9
        }, this)
      }, void 0, !1, {
        fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
        lineNumber: 146,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/staging.tsx",
    lineNumber: 104,
    columnNumber: 5
  }, this);
}

// app/routes/__app/tripitaka/$sutraId/$rollId/index.tsx
var rollId_exports2 = {};
__export(rollId_exports2, {
  default: () => RollRoute2,
  loader: () => loader8
});
var import_node8 = require("@remix-run/node"), import_react43 = require("@remix-run/react"), import_react44 = require("@chakra-ui/react"), import_react45 = require("react");
var import_fi2 = require("react-icons/fi"), import_jsx_dev_runtime21 = require("react/jsx-dev-runtime"), loader8 = async ({ params }) => (0, import_node8.json)({
  footnotes: [],
  paragraphs: [
    {
      num: "0001",
      finish: !0,
      origin: "\u84CB\u805E\uFF1A\u300C\u9020\u5316\u6B0A\u8F3F\u4E4B\u9996\uFF0C\u5929\u9053\u672A\u5206\uFF1B\u9F9C\u9F8D\u7E6B\u8C61\u4E4B\u521D\uFF0C\u4EBA\u6587\u59CB\u8457\u3002\u96D6\u842C\u516B\u5343\u6B72\uFF0C\u540C\u81E8\u6709\u622A\u4E4B\u5340\uFF1B\u4E03\u5341\u4E8C\u541B\uFF0C\u8A4E\u8B58\u7121\u908A\u4E4B\u7FA9\u3002\u300D\u7531\u662F\u4EBA\u8FF7\u56DB\u5FCD\uFF0C\u8F2A\u8FF4\u65BC\u516D\u8DA3\u4E4B\u4E2D\uFF1B\u5BB6\u7E8F\u4E94\u84CB\uFF0C\u6C92\u6EBA\u65BC\u4E09\u5857\u4E4B\u4E0B\u3002\u53CA\u592B\u9DF2\u5DD6\u897F\u5CD9\uFF0C\u8C61\u99D5\u6771\u9A45\uFF0C\u6167\u65E5\u6CD5\u738B\u8D85\u56DB\u5927\u800C\u9AD8\u8996\uFF0C\u4E2D\u5929\u8ABF\u5FA1\u8D8A\u5341\u5730\u4EE5\u5C45\u5C0A\uFF0C\u5305\u62EC\u9435\u570D\uFF0C\u5EF6\u4FC3\u6C99\u52AB\u3002\u5176\u70BA\u9AD4\u4E5F\uFF0C\u5247\u4E0D\u751F\u4E0D\u6EC5\uFF1B\u5176\u70BA\u76F8\u4E5F\uFF0C\u5247\u7121\u53BB\u7121\u4F86\u3002\u5FF5\u8655\u3001\u6B63\u52E4\uFF0C\u4E09\u5341\u4E03\u54C1\u70BA\u5176\u884C\uFF1B\u6148\u3001\u60B2\u3001\u559C\u3001\u6368\uFF0C\u56DB\u7121\u91CF\u6CD5\u904B\u5176\u5FC3\u3002\u65B9\u4FBF\u4E4B\u529B\u96E3\u601D\uFF0C\u5713\u5C0D\u4E4B\u6A5F\u591A\u7DD2\uFF0C\u6DF7\u5927\u7A7A\u800C\u70BA\u91CF\uFF0C\u8C48\u7B97\u6578\u4E4B\u80FD\u7AAE\uFF1F\u5165\u7E96\u82A5\u4E4B\u5FAE\u5340\uFF0C\u532A\u540D\u8A00\u4E4B\u53EF\u8FF0\uFF0C\u7121\u5F97\u800C\u7A31\u8005\uFF0C\u5176\u552F\u5927\u89BA\u6B5F\uFF01",
      target: "Aliquam commodo fringilla neque, sit amet condimentum risus commodo in. Quisque porta mi arcu, eget condimentum nunc mollis ac. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed ut cursus nulla. Curabitur ut nunc in est sollicitudin feugiat non at odio. Nullam in accumsan purus, non congue risus. Suspendisse hendrerit non eros ac mattis. Maecenas ornare pellentesque augue non venenatis. Sed tincidunt blandit nibh vel rhoncus. Etiam vitae sagittis risus. Praesent in nisl urna. Suspendisse pharetra eros ut diam malesuada gravida. Aliquam ornare scelerisque enim, sit amet ultricies urna consectetur non. Maecenas in odio malesuada, sagittis erat a, suscipit eros. Proin sodales rhoncus metus, sed placerat ipsum consequat a. Nam quis accumsan arcu. Quisque egestas fringilla lectus, interdum vehicula quam porta ac. Integer magna ligula, porta quis elementum eget, ornare ac purus. Duis lobortis euismod neque sed pellentesque."
    },
    {
      num: "0002",
      finish: !1,
      origin: "\u6715\u66E9\u52AB\u690D\u56E0\uFF0C\u53E8\u627F\u4F5B\u8A18\u3002\u91D1[4]\u4ED9\u964D\u65E8\uFF0C\u5927\u96F2\u4E4B\u5048\u5148\u5F70\uFF1B\u7389\u6246\u62AB\u7965\uFF0C\u5BF6\u96E8\u4E4B\u6587\u5F8C\u53CA\u3002\u52A0\u4EE5\u7A4D\u5584\u9918\u6176\uFF0C\u4FEF\u96C6\u5FAE\u8EAC\uFF0C\u9042\u5F97\u5730\u5E73\u5929\u6210\uFF0C\u6CB3\u6E05\u6D77\u664F\u3002\u6B8A\u798E\u7D55\u745E\uFF0C\u65E2\u65E5\u81F3\u800C\u6708\u66F8\uFF1B\u8C9D[5]\u7252\u9748\u6587\uFF0C\u4EA6\u6642\u81FB\u800C\u6B72\u6D3D\u3002\u903E\u6D77\u8D8A\u6F20\uFF0C\u737B\u8CDD\u4E4B\u79AE\u5099\u7109\uFF1B\u67B6\u96AA\u822A\u6DF1\uFF0C\u91CD\u8B6F\u4E4B[6]\u8FAD\u7F44\u77E3\u3002",
      target: ""
    },
    {
      num: "0003",
      finish: !1,
      origin: "\u300A\u5927\u65B9\u5EE3\u4F5B\u83EF\u56B4\u7D93\u300B\u8005\uFF0C\u65AF\u4E43\u8AF8\u4F5B\u4E4B\u5BC6\u85CF\uFF0C\u5982\u4F86\u4E4B\u6027\u6D77\u3002\u8996\u4E4B\u8005\uFF0C\u83AB\u8B58\u5176\u6307\u6B78\uFF1B\u6339\u4E4B\u8005\uFF0C\u7F55\u6E2C\u5176\u6DAF\u969B\u3002\u6709\u5B78\u3001\u7121\u5B78\uFF0C\u5FD7\u7D55\u7ABA\u89A6\uFF1B\u4E8C\u4E58\u3001\u4E09\u4E58\uFF0C\u5BE7\u5E0C\u807D\u53D7\u3002\u6700\u52DD\u7A2E\u667A\uFF0C\u838A\u56B4\u4E4B\u8FF9\u65E2\u9686\uFF1B\u666E\u8CE2\u3001\u6587\u6B8A\uFF0C\u9858\u884C\u4E4B\u56E0\u65AF\u6EFF\u3002\u4E00\u53E5\u4E4B\u5167\uFF0C\u5305\u6CD5\u754C\u4E4B\u7121\u908A\uFF1B\u4E00\u6BEB\u4E4B\u4E2D\uFF0C\u7F6E\u524E\u571F\u800C\u975E\u9698\u3002\u6469\u7AED\u9640\u570B\uFF0C\u8087\u8208\u5999\u6703\u4E4B\u7DE3\uFF1B\u666E\u5149\u6CD5\u5802\uFF0C\u7230\u6577\u5BC2\u6EC5\u4E4B\u7406\u3002\u7DEC\u60DF\u5967\u7FA9\uFF0C\u8B6F\u5728\u6649\u671D\uFF1B\u6642\u903E\u516D\u4EE3\uFF0C\u5E74\u5C07\u56DB\u767E\u3002[7]\u7136\u5713\u4E00\u90E8\u4E4B\u5178\uFF0C\u7E94\u7372\u4E09\u842C\u9918\u8A00\uFF0C\u552F\u555F\u534A\u73E0\uFF0C\u672A\u7ABA\u5168\u5BF6\u3002\u6715\u805E\u5176\u68B5\u672C\uFF0C\u5148\u5728\u4E8E\u95D0\u570B\u4E2D\uFF0C\u9063\u4F7F\u5949\u8FCE\uFF0C\u8FD1\u65B9\u81F3\u6B64\u3002\u65E2\u89A9\u767E\u5343\u4E4B\u5999\u980C\uFF0C\u4E43\u62AB\u5341\u842C\u4E4B\u6B63\u6587\u3002\u7CB5\u4EE5\u8B49\u8056\u5143\u5E74\uFF0C\u6B72\u6B21\u4E59\u672A\uFF0C\u6708\u65C5\u6CBD\u6D17\uFF0C\u6714\u60DF\u620A\u7533\uFF0C\u4EE5\u5176\u5341\u56DB\u65E5\u8F9B\u9149\uFF0C\u65BC\u5927\u904D\u7A7A\u5BFA\uFF0C\u89AA\u53D7\u7B46\u524A\uFF0C\u656C\u8B6F\u65AF\u7D93\u3002\u9042\u5F97\u7518\u9732\u6D41\u6D25\uFF0C\u9810\u5922\u5E9A\u7533\u4E4B\u5915\uFF1B\u818F\u96E8\u7051\u6F64\uFF0C\u5F8C\u8983\u58EC\u620C\u4E4B\u8FB0\u3002\u5F0F\u958B\u5BE6\u76F8\u4E4B\u9580\uFF0C\u9084\u7B26\u4E00\u5473\u4E4B\u6FA4\u3002\u4EE5\u8056\u66C6\u4E8C\u5E74\uFF0C\u6B72\u6B21[A1]\u5DF1\u4EA5\uFF0C\u5341\u6708\u58EC\u5348\u6714\uFF0C\u516B\u65E5[A2]\u5DF1\u4E11\uFF0C\u7E55\u5BEB\u7562\u529F\uFF1B\u6DFB\u6027\u6D77\u4E4B\u6CE2\u703E\uFF0C\u5ED3\u6CD5\u754C\u4E4B\u7586\u57DF\u3002\u5927\u4E58\u9813\u6559\uFF0C\u666E\u88AB\u65BC\u7121\u7AAE\uFF1B\u65B9\u5EE3\u771F[8]\u7B4C\uFF0C\u9050\u8A72\u65BC\u6709\u8B58\u3002\u8C48\u8B02\u5F8C\u4E94\u767E\u6B72\uFF0C\u5FFD\u5949\u91D1\u53E3\u4E4B\u8A00\uFF1B\u5A11\u5A46\u5883\u4E2D\uFF0C\u4FC4\u555F\u73E0\u51FD\u4E4B\u7955\u3002\u6240\u5180\uFF1A\u95E1\u63DA\u6C99\u754C\uFF0C\u5BA3\u66A2\u5875\u5340\uFF1B\u4E26\u5169\u66DC\u800C\u9577\u61F8\uFF0C\u5F4C\u5341\u65B9\u800C\u6C38\u5E03\u3002\u4E00\u7ABA\u5BF6\u5048\uFF0C\u6176\u6EA2\u5FC3\u9748\uFF1B\u4E09\u5FA9\u5E7D\u5B97\uFF0C\u559C\u76C8\u8EAB\u610F\u3002\u96D6\u5247\u7121\u8AAA\u7121\u793A\uFF0C\u7406\u7B26\u4E0D\u4E8C\u4E4B\u9580\uFF1B[9]\u7136\u800C\u56E0\u8A00\u986F\u8A00\uFF0C\u65B9\u95E1\u5927\u5343\u4E4B\u7FA9\u3002\u8F12\u7533\u9119\u4F5C\uFF0C\u7230\u984C\u5E8F\u4E91\u3002",
      target: ""
    }
  ]
});
function RollRoute2() {
  let { paragraphs, footnotes } = (0, import_react43.useLoaderData)(), navigate = (0, import_react43.useNavigate)(), checkedParagraphs = (0, import_react45.useRef)(/* @__PURE__ */ new Set()), paragraphsComp = paragraphs.map((paragraph, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)(Paragraph, {
    origin: paragraph.origin,
    target: paragraph.target,
    index,
    checkedParagraphs,
    disabled: paragraph.finish,
    finish: !1,
    footnotes
  }, paragraph.num, !1, {
    fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/index.tsx",
    lineNumber: 43,
    columnNumber: 5
  }, this));
  return paragraphs.length ? /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)(import_react44.Flex, {
    w: "100%",
    flexDir: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 4,
    mt: 10,
    children: [
      paragraphsComp,
      /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)(import_react44.IconButton, {
        borderRadius: "50%",
        w: 12,
        h: 12,
        pos: "fixed",
        bottom: 8,
        right: 8,
        icon: /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)(import_fi2.FiEdit, {}, void 0, !1, {
          fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/index.tsx",
          lineNumber: 72,
          columnNumber: 17
        }, this),
        "aria-label": "edit roll",
        colorScheme: "iconButton",
        onClick: () => {
          navigate("staging", {
            state: {
              paragraphs: Array.from(checkedParagraphs.current).sort().map((index) => paragraphs[index])
            }
          });
        },
        children: "Edit"
      }, void 0, !1, {
        fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/index.tsx",
        lineNumber: 65,
        columnNumber: 9
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/index.tsx",
    lineNumber: 56,
    columnNumber: 7
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)("div", {
    children: "Roll"
  }, void 0, !1, {
    fileName: "app/routes/__app/tripitaka/$sutraId/$rollId/index.tsx",
    lineNumber: 90,
    columnNumber: 10
  }, this);
}

// app/routes/__app/tripitaka/$sutraId/index.tsx
var sutraId_exports2 = {};
__export(sutraId_exports2, {
  CatchBoundary: () => CatchBoundary,
  default: () => SutraSlug2,
  loader: () => loader9
});
var import_node9 = require("@remix-run/node"), import_react46 = require("@remix-run/react"), import_react47 = require("@chakra-ui/react");
var import_jsx_dev_runtime22 = require("react/jsx-dev-runtime"), loader9 = async ({ params }) => {
  let { sutraId } = params;
  switch (sutraId) {
    case "ZH-SUTRA-V1-0001":
      return (0, import_node9.json)({
        rolls: [
          {
            title: "\u4E16\u4E3B\u5999\u56B4\u54C1\u7B2C\u4E00\u4E4B\u4E00",
            slug: "ZH-ROLL-V1-0001",
            roll_num: "\u7B2C\u4E00\u5377",
            finish: !0
          },
          {
            title: "\u4E16\u4E3B\u5999\u56B4\u54C1\u7B2C\u4E00\u4E4B\u4E8C",
            slug: "ZH-ROLL-V1-0002",
            roll_num: "\u7B2C\u4E8C\u5377",
            finish: !0
          }
        ]
      });
    case "ZH-SUTRA-V1-0002":
      return (0, import_node9.json)({
        rolls: [
          {
            title: "\u4E16\u4E3B\u5999\u56B4\u54C1\u7B2C\u4E00\u4E4B\u4E00",
            slug: "ZH-ROLL-V1-0001",
            roll_num: "\u7B2C\u4E00\u5377",
            finish: !0
          },
          {
            title: "\u4E16\u4E3B\u5999\u56B4\u54C1\u7B2C\u4E00\u4E4B\u4E8C",
            slug: "ZH-ROLL-V1-0002",
            roll_num: "\u7B2C\u4E8C\u5377",
            finish: !0
          }
        ]
      });
    case "ZH-SUTRA-V1-0003":
      return (0, import_node9.json)({
        rolls: [
          {
            title: "\u4E16\u4E3B\u5999\u56B4\u54C1\u7B2C\u4E00\u4E4B\u4E00",
            slug: "ZH-ROLL-V1-0001",
            roll_num: "\u7B2C\u4E00\u5377",
            finish: !0
          },
          {
            title: "\u4E16\u4E3B\u5999\u56B4\u54C1\u7B2C\u4E00\u4E4B\u4E8C",
            slug: "ZH-ROLL-V1-0002",
            roll_num: "\u7B2C\u4E8C\u5377",
            finish: !0
          }
        ]
      });
    default:
      throw new import_node9.Response(
        "We could not find this sutra, please check if you have provided correct sutra id",
        { status: 400 }
      );
  }
};
function SutraSlug2() {
  let { rolls } = (0, import_react46.useLoaderData)(), rollsComp = rolls.map((roll) => /* @__PURE__ */ (0, import_jsx_dev_runtime22.jsxDEV)(Roll, {
    ...roll
  }, roll.slug, !1, {
    fileName: "app/routes/__app/tripitaka/$sutraId/index.tsx",
    lineNumber: 71,
    columnNumber: 41
  }, this));
  return rolls.length ? /* @__PURE__ */ (0, import_jsx_dev_runtime22.jsxDEV)(import_react47.Box, {
    p: 10,
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime22.jsxDEV)(import_react47.Flex, {
      gap: 8,
      children: rollsComp
    }, void 0, !1, {
      fileName: "app/routes/__app/tripitaka/$sutraId/index.tsx",
      lineNumber: 75,
      columnNumber: 9
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/__app/tripitaka/$sutraId/index.tsx",
    lineNumber: 74,
    columnNumber: 7
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime22.jsxDEV)(import_react47.Box, {
    children: "No roll for this sutra"
  }, void 0, !1, {
    fileName: "app/routes/__app/tripitaka/$sutraId/index.tsx",
    lineNumber: 79,
    columnNumber: 12
  }, this);
}
function CatchBoundary() {
  let caught = (0, import_react46.useCatch)();
  if (caught.status === 400)
    return /* @__PURE__ */ (0, import_jsx_dev_runtime22.jsxDEV)(Warning, {
      content: caught.data
    }, void 0, !1, {
      fileName: "app/routes/__app/tripitaka/$sutraId/index.tsx",
      lineNumber: 87,
      columnNumber: 12
    }, this);
}

// app/routes/__app/tripitaka/index.tsx
var tripitaka_exports2 = {};
__export(tripitaka_exports2, {
  default: () => TripitakaRoute4,
  loader: () => loader10
});
var import_react48 = require("@chakra-ui/react"), import_node10 = require("@remix-run/node"), import_react49 = require("@remix-run/react");
var import_jsx_dev_runtime23 = require("react/jsx-dev-runtime"), loader10 = async () => (0, import_node10.json)({
  sutras: [
    {
      slug: "ZH-SUTRA-V1-0001",
      title: "\u5927\u65B9\u5EE3\u4F5B\u83EF\u56B4\u7D93",
      category: "\u83EF\u56B4\u90E8\u985E",
      roll_count: 80,
      num_chars: 593144,
      translator: "\u5510 \u5BE6\u53C9\u96E3\u9640\u8B6F",
      dynasty: "\u5510",
      time_from: 695,
      time_to: 699
    },
    {
      slug: "ZH-SUTRA-V1-0002",
      title: "\u5999\u6CD5\u84EE\u83EF\u7D93",
      category: "\u83EF\u56B4\u90E8\u985E",
      roll_count: 80,
      num_chars: 593144,
      translator: "\u5510 \u5BE6\u53C9\u96E3\u9640\u8B6F",
      dynasty: "\u5510",
      time_from: 695,
      time_to: 699
    },
    {
      slug: "ZH-SUTRA-V1-0003",
      title: "\u91D1\u525B\u822C\u82E5\u6CE2\u7F85\u871C\u7D93",
      category: "\u83EF\u56B4\u90E8\u985E",
      roll_count: 80,
      num_chars: 593144,
      translator: "\u5510 \u5BE6\u53C9\u96E3\u9640\u8B6F",
      dynasty: "\u5510",
      time_from: 695,
      time_to: 699
    },
    {
      slug: "ZH-SUTRA-V1-0004",
      title: "\u822C\u82E5\u6CE2\u7F85\u871C\u591A\u5FC3\u7D93",
      category: "\u83EF\u56B4\u90E8\u985E",
      roll_count: 80,
      num_chars: 593144,
      translator: "\u5510 \u5BE6\u53C9\u96E3\u9640\u8B6F",
      dynasty: "\u5510",
      time_from: 695,
      time_to: 699
    },
    {
      slug: "ZH-SUTRA-V1-0005",
      title: "\u4F5B\u8AAA\u963F\u5F4C\u9640\u7D93",
      category: "\u83EF\u56B4\u90E8\u985E",
      roll_count: 80,
      num_chars: 593144,
      translator: "\u5510 \u5BE6\u53C9\u96E3\u9640\u8B6F",
      dynasty: "\u5510",
      time_from: 695,
      time_to: 699
    }
  ]
});
function TripitakaRoute4() {
  let { sutras } = (0, import_react49.useLoaderData)(), sutraComp = sutras.map((sutra) => /* @__PURE__ */ (0, import_jsx_dev_runtime23.jsxDEV)(Sutra, {
    ...sutra
  }, sutra.slug, !1, {
    fileName: "app/routes/__app/tripitaka/index.tsx",
    lineNumber: 69,
    columnNumber: 43
  }, this));
  return /* @__PURE__ */ (0, import_jsx_dev_runtime23.jsxDEV)(import_react48.Box, {
    p: 10,
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime23.jsxDEV)(import_react48.Flex, {
      gap: 8,
      flexWrap: "wrap",
      children: sutraComp
    }, void 0, !1, {
      fileName: "app/routes/__app/tripitaka/index.tsx",
      lineNumber: 72,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/__app/tripitaka/index.tsx",
    lineNumber: 71,
    columnNumber: 5
  }, this);
}

// app/routes/__app/setting.tsx
var setting_exports = {};
__export(setting_exports, {
  action: () => action2,
  default: () => TranslationRoute2
});
var import_react50 = require("@chakra-ui/react"), import_react51 = require("@remix-run/react");
var import_jsx_dev_runtime24 = require("react/jsx-dev-runtime");
async function action2({ request }) {
  await authenticator.logout(request, { redirectTo: "/login" });
}
function TranslationRoute2() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime24.jsxDEV)(import_react50.Flex, {
    p: 10,
    background: "secondary.800",
    w: "100%",
    flexDir: "column",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime24.jsxDEV)(import_react50.Box, {
      my: 8,
      textAlign: "left",
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime24.jsxDEV)(import_react51.Form, {
        method: "post",
        children: /* @__PURE__ */ (0, import_jsx_dev_runtime24.jsxDEV)(import_react50.Button, {
          colorScheme: "iconButton",
          width: "full",
          mt: 4,
          type: "submit",
          children: "Logout"
        }, void 0, !1, {
          fileName: "app/routes/__app/setting.tsx",
          lineNumber: 13,
          columnNumber: 11
        }, this)
      }, void 0, !1, {
        fileName: "app/routes/__app/setting.tsx",
        lineNumber: 12,
        columnNumber: 9
      }, this)
    }, void 0, !1, {
      fileName: "app/routes/__app/setting.tsx",
      lineNumber: 11,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/__app/setting.tsx",
    lineNumber: 10,
    columnNumber: 5
  }, this);
}

// app/routes/__app/admin.tsx
var admin_exports = {};
__export(admin_exports, {
  default: () => TripitakaRoute5,
  loader: () => loader11
});
var import_react52 = require("@chakra-ui/react"), import_node11 = require("@remix-run/node"), import_react53 = require("@remix-run/react");
var import_icons7 = require("@chakra-ui/icons"), import_ri = require("react-icons/ri"), import_fa = require("react-icons/fa");
var import_jsx_dev_runtime25 = require("react/jsx-dev-runtime"), loader11 = async () => (0, import_node11.json)({
  teams: Object.values(Team),
  roles,
  langs,
  users: [
    {
      username: "Terry Pan",
      roles: ["Viewer"],
      email: "pantaotao@icloud.com",
      origin_lang: "ZH",
      target_lang: "EN",
      team: "Master Sure" /* TEAM0001 */,
      first_login: !1
    },
    {
      username: "Tao Pan",
      roles: ["Admin"],
      email: "pttdev123@gmail.com",
      origin_lang: "ZH",
      target_lang: "EN",
      team: "Master Chi" /* TEAM0002 */,
      first_login: !1
    }
  ]
});
function TripitakaRoute5() {
  let { users, teams, roles: roles2, langs: langs2 } = (0, import_react53.useLoaderData)(), usersComp = users == null ? void 0 : users.map((user) => /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(UserConfig, {
    user,
    userform: /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(UserForm, {
      ...user,
      teams,
      langs: langs2,
      roless: roles2
    }, void 0, !1, {
      fileName: "app/routes/__app/admin.tsx",
      lineNumber: 64,
      columnNumber: 19
    }, this)
  }, user.email, !1, {
    fileName: "app/routes/__app/admin.tsx",
    lineNumber: 61,
    columnNumber: 7
  }, this));
  return /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Flex, {
    p: 10,
    background: "secondary.800",
    w: "100%",
    flexDir: "column",
    children: [
      usersComp,
      /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(AdminActionButtons, {
        teams,
        roles: roles2,
        langs: langs2
      }, void 0, !1, {
        fileName: "app/routes/__app/admin.tsx",
        lineNumber: 71,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/routes/__app/admin.tsx",
    lineNumber: 69,
    columnNumber: 5
  }, this);
}
var UserConfig = (props) => {
  var _a;
  let { user, userform } = props;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Accordion, {
    allowToggle: !0,
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.AccordionItem, {
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)("h2", {
          children: /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.AccordionButton, {
            _expanded: { bg: "primary.800", color: "white" },
            children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Box, {
                flex: "1",
                textAlign: "left",
                children: [
                  user.username,
                  (_a = user.roles) == null ? void 0 : _a.map((role) => /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Tag, {
                    ml: 4,
                    background: role === "Admin" ? "pink" : "lightgreen",
                    children: role
                  }, role, !1, {
                    fileName: "app/routes/__app/admin.tsx",
                    lineNumber: 90,
                    columnNumber: 17
                  }, this))
                ]
              }, void 0, !0, {
                fileName: "app/routes/__app/admin.tsx",
                lineNumber: 87,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.AccordionIcon, {}, void 0, !1, {
                fileName: "app/routes/__app/admin.tsx",
                lineNumber: 95,
                columnNumber: 13
              }, this)
            ]
          }, void 0, !0, {
            fileName: "app/routes/__app/admin.tsx",
            lineNumber: 86,
            columnNumber: 11
          }, this)
        }, void 0, !1, {
          fileName: "app/routes/__app/admin.tsx",
          lineNumber: 85,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.AccordionPanel, {
          background: "secondary.500",
          children: userform
        }, void 0, !1, {
          fileName: "app/routes/__app/admin.tsx",
          lineNumber: 98,
          columnNumber: 9
        }, this)
      ]
    }, void 0, !0, {
      fileName: "app/routes/__app/admin.tsx",
      lineNumber: 84,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/__app/admin.tsx",
    lineNumber: 83,
    columnNumber: 5
  }, this);
}, AdminActionButtons = (props) => {
  let { roles: roles2, teams, langs: langs2 } = props, { isOpen, onToggle } = (0, import_react52.useDisclosure)(), { isOpen: isOpenNewUser, onOpen: onOpenNewUser, onClose: onCloseNewUser } = (0, import_react52.useDisclosure)(), user = {
    username: "",
    email: "",
    roles: ["Viewer"],
    team: "Master Sure" /* TEAM0001 */,
    origin_lang: "ZH",
    target_lang: "EN",
    first_login: !1
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Box, {
    pos: "fixed",
    right: 8,
    bottom: 8,
    children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Fade, {
        in: isOpen,
        children: /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.VStack, {
          spacing: 4,
          mb: 4,
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Tooltip, {
              label: "add a new user",
              placement: "left",
              children: /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)("span", {
                children: [
                  /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.IconButton, {
                    colorScheme: "iconButton",
                    borderRadius: "50%",
                    w: 12,
                    h: 12,
                    "aria-label": "open admin edit buttons",
                    icon: /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_ri.RiUser2Line, {}, void 0, !1, {
                      fileName: "app/routes/__app/admin.tsx",
                      lineNumber: 141,
                      columnNumber: 23
                    }, this),
                    onClick: onOpenNewUser
                  }, void 0, !1, {
                    fileName: "app/routes/__app/admin.tsx",
                    lineNumber: 135,
                    columnNumber: 15
                  }, this),
                  /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(FormModal, {
                    header: "Add a New User",
                    body: /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(UserForm, {
                      ...user,
                      teams,
                      roless: roles2,
                      langs: langs2,
                      isNew: !0
                    }, void 0, !1, {
                      fileName: "app/routes/__app/admin.tsx",
                      lineNumber: 147,
                      columnNumber: 19
                    }, this),
                    isOpen: isOpenNewUser,
                    onClose: onCloseNewUser,
                    name: "newuser"
                  }, void 0, !1, {
                    fileName: "app/routes/__app/admin.tsx",
                    lineNumber: 144,
                    columnNumber: 15
                  }, this)
                ]
              }, void 0, !0, {
                fileName: "app/routes/__app/admin.tsx",
                lineNumber: 134,
                columnNumber: 13
              }, this)
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 133,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Tooltip, {
              label: "add a new team",
              placement: "left",
              children: /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.IconButton, {
                colorScheme: "iconButton",
                borderRadius: "50%",
                w: 12,
                h: 12,
                "aria-label": "open admin edit buttons",
                icon: /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_ri.RiTeamLine, {}, void 0, !1, {
                  fileName: "app/routes/__app/admin.tsx",
                  lineNumber: 162,
                  columnNumber: 21
                }, this)
              }, void 0, !1, {
                fileName: "app/routes/__app/admin.tsx",
                lineNumber: 156,
                columnNumber: 13
              }, this)
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 155,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Tooltip, {
              label: "add a new language",
              placement: "left",
              children: /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.IconButton, {
                colorScheme: "iconButton",
                borderRadius: "50%",
                w: 12,
                h: 12,
                "aria-label": "open admin edit buttons",
                icon: /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_fa.FaLanguage, {}, void 0, !1, {
                  fileName: "app/routes/__app/admin.tsx",
                  lineNumber: 172,
                  columnNumber: 21
                }, this)
              }, void 0, !1, {
                fileName: "app/routes/__app/admin.tsx",
                lineNumber: 166,
                columnNumber: 13
              }, this)
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 165,
              columnNumber: 11
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/routes/__app/admin.tsx",
          lineNumber: 132,
          columnNumber: 9
        }, this)
      }, void 0, !1, {
        fileName: "app/routes/__app/admin.tsx",
        lineNumber: 131,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.IconButton, {
        colorScheme: "iconButton",
        borderRadius: "50%",
        w: 12,
        h: 12,
        "aria-label": "open admin edit buttons",
        icon: /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_icons7.EditIcon, {}, void 0, !1, {
          fileName: "app/routes/__app/admin.tsx",
          lineNumber: 183,
          columnNumber: 15
        }, this),
        onClick: onToggle
      }, void 0, !1, {
        fileName: "app/routes/__app/admin.tsx",
        lineNumber: 177,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/routes/__app/admin.tsx",
    lineNumber: 130,
    columnNumber: 5
  }, this);
}, UserForm = (props) => {
  let [toggleEdit, setToggleEdit] = (0, import_react52.useBoolean)(!0), { username, email, team, teams, langs: langs2, origin_lang, target_lang, roles: roles2, roless, isNew } = props;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)("form", {
    method: "post",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.SimpleGrid, {
      columns: isNew ? 2 : 3,
      spacing: 4,
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.FormControl, {
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.FormLabel, {
              children: "User name:"
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 198,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Input, {
              type: "text",
              value: username,
              onChange: () => {
              },
              name: "username"
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 199,
              columnNumber: 11
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/routes/__app/admin.tsx",
          lineNumber: 197,
          columnNumber: 9
        }, this),
        isNew ? /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.FormControl, {
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.FormLabel, {
              children: "Password: "
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 203,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Input, {
              type: "text",
              value: "",
              onChange: () => {
              },
              name: "password"
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 204,
              columnNumber: 13
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/routes/__app/admin.tsx",
          lineNumber: 202,
          columnNumber: 11
        }, this) : null,
        /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.FormControl, {
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.FormLabel, {
              children: "Email:"
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 208,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Input, {
              type: "email",
              value: email,
              onChange: () => {
              },
              name: "email"
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 209,
              columnNumber: 11
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/routes/__app/admin.tsx",
          lineNumber: 207,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.FormControl, {
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.FormLabel, {
              children: "Team:"
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 212,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Select, {
              value: team,
              onChange: () => {
              },
              children: teams == null ? void 0 : teams.map((team2) => /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)("option", {
                value: team2,
                children: team2
              }, team2, !1, {
                fileName: "app/routes/__app/admin.tsx",
                lineNumber: 215,
                columnNumber: 15
              }, this))
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 213,
              columnNumber: 11
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/routes/__app/admin.tsx",
          lineNumber: 211,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.FormControl, {
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.FormLabel, {
              children: "Role:"
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 222,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Select, {
              value: roles2[0],
              onChange: () => {
              },
              children: roless == null ? void 0 : roless.map((role) => /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)("option", {
                value: role,
                children: role
              }, role, !1, {
                fileName: "app/routes/__app/admin.tsx",
                lineNumber: 225,
                columnNumber: 15
              }, this))
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 223,
              columnNumber: 11
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/routes/__app/admin.tsx",
          lineNumber: 221,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.FormControl, {
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.FormLabel, {
              children: "Source Language:"
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 232,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Select, {
              value: origin_lang,
              onChange: () => {
              },
              children: langs2 == null ? void 0 : langs2.map((lang) => /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)("option", {
                value: lang,
                children: lang
              }, lang, !1, {
                fileName: "app/routes/__app/admin.tsx",
                lineNumber: 235,
                columnNumber: 15
              }, this))
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 233,
              columnNumber: 11
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/routes/__app/admin.tsx",
          lineNumber: 231,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.FormControl, {
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.FormLabel, {
              children: "Target Language:"
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 242,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(import_react52.Select, {
              value: target_lang,
              onChange: () => {
              },
              children: langs2 == null ? void 0 : langs2.map((lang) => /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)("option", {
                value: lang,
                children: lang
              }, lang, !1, {
                fileName: "app/routes/__app/admin.tsx",
                lineNumber: 245,
                columnNumber: 15
              }, this))
            }, void 0, !1, {
              fileName: "app/routes/__app/admin.tsx",
              lineNumber: 243,
              columnNumber: 11
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/routes/__app/admin.tsx",
          lineNumber: 241,
          columnNumber: 9
        }, this)
      ]
    }, void 0, !0, {
      fileName: "app/routes/__app/admin.tsx",
      lineNumber: 196,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/__app/admin.tsx",
    lineNumber: 195,
    columnNumber: 5
  }, this);
};

// app/routes/__app/index.tsx
var app_exports2 = {};
__export(app_exports2, {
  default: () => HomeRoute,
  loader: () => loader12
});
var import_node12 = require("@remix-run/node"), import_jsx_dev_runtime26 = require("react/jsx-dev-runtime"), loader12 = async ({ request }) => (0, import_node12.redirect)("/dashboard");
function HomeRoute() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime26.jsxDEV)("div", {
    children: "Home"
  }, void 0, !1, {
    fileName: "app/routes/__app/index.tsx",
    lineNumber: 8,
    columnNumber: 10
  }, this);
}

// app/routes/login.tsx
var login_exports = {};
__export(login_exports, {
  action: () => action3,
  default: () => LoginRoute,
  loader: () => loader13
});
var import_node13 = require("@remix-run/node");

// app/utils/regex.ts
var emailRegex = new RegExp(
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

// app/routes/login.tsx
var import_react54 = require("@chakra-ui/react"), import_react55 = require("@remix-run/react");
var import_jsx_dev_runtime27 = require("react/jsx-dev-runtime"), loader13 = async () => (await onlyCreateAdminUserWhenFirstSystemUp(), (0, import_node13.json)({}));
async function action3({ request }) {
  try {
    let form = await request.clone().formData(), username = form.get("username"), password = form.get("password");
    if (!username)
      return (0, import_node13.json)({ username: "username cannot be empty" }, { status: 400 });
    if (!emailRegex.test(username))
      return (0, import_node13.json)({ username: "please enter valid email" }, { status: 400 });
    if (!password)
      return (0, import_node13.json)({ password: "password cannot be empty" }, { status: 400 });
    let user = await authenticator.authenticate("form", request);
    if (user) {
      let session = await getSession(request.headers.get("cookie"));
      session.set(authenticator.sessionKey, user);
      let headers = new Headers({ "Set-Cookie": await commitSession(session) });
      return user.first_login ? (0, import_node13.redirect)("/update_password", { headers }) : (0, import_node13.redirect)("/", { headers });
    } else
      return (0, import_node13.json)({ password: "please enter correct credentials" }, { status: 401 });
  } catch {
    return (0, import_node13.json)({ password: "Internal Server Error" }, { status: 500 });
  }
}
function LoginRoute() {
  let actionData = (0, import_react55.useActionData)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Flex, {
    minHeight: "100vh",
    width: "full",
    align: "center",
    justifyContent: "center",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Box, {
      borderWidth: 1,
      px: 4,
      width: "full",
      maxWidth: "500px",
      borderRadius: 4,
      textAlign: "center",
      boxShadow: "lg",
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Box, {
        p: 4,
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(LoginHeader, {}, void 0, !1, {
            fileName: "app/routes/login.tsx",
            lineNumber: 75,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(LoginForm, {
            actionData
          }, void 0, !1, {
            fileName: "app/routes/login.tsx",
            lineNumber: 76,
            columnNumber: 11
          }, this)
        ]
      }, void 0, !0, {
        fileName: "app/routes/login.tsx",
        lineNumber: 74,
        columnNumber: 9
      }, this)
    }, void 0, !1, {
      fileName: "app/routes/login.tsx",
      lineNumber: 65,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/login.tsx",
    lineNumber: 64,
    columnNumber: 5
  }, this);
}
var LoginHeader = () => /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Box, {
  textAlign: "center",
  children: /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Heading, {
    children: "Login to Your Account"
  }, void 0, !1, {
    fileName: "app/routes/login.tsx",
    lineNumber: 86,
    columnNumber: 7
  }, this)
}, void 0, !1, {
  fileName: "app/routes/login.tsx",
  lineNumber: 85,
  columnNumber: 5
}, this), LoginForm = (props) => {
  let transition = (0, import_react55.useTransition)(), isLoading = Boolean(transition.submission), { username, password } = props.actionData || {};
  return /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Box, {
    my: 8,
    textAlign: "left",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react55.Form, {
      method: "post",
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.FormControl, {
          isInvalid: Boolean(username),
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.FormLabel, {
              children: "Email address"
            }, void 0, !1, {
              fileName: "app/routes/login.tsx",
              lineNumber: 105,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Input, {
              type: "email",
              placeholder: "Enter your email address",
              name: "username"
            }, void 0, !1, {
              fileName: "app/routes/login.tsx",
              lineNumber: 106,
              columnNumber: 11
            }, this),
            username ? /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.FormErrorMessage, {
              children: username
            }, void 0, !1, {
              fileName: "app/routes/login.tsx",
              lineNumber: 107,
              columnNumber: 23
            }, this) : null
          ]
        }, void 0, !0, {
          fileName: "app/routes/login.tsx",
          lineNumber: 104,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.FormControl, {
          mt: 4,
          isInvalid: Boolean(password),
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.FormLabel, {
              children: "Password"
            }, void 0, !1, {
              fileName: "app/routes/login.tsx",
              lineNumber: 111,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Input, {
              type: "password",
              placeholder: "Enter your password",
              name: "password"
            }, void 0, !1, {
              fileName: "app/routes/login.tsx",
              lineNumber: 112,
              columnNumber: 11
            }, this),
            password ? /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.FormErrorMessage, {
              children: password
            }, void 0, !1, {
              fileName: "app/routes/login.tsx",
              lineNumber: 113,
              columnNumber: 23
            }, this) : null
          ]
        }, void 0, !0, {
          fileName: "app/routes/login.tsx",
          lineNumber: 110,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Stack, {
          isInline: !0,
          justifyContent: "space-between",
          mt: 4,
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Box, {
              children: /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Checkbox, {
                children: "Remember Me"
              }, void 0, !1, {
                fileName: "app/routes/login.tsx",
                lineNumber: 118,
                columnNumber: 13
              }, this)
            }, void 0, !1, {
              fileName: "app/routes/login.tsx",
              lineNumber: 117,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Box, {
              children: /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Link, {
                color: "primary.500",
                children: "Forgot your password?"
              }, void 0, !1, {
                fileName: "app/routes/login.tsx",
                lineNumber: 121,
                columnNumber: 13
              }, this)
            }, void 0, !1, {
              fileName: "app/routes/login.tsx",
              lineNumber: 120,
              columnNumber: 11
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/routes/login.tsx",
          lineNumber: 116,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Button, {
          colorScheme: "iconButton",
          width: "full",
          mt: 4,
          type: "submit",
          disabled: isLoading,
          children: isLoading ? /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(import_react54.Spinner, {}, void 0, !1, {
            fileName: "app/routes/login.tsx",
            lineNumber: 126,
            columnNumber: 24
          }, this) : "Log In"
        }, void 0, !1, {
          fileName: "app/routes/login.tsx",
          lineNumber: 125,
          columnNumber: 9
        }, this)
      ]
    }, void 0, !0, {
      fileName: "app/routes/login.tsx",
      lineNumber: 103,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/login.tsx",
    lineNumber: 102,
    columnNumber: 5
  }, this);
};

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { version: "dcb40aaf", entry: { module: "/build/entry.client-ADLZI4UN.js", imports: ["/build/_shared/chunk-TY6SAEDL.js", "/build/_shared/chunk-LOPKYMI2.js", "/build/_shared/chunk-7N4LN2LI.js", "/build/_shared/chunk-C5IU4CE3.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-XYZ4HAJL.js", imports: ["/build/_shared/chunk-QIYUMQTB.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/__app": { id: "routes/__app", parentId: "root", path: void 0, index: void 0, caseSensitive: void 0, module: "/build/routes/__app-7QWNZ26G.js", imports: ["/build/_shared/chunk-YWLFOGHQ.js", "/build/_shared/chunk-AUYLHJJM.js", "/build/_shared/chunk-RPWT6SDD.js", "/build/_shared/chunk-CPRH5P5W.js", "/build/_shared/chunk-GXZ53O3Z.js", "/build/_shared/chunk-CPLWIBSY.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/__app/admin": { id: "routes/__app/admin", parentId: "routes/__app", path: "admin", index: void 0, caseSensitive: void 0, module: "/build/routes/__app/admin-5743NI2O.js", imports: ["/build/_shared/chunk-VH426VOC.js", "/build/_shared/chunk-YSRBB4OA.js", "/build/_shared/chunk-VUOGFKXV.js", "/build/_shared/chunk-IXRLZF4B.js", "/build/_shared/chunk-QIYUMQTB.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/__app/dashboard": { id: "routes/__app/dashboard", parentId: "routes/__app", path: "dashboard", index: void 0, caseSensitive: void 0, module: "/build/routes/__app/dashboard-TQV6FNCZ.js", imports: ["/build/_shared/chunk-QIYUMQTB.js"], hasAction: !1, hasLoader: !1, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/__app/index": { id: "routes/__app/index", parentId: "routes/__app", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/__app/index-F6PCD6WF.js", imports: void 0, hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/__app/setting": { id: "routes/__app/setting", parentId: "routes/__app", path: "setting", index: void 0, caseSensitive: void 0, module: "/build/routes/__app/setting-GMHNZWYJ.js", imports: ["/build/_shared/chunk-QIYUMQTB.js"], hasAction: !0, hasLoader: !1, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/__app/translation": { id: "routes/__app/translation", parentId: "routes/__app", path: "translation", index: void 0, caseSensitive: void 0, module: "/build/routes/__app/translation-7X7BDGJZ.js", imports: ["/build/_shared/chunk-VH426VOC.js", "/build/_shared/chunk-YSRBB4OA.js", "/build/_shared/chunk-VUOGFKXV.js", "/build/_shared/chunk-IXRLZF4B.js", "/build/_shared/chunk-QIYUMQTB.js"], hasAction: !1, hasLoader: !1, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/__app/translation/$sutraId/$rollId/index": { id: "routes/__app/translation/$sutraId/$rollId/index", parentId: "routes/__app/translation", path: ":sutraId/:rollId", index: !0, caseSensitive: void 0, module: "/build/routes/__app/translation/$sutraId/$rollId/index-3H56LJVX.js", imports: void 0, hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/__app/translation/$sutraId/index": { id: "routes/__app/translation/$sutraId/index", parentId: "routes/__app/translation", path: ":sutraId", index: !0, caseSensitive: void 0, module: "/build/routes/__app/translation/$sutraId/index-2ACPQYTR.js", imports: ["/build/_shared/chunk-RM3NL5X6.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/__app/translation/index": { id: "routes/__app/translation/index", parentId: "routes/__app/translation", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/__app/translation/index-G5YCOY63.js", imports: void 0, hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/__app/tripitaka": { id: "routes/__app/tripitaka", parentId: "routes/__app", path: "tripitaka", index: void 0, caseSensitive: void 0, module: "/build/routes/__app/tripitaka-F3RZZM5T.js", imports: ["/build/_shared/chunk-YSRBB4OA.js", "/build/_shared/chunk-QIYUMQTB.js"], hasAction: !1, hasLoader: !1, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/__app/tripitaka/$sutraId/$rollId/index": { id: "routes/__app/tripitaka/$sutraId/$rollId/index", parentId: "routes/__app/tripitaka", path: ":sutraId/:rollId", index: !0, caseSensitive: void 0, module: "/build/routes/__app/tripitaka/$sutraId/$rollId/index-6C5URFZR.js", imports: ["/build/_shared/chunk-CPRH5P5W.js", "/build/_shared/chunk-GXZ53O3Z.js", "/build/_shared/chunk-VUOGFKXV.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/__app/tripitaka/$sutraId/$rollId/staging": { id: "routes/__app/tripitaka/$sutraId/$rollId/staging", parentId: "routes/__app/tripitaka", path: ":sutraId/:rollId/staging", index: void 0, caseSensitive: void 0, module: "/build/routes/__app/tripitaka/$sutraId/$rollId/staging-QDY6JOFJ.js", imports: ["/build/_shared/chunk-WDMOJSVM.js", "/build/_shared/chunk-GXZ53O3Z.js", "/build/_shared/chunk-CPLWIBSY.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/__app/tripitaka/$sutraId/index": { id: "routes/__app/tripitaka/$sutraId/index", parentId: "routes/__app/tripitaka", path: ":sutraId", index: !0, caseSensitive: void 0, module: "/build/routes/__app/tripitaka/$sutraId/index-BXCCJNTH.js", imports: ["/build/_shared/chunk-WDMOJSVM.js", "/build/_shared/chunk-CPLWIBSY.js", "/build/_shared/chunk-RM3NL5X6.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !0, hasErrorBoundary: !1 }, "routes/__app/tripitaka/index": { id: "routes/__app/tripitaka/index", parentId: "routes/__app/tripitaka", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/__app/tripitaka/index-P4KE45L4.js", imports: ["/build/_shared/chunk-IXRLZF4B.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/login": { id: "routes/login", parentId: "root", path: "login", index: void 0, caseSensitive: void 0, module: "/build/routes/login-Z272AK5S.js", imports: ["/build/_shared/chunk-VJNNFP4S.js", "/build/_shared/chunk-YWLFOGHQ.js", "/build/_shared/chunk-AUYLHJJM.js"], hasAction: !0, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/update_password": { id: "routes/update_password", parentId: "root", path: "update_password", index: void 0, caseSensitive: void 0, module: "/build/routes/update_password-53UK37MF.js", imports: ["/build/_shared/chunk-VJNNFP4S.js", "/build/_shared/chunk-YWLFOGHQ.js", "/build/_shared/chunk-AUYLHJJM.js"], hasAction: !0, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 } }, url: "/build/manifest-DCB40AAF.js" };

// server-entry-module:@remix-run/dev/server-build
var assetsBuildDirectory = "public/build", future = { v2_meta: !1 }, publicPath = "/build/", entry = { module: entry_server_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/update_password": {
    id: "routes/update_password",
    parentId: "root",
    path: "update_password",
    index: void 0,
    caseSensitive: void 0,
    module: update_password_exports
  },
  "routes/__app": {
    id: "routes/__app",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: app_exports
  },
  "routes/__app/translation": {
    id: "routes/__app/translation",
    parentId: "routes/__app",
    path: "translation",
    index: void 0,
    caseSensitive: void 0,
    module: translation_exports
  },
  "routes/__app/translation/$sutraId/$rollId/index": {
    id: "routes/__app/translation/$sutraId/$rollId/index",
    parentId: "routes/__app/translation",
    path: ":sutraId/:rollId",
    index: !0,
    caseSensitive: void 0,
    module: rollId_exports
  },
  "routes/__app/translation/$sutraId/index": {
    id: "routes/__app/translation/$sutraId/index",
    parentId: "routes/__app/translation",
    path: ":sutraId",
    index: !0,
    caseSensitive: void 0,
    module: sutraId_exports
  },
  "routes/__app/translation/index": {
    id: "routes/__app/translation/index",
    parentId: "routes/__app/translation",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: translation_exports2
  },
  "routes/__app/dashboard": {
    id: "routes/__app/dashboard",
    parentId: "routes/__app",
    path: "dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: dashboard_exports
  },
  "routes/__app/tripitaka": {
    id: "routes/__app/tripitaka",
    parentId: "routes/__app",
    path: "tripitaka",
    index: void 0,
    caseSensitive: void 0,
    module: tripitaka_exports
  },
  "routes/__app/tripitaka/$sutraId/$rollId/staging": {
    id: "routes/__app/tripitaka/$sutraId/$rollId/staging",
    parentId: "routes/__app/tripitaka",
    path: ":sutraId/:rollId/staging",
    index: void 0,
    caseSensitive: void 0,
    module: staging_exports
  },
  "routes/__app/tripitaka/$sutraId/$rollId/index": {
    id: "routes/__app/tripitaka/$sutraId/$rollId/index",
    parentId: "routes/__app/tripitaka",
    path: ":sutraId/:rollId",
    index: !0,
    caseSensitive: void 0,
    module: rollId_exports2
  },
  "routes/__app/tripitaka/$sutraId/index": {
    id: "routes/__app/tripitaka/$sutraId/index",
    parentId: "routes/__app/tripitaka",
    path: ":sutraId",
    index: !0,
    caseSensitive: void 0,
    module: sutraId_exports2
  },
  "routes/__app/tripitaka/index": {
    id: "routes/__app/tripitaka/index",
    parentId: "routes/__app/tripitaka",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: tripitaka_exports2
  },
  "routes/__app/setting": {
    id: "routes/__app/setting",
    parentId: "routes/__app",
    path: "setting",
    index: void 0,
    caseSensitive: void 0,
    module: setting_exports
  },
  "routes/__app/admin": {
    id: "routes/__app/admin",
    parentId: "routes/__app",
    path: "admin",
    index: void 0,
    caseSensitive: void 0,
    module: admin_exports
  },
  "routes/__app/index": {
    id: "routes/__app/index",
    parentId: "routes/__app",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: app_exports2
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: login_exports
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  assets,
  assetsBuildDirectory,
  entry,
  future,
  publicPath,
  routes
});
//# sourceMappingURL=index.js.map
