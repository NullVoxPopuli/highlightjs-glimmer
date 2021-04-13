var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};

// src/index.js
__markAsModule(exports);
__export(exports, {
  glimmer: () => glimmer2,
  registerInjections: () => registerInjections,
  registerLanguage: () => registerLanguage,
  setup: () => setup
});

// src/glimmer.js
function glimmer(hljs) {
  function definition() {
    return {
      name: "Ember.JS, Glimmer",
      aliases: ["glimmer", "hbs", "html.hbs", "html.handlebars", "htmlbars"],
      case_insensitive: true,
      keywords: KEYWORDS,
      disableAutodetect: true,
      contains: [
        hljs.COMMENT(/\{\{!--/, /--\}\}/),
        hljs.COMMENT(/\{\{!/, /\}\}/),
        hljs.COMMENT(/<!--/, /-->/),
        XML_ENTITIES,
        ...MUSTACHE_EXPRESSION,
        OPERATORS,
        ARGUMENTS,
        TAG_COMMENT,
        ...ANGLE_BRACKET_BLOCK
      ]
    };
  }
  const _EQUALITY_HELPERS = "eq neq";
  const _NUMERIC_COMPARISON_HELPERS = "gt gte le lte";
  const _LOGICAL_OPERATOR_HELPERS = "and or not";
  const _OTHER_OPERATORS = "not-eq xor is-array is-object is-equal";
  const _BLOCK_HELPERS = "let each each-in if else unless";
  const _DEBUG_HELPERS = "log debugger";
  const _INLINE_HELPERS = "has-block concat fn component helper modifier get hash query-params";
  const _MODIFIERS = "action on";
  const _SPECIAL = "outlet yield";
  const _LITERALS = "true false undefined null";
  const KEYWORDS = {
    $pattern: /\b[\w][\w-]+\b/,
    keyword: `${_SPECIAL} ${_MODIFIERS} ${_DEBUG_HELPERS}`,
    built_in: _BLOCK_HELPERS,
    function: `${_OTHER_OPERATORS} ${_INLINE_HELPERS} ${_EQUALITY_HELPERS} ${_NUMERIC_COMPARISON_HELPERS} ${_LOGICAL_OPERATOR_HELPERS}`,
    literal: _LITERALS
  };
  const TAG_NAME = regex.either(regex.concat(/[a-zA-Z_]/, regex.optional(/[A-Z0-9:_.-]*:/), /[A-Z0-9_.-]*/), /[a-z]/);
  const COMPONENT_NAME_SEGMENT = /[A-Z][A-Za-z0-9]+/;
  const COMPONENT_NAME = regex.either(COMPONENT_NAME_SEGMENT, /[a-zA-Z0-9]*\.[a-zA-Z0-9-]*/, regex.concat(COMPONENT_NAME_SEGMENT, /::/, /-?/, COMPONENT_NAME_SEGMENT), /[a-z]/);
  const CURLY_BLOCK_NAME = /[a-z-][a-z\d-_]+\b/;
  const ATTR_REGEX = /[@A-Za-z0-9._:-]+/;
  const XML_ENTITIES = {
    className: "symbol",
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
  };
  const PUNCTUATION = {
    className: "punctuation",
    match: regex.either(/\./, /\{\{\{?#?\/?/, /\}\}\}?/, /\(/, /\)/, /::/, /\|/, /~/)
  };
  const BLOCK_PARAMS = {
    begin: /as\s+\|/,
    keywords: {
      keyword: "as"
    },
    end: /\|/,
    contains: [
      {
        className: "template-variable",
        begin: ATTR_REGEX
      }
    ]
  };
  const OPERATORS = {
    className: "operator",
    match: /\=/
  };
  const ARGUMENTS = {
    className: {
      1: "punctuation",
      2: "params"
    },
    match: [/@/, /[\w\d-_]+/]
  };
  const ATTRIBUTES = {
    className: {
      1: "attribute",
      2: "operator"
    },
    match: [/[A-Za-z0-9-_]+/, /=/]
  };
  const THIS_EXPRESSION = {
    className: {
      1: "class",
      2: "punctuation",
      3: "property"
    },
    match: [/this/, /\./, /[^\s}]+/]
  };
  const ABS_NAME = {
    className: "title",
    match: COMPONENT_NAME
  };
  const CURLY_NAME = {
    className: "title",
    match: CURLY_BLOCK_NAME,
    keywords: KEYWORDS
  };
  const NUMBER = {
    className: "number",
    match: /[\d]+((\.[\d]+))?/
  };
  const TAG_COMMENT = {
    className: "comment",
    begin: /\{\{!--/,
    contains: [
      {
        className: "comment",
        match: /.+/
      },
      {
        begin: /--\}\}/,
        endsParent: true
      }
    ]
  };
  const STRING = {
    className: "string",
    variants: [
      {
        begin: /"/,
        end: /"/,
        contains: [
          XML_ENTITIES
        ]
      },
      {
        begin: /'/,
        end: /'/,
        contains: [
          XML_ENTITIES
        ]
      }
    ]
  };
  const MUSTACHE_AND_SUB_EXPRESSION_INTERNALS = [
    PUNCTUATION,
    OPERATORS,
    ARGUMENTS,
    NUMBER,
    BLOCK_PARAMS,
    THIS_EXPRESSION,
    ATTRIBUTES,
    CURLY_NAME,
    STRING
  ];
  const SUB_EXPRESSION = {
    keywords: KEYWORDS,
    begin: regex.concat(/\(/, regex.lookahead(regex.concat(/\)/))),
    end: /\)/,
    contains: [
      ...MUSTACHE_AND_SUB_EXPRESSION_INTERNALS,
      "self",
      {
        begin: /\)/,
        endsParent: true
      }
    ]
  };
  MUSTACHE_AND_SUB_EXPRESSION_INTERNALS.push(SUB_EXPRESSION);
  const MUSTACHE_EXPRESSION = [
    {
      className: "punctuation mustache",
      keywords: KEYWORDS,
      begin: regex.concat(/\{\{\{?#?/),
      end: /\}\}\}?/,
      contains: [
        {
          begin: /\}\}\}?/,
          endsParent: true
        },
        ...MUSTACHE_AND_SUB_EXPRESSION_INTERNALS,
        SUB_EXPRESSION
      ]
    }
  ];
  STRING.variants.forEach((variant) => variant.contains.push(...MUSTACHE_EXPRESSION));
  const ANGLE_BRACKET_BLOCK = [
    {
      className: "tag",
      begin: regex.concat(/<:?/, regex.lookahead(regex.concat(TAG_NAME, regex.either(/\/>/, />/, /\s/)))),
      end: /\/?>/,
      contains: [
        OPERATORS,
        ARGUMENTS,
        TAG_COMMENT,
        BLOCK_PARAMS,
        THIS_EXPRESSION,
        ...MUSTACHE_EXPRESSION,
        ATTRIBUTES,
        STRING,
        ABS_NAME
      ]
    },
    {
      className: "tag",
      begin: regex.concat(/<\/:?/, regex.lookahead(regex.concat(TAG_NAME, />/))),
      end: /\>/,
      contains: [ABS_NAME]
    }
  ];
  return definition();
}
function lookahead(re) {
  return concat("(?=", re, ")");
}
function optional(re) {
  return concat("(", re, ")?");
}
function concat(...args) {
  const joined = args.map((x) => source(x)).join("");
  return joined;
}
function either(...args) {
  const joined = "(" + args.map((x) => source(x)).join("|") + ")";
  return joined;
}
function source(re) {
  if (!re)
    return null;
  if (typeof re === "string")
    return re;
  return re.source;
}
var regex = {lookahead, either, optional, concat};

// src/index.js
var glimmer2 = glimmer;
function setup(hljs) {
  registerLanguage(hljs);
  registerInjections(hljs);
}
function registerLanguage(hljs) {
  hljs.registerLanguage("glimmer", glimmer);
}
function registerInjections(hljs) {
  registerJavaScriptInjections(hljs);
}
function registerJavaScriptInjections(hljs) {
  let js = hljs.getLanguage("javascript");
  if (!js) {
    console.warn(`JavaScript grammar not loaded`);
    return;
  }
  js = js.rawDefinition(hljs);
  let cssIndex = js.contains.findIndex((rule) => (rule == null ? void 0 : rule.begin) === "css`");
  let css = js.contains[cssIndex];
  js.contains.flatMap((contains) => (contains == null ? void 0 : contains.contains) || contains).filter((rule) => rule.subLanguage === "xml").forEach((rule) => rule.subLanguage = "glimmer");
  const HBS_TEMPLATE = hljs.inherit(css, {begin: /hbs`/});
  HBS_TEMPLATE.starts.subLanguage = "glimmer";
  js.contains.splice(cssIndex, 0, HBS_TEMPLATE);
  hljs.registerLanguage("javascript", () => js);
}
