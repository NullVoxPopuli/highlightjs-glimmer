import { describe, test, expect } from 'vitest';
import { stripIndent } from 'common-tags';
import { parse, tag, list, glimmer, template, tags, formattedEquals, format } from '../-utils';

describe('Injections | JS', () => {
  describe('hbs template literal', () => {
    test('basic', () => {
      let result = parse(
        stripIndent`
          const hbs\`{{foo}}\`
        `,
        'js'
      );

      expect(result).toEqual(
        '<span class="hljs-keyword">const</span> hbs`<span class="language-glimmer"><span class="hljs-punctuation mustache">{{<span class="hljs-title">foo</span>}}</span>`</span>'
      );
    });
  });

  describe('gjs / template tag', () => {
    test('basic', () => {
      let result = parse(
        stripIndent`
          export const Name = <template>
            {{@name}}
          </template>;
        `,
        'glimmer-javascript'
      );

      expect(result).toEqual(
        list(
          tags.keyword.export,
          ' ',
          tags.keyword.const,
          ' ',
          tag('title class_', 'Name'),
          ' = ',
          glimmer(template(tags.mustache(tags.arg('name')))),
          ';'
        )
      );
    });

    test('implied default export', () => {
      let result = parse(
        stripIndent`
          <template>
            {{@name}}
          </template>
        `,
        'js'
      );

      expect(result).toEqual(glimmer(template(tags.mustache(tags.arg('name')))));
    });

    test('explicit default export', () => {
      let result = parse(
        stripIndent`
          export default <template>
            {{@name}}
          </template>
        `,
        'javascript'
      );

      expect(result).toEqual(
        list(
          tags.keyword.export,
          ' ',
          tags.keyword.default,
          ' ',
          glimmer(template(tags.mustache(tags.arg('name'))))
        )
      );
    });

    test('with imports', () => {
      let result = parse(
        stripIndent`
          import Greeting from './greeting.js';
          import WeatherSummary from './weather-summary.js';

          <template>
            <div>
              <Greeting @name="Chris" />
              <WeatherSummary />
            </div>
          </template>
        `,
        'js'
      );

      formattedEquals(
        result,
        list(
          // These are JS and not tagged by us
          `<span class="hljs-keyword">import</span> <span class="hljs-title class_">Greeting</span> <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;./greeting.js&#x27;</span>;`,
          '\n',
          `<span class="hljs-keyword">import</span> <span class="hljs-title class_">WeatherSummary</span> <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;./weather-summary.js&#x27;</span>;`,
          '\n',
          '\n',
          glimmer(
            template(
              tags.element('div', [
                tags.selfClosing('Greeting', [
                  ' ',
                  tags.arg('name'),
                  tags.operator.equals,
                  tags.string('Chris'),
                ]),
                '\n',
                tags.selfClosing('WeatherSummary'),
              ])
            )
          )
        )
      );
    });

    test('a function exists above the template', () => {
      let result = parse(
        stripIndent`
          import Greeting from './greeting.js';
          import WeatherSummary from './weather-summary.js';

          function isBirthday(dateOfBirth) {
            const now = new Date();
            return (
              dateOfBirth.getDate() === now.getDate() &&
              dateOfBirth.getMonth() === now.getMonth()
            );
          }

          <template>
            <div>
              <Greeting @name="Chris" />
              {{#if (isBirthday @user.dateOfBirth)}}
                <Celebration type='birthday' />
              {{/if}}
              <WeatherSummary />
            </div>
          </template>
        `,
        'js'
      );

      formattedEquals(
        result,
        list(
          // These are JS and not tagged by us
          `<span class="hljs-keyword">import</span> <span class="hljs-title class_">Greeting</span> <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;./greeting.js&#x27;</span>;
 <span class="hljs-keyword">import</span> <span class="hljs-title class_">WeatherSummary</span> <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;./weather-summary.js&#x27;</span>;

 <span class="hljs-keyword">function</span> <span class="hljs-title function_">isBirthday</span>(<span class="hljs-params">dateOfBirth</span>) {
   <span class="hljs-keyword">const</span> now = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Date</span>();
   <span class="hljs-keyword">return</span> (
     dateOfBirth.<span class="hljs-title function_">getDate</span>() === now.<span class="hljs-title function_">getDate</span>() &amp;&amp;
     dateOfBirth.<span class="hljs-title function_">getMonth</span>() === now.<span class="hljs-title function_">getMonth</span>()
   );
 }`,
          '\n',
          '\n',
          glimmer(
            template(
              tags.element('div', [
                tags.selfClosing('Greeting', [
                  ' ',
                  tags.arg('name'),
                  tags.operator.equals,
                  tags.string('Chris'),
                ]),
                '\n',
                tags.mustache(
                  '#',
                  tag('title', tag('built_in', 'if')),
                  tag('punctuation', '('),
                  tag('title', 'isBirthday'),
                  ' ',
                  tag('punctuation', '@'),
                  tag('params', 'user'),
                  tag('punctuation', '.'),
                  tag('title', 'dateOfBirth'),
                  tag('punctuation', ')')
                ),
                tags.selfClosing('Celebration', [
                  tag('attribute', 'type'),
                  tags.operator.equals,
                  tag('string', ['&#x27;', 'birthday', '&#x27;']),
                ]),
                tags.mustache('/', tag('title', tag('built_in', 'if'))),
                tags.selfClosing('WeatherSummary'),
              ])
            )
          )
        )
      );
    });

    test('is embedded in a class', () => {
      let result = parse(
        stripIndent`
          import Component from '@glimmer/component';
          import { gt, lt } from '@glimmer/helper';

          export default class WeatherSummary extends Component {
            @tracked currentTemp;

            interval;

            getWeather = () => {
              this.currentTemp = // something
            }

            constructor(owner, args) {
              super(owner, args);
              this.interval = setInterval(this.getWeather, 10000);
            }

            willDestroy() {
              super.willDestroy();
              clearInterval(this.interval);
            }

            <template>
              <p>
                The current temperature is {{this.currentTemp}}!
                {{#if (lt 50 this.currentTemp)}}
                  Brr! 🥶
                {{else if (gt 80 this.currentTemp)}}
                  Yikes! 🥵
                {{/if}}
              </p>
            </template>
          }
        `,
        'js'
      );

      expect(format(result)).toMatchSnapshot();
    });

    test('multiple components', () => {
      let result = parse(
        stripIndent`
          import WeatherSummary from './weather-summary.js';

          const Greeting = <template>
            <p>Hello, {{@name}}!</p>
          </template>;

          function isBirthday(dateOfBirth) {
            const now = new Date();
            return (
              dateOfBirth.getDate() === now.getDate() &&
              dateOfBirth.getMonth() === now.getMonth()
            );
          }

          <template>
            <div>
              <Greeting @name="Chris" />
              {{#if (isBirthday @user.dateOfBirth)}}
                <Celebration type='birthday' />
              {{/if}}
              <WeatherSummary />
            </div>
          </template>
        `,
        'js'
      );

      expect(format(result)).toMatchSnapshot();
    });
  });
});
