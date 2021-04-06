/*!
  Highlight.js v10.7.1 (git: 779be2b9cf)
  (c) 2006-2021 Ivan Sagalaev and other contributors
  License: BSD-3-Clause
 */
var hljs = (function () {
    'use strict';

    function deepFreeze(obj) {
        if (obj instanceof Map) {
            obj.clear = obj.delete = obj.set = function () {
                throw new Error('map is read-only');
            };
        } else if (obj instanceof Set) {
            obj.add = obj.clear = obj.delete = function () {
                throw new Error('set is read-only');
            };
        }

        // Freeze self
        Object.freeze(obj);

        Object.getOwnPropertyNames(obj).forEach(function (name) {
            var prop = obj[name];

            // Freeze prop if it is an object
            if (typeof prop == 'object' && !Object.isFrozen(prop)) {
                deepFreeze(prop);
            }
        });

        return obj;
    }

    var deepFreezeEs6 = deepFreeze;
    var _default = deepFreeze;
    deepFreezeEs6.default = _default;

    
    class Response {
      /**
       * @param {CompiledMode} mode
       */
      constructor(mode) {
        // eslint-disable-next-line no-undefined
        if (mode.data === undefined) mode.data = {};

        this.data = mode.data;
        this.isMatchIgnored = false;
      }

      ignoreMatch() {
        this.isMatchIgnored = true;
      }
    }

    /**
     * @param {string} value
     * @returns {string}
     */
    function escapeHTML(value) {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }

    /**
     * performs a shallow merge of multiple objects into one
     *
     * @template T
     * @param {T} original
     * @param {Record<string,any>[]} objects
     * @returns {T} a single new object
     */
    function inherit(original, ...objects) {
      /** @type Record<string,any> */
      const result = Object.create(null);

      for (const key in original) {
        result[key] = original[key];
      }
      objects.forEach(function(obj) {
        for (const key in obj) {
          result[key] = obj[key];
        }
      });
      return /** @type {T} */ (result);
    }

    /**
     * @typedef {object} Renderer
     * @property {(text: string) => void} addText
     * @property {(node: Node) => void} openNode
     * @property {(node: Node) => void} closeNode
     * @property {() => string} value
     */

    /** @typedef {{kind?: string, sublanguage?: boolean}} Node */
    /** @typedef {{walk: (r: Renderer) => void}} Tree */
    /** */

    const SPAN_CLOSE = '</span>';

    /**
     * Determines if a node needs to be wrapped in <span>
     *
     * @param {Node} node */
    const emitsWrappingTags = (node) => {
      return !!node.kind;
    };

    /** @type {Renderer} */
    class HTMLRenderer {
      /**
       * Creates a new HTMLRenderer
       *
       * @param {Tree} parseTree - the parse tree (must support `walk` API)
       * @param {{classPrefix: string}} options
       */
      constructor(parseTree, options) {
        this.buffer = "";
        this.classPrefix = options.classPrefix;
        parseTree.walk(this);
      }

      /**
       * Adds texts to the output stream
       *
       * @param {string} text */
      addText(text) {
        this.buffer += escapeHTML(text);
      }

      /**
       * Adds a node open to the output stream (if needed)
       *
       * @param {Node} node */
      openNode(node) {
        if (!emitsWrappingTags(node)) return;

        let className = node.kind;
        if (!node.sublanguage) {
          className = `${this.classPrefix}${className}`;
        }
        this.span(className);
      }

      /**
       * Adds a node close to the output stream (if needed)
       *
       * @param {Node} node */
      closeNode(node) {
        if (!emitsWrappingTags(node)) return;

        this.buffer += SPAN_CLOSE;
      }

      /**
       * returns the accumulated buffer
      */
      value() {
        return this.buffer;
      }

      // helpers

      /**
       * Builds a span element
       *
       * @param {string} className */
      span(className) {
        this.buffer += `<span class="${className}">`;
      }
    }

    /** @typedef {{kind?: string, sublanguage?: boolean, children: Node[]} | string} Node */
    /** @typedef {{kind?: string, sublanguage?: boolean, children: Node[]} } DataNode */
    /**  */

    class TokenTree {
      constructor() {
        /** @type DataNode */
        this.rootNode = { children: [] };
        this.stack = [this.rootNode];
      }

      get top() {
        return this.stack[this.stack.length - 1];
      }

      get root() { return this.rootNode; }

      /** @param {Node} node */
      add(node) {
        this.top.children.push(node);
      }

      /** @param {string} kind */
      openNode(kind) {
        /** @type Node */
        const node = { kind, children: [] };
        this.add(node);
        this.stack.push(node);
      }

      closeNode() {
        if (this.stack.length > 1) {
          return this.stack.pop();
        }
        // eslint-disable-next-line no-undefined
        return undefined;
      }

      closeAllNodes() {
        while (this.closeNode());
      }

      toJSON() {
        return JSON.stringify(this.rootNode, null, 4);
      }

      /**
       * @typedef { import("./html_renderer").Renderer } Renderer
       * @param {Renderer} builder
       */
      walk(builder) {
        // this does not
        return this.constructor._walk(builder, this.rootNode);
        // this works
        // return TokenTree._walk(builder, this.rootNode);
      }

      /**
       * @param {Renderer} builder
       * @param {Node} node
       */
      static _walk(builder, node) {
        if (typeof node === "string") {
          builder.addText(node);
        } else if (node.children) {
          builder.openNode(node);
          node.children.forEach((child) => this._walk(builder, child));
          builder.closeNode(node);
        }
        return builder;
      }

      /**
       * @param {Node} node
       */
      static _collapse(node) {
        if (typeof node === "string") return;
        if (!node.children) return;

        if (node.children.every(el => typeof el === "string")) {
          // node.text = node.children.join("");
          // delete node.children;
          node.children = [node.children.join("")];
        } else {
          node.children.forEach((child) => {
            TokenTree._collapse(child);
          });
        }
      }
    }

    /**
      Currently this is all private API, but this is the minimal API necessary
      that an Emitter must implement to fully support the parser.

      Minimal interface:

      - addKeyword(text, kind)
      - addText(text)
      - addSublanguage(emitter, subLanguageName)
      - finalize()
      - openNode(kind)
      - closeNode()
      - closeAllNodes()
      - toHTML()

    */

    /**
     * @implements {Emitter}
     */
    class TokenTreeEmitter extends TokenTree {
      /**
       * @param {*} options
       */
      constructor(options) {
        super();
        this.options = options;
      }

      /**
       * @param {string} text
       * @param {string} kind
       */
      addKeyword(text, kind) {
        if (text === "") { return; }

        this.openNode(kind);
        this.addText(text);
        this.closeNode();
      }

      /**
       * @param {string} text
       */
      addText(text) {
        if (text === "") { return; }

        this.add(text);
      }

      /**
       * @param {Emitter & {root: DataNode}} emitter
       * @param {string} name
       */
      addSublanguage(emitter, name) {
        /** @type DataNode */
        const node = emitter.root;
        node.kind = name;
        node.sublanguage = true;
        this.add(node);
      }

      toHTML() {
        const renderer = new HTMLRenderer(this, this.options);
        return renderer.value();
      }

      finalize() {
        return true;
      }
    }

    /**
     * @param {string} value
     * @returns {RegExp}
     * */
    function escape(value) {
      return new RegExp(value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'm');
    }

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function source(re) {
      if (!re) return null;
      if (typeof re === "string") return re;

      return re.source;
    }

    /**
     * @param {...(RegExp | string) } args
     * @returns {string}
     */
    function concat(...args) {
      const joined = args.map((x) => source(x)).join("");
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
      const joined = '(' + args.map((x) => source(x)).join("|") + ")";
      return joined;
    }

    /**
     * @param {RegExp} re
     * @returns {number}
     */
    function countMatchGroups(re) {
      return (new RegExp(re.toString() + '|')).exec('').length - 1;
    }

    /**
     * Does lexeme start with a regular expression match at the beginning
     * @param {RegExp} re
     * @param {string} lexeme
     */
    function startsWith(re, lexeme) {
      const match = re && re.exec(lexeme);
      return match && match.index === 0;
    }

    // BACKREF_RE matches an open parenthesis or backreference. To avoid
    // an incorrect parse, it additionally matches the following:
    // - [...] elements, where the meaning of parentheses and escapes change
    // - other escape sequences, so we do not misparse escape sequences as
    //   interesting elements
    // - non-matching or lookahead parentheses, which do not capture. These
    //   follow the '(' with a '?'.
    const BACKREF_RE = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;

    // join logically computes regexps.join(separator), but fixes the
    // backreferences so they continue to match.
    // it also places each individual regular expression into it's own
    // match group, keeping track of the sequencing of those match groups
    // is currently an exercise for the caller. :-)
    /**
     * @param {(string | RegExp)[]} regexps
     * @param {string} separator
     * @returns {string}
     */
    function join(regexps, separator = "|") {
      let numCaptures = 0;

      return regexps.map((regex) => {
        numCaptures += 1;
        const offset = numCaptures;
        let re = source(regex);
        let out = '';

        while (re.length > 0) {
          const match = BACKREF_RE.exec(re);
          if (!match) {
            out += re;
            break;
          }
          out += re.substring(0, match.index);
          re = re.substring(match.index + match[0].length);
          if (match[0][0] === '\\' && match[1]) {
            // Adjust the backreference.
            out += '\\' + String(Number(match[1]) + offset);
          } else {
            out += match[0];
            if (match[0] === '(') {
              numCaptures++;
            }
          }
        }
        return out;
      }).map(re => `(${re})`).join(separator);
    }

    // Common regexps
    const MATCH_NOTHING_RE = /\b\B/;
    const IDENT_RE = '[a-zA-Z]\\w*';
    const UNDERSCORE_IDENT_RE = '[a-zA-Z_]\\w*';
    const NUMBER_RE = '\\b\\d+(\\.\\d+)?';
    const C_NUMBER_RE = '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
    const BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
    const RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

    /**
    * @param { Partial<Mode> & {binary?: string | RegExp} } opts
    */
    const SHEBANG = (opts = {}) => {
      const beginShebang = /^#![ ]*\//;
      if (opts.binary) {
        opts.begin = concat(
          beginShebang,
          /.*\b/,
          opts.binary,
          /\b.*/);
      }
      return inherit({
        className: 'meta',
        begin: beginShebang,
        end: /$/,
        relevance: 0,
        /** @type {ModeCallback} */
        "on:begin": (m, resp) => {
          if (m.index !== 0) resp.ignoreMatch();
        }
      }, opts);
    };

    // Common modes
    const BACKSLASH_ESCAPE = {
      begin: '\\\\[\\s\\S]', relevance: 0
    };
    const APOS_STRING_MODE = {
      className: 'string',
      begin: '\'',
      end: '\'',
      illegal: '\\n',
      contains: [BACKSLASH_ESCAPE]
    };
    const QUOTE_STRING_MODE = {
      className: 'string',
      begin: '"',
      end: '"',
      illegal: '\\n',
      contains: [BACKSLASH_ESCAPE]
    };
    const PHRASAL_WORDS_MODE = {
      begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
    };
    /**
     * Creates a comment mode
     *
     * @param {string | RegExp} begin
     * @param {string | RegExp} end
     * @param {Mode | {}} [modeOptions]
     * @returns {Partial<Mode>}
     */
    const COMMENT = function(begin, end, modeOptions = {}) {
      const mode = inherit(
        {
          className: 'comment',
          begin,
          end,
          contains: []
        },
        modeOptions
      );
      mode.contains.push({
        className: 'doctag',
        // hack to avoid the space from being included. the space is necessary to
        // match here to prevent the plain text rule below from gobbling up doctags
        begin: '[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)',
        end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
        excludeBegin: true,
        relevance: 0
      });
      const ENGLISH_WORD = either(
        // list of common 1 and 2 letter words in English
        "I",
        "a",
        "is",
        "so",
        "us",
        "to",
        "at",
        "if",
        "in",
        "it",
        "on",
        // note: this is not an exhaustive list of contractions, just popular ones
        /[A-Za-z]+['](d|ve|re|ll|t|s|n)/, // contractions - can't we'd they're let's, etc
        /[A-Za-z]+[-][a-z]+/, // `no-way`, etc.
        /[A-Za-z][a-z]{2,}/ // allow capitalized words at beginning of sentences
      );
      // looking like plain text, more likely to be a comment
      mode.contains.push(
        {
          // TODO: how to include ", (, ) without breaking grammars that use these for
          // comment delimiters?
          // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
          // ---

          // this tries to find sequences of 3 english words in a row (without any
          // "programming" type syntax) this gives us a strong signal that we've
          // TRULY found a comment - vs perhaps scanning with the wrong language.
          // It's possible to find something that LOOKS like the start of the
          // comment - but then if there is no readable text - good chance it is a
          // false match and not a comment.
          //
          // for a visual example please see:
          // https://github.com/highlightjs/highlight.js/issues/2827

          begin: concat(
            /[ ]+/, // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
            '(',
            ENGLISH_WORD,
            /[.]?[:]?([.][ ]|[ ])/,
            '){3}') // look for 3 words in a row
        }
      );
      return mode;
    };
    const C_LINE_COMMENT_MODE = COMMENT('//', '$');
    const C_BLOCK_COMMENT_MODE = COMMENT('/\\*', '\\*/');
    const HASH_COMMENT_MODE = COMMENT('#', '$');
    const NUMBER_MODE = {
      className: 'number',
      begin: NUMBER_RE,
      relevance: 0
    };
    const C_NUMBER_MODE = {
      className: 'number',
      begin: C_NUMBER_RE,
      relevance: 0
    };
    const BINARY_NUMBER_MODE = {
      className: 'number',
      begin: BINARY_NUMBER_RE,
      relevance: 0
    };
    const CSS_NUMBER_MODE = {
      className: 'number',
      begin: NUMBER_RE + '(' +
        '%|em|ex|ch|rem' +
        '|vw|vh|vmin|vmax' +
        '|cm|mm|in|pt|pc|px' +
        '|deg|grad|rad|turn' +
        '|s|ms' +
        '|Hz|kHz' +
        '|dpi|dpcm|dppx' +
        ')?',
      relevance: 0
    };
    const REGEXP_MODE = {
      // this outer rule makes sure we actually have a WHOLE regex and not simply
      // an expression such as:
      //
      //     3 / something
      //
      // (which will then blow up when regex's `illegal` sees the newline)
      begin: /(?=\/[^/\n]*\/)/,
      contains: [{
        className: 'regexp',
        begin: /\//,
        end: /\/[gimuy]*/,
        illegal: /\n/,
        contains: [
          BACKSLASH_ESCAPE,
          {
            begin: /\[/,
            end: /\]/,
            relevance: 0,
            contains: [BACKSLASH_ESCAPE]
          }
        ]
      }]
    };
    const TITLE_MODE = {
      className: 'title',
      begin: IDENT_RE,
      relevance: 0
    };
    const UNDERSCORE_TITLE_MODE = {
      className: 'title',
      begin: UNDERSCORE_IDENT_RE,
      relevance: 0
    };
    const METHOD_GUARD = {
      // excludes method names from keyword processing
      begin: '\\.\\s*' + UNDERSCORE_IDENT_RE,
      relevance: 0
    };

    /**
     * Adds end same as begin mechanics to a mode
     *
     * Your mode must include at least a single () match group as that first match
     * group is what is used for comparison
     * @param {Partial<Mode>} mode
     */
    const END_SAME_AS_BEGIN = function(mode) {
      return Object.assign(mode,
        {
          /** @type {ModeCallback} */
          'on:begin': (m, resp) => { resp.data._beginMatch = m[1]; },
          /** @type {ModeCallback} */
          'on:end': (m, resp) => { if (resp.data._beginMatch !== m[1]) resp.ignoreMatch(); }
        });
    };

    var MODES = /*#__PURE__*/Object.freeze({
        __proto__: null,
        MATCH_NOTHING_RE: MATCH_NOTHING_RE,
        IDENT_RE: IDENT_RE,
        UNDERSCORE_IDENT_RE: UNDERSCORE_IDENT_RE,
        NUMBER_RE: NUMBER_RE,
        C_NUMBER_RE: C_NUMBER_RE,
        BINARY_NUMBER_RE: BINARY_NUMBER_RE,
        RE_STARTERS_RE: RE_STARTERS_RE,
        SHEBANG: SHEBANG,
        BACKSLASH_ESCAPE: BACKSLASH_ESCAPE,
        APOS_STRING_MODE: APOS_STRING_MODE,
        QUOTE_STRING_MODE: QUOTE_STRING_MODE,
        PHRASAL_WORDS_MODE: PHRASAL_WORDS_MODE,
        COMMENT: COMMENT,
        C_LINE_COMMENT_MODE: C_LINE_COMMENT_MODE,
        C_BLOCK_COMMENT_MODE: C_BLOCK_COMMENT_MODE,
        HASH_COMMENT_MODE: HASH_COMMENT_MODE,
        NUMBER_MODE: NUMBER_MODE,
        C_NUMBER_MODE: C_NUMBER_MODE,
        BINARY_NUMBER_MODE: BINARY_NUMBER_MODE,
        CSS_NUMBER_MODE: CSS_NUMBER_MODE,
        REGEXP_MODE: REGEXP_MODE,
        TITLE_MODE: TITLE_MODE,
        UNDERSCORE_TITLE_MODE: UNDERSCORE_TITLE_MODE,
        METHOD_GUARD: METHOD_GUARD,
        END_SAME_AS_BEGIN: END_SAME_AS_BEGIN
    });

    // Grammar extensions / plugins
    // See: https://github.com/highlightjs/highlight.js/issues/2833

    // Grammar extensions allow "syntactic sugar" to be added to the grammar modes
    // without requiring any underlying changes to the compiler internals.

    // `compileMatch` being the perfect small example of now allowing a grammar
    // author to write `match` when they desire to match a single expression rather
    // than being forced to use `begin`.  The extension then just moves `match` into
    // `begin` when it runs.  Ie, no features have been added, but we've just made
    // the experience of writing (and reading grammars) a little bit nicer.

    // ------

    // TODO: We need negative look-behind support to do this properly
    /**
     * Skip a match if it has a preceding dot
     *
     * This is used for `beginKeywords` to prevent matching expressions such as
     * `bob.keyword.do()`. The mode compiler automatically wires this up as a
     * special _internal_ 'on:begin' callback for modes with `beginKeywords`
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    function skipIfhasPrecedingDot(match, response) {
      const before = match.input[match.index - 1];
      if (before === ".") {
        response.ignoreMatch();
      }
    }


    /**
     * `beginKeywords` syntactic sugar
     * @type {CompilerExt}
     */
    function beginKeywords(mode, parent) {
      if (!parent) return;
      if (!mode.beginKeywords) return;

      // for languages with keywords that include non-word characters checking for
      // a word boundary is not sufficient, so instead we check for a word boundary
      // or whitespace - this does no harm in any case since our keyword engine
      // doesn't allow spaces in keywords anyways and we still check for the boundary
      // first
      mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')(?!\\.)(?=\\b|\\s)';
      mode.__beforeBegin = skipIfhasPrecedingDot;
      mode.keywords = mode.keywords || mode.beginKeywords;
      delete mode.beginKeywords;

      // prevents double relevance, the keywords themselves provide
      // relevance, the mode doesn't need to double it
      // eslint-disable-next-line no-undefined
      if (mode.relevance === undefined) mode.relevance = 0;
    }

    /**
     * Allow `illegal` to contain an array of illegal values
     * @type {CompilerExt}
     */
    function compileIllegal(mode, _parent) {
      if (!Array.isArray(mode.illegal)) return;

      mode.illegal = either(...mode.illegal);
    }

    /**
     * `match` to match a single expression for readability
     * @type {CompilerExt}
     */
    function compileMatch(mode, _parent) {
      if (!mode.match) return;
      if (mode.begin || mode.end) throw new Error("begin & end are not supported with match");

      mode.begin = mode.match;
      delete mode.match;
    }

    /**
     * provides the default 1 relevance to all modes
     * @type {CompilerExt}
     */
    function compileRelevance(mode, _parent) {
      // eslint-disable-next-line no-undefined
      if (mode.relevance === undefined) mode.relevance = 1;
    }

    // keywords that should have no default relevance value
    const COMMON_KEYWORDS = [
      'of',
      'and',
      'for',
      'in',
      'not',
      'or',
      'if',
      'then',
      'parent', // common variable name
      'list', // common variable name
      'value' // common variable name
    ];

    const DEFAULT_KEYWORD_CLASSNAME = "keyword";

    /**
     * Given raw keywords from a language definition, compile them.
     *
     * @param {string | Record<string,string|string[]> | Array<string>} rawKeywords
     * @param {boolean} caseInsensitive
     */
    function compileKeywords(rawKeywords, caseInsensitive, className = DEFAULT_KEYWORD_CLASSNAME) {
      /** @type KeywordDict */
      const compiledKeywords = {};

      // input can be a string of keywords, an array of keywords, or a object with
      // named keys representing className (which can then point to a string or array)
      if (typeof rawKeywords === 'string') {
        compileList(className, rawKeywords.split(" "));
      } else if (Array.isArray(rawKeywords)) {
        compileList(className, rawKeywords);
      } else {
        Object.keys(rawKeywords).forEach(function(className) {
          // collapse all our objects back into the parent object
          Object.assign(
            compiledKeywords,
            compileKeywords(rawKeywords[className], caseInsensitive, className)
          );
        });
      }
      return compiledKeywords;

      // ---

      /**
       * Compiles an individual list of keywords
       *
       * Ex: "for if when while|5"
       *
       * @param {string} className
       * @param {Array<string>} keywordList
       */
      function compileList(className, keywordList) {
        if (caseInsensitive) {
          keywordList = keywordList.map(x => x.toLowerCase());
        }
        keywordList.forEach(function(keyword) {
          const pair = keyword.split('|');
          compiledKeywords[pair[0]] = [className, scoreForKeyword(pair[0], pair[1])];
        });
      }
    }

    /**
     * Returns the proper score for a given keyword
     *
     * Also takes into account comment keywords, which will be scored 0 UNLESS
     * another score has been manually assigned.
     * @param {string} keyword
     * @param {string} [providedScore]
     */
    function scoreForKeyword(keyword, providedScore) {
      // manual scores always win over common keywords
      // so you can force a score of 1 if you really insist
      if (providedScore) {
        return Number(providedScore);
      }

      return commonKeyword(keyword) ? 0 : 1;
    }

    /**
     * Determines if a given keyword is common or not
     *
     * @param {string} keyword */
    function commonKeyword(keyword) {
      return COMMON_KEYWORDS.includes(keyword.toLowerCase());
    }

    /*

    For the reasoning behind this please see:
    https://github.com/highlightjs/highlight.js/issues/2880#issuecomment-747275419

    */

    /**
     * @type {Record<string, boolean>}
     */
    const seenDeprecations = {};

    /**
     * @param {string} message
     */
    const error = (message) => {
      console.error(message);
    };

    /**
     * @param {string} message
     * @param {any} args
     */
    const warn = (message, ...args) => {
      console.log(`WARN: ${message}`, ...args);
    };

    /**
     * @param {string} version
     * @param {string} message
     */
    const deprecated = (version, message) => {
      if (seenDeprecations[`${version}/${message}`]) return;

      console.log(`Deprecated as of ${version}. ${message}`);
      seenDeprecations[`${version}/${message}`] = true;
    };

    /* eslint-disable no-throw-literal */

    const MultiClassError = new Error();

    /**
     *
     * @param {CompiledMode} mode
     */
    function MultiClass(mode) {
      if (!Array.isArray(mode.begin)) return;

      if (mode.skip || mode.excludeBegin || mode.returnBegin) {
        error("skip, excludeBegin, returnBegin not compatible with multi-class");
        throw MultiClassError;
      }

      if (typeof mode.className !== "object") {
        error("className must be object");
        throw MultiClassError;
      }

      const items = mode.begin.map(x => concat("(", x, ")"));
      mode.begin = concat(...items);
      mode.isMultiClass = true;
    }

    // compilation

    /**
     * Compiles a language definition result
     *
     * Given the raw result of a language definition (Language), compiles this so
     * that it is ready for highlighting code.
     * @param {Language} language
     * @param {{plugins: HLJSPlugin[]}} opts
     * @returns {CompiledLanguage}
     */
    function compileLanguage(language, { plugins }) {
      /**
       * Builds a regex with the case sensativility of the current language
       *
       * @param {RegExp | string} value
       * @param {boolean} [global]
       */
      function langRe(value, global) {
        return new RegExp(
          source(value),
          'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')
        );
      }

      /**
        Stores multiple regular expressions and allows you to quickly search for
        them all in a string simultaneously - returning the first match.  It does
        this by creating a huge (a|b|c) regex - each individual item wrapped with ()
        and joined by `|` - using match groups to track position.  When a match is
        found checking which position in the array has content allows us to figure
        out which of the original regexes / match groups triggered the match.

        The match object itself (the result of `Regex.exec`) is returned but also
        enhanced by merging in any meta-data that was registered with the regex.
        This is how we keep track of which mode matched, and what type of rule
        (`illegal`, `begin`, end, etc).
      */
      class MultiRegex {
        constructor() {
          this.matchIndexes = {};
          // @ts-ignore
          this.regexes = [];
          this.matchAt = 1;
          this.position = 0;
        }

        // @ts-ignore
        addRule(re, opts) {
          opts.position = this.position++;
          // @ts-ignore
          this.matchIndexes[this.matchAt] = opts;
          this.regexes.push([opts, re]);
          this.matchAt += countMatchGroups(re) + 1;
        }

        compile() {
          if (this.regexes.length === 0) {
            // avoids the need to check length every time exec is called
            // @ts-ignore
            this.exec = () => null;
          }
          const terminators = this.regexes.map(el => el[1]);
          this.matcherRe = langRe(join(terminators), true);
          this.lastIndex = 0;
        }

        /** @param {string} s */
        exec(s) {
          this.matcherRe.lastIndex = this.lastIndex;
          const match = this.matcherRe.exec(s);
          if (!match) { return null; }

          // eslint-disable-next-line no-undefined
          const i = match.findIndex((el, i) => i > 0 && el !== undefined);
          // @ts-ignore
          const matchData = this.matchIndexes[i];
          // trim off any earlier non-relevant match groups (ie, the other regex
          // match groups that make up the multi-matcher)
          match.splice(0, i);

          return Object.assign(match, matchData);
        }
      }

      /*
        Created to solve the key deficiently with MultiRegex - there is no way to
        test for multiple matches at a single location.  Why would we need to do
        that?  In the future a more dynamic engine will allow certain matches to be
        ignored.  An example: if we matched say the 3rd regex in a large group but
        decided to ignore it - we'd need to started testing again at the 4th
        regex... but MultiRegex itself gives us no real way to do that.

        So what this class creates MultiRegexs on the fly for whatever search
        position they are needed.

        NOTE: These additional MultiRegex objects are created dynamically.  For most
        grammars most of the time we will never actually need anything more than the
        first MultiRegex - so this shouldn't have too much overhead.

        Say this is our search group, and we match regex3, but wish to ignore it.

          regex1 | regex2 | regex3 | regex4 | regex5    ' ie, startAt = 0

        What we need is a new MultiRegex that only includes the remaining
        possibilities:

          regex4 | regex5                               ' ie, startAt = 3

        This class wraps all that complexity up in a simple API... `startAt` decides
        where in the array of expressions to start doing the matching. It
        auto-increments, so if a match is found at position 2, then startAt will be
        set to 3.  If the end is reached startAt will return to 0.

        MOST of the time the parser will be setting startAt manually to 0.
      */
      class ResumableMultiRegex {
        constructor() {
          // @ts-ignore
          this.rules = [];
          // @ts-ignore
          this.multiRegexes = [];
          this.count = 0;

          this.lastIndex = 0;
          this.regexIndex = 0;
        }

        // @ts-ignore
        getMatcher(index) {
          if (this.multiRegexes[index]) return this.multiRegexes[index];

          const matcher = new MultiRegex();
          this.rules.slice(index).forEach(([re, opts]) => matcher.addRule(re, opts));
          matcher.compile();
          this.multiRegexes[index] = matcher;
          return matcher;
        }

        resumingScanAtSamePosition() {
          return this.regexIndex !== 0;
        }

        considerAll() {
          this.regexIndex = 0;
        }

        // @ts-ignore
        addRule(re, opts) {
          this.rules.push([re, opts]);
          if (opts.type === "begin") this.count++;
        }

        /** @param {string} s */
        exec(s) {
          const m = this.getMatcher(this.regexIndex);
          m.lastIndex = this.lastIndex;
          let result = m.exec(s);

          // The following is because we have no easy way to say "resume scanning at the
          // existing position but also skip the current rule ONLY". What happens is
          // all prior rules are also skipped which can result in matching the wrong
          // thing. Example of matching "booger":

          // our matcher is [string, "booger", number]
          //
          // ....booger....

          // if "booger" is ignored then we'd really need a regex to scan from the
          // SAME position for only: [string, number] but ignoring "booger" (if it
          // was the first match), a simple resume would scan ahead who knows how
          // far looking only for "number", ignoring potential string matches (or
          // future "booger" matches that might be valid.)

          // So what we do: We execute two matchers, one resuming at the same
          // position, but the second full matcher starting at the position after:

          //     /--- resume first regex match here (for [number])
          //     |/---- full match here for [string, "booger", number]
          //     vv
          // ....booger....

          // Which ever results in a match first is then used. So this 3-4 step
          // process essentially allows us to say "match at this position, excluding
          // a prior rule that was ignored".
          //
          // 1. Match "booger" first, ignore. Also proves that [string] does non match.
          // 2. Resume matching for [number]
          // 3. Match at index + 1 for [string, "booger", number]
          // 4. If #2 and #3 result in matches, which came first?
          if (this.resumingScanAtSamePosition()) {
            if (result && result.index === this.lastIndex) ; else { // use the second matcher result
              const m2 = this.getMatcher(0);
              m2.lastIndex = this.lastIndex + 1;
              result = m2.exec(s);
            }
          }

          if (result) {
            this.regexIndex += result.position + 1;
            if (this.regexIndex === this.count) {
              // wrap-around to considering all matches again
              this.considerAll();
            }
          }

          return result;
        }
      }

      /**
       * Given a mode, builds a huge ResumableMultiRegex that can be used to walk
       * the content and find matches.
       *
       * @param {CompiledMode} mode
       * @returns {ResumableMultiRegex}
       */
      function buildModeRegex(mode) {
        const mm = new ResumableMultiRegex();

        mode.contains.forEach(term => mm.addRule(term.begin, { rule: term, type: "begin" }));

        if (mode.terminatorEnd) {
          mm.addRule(mode.terminatorEnd, { type: "end" });
        }
        if (mode.illegal) {
          mm.addRule(mode.illegal, { type: "illegal" });
        }

        return mm;
      }

      /** skip vs abort vs ignore
       *
       * @skip   - The mode is still entered and exited normally (and contains rules apply),
       *           but all content is held and added to the parent buffer rather than being
       *           output when the mode ends.  Mostly used with `sublanguage` to build up
       *           a single large buffer than can be parsed by sublanguage.
       *
       *             - The mode begin ands ends normally.
       *             - Content matched is added to the parent mode buffer.
       *             - The parser cursor is moved forward normally.
       *
       * @abort  - A hack placeholder until we have ignore.  Aborts the mode (as if it
       *           never matched) but DOES NOT continue to match subsequent `contains`
       *           modes.  Abort is bad/suboptimal because it can result in modes
       *           farther down not getting applied because an earlier rule eats the
       *           content but then aborts.
       *
       *             - The mode does not begin.
       *             - Content matched by `begin` is added to the mode buffer.
       *             - The parser cursor is moved forward accordingly.
       *
       * @ignore - Ignores the mode (as if it never matched) and continues to match any
       *           subsequent `contains` modes.  Ignore isn't technically possible with
       *           the current parser implementation.
       *
       *             - The mode does not begin.
       *             - Content matched by `begin` is ignored.
       *             - The parser cursor is not moved forward.
       */

      /**
       * Compiles an individual mode
       *
       * This can raise an error if the mode contains certain detectable known logic
       * issues.
       * @param {Mode} mode
       * @param {CompiledMode | null} [parent]
       * @returns {CompiledMode | never}
       */
      function compileMode(mode, parent) {
        const cmode = /** @type CompiledMode */ (mode);
        if (mode.isCompiled) return cmode;

        [
          // do this early so compiler extensions generally don't have to worry about
          // the distinction between match/begin
          compileMatch,
          MultiClass
        ].forEach(ext => ext(mode, parent));

        language.compilerExtensions.forEach(ext => ext(mode, parent));

        // __beforeBegin is considered private API, internal use only
        mode.__beforeBegin = null;

        [
          beginKeywords,
          // do this later so compiler extensions that come earlier have access to the
          // raw array if they wanted to perhaps manipulate it, etc.
          compileIllegal,
          // default to 1 relevance if not specified
          compileRelevance
        ].forEach(ext => ext(mode, parent));

        mode.isCompiled = true;

        let keywordPattern = null;
        if (typeof mode.keywords === "object" && mode.keywords.$pattern) {
          // we need a copy because keywords might be compiled multiple times
          // so we can't go deleting $pattern from the original on the first
          // pass
          mode.keywords = Object.assign({}, mode.keywords);
          keywordPattern = mode.keywords.$pattern;
          delete mode.keywords.$pattern;
        }

        if (mode.keywords) {
          mode.keywords = compileKeywords(mode.keywords, language.case_insensitive);
        }

        // both are not allowed
        if (mode.lexemes && keywordPattern) {
          throw new Error("ERR: Prefer `keywords.$pattern` to `mode.lexemes`, BOTH are not allowed. (see mode reference) ");
        }

        // `mode.lexemes` was the old standard before we added and now recommend
        // using `keywords.$pattern` to pass the keyword pattern
        keywordPattern = keywordPattern || mode.lexemes || /\w+/;
        cmode.keywordPatternRe = langRe(keywordPattern, true);

        if (parent) {
          if (!mode.begin) mode.begin = /\B|\b/;
          cmode.beginRe = langRe(mode.begin);
          if (mode.endSameAsBegin) mode.end = mode.begin;
          if (!mode.end && !mode.endsWithParent) mode.end = /\B|\b/;
          if (mode.end) cmode.endRe = langRe(mode.end);
          cmode.terminatorEnd = source(mode.end) || '';
          if (mode.endsWithParent && parent.terminatorEnd) {
            cmode.terminatorEnd += (mode.end ? '|' : '') + parent.terminatorEnd;
          }
        }
        if (mode.illegal) cmode.illegalRe = langRe(/** @type {RegExp | string} */ (mode.illegal));
        if (!mode.contains) mode.contains = [];

        mode.contains = [].concat(...mode.contains.map(function(c) {
          return expandOrCloneMode(c === 'self' ? mode : c);
        }));
        mode.contains.forEach(function(c) { compileMode(/** @type Mode */ (c), cmode); });

        if (mode.starts) {
          compileMode(mode.starts, parent);
        }

        cmode.matcher = buildModeRegex(cmode);
        return cmode;
      }

      if (!language.compilerExtensions) language.compilerExtensions = [];

      // self is not valid at the top-level
      if (language.contains && language.contains.includes('self')) {
        throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
      }

      // we need a null object, which inherit will guarantee
      language.classNameAliases = inherit(language.classNameAliases || {});

      return compileMode(/** @type Mode */ (language));
    }

    /**
     * Determines if a mode has a dependency on it's parent or not
     *
     * If a mode does have a parent dependency then often we need to clone it if
     * it's used in multiple places so that each copy points to the correct parent,
     * where-as modes without a parent can often safely be re-used at the bottom of
     * a mode chain.
     *
     * @param {Mode | null} mode
     * @returns {boolean} - is there a dependency on the parent?
     * */
    function dependencyOnParent(mode) {
      if (!mode) return false;

      return mode.endsWithParent || dependencyOnParent(mode.starts);
    }

    /**
     * Expands a mode or clones it if necessary
     *
     * This is necessary for modes with parental dependenceis (see notes on
     * `dependencyOnParent`) and for nodes that have `variants` - which must then be
     * exploded into their own individual modes at compile time.
     *
     * @param {Mode} mode
     * @returns {Mode | Mode[]}
     * */
    function expandOrCloneMode(mode) {
      if (mode.variants && !mode.cachedVariants) {
        mode.cachedVariants = mode.variants.map(function(variant) {
          return inherit(mode, { variants: null }, variant);
        });
      }

      // EXPAND
      // if we have variants then essentially "replace" the mode with the variants
      // this happens in compileMode, where this function is called from
      if (mode.cachedVariants) {
        return mode.cachedVariants;
      }

      // CLONE
      // if we have dependencies on parents then we need a unique
      // instance of ourselves, so we can be reused with many
      // different parents without issue
      if (dependencyOnParent(mode)) {
        return inherit(mode, { starts: mode.starts ? inherit(mode.starts) : null });
      }

      if (Object.isFrozen(mode)) {
        return inherit(mode);
      }

      // no special dependency issues, just return ourselves
      return mode;
    }

    var version = "10.7.1";

    // @ts-nocheck

    function hasValueOrEmptyAttribute(value) {
      return Boolean(value || value === "");
    }

    function BuildVuePlugin(hljs) {
      const Component = {
        props: ["language", "code", "autodetect"],
        data: function() {
          return {
            detectedLanguage: "",
            unknownLanguage: false
          };
        },
        computed: {
          className() {
            if (this.unknownLanguage) return "";

            return "hljs " + this.detectedLanguage;
          },
          highlighted() {
            // no idea what language to use, return raw code
            if (!this.autoDetect && !hljs.getLanguage(this.language)) {
              console.warn(`The language "${this.language}" you specified could not be found.`);
              this.unknownLanguage = true;
              return escapeHTML(this.code);
            }

            let result = {};
            if (this.autoDetect) {
              result = hljs.highlightAuto(this.code);
              this.detectedLanguage = result.language;
            } else {
              result = hljs.highlight(this.language, this.code, this.ignoreIllegals);
              this.detectedLanguage = this.language;
            }
            return result.value;
          },
          autoDetect() {
            return !this.language || hasValueOrEmptyAttribute(this.autodetect);
          },
          ignoreIllegals() {
            return true;
          }
        },
        // this avoids needing to use a whole Vue compilation pipeline just
        // to build Highlight.js
        render(createElement) {
          return createElement("pre", {}, [
            createElement("code", {
              class: this.className,
              domProps: { innerHTML: this.highlighted }
            })
          ]);
        }
        // template: `<pre><code :class="className" v-html="highlighted"></code></pre>`
      };

      const VuePlugin = {
        install(Vue) {
          Vue.component('highlightjs', Component);
        }
      };

      return { Component, VuePlugin };
    }

    /* plugin itself */

    /** @type {HLJSPlugin} */
    const mergeHTMLPlugin = {
      "after:highlightElement": ({ el, result, text }) => {
        const originalStream = nodeStream(el);
        if (!originalStream.length) return;

        const resultNode = document.createElement('div');
        resultNode.innerHTML = result.value;
        result.value = mergeStreams(originalStream, nodeStream(resultNode), text);
      }
    };

    /* Stream merging support functions */

    /**
     * @typedef Event
     * @property {'start'|'stop'} event
     * @property {number} offset
     * @property {Node} node
     */

    /**
     * @param {Node} node
     */
    function tag(node) {
      return node.nodeName.toLowerCase();
    }

    /**
     * @param {Node} node
     */
    function nodeStream(node) {
      /** @type Event[] */
      const result = [];
      (function _nodeStream(node, offset) {
        for (let child = node.firstChild; child; child = child.nextSibling) {
          if (child.nodeType === 3) {
            offset += child.nodeValue.length;
          } else if (child.nodeType === 1) {
            result.push({
              event: 'start',
              offset: offset,
              node: child
            });
            offset = _nodeStream(child, offset);
            // Prevent void elements from having an end tag that would actually
            // double them in the output. There are more void elements in HTML
            // but we list only those realistically expected in code display.
            if (!tag(child).match(/br|hr|img|input/)) {
              result.push({
                event: 'stop',
                offset: offset,
                node: child
              });
            }
          }
        }
        return offset;
      })(node, 0);
      return result;
    }

    /**
     * @param {any} original - the original stream
     * @param {any} highlighted - stream of the highlighted source
     * @param {string} value - the original source itself
     */
    function mergeStreams(original, highlighted, value) {
      let processed = 0;
      let result = '';
      const nodeStack = [];

      function selectStream() {
        if (!original.length || !highlighted.length) {
          return original.length ? original : highlighted;
        }
        if (original[0].offset !== highlighted[0].offset) {
          return (original[0].offset < highlighted[0].offset) ? original : highlighted;
        }

        /*
        To avoid starting the stream just before it should stop the order is
        ensured that original always starts first and closes last:

        if (event1 == 'start' && event2 == 'start')
          return original;
        if (event1 == 'start' && event2 == 'stop')
          return highlighted;
        if (event1 == 'stop' && event2 == 'start')
          return original;
        if (event1 == 'stop' && event2 == 'stop')
          return highlighted;

        ... which is collapsed to:
        */
        return highlighted[0].event === 'start' ? original : highlighted;
      }

      /**
       * @param {Node} node
       */
      function open(node) {
        /** @param {Attr} attr */
        function attributeString(attr) {
          return ' ' + attr.nodeName + '="' + escapeHTML(attr.value) + '"';
        }
        // @ts-ignore
        result += '<' + tag(node) + [].map.call(node.attributes, attributeString).join('') + '>';
      }

      /**
       * @param {Node} node
       */
      function close(node) {
        result += '</' + tag(node) + '>';
      }

      /**
       * @param {Event} event
       */
      function render(event) {
        (event.event === 'start' ? open : close)(event.node);
      }

      while (original.length || highlighted.length) {
        let stream = selectStream();
        result += escapeHTML(value.substring(processed, stream[0].offset));
        processed = stream[0].offset;
        if (stream === original) {
          /*
          On any opening or closing tag of the original markup we first close
          the entire highlighted node stack, then render the original tag along
          with all the following original tags at the same offset and then
          reopen all the tags on the highlighted stack.
          */
          nodeStack.reverse().forEach(close);
          do {
            render(stream.splice(0, 1)[0]);
            stream = selectStream();
          } while (stream === original && stream.length && stream[0].offset === processed);
          nodeStack.reverse().forEach(open);
        } else {
          if (stream[0].event === 'start') {
            nodeStack.push(stream[0].node);
          } else {
            nodeStack.pop();
          }
          render(stream.splice(0, 1)[0]);
        }
      }
      return result + escapeHTML(value.substr(processed));
    }

    /*
    Syntax highlighting with language autodetection.
    https://highlightjs.org/
    */

    const escape$1 = escapeHTML;
    const inherit$1 = inherit;
    const NO_MATCH = Symbol("nomatch");

    /**
     * @param {any} hljs - object that is extended (legacy)
     * @returns {HLJSApi}
     */
    const HLJS = function(hljs) {
      // Global internal variables used within the highlight.js library.
      /** @type {Record<string, Language>} */
      const languages = Object.create(null);
      /** @type {Record<string, string>} */
      const aliases = Object.create(null);
      /** @type {HLJSPlugin[]} */
      const plugins = [];

      // safe/production mode - swallows more errors, tries to keep running
      // even if a single syntax or parse hits a fatal error
      let SAFE_MODE = true;
      const fixMarkupRe = /(^(<[^>]+>|\t|)+|\n)/gm;
      const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
      /** @type {Language} */
      const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: 'Plain text', contains: [] };

      // Global options used when within external APIs. This is modified when
      // calling the `hljs.configure` function.
      /** @type HLJSOptions */
      let options = {
        noHighlightRe: /^(no-?highlight)$/i,
        languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
        classPrefix: 'hljs-',
        tabReplace: null,
        useBR: false,
        languages: null,
        // beta configuration options, subject to change, welcome to discuss
        // https://github.com/highlightjs/highlight.js/issues/1086
        __emitter: TokenTreeEmitter
      };

      /* Utility functions */

      /**
       * Tests a language name to see if highlighting should be skipped
       * @param {string} languageName
       */
      function shouldNotHighlight(languageName) {
        return options.noHighlightRe.test(languageName);
      }

      /**
       * @param {HighlightedHTMLElement} block - the HTML element to determine language for
       */
      function blockLanguage(block) {
        let classes = block.className + ' ';

        classes += block.parentNode ? block.parentNode.className : '';

        // language-* takes precedence over non-prefixed class names.
        const match = options.languageDetectRe.exec(classes);
        if (match) {
          const language = getLanguage(match[1]);
          if (!language) {
            warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
            warn("Falling back to no-highlight mode for this block.", block);
          }
          return language ? match[1] : 'no-highlight';
        }

        return classes
          .split(/\s+/)
          .find((_class) => shouldNotHighlight(_class) || getLanguage(_class));
      }

      /**
       * Core highlighting function.
       *
       * OLD API
       * highlight(lang, code, ignoreIllegals, continuation)
       *
       * NEW API
       * highlight(code, {lang, ignoreIllegals})
       *
       * @param {string} codeOrlanguageName - the language to use for highlighting
       * @param {string | HighlightOptions} optionsOrCode - the code to highlight
       * @param {boolean} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
       * @param {CompiledMode} [continuation] - current continuation mode, if any
       *
       * @returns {HighlightResult} Result - an object that represents the result
       * @property {string} language - the language name
       * @property {number} relevance - the relevance score
       * @property {string} value - the highlighted HTML code
       * @property {string} code - the original raw code
       * @property {CompiledMode} top - top of the current mode stack
       * @property {boolean} illegal - indicates whether any illegal matches were found
      */
      function highlight(codeOrlanguageName, optionsOrCode, ignoreIllegals, continuation) {
        let code = "";
        let languageName = "";
        if (typeof optionsOrCode === "object") {
          code = codeOrlanguageName;
          ignoreIllegals = optionsOrCode.ignoreIllegals;
          languageName = optionsOrCode.language;
          // continuation not supported at all via the new API
          // eslint-disable-next-line no-undefined
          continuation = undefined;
        } else {
          // old API
          deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
          deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
          languageName = codeOrlanguageName;
          code = optionsOrCode;
        }

        /** @type {BeforeHighlightContext} */
        const context = {
          code,
          language: languageName
        };
        // the plugin can change the desired language or the code to be highlighted
        // just be changing the object it was passed
        fire("before:highlight", context);

        // a before plugin can usurp the result completely by providing it's own
        // in which case we don't even need to call highlight
        const result = context.result
          ? context.result
          : _highlight(context.language, context.code, ignoreIllegals, continuation);

        result.code = context.code;
        // the plugin can change anything in result to suite it
        fire("after:highlight", result);

        return result;
      }

      /**
       * private highlight that's used internally and does not fire callbacks
       *
       * @param {string} languageName - the language to use for highlighting
       * @param {string} codeToHighlight - the code to highlight
       * @param {boolean?} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
       * @param {CompiledMode?} [continuation] - current continuation mode, if any
       * @returns {HighlightResult} - result of the highlight operation
      */
      function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
        /**
         * Return keyword data if a match is a keyword
         * @param {CompiledMode} mode - current mode
         * @param {RegExpMatchArray} match - regexp match data
         * @returns {KeywordData | false}
         */
        function keywordData(mode, match) {
          const matchText = language.case_insensitive ? match[0].toLowerCase() : match[0];
          return Object.prototype.hasOwnProperty.call(mode.keywords, matchText) && mode.keywords[matchText];
        }

        function processKeywords() {
          if (!top.keywords) {
            emitter.addText(modeBuffer);
            return;
          }

          let lastIndex = 0;
          top.keywordPatternRe.lastIndex = 0;
          let match = top.keywordPatternRe.exec(modeBuffer);
          let buf = "";

          while (match) {
            buf += modeBuffer.substring(lastIndex, match.index);
            const data = keywordData(top, match);
            if (data) {
              const [kind, keywordRelevance] = data;
              emitter.addText(buf);
              buf = "";

              relevance += keywordRelevance;
              if (kind.startsWith("_")) {
                // _ implied for relevance only, do not highlight
                // by applying a class name
                buf += match[0];
              } else {
                const cssClass = language.classNameAliases[kind] || kind;
                emitter.addKeyword(match[0], cssClass);
              }
            } else {
              buf += match[0];
            }
            lastIndex = top.keywordPatternRe.lastIndex;
            match = top.keywordPatternRe.exec(modeBuffer);
          }
          buf += modeBuffer.substr(lastIndex);
          emitter.addText(buf);
        }

        function processSubLanguage() {
          if (modeBuffer === "") return;
          /** @type HighlightResult */
          let result = null;

          if (typeof top.subLanguage === 'string') {
            if (!languages[top.subLanguage]) {
              emitter.addText(modeBuffer);
              return;
            }
            result = _highlight(top.subLanguage, modeBuffer, true, continuations[top.subLanguage]);
            continuations[top.subLanguage] = /** @type {CompiledMode} */ (result.top);
          } else {
            result = highlightAuto(modeBuffer, top.subLanguage.length ? top.subLanguage : null);
          }

          // Counting embedded language score towards the host language may be disabled
          // with zeroing the containing mode relevance. Use case in point is Markdown that
          // allows XML everywhere and makes every XML snippet to have a much larger Markdown
          // score.
          if (top.relevance > 0) {
            relevance += result.relevance;
          }
          emitter.addSublanguage(result.emitter, result.language);
        }

        function processBuffer() {
          if (top.subLanguage != null) {
            processSubLanguage();
          } else {
            processKeywords();
          }
          modeBuffer = '';
        }

        /**
         * @param {CompiledMode} mode
         * @param {RegExpMatchArray} match
         */
        function emitMultiClass(mode, match) {
          let i = 1;
          while (match[i]) {
            const klass = language.classNameAliases[mode.className[i]] || mode.className[i];
            const text = match[i];
            if (klass) { emitter.addKeyword(text, klass); } else { emitter.addText(text); }
            i++;
          }
        }

        /**
         * @param {CompiledMode} mode - new mode to start
         * @param {RegExpMatchArray} match
         */
        function startNewMode(mode, match) {
          if (mode.isMultiClass) {
            // at this point modeBuffer should just be the match
            modeBuffer = "";
            emitMultiClass(mode, match);
          } else if (mode.className) {
            emitter.openNode(language.classNameAliases[mode.className] || mode.className);
          }
          top = Object.create(mode, { parent: { value: top } });
          return top;
        }

        /**
         * @param {CompiledMode } mode - the mode to potentially end
         * @param {RegExpMatchArray} match - the latest match
         * @param {string} matchPlusRemainder - match plus remainder of content
         * @returns {CompiledMode | void} - the next mode, or if void continue on in current mode
         */
        function endOfMode(mode, match, matchPlusRemainder) {
          let matched = startsWith(mode.endRe, matchPlusRemainder);

          if (matched) {
            if (mode["on:end"]) {
              const resp = new Response(mode);
              mode["on:end"](match, resp);
              if (resp.isMatchIgnored) matched = false;
            }

            if (matched) {
              while (mode.endsParent && mode.parent) {
                mode = mode.parent;
              }
              return mode;
            }
          }
          // even if on:end fires an `ignore` it's still possible
          // that we might trigger the end node because of a parent mode
          if (mode.endsWithParent) {
            return endOfMode(mode.parent, match, matchPlusRemainder);
          }
        }

        /**
         * Handle matching but then ignoring a sequence of text
         *
         * @param {string} lexeme - string containing full match text
         */
        function doIgnore(lexeme) {
          if (top.matcher.regexIndex === 0) {
            // no more regexs to potentially match here, so we move the cursor forward one
            // space
            modeBuffer += lexeme[0];
            return 1;
          } else {
            // no need to move the cursor, we still have additional regexes to try and
            // match at this very spot
            resumeScanAtSamePosition = true;
            return 0;
          }
        }

        /**
         * Handle the start of a new potential mode match
         *
         * @param {EnhancedMatch} match - the current match
         * @returns {number} how far to advance the parse cursor
         */
        function doBeginMatch(match) {
          const lexeme = match[0];
          const newMode = match.rule;

          const resp = new Response(newMode);
          // first internal before callbacks, then the public ones
          const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
          for (const cb of beforeCallbacks) {
            if (!cb) continue;
            cb(match, resp);
            if (resp.isMatchIgnored) return doIgnore(lexeme);
          }

          if (newMode && newMode.endSameAsBegin) {
            newMode.endRe = escape(lexeme);
          }

          if (newMode.skip) {
            modeBuffer += lexeme;
          } else {
            if (newMode.excludeBegin) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (!newMode.returnBegin && !newMode.excludeBegin) {
              modeBuffer = lexeme;
            }
          }
          startNewMode(newMode, match);
          // if (mode["after:begin"]) {
          //   let resp = new Response(mode);
          //   mode["after:begin"](match, resp);
          // }
          return newMode.returnBegin ? 0 : lexeme.length;
        }

        /**
         * Handle the potential end of mode
         *
         * @param {RegExpMatchArray} match - the current match
         */
        function doEndMatch(match) {
          const lexeme = match[0];
          const matchPlusRemainder = codeToHighlight.substr(match.index);

          const endMode = endOfMode(top, match, matchPlusRemainder);
          if (!endMode) { return NO_MATCH; }

          const origin = top;
          if (origin.skip) {
            modeBuffer += lexeme;
          } else {
            if (!(origin.returnEnd || origin.excludeEnd)) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (origin.excludeEnd) {
              modeBuffer = lexeme;
            }
          }
          do {
            if (top.className && !top.isMultiClass) {
              emitter.closeNode();
            }
            if (!top.skip && !top.subLanguage) {
              relevance += top.relevance;
            }
            top = top.parent;
          } while (top !== endMode.parent);
          if (endMode.starts) {
            if (endMode.endSameAsBegin) {
              endMode.starts.endRe = endMode.endRe;
            }
            startNewMode(endMode.starts, match);
          }
          return origin.returnEnd ? 0 : lexeme.length;
        }

        function processContinuations() {
          const list = [];
          for (let current = top; current !== language; current = current.parent) {
            if (current.className) {
              list.unshift(current.className);
            }
          }
          list.forEach(item => emitter.openNode(item));
        }

        /** @type {{type?: MatchType, index?: number, rule?: Mode}}} */
        let lastMatch = {};

        /**
         *  Process an individual match
         *
         * @param {string} textBeforeMatch - text preceeding the match (since the last match)
         * @param {EnhancedMatch} [match] - the match itself
         */
        function processLexeme(textBeforeMatch, match) {
          const lexeme = match && match[0];

          // add non-matched text to the current mode buffer
          modeBuffer += textBeforeMatch;

          if (lexeme == null) {
            processBuffer();
            return 0;
          }

          // we've found a 0 width match and we're stuck, so we need to advance
          // this happens when we have badly behaved rules that have optional matchers to the degree that
          // sometimes they can end up matching nothing at all
          // Ref: https://github.com/highlightjs/highlight.js/issues/2140
          if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
            // spit the "skipped" character that our regex choked on back into the output sequence
            modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
            if (!SAFE_MODE) {
              /** @type {AnnotatedError} */
              const err = new Error('0 width match regex');
              err.languageName = languageName;
              err.badRule = lastMatch.rule;
              throw err;
            }
            return 1;
          }
          lastMatch = match;

          if (match.type === "begin") {
            return doBeginMatch(match);
          } else if (match.type === "illegal" && !ignoreIllegals) {
            // illegal match, we do not continue processing
            /** @type {AnnotatedError} */
            const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.className || '<unnamed>') + '"');
            err.mode = top;
            throw err;
          } else if (match.type === "end") {
            const processed = doEndMatch(match);
            if (processed !== NO_MATCH) {
              return processed;
            }
          }

          // edge case for when illegal matches $ (end of line) which is technically
          // a 0 width match but not a begin/end match so it's not caught by the
          // first handler (when ignoreIllegals is true)
          if (match.type === "illegal" && lexeme === "") {
            // advance so we aren't stuck in an infinite loop
            return 1;
          }

          // infinite loops are BAD, this is a last ditch catch all. if we have a
          // decent number of iterations yet our index (cursor position in our
          // parsing) still 3x behind our index then something is very wrong
          // so we bail
          if (iterations > 100000 && iterations > match.index * 3) {
            const err = new Error('potential infinite loop, way more iterations than matches');
            throw err;
          }

          /*
          Why might be find ourselves here?  Only one occasion now.  An end match that was
          triggered but could not be completed.  When might this happen?  When an `endSameasBegin`
          rule sets the end rule to a specific match.  Since the overall mode termination rule that's
          being used to scan the text isn't recompiled that means that any match that LOOKS like
          the end (but is not, because it is not an exact match to the beginning) will
          end up here.  A definite end match, but when `doEndMatch` tries to "reapply"
          the end rule and fails to match, we wind up here, and just silently ignore the end.

          This causes no real harm other than stopping a few times too many.
          */

          modeBuffer += lexeme;
          return lexeme.length;
        }

        const language = getLanguage(languageName);
        if (!language) {
          error(LANGUAGE_NOT_FOUND.replace("{}", languageName));
          throw new Error('Unknown language: "' + languageName + '"');
        }

        const md = compileLanguage(language, { plugins });
        let result = '';
        /** @type {CompiledMode} */
        let top = continuation || md;
        /** @type Record<string,CompiledMode> */
        const continuations = {}; // keep continuations for sub-languages
        const emitter = new options.__emitter(options);
        processContinuations();
        let modeBuffer = '';
        let relevance = 0;
        let index = 0;
        let iterations = 0;
        let resumeScanAtSamePosition = false;

        try {
          top.matcher.considerAll();

          for (;;) {
            iterations++;
            if (resumeScanAtSamePosition) {
              // only regexes not matched previously will now be
              // considered for a potential match
              resumeScanAtSamePosition = false;
            } else {
              top.matcher.considerAll();
            }
            top.matcher.lastIndex = index;

            const match = top.matcher.exec(codeToHighlight);
            // console.log("match", match[0], match.rule && match.rule.begin)

            if (!match) break;

            const beforeMatch = codeToHighlight.substring(index, match.index);
            const processedCount = processLexeme(beforeMatch, match);
            index = match.index + processedCount;
          }
          processLexeme(codeToHighlight.substr(index));
          emitter.closeAllNodes();
          emitter.finalize();
          result = emitter.toHTML();

          return {
            // avoid possible breakage with v10 clients expecting
            // this to always be an integer
            relevance: Math.floor(relevance),
            value: result,
            language: languageName,
            illegal: false,
            emitter: emitter,
            top: top
          };
        } catch (err) {
          if (err.message && err.message.includes('Illegal')) {
            return {
              illegal: true,
              illegalBy: {
                msg: err.message,
                context: codeToHighlight.slice(index - 100, index + 100),
                mode: err.mode
              },
              sofar: result,
              relevance: 0,
              value: escape$1(codeToHighlight),
              emitter: emitter
            };
          } else if (SAFE_MODE) {
            return {
              illegal: false,
              relevance: 0,
              value: escape$1(codeToHighlight),
              emitter: emitter,
              language: languageName,
              top: top,
              errorRaised: err
            };
          } else {
            throw err;
          }
        }
      }

      /**
       * returns a valid highlight result, without actually doing any actual work,
       * auto highlight starts with this and it's possible for small snippets that
       * auto-detection may not find a better match
       * @param {string} code
       * @returns {HighlightResult}
       */
      function justTextHighlightResult(code) {
        const result = {
          relevance: 0,
          emitter: new options.__emitter(options),
          value: escape$1(code),
          illegal: false,
          top: PLAINTEXT_LANGUAGE
        };
        result.emitter.addText(code);
        return result;
      }

      /**
      Highlighting with language detection. Accepts a string with the code to
      highlight. Returns an object with the following properties:

      - language (detected language)
      - relevance (int)
      - value (an HTML string with highlighting markup)
      - second_best (object with the same structure for second-best heuristically
        detected language, may be absent)

        @param {string} code
        @param {Array<string>} [languageSubset]
        @returns {AutoHighlightResult}
      */
      function highlightAuto(code, languageSubset) {
        languageSubset = languageSubset || options.languages || Object.keys(languages);
        const plaintext = justTextHighlightResult(code);

        const results = languageSubset.filter(getLanguage).filter(autoDetection).map(name =>
          _highlight(name, code, false)
        );
        results.unshift(plaintext); // plaintext is always an option

        const sorted = results.sort((a, b) => {
          // sort base on relevance
          if (a.relevance !== b.relevance) return b.relevance - a.relevance;

          // always award the tie to the base language
          // ie if C++ and Arduino are tied, it's more likely to be C++
          if (a.language && b.language) {
            if (getLanguage(a.language).supersetOf === b.language) {
              return 1;
            } else if (getLanguage(b.language).supersetOf === a.language) {
              return -1;
            }
          }

          // otherwise say they are equal, which has the effect of sorting on
          // relevance while preserving the original ordering - which is how ties
          // have historically been settled, ie the language that comes first always
          // wins in the case of a tie
          return 0;
        });

        const [best, secondBest] = sorted;

        /** @type {AutoHighlightResult} */
        const result = best;
        result.second_best = secondBest;

        return result;
      }

      /**
      Post-processing of the highlighted markup:

      - replace TABs with something more useful
      - replace real line-breaks with '<br>' for non-pre containers

        @param {string} html
        @returns {string}
      */
      function fixMarkup(html) {
        if (!(options.tabReplace || options.useBR)) {
          return html;
        }

        return html.replace(fixMarkupRe, match => {
          if (match === '\n') {
            return options.useBR ? '<br>' : match;
          } else if (options.tabReplace) {
            return match.replace(/\t/g, options.tabReplace);
          }
          return match;
        });
      }

      /**
       * Builds new class name for block given the language name
       *
       * @param {HTMLElement} element
       * @param {string} [currentLang]
       * @param {string} [resultLang]
       */
      function updateClassName(element, currentLang, resultLang) {
        const language = currentLang ? aliases[currentLang] : resultLang;

        element.classList.add("hljs");
        if (language) element.classList.add(language);
      }

      /** @type {HLJSPlugin} */
      const brPlugin = {
        "before:highlightElement": ({ el }) => {
          if (options.useBR) {
            el.innerHTML = el.innerHTML.replace(/\n/g, '').replace(/<br[ /]*>/g, '\n');
          }
        },
        "after:highlightElement": ({ result }) => {
          if (options.useBR) {
            result.value = result.value.replace(/\n/g, "<br>");
          }
        }
      };

      const TAB_REPLACE_RE = /^(<[^>]+>|\t)+/gm;
      /** @type {HLJSPlugin} */
      const tabReplacePlugin = {
        "after:highlightElement": ({ result }) => {
          if (options.tabReplace) {
            result.value = result.value.replace(TAB_REPLACE_RE, (m) =>
              m.replace(/\t/g, options.tabReplace)
            );
          }
        }
      };

      /**
       * Applies highlighting to a DOM node containing code. Accepts a DOM node and
       * two optional parameters for fixMarkup.
       *
       * @param {HighlightedHTMLElement} element - the HTML element to highlight
      */
      function highlightElement(element) {
        /** @type HTMLElement */
        let node = null;
        const language = blockLanguage(element);

        if (shouldNotHighlight(language)) return;

        // support for v10 API
        fire("before:highlightElement",
          { el: element, language: language });

        node = element;
        const text = node.textContent;
        const result = language ? highlight(text, { language, ignoreIllegals: true }) : highlightAuto(text);

        // support for v10 API
        fire("after:highlightElement", { el: element, result, text });

        element.innerHTML = result.value;
        updateClassName(element, language, result.language);
        element.result = {
          language: result.language,
          // TODO: remove with version 11.0
          re: result.relevance,
          relavance: result.relevance
        };
        if (result.second_best) {
          element.second_best = {
            language: result.second_best.language,
            // TODO: remove with version 11.0
            re: result.second_best.relevance,
            relavance: result.second_best.relevance
          };
        }
      }

      /**
       * Updates highlight.js global options with the passed options
       *
       * @param {Partial<HLJSOptions>} userOptions
       */
      function configure(userOptions) {
        if (userOptions.useBR) {
          deprecated("10.3.0", "'useBR' will be removed entirely in v11.0");
          deprecated("10.3.0", "Please see https://github.com/highlightjs/highlight.js/issues/2559");
        }
        options = inherit$1(options, userOptions);
      }

      /**
       * Highlights to all <pre><code> blocks on a page
       *
       * @type {Function & {called?: boolean}}
       */
      // TODO: remove v12, deprecated
      const initHighlighting = () => {
        if (initHighlighting.called) return;
        initHighlighting.called = true;

        deprecated("10.6.0", "initHighlighting() is deprecated.  Use highlightAll() instead.");

        const blocks = document.querySelectorAll('pre code');
        blocks.forEach(highlightElement);
      };

      // Higlights all when DOMContentLoaded fires
      // TODO: remove v12, deprecated
      function initHighlightingOnLoad() {
        deprecated("10.6.0", "initHighlightingOnLoad() is deprecated.  Use highlightAll() instead.");
        wantsHighlight = true;
      }

      let wantsHighlight = false;

      /**
       * auto-highlights all pre>code elements on the page
       */
      function highlightAll() {
        // if we are called too early in the loading process
        if (document.readyState === "loading") {
          wantsHighlight = true;
          return;
        }

        const blocks = document.querySelectorAll('pre code');
        blocks.forEach(highlightElement);
      }

      function boot() {
        // if a highlight was requested before DOM was loaded, do now
        if (wantsHighlight) highlightAll();
      }

      // make sure we are in the browser environment
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('DOMContentLoaded', boot, false);
      }

      /**
       * Register a language grammar module
       *
       * @param {string} languageName
       * @param {LanguageFn} languageDefinition
       */
      function registerLanguage(languageName, languageDefinition) {
        let lang = null;
        try {
          lang = languageDefinition(hljs);
        } catch (error$1) {
          error("Language definition for '{}' could not be registered.".replace("{}", languageName));
          // hard or soft error
          if (!SAFE_MODE) { throw error$1; } else { error(error$1); }
          // languages that have serious errors are replaced with essentially a
          // "plaintext" stand-in so that the code blocks will still get normal
          // css classes applied to them - and one bad language won't break the
          // entire highlighter
          lang = PLAINTEXT_LANGUAGE;
        }
        // give it a temporary name if it doesn't have one in the meta-data
        if (!lang.name) lang.name = languageName;
        languages[languageName] = lang;
        lang.rawDefinition = languageDefinition.bind(null, hljs);

        if (lang.aliases) {
          registerAliases(lang.aliases, { languageName });
        }
      }

      /**
       * Remove a language grammar module
       *
       * @param {string} languageName
       */
      function unregisterLanguage(languageName) {
        delete languages[languageName];
        for (const alias of Object.keys(aliases)) {
          if (aliases[alias] === languageName) {
            delete aliases[alias];
          }
        }
      }

      /**
       * @returns {string[]} List of language internal names
       */
      function listLanguages() {
        return Object.keys(languages);
      }

      /**
        intended usage: When one language truly requires another

        Unlike `getLanguage`, this will throw when the requested language
        is not available.

        @param {string} name - name of the language to fetch/require
        @returns {Language | never}
      */
      function requireLanguage(name) {
        deprecated("10.4.0", "requireLanguage will be removed entirely in v11.");
        deprecated("10.4.0", "Please see https://github.com/highlightjs/highlight.js/pull/2844");

        const lang = getLanguage(name);
        if (lang) { return lang; }

        const err = new Error('The \'{}\' language is required, but not loaded.'.replace('{}', name));
        throw err;
      }

      /**
       * @param {string} name - name of the language to retrieve
       * @returns {Language | undefined}
       */
      function getLanguage(name) {
        name = (name || '').toLowerCase();
        return languages[name] || languages[aliases[name]];
      }

      /**
       *
       * @param {string|string[]} aliasList - single alias or list of aliases
       * @param {{languageName: string}} opts
       */
      function registerAliases(aliasList, { languageName }) {
        if (typeof aliasList === 'string') {
          aliasList = [aliasList];
        }
        aliasList.forEach(alias => { aliases[alias.toLowerCase()] = languageName; });
      }

      /**
       * Determines if a given language has auto-detection enabled
       * @param {string} name - name of the language
       */
      function autoDetection(name) {
        const lang = getLanguage(name);
        return lang && !lang.disableAutodetect;
      }

      /**
       * Upgrades the old highlightBlock plugins to the new
       * highlightElement API
       * @param {HLJSPlugin} plugin
       */
      function upgradePluginAPI(plugin) {
        // TODO: remove with v12
        if (plugin["before:highlightBlock"] && !plugin["before:highlightElement"]) {
          plugin["before:highlightElement"] = (data) => {
            plugin["before:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
        if (plugin["after:highlightBlock"] && !plugin["after:highlightElement"]) {
          plugin["after:highlightElement"] = (data) => {
            plugin["after:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
      }

      /**
       * @param {HLJSPlugin} plugin
       */
      function addPlugin(plugin) {
        upgradePluginAPI(plugin);
        plugins.push(plugin);
      }

      /**
       *
       * @param {PluginEvent} event
       * @param {any} args
       */
      function fire(event, args) {
        const cb = event;
        plugins.forEach(function(plugin) {
          if (plugin[cb]) {
            plugin[cb](args);
          }
        });
      }

      /**
      Note: fixMarkup is deprecated and will be removed entirely in v11

      @param {string} arg
      @returns {string}
      */
      function deprecateFixMarkup(arg) {
        deprecated("10.2.0", "fixMarkup will be removed entirely in v11.0");
        deprecated("10.2.0", "Please see https://github.com/highlightjs/highlight.js/issues/2534");

        return fixMarkup(arg);
      }

      /**
       *
       * @param {HighlightedHTMLElement} el
       */
      function deprecateHighlightBlock(el) {
        deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
        deprecated("10.7.0", "Please use highlightElement now.");

        return highlightElement(el);
      }

      /* Interface definition */
      Object.assign(hljs, {
        highlight,
        highlightAuto,
        highlightAll,
        fixMarkup: deprecateFixMarkup,
        highlightElement,
        // TODO: Remove with v12 API
        highlightBlock: deprecateHighlightBlock,
        configure,
        initHighlighting,
        initHighlightingOnLoad,
        registerLanguage,
        unregisterLanguage,
        listLanguages,
        getLanguage,
        registerAliases,
        requireLanguage,
        autoDetection,
        inherit: inherit$1,
        addPlugin,
        // plugins for frameworks
        vuePlugin: BuildVuePlugin(hljs).VuePlugin
      });

      hljs.debugMode = function() { SAFE_MODE = false; };
      hljs.safeMode = function() { SAFE_MODE = true; };
      hljs.versionString = version;

      for (const key in MODES) {
        // @ts-ignore
        if (typeof MODES[key] === "object") {
          // @ts-ignore
          deepFreezeEs6(MODES[key]);
        }
      }

      // merge all the modes/regexs into our main object
      Object.assign(hljs, MODES);

      // built-in plugins, likely to be moved out of core in the future
      hljs.addPlugin(brPlugin); // slated to be removed in v11
      hljs.addPlugin(mergeHTMLPlugin);
      hljs.addPlugin(tabReplacePlugin);
      return hljs;
    };

    // export an "instance" of the highlighter
    var highlight = HLJS({});

    return highlight;

}());
if (typeof exports === 'object' && typeof module !== 'undefined') { module.exports = hljs; }

hljs.registerLanguage('xml', function () {
  'use strict';

  /**
   * @param {string} value
   * @returns {RegExp}
   * */

  /**
   * @param {RegExp | string } re
   * @returns {string}
   */
  function source(re) {
    if (!re) return null;
    if (typeof re === "string") return re;

    return re.source;
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
    const joined = args.map((x) => source(x)).join("");
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
    const joined = '(' + args.map((x) => source(x)).join("|") + ")";
    return joined;
  }

  /*
  Language: HTML, XML
  Website: https://www.w3.org/XML/
  Category: common
  Audit: 2020
  */

  /** @type LanguageFn */
  function xml(hljs) {
    // Element names can contain letters, digits, hyphens, underscores, and periods
    const TAG_NAME_RE = concat(/[A-Z_]/, optional(/[A-Z0-9_.-]*:/), /[A-Z0-9_.-]*/);
    const XML_IDENT_RE = /[A-Za-z0-9._:-]+/;
    const XML_ENTITIES = {
      className: 'symbol',
      begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
    };
    const XML_META_KEYWORDS = {
      begin: /\s/,
      contains: [
        {
          className: 'meta-keyword',
          begin: /#?[a-z_][a-z1-9_-]+/,
          illegal: /\n/
        }
      ]
    };
    const XML_META_PAR_KEYWORDS = hljs.inherit(XML_META_KEYWORDS, {
      begin: /\(/,
      end: /\)/
    });
    const APOS_META_STRING_MODE = hljs.inherit(hljs.APOS_STRING_MODE, {
      className: 'meta-string'
    });
    const QUOTE_META_STRING_MODE = hljs.inherit(hljs.QUOTE_STRING_MODE, {
      className: 'meta-string'
    });
    const TAG_INTERNALS = {
      endsWithParent: true,
      illegal: /</,
      relevance: 0,
      contains: [
        {
          className: 'attr',
          begin: XML_IDENT_RE,
          relevance: 0
        },
        {
          begin: /=\s*/,
          relevance: 0,
          contains: [
            {
              className: 'string',
              endsParent: true,
              variants: [
                {
                  begin: /"/,
                  end: /"/,
                  contains: [ XML_ENTITIES ]
                },
                {
                  begin: /'/,
                  end: /'/,
                  contains: [ XML_ENTITIES ]
                },
                {
                  begin: /[^\s"'=<>`]+/
                }
              ]
            }
          ]
        }
      ]
    };
    return {
      name: 'HTML, XML',
      aliases: [
        'html',
        'xhtml',
        'rss',
        'atom',
        'xjb',
        'xsd',
        'xsl',
        'plist',
        'wsf',
        'svg'
      ],
      case_insensitive: true,
      contains: [
        {
          className: 'meta',
          begin: /<![a-z]/,
          end: />/,
          relevance: 10,
          contains: [
            XML_META_KEYWORDS,
            QUOTE_META_STRING_MODE,
            APOS_META_STRING_MODE,
            XML_META_PAR_KEYWORDS,
            {
              begin: /\[/,
              end: /\]/,
              contains: [
                {
                  className: 'meta',
                  begin: /<![a-z]/,
                  end: />/,
                  contains: [
                    XML_META_KEYWORDS,
                    XML_META_PAR_KEYWORDS,
                    QUOTE_META_STRING_MODE,
                    APOS_META_STRING_MODE
                  ]
                }
              ]
            }
          ]
        },
        hljs.COMMENT(
          /<!--/,
          /-->/,
          {
            relevance: 10
          }
        ),
        {
          begin: /<!\[CDATA\[/,
          end: /\]\]>/,
          relevance: 10
        },
        XML_ENTITIES,
        {
          className: 'meta',
          begin: /<\?xml/,
          end: /\?>/,
          relevance: 10
        },
        {
          className: 'tag',
          /*
          The lookahead pattern (?=...) ensures that 'begin' only matches
          '<style' as a single word, followed by a whitespace or an
          ending braket. The '$' is needed for the lexeme to be recognized
          by hljs.subMode() that tests lexemes outside the stream.
          */
          begin: /<style(?=\s|>)/,
          end: />/,
          keywords: {
            name: 'style'
          },
          contains: [ TAG_INTERNALS ],
          starts: {
            end: /<\/style>/,
            returnEnd: true,
            subLanguage: [
              'css',
              'xml'
            ]
          }
        },
        {
          className: 'tag',
          // See the comment in the <style tag about the lookahead pattern
          begin: /<script(?=\s|>)/,
          end: />/,
          keywords: {
            name: 'script'
          },
          contains: [ TAG_INTERNALS ],
          starts: {
            end: /<\/script>/,
            returnEnd: true,
            subLanguage: [
              'javascript',
              'handlebars',
              'xml'
            ]
          }
        },
        // we need this for now for jSX
        {
          className: 'tag',
          begin: /<>|<\/>/
        },
        // open tag
        {
          className: 'tag',
          begin: concat(
            /</,
            lookahead(concat(
              TAG_NAME_RE,
              // <tag/>
              // <tag>
              // <tag ...
              either(/\/>/, />/, /\s/)
            ))
          ),
          end: /\/?>/,
          contains: [
            {
              className: 'name',
              begin: TAG_NAME_RE,
              relevance: 0,
              starts: TAG_INTERNALS
            }
          ]
        },
        // close tag
        {
          className: 'tag',
          begin: concat(
            /<\//,
            lookahead(concat(
              TAG_NAME_RE, />/
            ))
          ),
          contains: [
            {
              className: 'name',
              begin: TAG_NAME_RE,
              relevance: 0
            },
            {
              begin: />/,
              relevance: 0,
              endsParent: true
            }
          ]
        }
      ]
    };
  }

  return xml;

  return module.exports.definer || module.exports;

}());

hljs.registerLanguage('django', function () {
  'use strict';

  /*
  Language: Django
  Description: Django is a high-level Python Web framework that encourages rapid development and clean, pragmatic design.
  Requires: xml.js
  Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
  Contributors: Ilya Baryshev <baryshev@gmail.com>
  Website: https://www.djangoproject.com
  Category: template
  */

  /** @type LanguageFn */
  function django(hljs) {
    const FILTER = {
      begin: /\|[A-Za-z]+:?/,
      keywords: {
        name:
          'truncatewords removetags linebreaksbr yesno get_digit timesince random striptags ' +
          'filesizeformat escape linebreaks length_is ljust rjust cut urlize fix_ampersands ' +
          'title floatformat capfirst pprint divisibleby add make_list unordered_list urlencode ' +
          'timeuntil urlizetrunc wordcount stringformat linenumbers slice date dictsort ' +
          'dictsortreversed default_if_none pluralize lower join center default ' +
          'truncatewords_html upper length phone2numeric wordwrap time addslashes slugify first ' +
          'escapejs force_escape iriencode last safe safeseq truncatechars localize unlocalize ' +
          'localtime utc timezone'
      },
      contains: [
        hljs.QUOTE_STRING_MODE,
        hljs.APOS_STRING_MODE
      ]
    };

    return {
      name: 'Django',
      aliases: ['jinja'],
      case_insensitive: true,
      subLanguage: 'xml',
      contains: [
        hljs.COMMENT(/\{%\s*comment\s*%\}/, /\{%\s*endcomment\s*%\}/),
        hljs.COMMENT(/\{#/, /#\}/),
        {
          className: 'template-tag',
          begin: /\{%/,
          end: /%\}/,
          contains: [{
            className: 'name',
            begin: /\w+/,
            keywords: {
              name:
                  'comment endcomment load templatetag ifchanged endifchanged if endif firstof for ' +
                  'endfor ifnotequal endifnotequal widthratio extends include spaceless ' +
                  'endspaceless regroup ifequal endifequal ssi now with cycle url filter ' +
                  'endfilter debug block endblock else autoescape endautoescape csrf_token empty elif ' +
                  'endwith static trans blocktrans endblocktrans get_static_prefix get_media_prefix ' +
                  'plural get_current_language language get_available_languages ' +
                  'get_current_language_bidi get_language_info get_language_info_list localize ' +
                  'endlocalize localtime endlocaltime timezone endtimezone get_current_timezone ' +
                  'verbatim'
            },
            starts: {
              endsWithParent: true,
              keywords: 'in by as',
              contains: [FILTER],
              relevance: 0
            }
          }]
        },
        {
          className: 'template-variable',
          begin: /\{\{/,
          end: /\}\}/,
          contains: [FILTER]
        }
      ]
    };
  }

  return django;

  return module.exports.definer || module.exports;

}());

hljs.registerLanguage('dust', function () {
  'use strict';

  /*
  Language: Dust
  Requires: xml.js
  Author: Michael Allen <michael.allen@benefitfocus.com>
  Description: Matcher for dust.js templates.
  Website: https://www.dustjs.com
  Category: template
  */

  /** @type LanguageFn */
  function dust(hljs) {
    const EXPRESSION_KEYWORDS = 'if eq ne lt lte gt gte select default math sep';
    return {
      name: 'Dust',
      aliases: ['dst'],
      case_insensitive: true,
      subLanguage: 'xml',
      contains: [
        {
          className: 'template-tag',
          begin: /\{[#\/]/,
          end: /\}/,
          illegal: /;/,
          contains: [{
            className: 'name',
            begin: /[a-zA-Z\.-]+/,
            starts: {
              endsWithParent: true,
              relevance: 0,
              contains: [hljs.QUOTE_STRING_MODE]
            }
          }]
        },
        {
          className: 'template-variable',
          begin: /\{/,
          end: /\}/,
          illegal: /;/,
          keywords: EXPRESSION_KEYWORDS
        }
      ]
    };
  }

  return dust;

  return module.exports.definer || module.exports;

}());

hljs.registerLanguage('ruby', function () {
  'use strict';

  /**
   * @param {string} value
   * @returns {RegExp}
   * */

  /**
   * @param {RegExp | string } re
   * @returns {string}
   */
  function source(re) {
    if (!re) return null;
    if (typeof re === "string") return re;

    return re.source;
  }

  /**
   * @param {RegExp | string } re
   * @returns {string}
   */
  function lookahead(re) {
    return concat('(?=', re, ')');
  }

  /**
   * @param {...(RegExp | string) } args
   * @returns {string}
   */
  function concat(...args) {
    const joined = args.map((x) => source(x)).join("");
    return joined;
  }

  /*
  Language: Ruby
  Description: Ruby is a dynamic, open source programming language with a focus on simplicity and productivity.
  Website: https://www.ruby-lang.org/
  Author: Anton Kovalyov <anton@kovalyov.net>
  Contributors: Peter Leonov <gojpeg@yandex.ru>, Vasily Polovnyov <vast@whiteants.net>, Loren Segal <lsegal@soen.ca>, Pascal Hurni <phi@ruby-reactive.org>, Cedric Sohrauer <sohrauer@googlemail.com>
  Category: common
  */

  function ruby(hljs) {
    const RUBY_METHOD_RE = '([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)';
    const RUBY_KEYWORDS = {
      keyword:
        'and then defined module in return redo if BEGIN retry end for self when ' +
        'next until do begin unless END rescue else break undef not super class case ' +
        'require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor ' +
        '__FILE__',
      built_in: 'proc lambda',
      literal:
        'true false nil'
    };
    const YARDOCTAG = {
      className: 'doctag',
      begin: '@[A-Za-z]+'
    };
    const IRB_OBJECT = {
      begin: '#<',
      end: '>'
    };
    const COMMENT_MODES = [
      hljs.COMMENT(
        '#',
        '$',
        {
          contains: [ YARDOCTAG ]
        }
      ),
      hljs.COMMENT(
        '^=begin',
        '^=end',
        {
          contains: [ YARDOCTAG ],
          relevance: 10
        }
      ),
      hljs.COMMENT('^__END__', '\\n$')
    ];
    const SUBST = {
      className: 'subst',
      begin: /#\{/,
      end: /\}/,
      keywords: RUBY_KEYWORDS
    };
    const STRING = {
      className: 'string',
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      variants: [
        {
          begin: /'/,
          end: /'/
        },
        {
          begin: /"/,
          end: /"/
        },
        {
          begin: /`/,
          end: /`/
        },
        {
          begin: /%[qQwWx]?\(/,
          end: /\)/
        },
        {
          begin: /%[qQwWx]?\[/,
          end: /\]/
        },
        {
          begin: /%[qQwWx]?\{/,
          end: /\}/
        },
        {
          begin: /%[qQwWx]?</,
          end: />/
        },
        {
          begin: /%[qQwWx]?\//,
          end: /\//
        },
        {
          begin: /%[qQwWx]?%/,
          end: /%/
        },
        {
          begin: /%[qQwWx]?-/,
          end: /-/
        },
        {
          begin: /%[qQwWx]?\|/,
          end: /\|/
        },
        // in the following expressions, \B in the beginning suppresses recognition of ?-sequences
        // where ? is the last character of a preceding identifier, as in: `func?4`
        {
          begin: /\B\?(\\\d{1,3})/
        },
        {
          begin: /\B\?(\\x[A-Fa-f0-9]{1,2})/
        },
        {
          begin: /\B\?(\\u\{?[A-Fa-f0-9]{1,6}\}?)/
        },
        {
          begin: /\B\?(\\M-\\C-|\\M-\\c|\\c\\M-|\\M-|\\C-\\M-)[\x20-\x7e]/
        },
        {
          begin: /\B\?\\(c|C-)[\x20-\x7e]/
        },
        {
          begin: /\B\?\\?\S/
        },
        { // heredocs
          begin: /<<[-~]?'?(\w+)\n(?:[^\n]*\n)*?\s*\1\b/,
          returnBegin: true,
          contains: [
            {
              begin: /<<[-~]?'?/
            },
            hljs.END_SAME_AS_BEGIN({
              begin: /(\w+)/,
              end: /(\w+)/,
              contains: [
                hljs.BACKSLASH_ESCAPE,
                SUBST
              ]
            })
          ]
        }
      ]
    };

    // Ruby syntax is underdocumented, but this grammar seems to be accurate
    // as of version 2.7.2 (confirmed with (irb and `Ripper.sexp(...)`)
    // https://docs.ruby-lang.org/en/2.7.0/doc/syntax/literals_rdoc.html#label-Numbers
    const decimal = '[1-9](_?[0-9])*|0';
    const digits = '[0-9](_?[0-9])*';
    const NUMBER = {
      className: 'number',
      relevance: 0,
      variants: [
        // decimal integer/float, optionally exponential or rational, optionally imaginary
        {
          begin: `\\b(${decimal})(\\.(${digits}))?([eE][+-]?(${digits})|r)?i?\\b`
        },

        // explicit decimal/binary/octal/hexadecimal integer,
        // optionally rational and/or imaginary
        {
          begin: "\\b0[dD][0-9](_?[0-9])*r?i?\\b"
        },
        {
          begin: "\\b0[bB][0-1](_?[0-1])*r?i?\\b"
        },
        {
          begin: "\\b0[oO][0-7](_?[0-7])*r?i?\\b"
        },
        {
          begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*r?i?\\b"
        },

        // 0-prefixed implicit octal integer, optionally rational and/or imaginary
        {
          begin: "\\b0(_?[0-7])+r?i?\\b"
        }
      ]
    };

    const PARAMS = {
      className: 'params',
      begin: '\\(',
      end: '\\)',
      endsParent: true,
      keywords: RUBY_KEYWORDS
    };

    const RUBY_DEFAULT_CONTAINS = [
      STRING,
      {
        className: 'class',
        beginKeywords: 'class module',
        end: '$|;',
        illegal: /=/,
        contains: [
          hljs.inherit(hljs.TITLE_MODE, {
            begin: '[A-Za-z_]\\w*(::\\w+)*(\\?|!)?'
          }),
          {
            begin: '<\\s*',
            contains: [
              {
                begin: '(' + hljs.IDENT_RE + '::)?' + hljs.IDENT_RE,
                // we already get points for <, we don't need poitns
                // for the name also
                relevance: 0
              }
            ]
          }
        ].concat(COMMENT_MODES)
      },
      {
        className: 'function',
        // def method_name(
        // def method_name;
        // def method_name (end of line)
        begin: concat(/def\s+/, lookahead(RUBY_METHOD_RE + "\\s*(\\(|;|$)")),
        relevance: 0, // relevance comes from kewords
        keywords: "def",
        end: '$|;',
        contains: [
          hljs.inherit(hljs.TITLE_MODE, {
            begin: RUBY_METHOD_RE
          }),
          PARAMS
        ].concat(COMMENT_MODES)
      },
      {
        // swallow namespace qualifiers before symbols
        begin: hljs.IDENT_RE + '::'
      },
      {
        className: 'symbol',
        begin: hljs.UNDERSCORE_IDENT_RE + '(!|\\?)?:',
        relevance: 0
      },
      {
        className: 'symbol',
        begin: ':(?!\\s)',
        contains: [
          STRING,
          {
            begin: RUBY_METHOD_RE
          }
        ],
        relevance: 0
      },
      NUMBER,
      {
        // negative-look forward attemps to prevent false matches like:
        // @ident@ or $ident$ that might indicate this is not ruby at all
        className: "variable",
        begin: '(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])' + `(?![A-Za-z])(?![@$?'])`
      },
      {
        className: 'params',
        begin: /\|/,
        end: /\|/,
        relevance: 0, // this could be a lot of things (in other languages) other than params
        keywords: RUBY_KEYWORDS
      },
      { // regexp container
        begin: '(' + hljs.RE_STARTERS_RE + '|unless)\\s*',
        keywords: 'unless',
        contains: [
          {
            className: 'regexp',
            contains: [
              hljs.BACKSLASH_ESCAPE,
              SUBST
            ],
            illegal: /\n/,
            variants: [
              {
                begin: '/',
                end: '/[a-z]*'
              },
              {
                begin: /%r\{/,
                end: /\}[a-z]*/
              },
              {
                begin: '%r\\(',
                end: '\\)[a-z]*'
              },
              {
                begin: '%r!',
                end: '![a-z]*'
              },
              {
                begin: '%r\\[',
                end: '\\][a-z]*'
              }
            ]
          }
        ].concat(IRB_OBJECT, COMMENT_MODES),
        relevance: 0
      }
    ].concat(IRB_OBJECT, COMMENT_MODES);

    SUBST.contains = RUBY_DEFAULT_CONTAINS;
    PARAMS.contains = RUBY_DEFAULT_CONTAINS;

    // >>
    // ?>
    const SIMPLE_PROMPT = "[>?]>";
    // irb(main):001:0>
    const DEFAULT_PROMPT = "[\\w#]+\\(\\w+\\):\\d+:\\d+>";
    const RVM_PROMPT = "(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>";

    const IRB_DEFAULT = [
      {
        begin: /^\s*=>/,
        starts: {
          end: '$',
          contains: RUBY_DEFAULT_CONTAINS
        }
      },
      {
        className: 'meta',
        begin: '^(' + SIMPLE_PROMPT + "|" + DEFAULT_PROMPT + '|' + RVM_PROMPT + ')(?=[ ])',
        starts: {
          end: '$',
          contains: RUBY_DEFAULT_CONTAINS
        }
      }
    ];

    COMMENT_MODES.unshift(IRB_OBJECT);

    return {
      name: 'Ruby',
      aliases: [
        'rb',
        'gemspec',
        'podspec',
        'thor',
        'irb'
      ],
      keywords: RUBY_KEYWORDS,
      illegal: /\/\*/,
      contains: [
        hljs.SHEBANG({
          binary: "ruby"
        })
      ]
        .concat(IRB_DEFAULT)
        .concat(COMMENT_MODES)
        .concat(RUBY_DEFAULT_CONTAINS)
    };
  }

  return ruby;

  return module.exports.definer || module.exports;

}());

hljs.registerLanguage('erb', function () {
  'use strict';

  /*
  Language: ERB (Embedded Ruby)
  Requires: xml.js, ruby.js
  Author: Lucas Mazza <lucastmazza@gmail.com>
  Contributors: Kassio Borges <kassioborgesm@gmail.com>
  Description: "Bridge" language defining fragments of Ruby in HTML within <% .. %>
  Website: https://ruby-doc.org/stdlib-2.6.5/libdoc/erb/rdoc/ERB.html
  Category: template
  */

  /** @type LanguageFn */
  function erb(hljs) {
    return {
      name: 'ERB',
      subLanguage: 'xml',
      contains: [
        hljs.COMMENT('<%#', '%>'),
        {
          begin: '<%[%=-]?',
          end: '[%-]?%>',
          subLanguage: 'ruby',
          excludeBegin: true,
          excludeEnd: true
        }
      ]
    };
  }

  return erb;

  return module.exports.definer || module.exports;

}());

hljs.registerLanguage('haml', function () {
  'use strict';

  /*
  Language: HAML
  Requires: ruby.js
  Author: Dan Allen <dan.j.allen@gmail.com>
  Website: http://haml.info
  Category: template
  */

  // TODO support filter tags like :javascript, support inline HTML
  function haml(hljs) {
    return {
      name: 'HAML',
      case_insensitive: true,
      contains: [
        {
          className: 'meta',
          begin: '^!!!( (5|1\\.1|Strict|Frameset|Basic|Mobile|RDFa|XML\\b.*))?$',
          relevance: 10
        },
        // FIXME these comments should be allowed to span indented lines
        hljs.COMMENT(
          '^\\s*(!=#|=#|-#|/).*$',
          false,
          {
            relevance: 0
          }
        ),
        {
          begin: '^\\s*(-|=|!=)(?!#)',
          starts: {
            end: '\\n',
            subLanguage: 'ruby'
          }
        },
        {
          className: 'tag',
          begin: '^\\s*%',
          contains: [
            {
              className: 'selector-tag',
              begin: '\\w+'
            },
            {
              className: 'selector-id',
              begin: '#[\\w-]+'
            },
            {
              className: 'selector-class',
              begin: '\\.[\\w-]+'
            },
            {
              begin: /\{\s*/,
              end: /\s*\}/,
              contains: [
                {
                  begin: ':\\w+\\s*=>',
                  end: ',\\s+',
                  returnBegin: true,
                  endsWithParent: true,
                  contains: [
                    {
                      className: 'attr',
                      begin: ':\\w+'
                    },
                    hljs.APOS_STRING_MODE,
                    hljs.QUOTE_STRING_MODE,
                    {
                      begin: '\\w+',
                      relevance: 0
                    }
                  ]
                }
              ]
            },
            {
              begin: '\\(\\s*',
              end: '\\s*\\)',
              excludeEnd: true,
              contains: [
                {
                  begin: '\\w+\\s*=',
                  end: '\\s+',
                  returnBegin: true,
                  endsWithParent: true,
                  contains: [
                    {
                      className: 'attr',
                      begin: '\\w+',
                      relevance: 0
                    },
                    hljs.APOS_STRING_MODE,
                    hljs.QUOTE_STRING_MODE,
                    {
                      begin: '\\w+',
                      relevance: 0
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          begin: '^\\s*[=~]\\s*'
        },
        {
          begin: /#\{/,
          starts: {
            end: /\}/,
            subLanguage: 'ruby'
          }
        }
      ]
    };
  }

  return haml;

  return module.exports.definer || module.exports;

}());

hljs.registerLanguage('handlebars', function () {
  'use strict';

  /**
   * @param {string} value
   * @returns {RegExp}
   * */

  /**
   * @param {RegExp | string } re
   * @returns {string}
   */
  function source(re) {
    if (!re) return null;
    if (typeof re === "string") return re;

    return re.source;
  }

  /**
   * @param {RegExp | string } re
   * @returns {string}
   */
  function anyNumberOfTimes(re) {
    return concat('(', re, ')*');
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
    const joined = args.map((x) => source(x)).join("");
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
    const joined = '(' + args.map((x) => source(x)).join("|") + ")";
    return joined;
  }

  /*
  Language: Handlebars
  Requires: xml.js
  Author: Robin Ward <robin.ward@gmail.com>
  Description: Matcher for Handlebars as well as EmberJS additions.
  Website: https://handlebarsjs.com
  Category: template
  */

  function handlebars(hljs) {
    const BUILT_INS = {
      $pattern: /[\w.\/]+/,
      'builtin-name': [
        'action',
        'bindattr',
        'collection',
        'component',
        'concat',
        'debugger',
        'each',
        'each-in',
        'get',
        'hash',
        'if',
        'in',
        'input',
        'link-to',
        'loc',
        'log',
        'lookup',
        'mut',
        'outlet',
        'partial',
        'query-params',
        'render',
        'template',
        'textarea',
        'unbound',
        'unless',
        'view',
        'with',
        'yield'
      ]
    };

    const LITERALS = {
      $pattern: /[\w.\/]+/,
      literal: [
        'true',
        'false',
        'undefined',
        'null'
      ]
    };

    // as defined in https://handlebarsjs.com/guide/expressions.html#literal-segments
    // this regex matches literal segments like ' abc ' or [ abc ] as well as helpers and paths
    // like a/b, ./abc/cde, and abc.bcd

    const DOUBLE_QUOTED_ID_REGEX = /""|"[^"]+"/;
    const SINGLE_QUOTED_ID_REGEX = /''|'[^']+'/;
    const BRACKET_QUOTED_ID_REGEX = /\[\]|\[[^\]]+\]/;
    const PLAIN_ID_REGEX = /[^\s!"#%&'()*+,.\/;<=>@\[\\\]^`{|}~]+/;
    const PATH_DELIMITER_REGEX = /(\.|\/)/;
    const ANY_ID = either(
      DOUBLE_QUOTED_ID_REGEX,
      SINGLE_QUOTED_ID_REGEX,
      BRACKET_QUOTED_ID_REGEX,
      PLAIN_ID_REGEX
      );

    const IDENTIFIER_REGEX = concat(
      optional(/\.|\.\/|\//), // relative or absolute path
      ANY_ID,
      anyNumberOfTimes(concat(
        PATH_DELIMITER_REGEX,
        ANY_ID
      ))
    );

    // identifier followed by a equal-sign (without the equal sign)
    const HASH_PARAM_REGEX = concat(
      '(',
      BRACKET_QUOTED_ID_REGEX, '|',
      PLAIN_ID_REGEX,
      ')(?==)'
    );

    const HELPER_NAME_OR_PATH_EXPRESSION = {
      begin: IDENTIFIER_REGEX
    };

    const HELPER_PARAMETER = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
      keywords: LITERALS
    });

    const SUB_EXPRESSION = {
      begin: /\(/,
      end: /\)/
      // the "contains" is added below when all necessary sub-modes are defined
    };

    const HASH = {
      // fka "attribute-assignment", parameters of the form 'key=value'
      className: 'attr',
      begin: HASH_PARAM_REGEX,
      relevance: 0,
      starts: {
        begin: /=/,
        end: /=/,
        starts: {
          contains: [
            hljs.NUMBER_MODE,
            hljs.QUOTE_STRING_MODE,
            hljs.APOS_STRING_MODE,
            HELPER_PARAMETER,
            SUB_EXPRESSION
          ]
        }
      }
    };

    const BLOCK_PARAMS = {
      // parameters of the form '{{#with x as | y |}}...{{/with}}'
      begin: /as\s+\|/,
      keywords: {
        keyword: 'as'
      },
      end: /\|/,
      contains: [
        {
          // define sub-mode in order to prevent highlighting of block-parameter named "as"
          begin: /\w+/
        }
      ]
    };

    const HELPER_PARAMETERS = {
      contains: [
        hljs.NUMBER_MODE,
        hljs.QUOTE_STRING_MODE,
        hljs.APOS_STRING_MODE,
        BLOCK_PARAMS,
        HASH,
        HELPER_PARAMETER,
        SUB_EXPRESSION
      ],
      returnEnd: true
      // the property "end" is defined through inheritance when the mode is used. If depends
      // on the surrounding mode, but "endsWithParent" does not work here (i.e. it includes the
      // end-token of the surrounding mode)
    };

    const SUB_EXPRESSION_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
      className: 'name',
      keywords: BUILT_INS,
      starts: hljs.inherit(HELPER_PARAMETERS, {
        end: /\)/
      })
    });

    SUB_EXPRESSION.contains = [SUB_EXPRESSION_CONTENTS];

    const OPENING_BLOCK_MUSTACHE_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
      keywords: BUILT_INS,
      className: 'name',
      starts: hljs.inherit(HELPER_PARAMETERS, {
        end: /\}\}/
      })
    });

    const CLOSING_BLOCK_MUSTACHE_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
      keywords: BUILT_INS,
      className: 'name'
    });

    const BASIC_MUSTACHE_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
      className: 'name',
      keywords: BUILT_INS,
      starts: hljs.inherit(HELPER_PARAMETERS, {
        end: /\}\}/
      })
    });

    const ESCAPE_MUSTACHE_WITH_PRECEEDING_BACKSLASH = {
      begin: /\\\{\{/,
      skip: true
    };
    const PREVENT_ESCAPE_WITH_ANOTHER_PRECEEDING_BACKSLASH = {
      begin: /\\\\(?=\{\{)/,
      skip: true
    };

    return {
      name: 'Handlebars',
      aliases: [
        'hbs',
        'html.hbs',
        'html.handlebars',
        'htmlbars'
      ],
      case_insensitive: true,
      subLanguage: 'xml',
      contains: [
        ESCAPE_MUSTACHE_WITH_PRECEEDING_BACKSLASH,
        PREVENT_ESCAPE_WITH_ANOTHER_PRECEEDING_BACKSLASH,
        hljs.COMMENT(/\{\{!--/, /--\}\}/),
        hljs.COMMENT(/\{\{!/, /\}\}/),
        {
          // open raw block "{{{{raw}}}} content not evaluated {{{{/raw}}}}"
          className: 'template-tag',
          begin: /\{\{\{\{(?!\/)/,
          end: /\}\}\}\}/,
          contains: [OPENING_BLOCK_MUSTACHE_CONTENTS],
          starts: {
            end: /\{\{\{\{\//,
            returnEnd: true,
            subLanguage: 'xml'
          }
        },
        {
          // close raw block
          className: 'template-tag',
          begin: /\{\{\{\{\//,
          end: /\}\}\}\}/,
          contains: [CLOSING_BLOCK_MUSTACHE_CONTENTS]
        },
        {
          // open block statement
          className: 'template-tag',
          begin: /\{\{#/,
          end: /\}\}/,
          contains: [OPENING_BLOCK_MUSTACHE_CONTENTS]
        },
        {
          className: 'template-tag',
          begin: /\{\{(?=else\}\})/,
          end: /\}\}/,
          keywords: 'else'
        },
        {
          className: 'template-tag',
          begin: /\{\{(?=else if)/,
          end: /\}\}/,
          keywords: 'else if'
        },
        {
          // closing block statement
          className: 'template-tag',
          begin: /\{\{\//,
          end: /\}\}/,
          contains: [CLOSING_BLOCK_MUSTACHE_CONTENTS]
        },
        {
          // template variable or helper-call that is NOT html-escaped
          className: 'template-variable',
          begin: /\{\{\{/,
          end: /\}\}\}/,
          contains: [BASIC_MUSTACHE_CONTENTS]
        },
        {
          // template variable or helper-call that is html-escaped
          className: 'template-variable',
          begin: /\{\{/,
          end: /\}\}/,
          contains: [BASIC_MUSTACHE_CONTENTS]
        }
      ]
    };
  }

  return handlebars;

  return module.exports.definer || module.exports;

}());

hljs.registerLanguage('htmlbars', function () {
  'use strict';

  /**
   * @param {string} value
   * @returns {RegExp}
   * */

  /**
   * @param {RegExp | string } re
   * @returns {string}
   */
  function source(re) {
    if (!re) return null;
    if (typeof re === "string") return re;

    return re.source;
  }

  /**
   * @param {RegExp | string } re
   * @returns {string}
   */
  function anyNumberOfTimes(re) {
    return concat('(', re, ')*');
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
    const joined = args.map((x) => source(x)).join("");
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
    const joined = '(' + args.map((x) => source(x)).join("|") + ")";
    return joined;
  }

  /*
  Language: Handlebars
  Requires: xml.js
  Author: Robin Ward <robin.ward@gmail.com>
  Description: Matcher for Handlebars as well as EmberJS additions.
  Website: https://handlebarsjs.com
  Category: template
  */

  function handlebars(hljs) {
    const BUILT_INS = {
      $pattern: /[\w.\/]+/,
      'builtin-name': [
        'action',
        'bindattr',
        'collection',
        'component',
        'concat',
        'debugger',
        'each',
        'each-in',
        'get',
        'hash',
        'if',
        'in',
        'input',
        'link-to',
        'loc',
        'log',
        'lookup',
        'mut',
        'outlet',
        'partial',
        'query-params',
        'render',
        'template',
        'textarea',
        'unbound',
        'unless',
        'view',
        'with',
        'yield'
      ]
    };

    const LITERALS = {
      $pattern: /[\w.\/]+/,
      literal: [
        'true',
        'false',
        'undefined',
        'null'
      ]
    };

    // as defined in https://handlebarsjs.com/guide/expressions.html#literal-segments
    // this regex matches literal segments like ' abc ' or [ abc ] as well as helpers and paths
    // like a/b, ./abc/cde, and abc.bcd

    const DOUBLE_QUOTED_ID_REGEX = /""|"[^"]+"/;
    const SINGLE_QUOTED_ID_REGEX = /''|'[^']+'/;
    const BRACKET_QUOTED_ID_REGEX = /\[\]|\[[^\]]+\]/;
    const PLAIN_ID_REGEX = /[^\s!"#%&'()*+,.\/;<=>@\[\\\]^`{|}~]+/;
    const PATH_DELIMITER_REGEX = /(\.|\/)/;
    const ANY_ID = either(
      DOUBLE_QUOTED_ID_REGEX,
      SINGLE_QUOTED_ID_REGEX,
      BRACKET_QUOTED_ID_REGEX,
      PLAIN_ID_REGEX
      );

    const IDENTIFIER_REGEX = concat(
      optional(/\.|\.\/|\//), // relative or absolute path
      ANY_ID,
      anyNumberOfTimes(concat(
        PATH_DELIMITER_REGEX,
        ANY_ID
      ))
    );

    // identifier followed by a equal-sign (without the equal sign)
    const HASH_PARAM_REGEX = concat(
      '(',
      BRACKET_QUOTED_ID_REGEX, '|',
      PLAIN_ID_REGEX,
      ')(?==)'
    );

    const HELPER_NAME_OR_PATH_EXPRESSION = {
      begin: IDENTIFIER_REGEX
    };

    const HELPER_PARAMETER = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
      keywords: LITERALS
    });

    const SUB_EXPRESSION = {
      begin: /\(/,
      end: /\)/
      // the "contains" is added below when all necessary sub-modes are defined
    };

    const HASH = {
      // fka "attribute-assignment", parameters of the form 'key=value'
      className: 'attr',
      begin: HASH_PARAM_REGEX,
      relevance: 0,
      starts: {
        begin: /=/,
        end: /=/,
        starts: {
          contains: [
            hljs.NUMBER_MODE,
            hljs.QUOTE_STRING_MODE,
            hljs.APOS_STRING_MODE,
            HELPER_PARAMETER,
            SUB_EXPRESSION
          ]
        }
      }
    };

    const BLOCK_PARAMS = {
      // parameters of the form '{{#with x as | y |}}...{{/with}}'
      begin: /as\s+\|/,
      keywords: {
        keyword: 'as'
      },
      end: /\|/,
      contains: [
        {
          // define sub-mode in order to prevent highlighting of block-parameter named "as"
          begin: /\w+/
        }
      ]
    };

    const HELPER_PARAMETERS = {
      contains: [
        hljs.NUMBER_MODE,
        hljs.QUOTE_STRING_MODE,
        hljs.APOS_STRING_MODE,
        BLOCK_PARAMS,
        HASH,
        HELPER_PARAMETER,
        SUB_EXPRESSION
      ],
      returnEnd: true
      // the property "end" is defined through inheritance when the mode is used. If depends
      // on the surrounding mode, but "endsWithParent" does not work here (i.e. it includes the
      // end-token of the surrounding mode)
    };

    const SUB_EXPRESSION_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
      className: 'name',
      keywords: BUILT_INS,
      starts: hljs.inherit(HELPER_PARAMETERS, {
        end: /\)/
      })
    });

    SUB_EXPRESSION.contains = [SUB_EXPRESSION_CONTENTS];

    const OPENING_BLOCK_MUSTACHE_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
      keywords: BUILT_INS,
      className: 'name',
      starts: hljs.inherit(HELPER_PARAMETERS, {
        end: /\}\}/
      })
    });

    const CLOSING_BLOCK_MUSTACHE_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
      keywords: BUILT_INS,
      className: 'name'
    });

    const BASIC_MUSTACHE_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
      className: 'name',
      keywords: BUILT_INS,
      starts: hljs.inherit(HELPER_PARAMETERS, {
        end: /\}\}/
      })
    });

    const ESCAPE_MUSTACHE_WITH_PRECEEDING_BACKSLASH = {
      begin: /\\\{\{/,
      skip: true
    };
    const PREVENT_ESCAPE_WITH_ANOTHER_PRECEEDING_BACKSLASH = {
      begin: /\\\\(?=\{\{)/,
      skip: true
    };

    return {
      name: 'Handlebars',
      aliases: [
        'hbs',
        'html.hbs',
        'html.handlebars',
        'htmlbars'
      ],
      case_insensitive: true,
      subLanguage: 'xml',
      contains: [
        ESCAPE_MUSTACHE_WITH_PRECEEDING_BACKSLASH,
        PREVENT_ESCAPE_WITH_ANOTHER_PRECEEDING_BACKSLASH,
        hljs.COMMENT(/\{\{!--/, /--\}\}/),
        hljs.COMMENT(/\{\{!/, /\}\}/),
        {
          // open raw block "{{{{raw}}}} content not evaluated {{{{/raw}}}}"
          className: 'template-tag',
          begin: /\{\{\{\{(?!\/)/,
          end: /\}\}\}\}/,
          contains: [OPENING_BLOCK_MUSTACHE_CONTENTS],
          starts: {
            end: /\{\{\{\{\//,
            returnEnd: true,
            subLanguage: 'xml'
          }
        },
        {
          // close raw block
          className: 'template-tag',
          begin: /\{\{\{\{\//,
          end: /\}\}\}\}/,
          contains: [CLOSING_BLOCK_MUSTACHE_CONTENTS]
        },
        {
          // open block statement
          className: 'template-tag',
          begin: /\{\{#/,
          end: /\}\}/,
          contains: [OPENING_BLOCK_MUSTACHE_CONTENTS]
        },
        {
          className: 'template-tag',
          begin: /\{\{(?=else\}\})/,
          end: /\}\}/,
          keywords: 'else'
        },
        {
          className: 'template-tag',
          begin: /\{\{(?=else if)/,
          end: /\}\}/,
          keywords: 'else if'
        },
        {
          // closing block statement
          className: 'template-tag',
          begin: /\{\{\//,
          end: /\}\}/,
          contains: [CLOSING_BLOCK_MUSTACHE_CONTENTS]
        },
        {
          // template variable or helper-call that is NOT html-escaped
          className: 'template-variable',
          begin: /\{\{\{/,
          end: /\}\}\}/,
          contains: [BASIC_MUSTACHE_CONTENTS]
        },
        {
          // template variable or helper-call that is html-escaped
          className: 'template-variable',
          begin: /\{\{/,
          end: /\}\}/,
          contains: [BASIC_MUSTACHE_CONTENTS]
        }
      ]
    };
  }

  /*
   Language: HTMLBars (legacy)
   Requires: xml.js
   Description: Matcher for Handlebars as well as EmberJS additions.
   Website: https://github.com/tildeio/htmlbars
   Category: template
   */

  function htmlbars(hljs) {
    const definition = handlebars(hljs);

    definition.name = "HTMLbars";

    // HACK: This lets handlebars do the auto-detection if it's been loaded (by
    // default the build script will load in alphabetical order) and if not (perhaps
    // an install is only using `htmlbars`, not `handlebars`) then this will still
    // allow HTMLBars to participate in the auto-detection

    // worse case someone will have HTMLbars and handlebars competing for the same
    // content and will need to change their setup to only require handlebars, but
    // I don't consider this a breaking change
    if (hljs.getLanguage("handlebars")) {
      definition.disableAutodetect = true;
    }

    return definition;
  }

  return htmlbars;

  return module.exports.definer || module.exports;

}());

hljs.registerLanguage('perl', function () {
  'use strict';

  /**
   * @param {string} value
   * @returns {RegExp}
   * */

  /**
   * @param {RegExp | string } re
   * @returns {string}
   */
  function source(re) {
    if (!re) return null;
    if (typeof re === "string") return re;

    return re.source;
  }

  /**
   * @param {...(RegExp | string) } args
   * @returns {string}
   */
  function concat(...args) {
    const joined = args.map((x) => source(x)).join("");
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
    const joined = '(' + args.map((x) => source(x)).join("|") + ")";
    return joined;
  }

  /*
  Language: Perl
  Author: Peter Leonov <gojpeg@yandex.ru>
  Website: https://www.perl.org
  Category: common
  */

  /** @type LanguageFn */
  function perl(hljs) {
    const KEYWORDS = [
      'abs',
      'accept',
      'alarm',
      'and',
      'atan2',
      'bind',
      'binmode',
      'bless',
      'break',
      'caller',
      'chdir',
      'chmod',
      'chomp',
      'chop',
      'chown',
      'chr',
      'chroot',
      'close',
      'closedir',
      'connect',
      'continue',
      'cos',
      'crypt',
      'dbmclose',
      'dbmopen',
      'defined',
      'delete',
      'die',
      'do',
      'dump',
      'each',
      'else',
      'elsif',
      'endgrent',
      'endhostent',
      'endnetent',
      'endprotoent',
      'endpwent',
      'endservent',
      'eof',
      'eval',
      'exec',
      'exists',
      'exit',
      'exp',
      'fcntl',
      'fileno',
      'flock',
      'for',
      'foreach',
      'fork',
      'format',
      'formline',
      'getc',
      'getgrent',
      'getgrgid',
      'getgrnam',
      'gethostbyaddr',
      'gethostbyname',
      'gethostent',
      'getlogin',
      'getnetbyaddr',
      'getnetbyname',
      'getnetent',
      'getpeername',
      'getpgrp',
      'getpriority',
      'getprotobyname',
      'getprotobynumber',
      'getprotoent',
      'getpwent',
      'getpwnam',
      'getpwuid',
      'getservbyname',
      'getservbyport',
      'getservent',
      'getsockname',
      'getsockopt',
      'given',
      'glob',
      'gmtime',
      'goto',
      'grep',
      'gt',
      'hex',
      'if',
      'index',
      'int',
      'ioctl',
      'join',
      'keys',
      'kill',
      'last',
      'lc',
      'lcfirst',
      'length',
      'link',
      'listen',
      'local',
      'localtime',
      'log',
      'lstat',
      'lt',
      'ma',
      'map',
      'mkdir',
      'msgctl',
      'msgget',
      'msgrcv',
      'msgsnd',
      'my',
      'ne',
      'next',
      'no',
      'not',
      'oct',
      'open',
      'opendir',
      'or',
      'ord',
      'our',
      'pack',
      'package',
      'pipe',
      'pop',
      'pos',
      'print',
      'printf',
      'prototype',
      'push',
      'q|0',
      'qq',
      'quotemeta',
      'qw',
      'qx',
      'rand',
      'read',
      'readdir',
      'readline',
      'readlink',
      'readpipe',
      'recv',
      'redo',
      'ref',
      'rename',
      'require',
      'reset',
      'return',
      'reverse',
      'rewinddir',
      'rindex',
      'rmdir',
      'say',
      'scalar',
      'seek',
      'seekdir',
      'select',
      'semctl',
      'semget',
      'semop',
      'send',
      'setgrent',
      'sethostent',
      'setnetent',
      'setpgrp',
      'setpriority',
      'setprotoent',
      'setpwent',
      'setservent',
      'setsockopt',
      'shift',
      'shmctl',
      'shmget',
      'shmread',
      'shmwrite',
      'shutdown',
      'sin',
      'sleep',
      'socket',
      'socketpair',
      'sort',
      'splice',
      'split',
      'sprintf',
      'sqrt',
      'srand',
      'stat',
      'state',
      'study',
      'sub',
      'substr',
      'symlink',
      'syscall',
      'sysopen',
      'sysread',
      'sysseek',
      'system',
      'syswrite',
      'tell',
      'telldir',
      'tie',
      'tied',
      'time',
      'times',
      'tr',
      'truncate',
      'uc',
      'ucfirst',
      'umask',
      'undef',
      'unless',
      'unlink',
      'unpack',
      'unshift',
      'untie',
      'until',
      'use',
      'utime',
      'values',
      'vec',
      'wait',
      'waitpid',
      'wantarray',
      'warn',
      'when',
      'while',
      'write',
      'x|0',
      'xor',
      'y|0'
    ];

    // https://perldoc.perl.org/perlre#Modifiers
    const REGEX_MODIFIERS = /[dualxmsipngr]{0,12}/; // aa and xx are valid, making max length 12
    const PERL_KEYWORDS = {
      $pattern: /[\w.]+/,
      keyword: KEYWORDS.join(" ")
    };
    const SUBST = {
      className: 'subst',
      begin: '[$@]\\{',
      end: '\\}',
      keywords: PERL_KEYWORDS
    };
    const METHOD = {
      begin: /->\{/,
      end: /\}/
      // contains defined later
    };
    const VAR = {
      variants: [
        {
          begin: /\$\d/
        },
        {
          begin: concat(
            /[$%@](\^\w\b|#\w+(::\w+)*|\{\w+\}|\w+(::\w*)*)/,
            // negative look-ahead tries to avoid matching patterns that are not
            // Perl at all like $ident$, @ident@, etc.
            `(?![A-Za-z])(?![@$%])`
          )
        },
        {
          begin: /[$%@][^\s\w{]/,
          relevance: 0
        }
      ]
    };
    const STRING_CONTAINS = [
      hljs.BACKSLASH_ESCAPE,
      SUBST,
      VAR
    ];
    const REGEX_DELIMS = [
      /!/,
      /\//,
      /\|/,
      /\?/,
      /'/,
      /"/, // valid but infrequent and weird
      /#/ // valid but infrequent and weird
    ];
    /**
     * @param {string|RegExp} prefix
     * @param {string|RegExp} open
     * @param {string|RegExp} close
     */
    const PAIRED_DOUBLE_RE = (prefix, open, close = '\\1') => {
      const middle = (close === '\\1')
        ? close
        : concat(close, open);
      return concat(
        concat("(?:", prefix, ")"),
        open,
        /(?:\\.|[^\\\/])*?/,
        middle,
        /(?:\\.|[^\\\/])*?/,
        close,
        REGEX_MODIFIERS
      );
    };
    /**
     * @param {string|RegExp} prefix
     * @param {string|RegExp} open
     * @param {string|RegExp} close
     */
    const PAIRED_RE = (prefix, open, close) => {
      return concat(
        concat("(?:", prefix, ")"),
        open,
        /(?:\\.|[^\\\/])*?/,
        close,
        REGEX_MODIFIERS
      );
    };
    const PERL_DEFAULT_CONTAINS = [
      VAR,
      hljs.HASH_COMMENT_MODE,
      hljs.COMMENT(
        /^=\w/,
        /=cut/,
        {
          endsWithParent: true
        }
      ),
      METHOD,
      {
        className: 'string',
        contains: STRING_CONTAINS,
        variants: [
          {
            begin: 'q[qwxr]?\\s*\\(',
            end: '\\)',
            relevance: 5
          },
          {
            begin: 'q[qwxr]?\\s*\\[',
            end: '\\]',
            relevance: 5
          },
          {
            begin: 'q[qwxr]?\\s*\\{',
            end: '\\}',
            relevance: 5
          },
          {
            begin: 'q[qwxr]?\\s*\\|',
            end: '\\|',
            relevance: 5
          },
          {
            begin: 'q[qwxr]?\\s*<',
            end: '>',
            relevance: 5
          },
          {
            begin: 'qw\\s+q',
            end: 'q',
            relevance: 5
          },
          {
            begin: '\'',
            end: '\'',
            contains: [ hljs.BACKSLASH_ESCAPE ]
          },
          {
            begin: '"',
            end: '"'
          },
          {
            begin: '`',
            end: '`',
            contains: [ hljs.BACKSLASH_ESCAPE ]
          },
          {
            begin: /\{\w+\}/,
            relevance: 0
          },
          {
            begin: '-?\\w+\\s*=>',
            relevance: 0
          }
        ]
      },
      {
        className: 'number',
        begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
        relevance: 0
      },
      { // regexp container
        begin: '(\\/\\/|' + hljs.RE_STARTERS_RE + '|\\b(split|return|print|reverse|grep)\\b)\\s*',
        keywords: 'split return print reverse grep',
        relevance: 0,
        contains: [
          hljs.HASH_COMMENT_MODE,
          {
            className: 'regexp',
            variants: [
              // allow matching common delimiters
              { begin: PAIRED_DOUBLE_RE("s|tr|y", either(...REGEX_DELIMS)) },
              // and then paired delmis
              { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\(", "\\)") },
              { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\[", "\\]") },
              { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\{", "\\}") }
            ],
            relevance: 2
          },
          {
            className: 'regexp',
            variants: [
              {
                // could be a comment in many languages so do not count
                // as relevant
                begin: /(m|qr)\/\//,
                relevance: 0
              },
              // prefix is optional with /regex/
              { begin: PAIRED_RE("(?:m|qr)?", /\//, /\//)},
              // allow matching common delimiters
              { begin: PAIRED_RE("m|qr", either(...REGEX_DELIMS), /\1/)},
              // allow common paired delmins
              { begin: PAIRED_RE("m|qr", /\(/, /\)/)},
              { begin: PAIRED_RE("m|qr", /\[/, /\]/)},
              { begin: PAIRED_RE("m|qr", /\{/, /\}/)}
            ]
          }
        ]
      },
      {
        className: 'function',
        beginKeywords: 'sub',
        end: '(\\s*\\(.*?\\))?[;{]',
        excludeEnd: true,
        relevance: 5,
        contains: [ hljs.TITLE_MODE ]
      },
      {
        begin: '-\\w\\b',
        relevance: 0
      },
      {
        begin: "^__DATA__$",
        end: "^__END__$",
        subLanguage: 'mojolicious',
        contains: [
          {
            begin: "^@@.*",
            end: "$",
            className: "comment"
          }
        ]
      }
    ];
    SUBST.contains = PERL_DEFAULT_CONTAINS;
    METHOD.contains = PERL_DEFAULT_CONTAINS;

    return {
      name: 'Perl',
      aliases: [
        'pl',
        'pm'
      ],
      keywords: PERL_KEYWORDS,
      contains: PERL_DEFAULT_CONTAINS
    };
  }

  return perl;

  return module.exports.definer || module.exports;

}());

hljs.registerLanguage('mojolicious', function () {
  'use strict';

  /*
  Language: Mojolicious
  Requires: xml.js, perl.js
  Author: Dotan Dimet <dotan@corky.net>
  Description: Mojolicious .ep (Embedded Perl) templates
  Website: https://mojolicious.org
  Category: template
  */
  function mojolicious(hljs) {
    return {
      name: 'Mojolicious',
      subLanguage: 'xml',
      contains: [
        {
          className: 'meta',
          begin: '^__(END|DATA)__$'
        },
        // mojolicious line
        {
          begin: "^\\s*%{1,2}={0,2}",
          end: '$',
          subLanguage: 'perl'
        },
        // mojolicious block
        {
          begin: "<%{1,2}={0,2}",
          end: "={0,1}%>",
          subLanguage: 'perl',
          excludeBegin: true,
          excludeEnd: true
        }
      ]
    };
  }

  return mojolicious;

  return module.exports.definer || module.exports;

}());

hljs.registerLanguage('parser3', function () {
  'use strict';

  /*
  Language: Parser3
  Requires: xml.js
  Author: Oleg Volchkov <oleg@volchkov.net>
  Website: https://www.parser.ru/en/
  Category: template
  */

  function parser3(hljs) {
    const CURLY_SUBCOMMENT = hljs.COMMENT(
      /\{/,
      /\}/,
      {
        contains: [ 'self' ]
      }
    );
    return {
      name: 'Parser3',
      subLanguage: 'xml',
      relevance: 0,
      contains: [
        hljs.COMMENT('^#', '$'),
        hljs.COMMENT(
          /\^rem\{/,
          /\}/,
          {
            relevance: 10,
            contains: [ CURLY_SUBCOMMENT ]
          }
        ),
        {
          className: 'meta',
          begin: '^@(?:BASE|USE|CLASS|OPTIONS)$',
          relevance: 10
        },
        {
          className: 'title',
          begin: '@[\\w\\-]+\\[[\\w^;\\-]*\\](?:\\[[\\w^;\\-]*\\])?(?:.*)$'
        },
        {
          className: 'variable',
          begin: /\$\{?[\w\-.:]+\}?/
        },
        {
          className: 'keyword',
          begin: /\^[\w\-.:]+/
        },
        {
          className: 'number',
          begin: '\\^#[0-9a-fA-F]+'
        },
        hljs.C_NUMBER_MODE
      ]
    };
  }

  return parser3;

  return module.exports.definer || module.exports;

}());

hljs.registerLanguage('twig', function () {
  'use strict';

  /*
  Language: Twig
  Requires: xml.js
  Author: Luke Holder <lukemh@gmail.com>
  Description: Twig is a templating language for PHP
  Website: https://twig.symfony.com
  Category: template
  */

  function twig(hljs) {
    var PARAMS = {
      className: 'params',
      begin: '\\(', end: '\\)'
    };

    var FUNCTION_NAMES = 'attribute block constant cycle date dump include ' +
                    'max min parent random range source template_from_string';

    var FUNCTIONS = {
      beginKeywords: FUNCTION_NAMES,
      keywords: {name: FUNCTION_NAMES},
      relevance: 0,
      contains: [
        PARAMS
      ]
    };

    var FILTER = {
      begin: /\|[A-Za-z_]+:?/,
      keywords:
        'abs batch capitalize column convert_encoding date date_modify default ' +
        'escape filter first format inky_to_html inline_css join json_encode keys last ' +
        'length lower map markdown merge nl2br number_format raw reduce replace ' +
        'reverse round slice sort spaceless split striptags title trim upper url_encode',
      contains: [
        FUNCTIONS
      ]
    };

    var TAGS = 'apply autoescape block deprecated do embed extends filter flush for from ' +
      'if import include macro sandbox set use verbatim with';

    TAGS = TAGS + ' ' + TAGS.split(' ').map(function(t){return 'end' + t}).join(' ');

    return {
      name: 'Twig',
      aliases: ['craftcms'],
      case_insensitive: true,
      subLanguage: 'xml',
      contains: [
        hljs.COMMENT(/\{#/, /#\}/),
        {
          className: 'template-tag',
          begin: /\{%/, end: /%\}/,
          contains: [
            {
              className: 'name',
              begin: /\w+/,
              keywords: TAGS,
              starts: {
                endsWithParent: true,
                contains: [FILTER, FUNCTIONS],
                relevance: 0
              }
            }
          ]
        },
        {
          className: 'template-variable',
          begin: /\{\{/, end: /\}\}/,
          contains: ['self', FILTER, FUNCTIONS]
        }
      ]
    };
  }

  return twig;

  return module.exports.definer || module.exports;

}());
