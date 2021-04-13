/*
Language: Ember, Glimmer, Handlebars
Website: https://emberjs.com
Category: template
Author: NullVoxPopuli
Description: Matcher for EmberJS and Glimmer.


  Regex copied from highlight.js for portability
*/

/** @type LanguageFn */
export default function glimmer(hljs) {
  // this is invoked and returned at the bottom of configureGlimmer
  function definition() {
    return {
      name: 'Ember.JS, Glimmer',
      aliases: ['glimmer', 'hbs', 'html.hbs', 'html.handlebars', 'htmlbars'],
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
        ...ANGLE_BRACKET_BLOCK,
      ],
    };
  }

  // Merged: https://github.com/emberjs/rfcs/pull/560
  const _EQUALITY_HELPERS = 'eq neq';

  // Merged: https://github.com/emberjs/rfcs/pull/561
  const _NUMERIC_COMPARISON_HELPERS = 'gt gte le lte';

  // Merged: https://github.com/emberjs/rfcs/pull/562/files
  const _LOGICAL_OPERATOR_HELPERS = 'and or not';

  // ember-truth-helpers
  const _OTHER_OPERATORS = 'not-eq xor is-array is-object is-equal';

  const _BLOCK_HELPERS = 'let each each-in if else unless';
  const _DEBUG_HELPERS = 'log debugger';
  const _INLINE_HELPERS = 'has-block concat fn component helper modifier get hash query-params';
  const _MODIFIERS = 'action on';
  const _SPECIAL = 'outlet yield';
  const _LITERALS = 'true false undefined null';

  // -------------------------------------------------

  const KEYWORDS = {
    $pattern: /\b[\w][\w-]+\b/,
    keyword: `${_SPECIAL} ${_MODIFIERS} ${_DEBUG_HELPERS}`,
    built_in: _BLOCK_HELPERS,
    function: `${_OTHER_OPERATORS} ${_INLINE_HELPERS} ${_EQUALITY_HELPERS} ${_NUMERIC_COMPARISON_HELPERS} ${_LOGICAL_OPERATOR_HELPERS}`,
    literal: _LITERALS,
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
    className: 'symbol',
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/,
  };

  const PUNCTUATION = {
    className: 'punctuation',
    match: regex.either(/\./, /\{\{\{?#?\/?/, /\}\}\}?/, /\(/, /\)/, /::/, /\|/, /~/),
  };

  const BLOCK_PARAMS = {
    begin: /as\s+\|/,
    keywords: {
      keyword: 'as',
    },
    end: /\|/,
    contains: [
      {
        className: 'template-variable',
        begin: ATTR_REGEX,
      },
    ],
  };

  const OPERATORS = {
    className: 'operator',
    match: /\=/,
  };

  const ARGUMENTS = {
    className: {
      1: 'punctuation',
      2: 'params',
    },
    match: [/@/, /[\w\d-_]+/],
  };

  const ATTRIBUTES = {
    className: {
      1: 'attribute',
      2: 'operator',
    },
    match: [/[A-Za-z0-9-_]+/, /=/],
  };

  const THIS_EXPRESSION = {
    className: {
      1: 'class',
      2: 'punctuation',
      3: 'property',
    },
    match: [/this/, /\./, /[^\s}]+/],
  };

  const ABS_NAME = {
    className: 'title',
    match: COMPONENT_NAME,
  };

  const CURLY_NAME = {
    className: 'title',
    match: CURLY_BLOCK_NAME,
    keywords: KEYWORDS,
  };

  const NUMBER = {
    className: 'number',
    match: /[\d]+((\.[\d]+))?/,
  };

  const TAG_COMMENT = {
    className: 'comment',
    begin: /\{\{!--/,
    contains: [
      {
        className: 'comment',
        match: /.+/,
      },
      {
        begin: /--\}\}/,
        endsParent: true,
      },
    ],
  };

  const STRING = {
    className: 'string',
    variants: [
      {
        begin: /"/,
        end: /"/,
        contains: [
          XML_ENTITIES,
          /* MUSTACHE_EXPRESSION added later */
        ],
      },
      {
        begin: /'/,
        end: /'/,
        contains: [
          XML_ENTITIES,
          /* MUSTACHE_EXPRESSION added later */
        ],
      },
    ],
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
    STRING,
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
      'self',
      {
        begin: /\)/,
        endsParent: true,
      },
    ],
  };

  MUSTACHE_AND_SUB_EXPRESSION_INTERNALS.push(SUB_EXPRESSION);

  const MUSTACHE_EXPRESSION = [
    {
      className: 'punctuation mustache',
      keywords: KEYWORDS,
      begin: regex.concat(/\{\{\{?#?/),
      end: /\}\}\}?/,
      contains: [
        {
          begin: /\}\}\}?/,
          endsParent: true,
        },
        ...MUSTACHE_AND_SUB_EXPRESSION_INTERNALS,
        SUB_EXPRESSION,
      ],
    },
  ];

  STRING.variants.forEach((variant) => variant.contains.push(...MUSTACHE_EXPRESSION));

  const ANGLE_BRACKET_BLOCK = [
    {
      className: 'tag',
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
        ABS_NAME,
      ],
    },
    // close tag
    {
      className: 'tag',
      begin: regex.concat(/<\/:?/, regex.lookahead(regex.concat(TAG_NAME, />/))),
      end: /\>/,
      contains: [ABS_NAME],
    },
  ];

  return definition();
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function lookahead(re) {
  return concat('(?=', re, ')');
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function optional(re) {
  return concat('(', re, ')?');
}

/**
 * @param {...(RegExp | string) } args
 * @returns {string}
 */
function concat(...args) {
  const joined = args.map((x) => source(x)).join('');

  return joined;
}

/**
 * Any of the passed expresssions may match
 *
 * Creates a huge this | this | that | that match
 * @param {(RegExp | string)[] } args
 * @returns {string}
 */
function either(...args) {
  const joined = '(' + args.map((x) => source(x)).join('|') + ')';

  return joined;
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function source(re) {
  if (!re) return null;
  if (typeof re === 'string') return re;

  return re.source;
}

const regex = { lookahead, either, optional, concat };
