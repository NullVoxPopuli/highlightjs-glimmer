var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var src_exports = {};
__export(src_exports, {
  externalSetup: () => externalSetup,
  glimmer: () => glimmer2,
  registerInjections: () => registerInjections,
  registerLanguage: () => registerLanguage,
  setup: () => setup
});
module.exports = __toCommonJS(src_exports);

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
  const TAG_NAME = regex.either(
    regex.concat(/[a-zA-Z_]/, regex.optional(/[A-Z0-9:_.-]*:/), /[A-Z0-9_.-]*/),
    /[a-z]/
  );
  const COMPONENT_NAME_SEGMENT = /[A-Z][A-Za-z0-9]+/;
  const COMPONENT_NAME = regex.either(
    COMPONENT_NAME_SEGMENT,
    /[a-zA-Z0-9]*\.[a-zA-Z0-9-]*/,
    regex.concat(COMPONENT_NAME_SEGMENT, /::/, /-?/, COMPONENT_NAME_SEGMENT),
    /[a-z]/
  );
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
          /* MUSTACHE_EXPRESSION added later */
        ]
      },
      {
        begin: /'/,
        end: /'/,
        contains: [
          XML_ENTITIES
          /* MUSTACHE_EXPRESSION added later */
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
    // {
    //   className: 'variable',
    //   keywords: KEYWORDS,
    //   match: /\s[\w\d-_^]+/
    // },
    // {
    //   match: /\b[a-z][a-zA-Z0-9-]+\b/,
    //   keywords: KEYWORDS,
    //   className: 'keyword'
    // },
    CURLY_NAME,
    STRING
    // NAME,
  ];
  const SUB_EXPRESSION = {
    keywords: KEYWORDS,
    begin: regex.concat(
      /\(/,
      regex.lookahead(
        regex.concat(
          // /[^)]+/,
          /\)/
        )
      )
    ),
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
      begin: regex.concat(
        /<:?/,
        regex.lookahead(regex.concat(TAG_NAME, regex.either(/\/>/, />/, /\s/)))
      ),
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
    // close tag
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
var regex = { lookahead, either, optional, concat };

// src/index.js
var glimmer2 = glimmer;
function setup(hljs) {
  registerLanguage(hljs);
  registerInjections(hljs);
}
function externalSetup(hljs) {
  let grammar = glimmer(hljs);
  registerInjections(hljs);
  return grammar;
}
function registerLanguage(hljs) {
  return hljs.registerLanguage("glimmer", glimmer);
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
  setupHBSLiteral(hljs, js);
  swapXMLForGlimmer(hljs, js);
  setupTemplateTag(hljs, js);
  hljs.registerLanguage("javascript", () => js);
  hljs.registerLanguage("glimmer-javascript", () => js);
}
function setupHBSLiteral(hljs, js) {
  let cssIndex = js.contains.findIndex((rule) => (rule == null ? void 0 : rule.begin) === "css`");
  let css = js.contains[cssIndex];
  const HBS_TEMPLATE = hljs.inherit(css, { begin: /hbs`/ });
  HBS_TEMPLATE.starts.subLanguage = "glimmer";
  js.contains.splice(cssIndex, 0, HBS_TEMPLATE);
}
function swapXMLForGlimmer(_hljs, js) {
  js.contains.flatMap((contains) => (contains == null ? void 0 : contains.contains) || contains).filter((rule) => rule.subLanguage === "xml").forEach((rule) => rule.subLanguage = "glimmer");
}
function setupTemplateTag(_hljs, js) {
  const GLIMMER_TEMPLATE_TAG = {
    begin: /<template>/,
    end: /<\/template>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (match, response) => {
      const afterMatchIndex = match[0].length + match.index;
      const nextChar = match.input[afterMatchIndex];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        nextChar === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        nextChar === ","
      ) {
        response.ignoreMatch();
        return;
      }
      if (nextChar === ">") {
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }
      let m;
      const afterMatch = match.input.substring(afterMatchIndex);
      if (m = afterMatch.match(/^\s+extends\s+/)) {
        if (m.index === 0) {
          response.ignoreMatch();
          return;
        }
      }
    }
  };
  js.contains.unshift({
    variants: [
      {
        begin: GLIMMER_TEMPLATE_TAG.begin,
        // we carefully check the opening tag to see if it truly
        // is a tag and not a false positive
        "on:begin": GLIMMER_TEMPLATE_TAG.isTrulyOpeningTag,
        end: GLIMMER_TEMPLATE_TAG.end
      }
    ],
    subLanguage: "glimmer",
    contains: [
      {
        begin: GLIMMER_TEMPLATE_TAG.begin,
        end: GLIMMER_TEMPLATE_TAG.end,
        skip: true,
        contains: ["self"]
      }
    ]
  });
}
