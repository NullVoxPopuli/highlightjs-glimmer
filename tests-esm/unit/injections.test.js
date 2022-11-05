import { describe, test, expect } from 'vitest';
import { stripIndent } from 'common-tags';
import { parse, tag, list } from '../-utils';

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
        '<span class="hljs-keyword">const</span> hbs<span class="hljs-string">`{{foo}}`</span>'
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
        'js'
      );

      expect(result).toEqual(
        stripIndent`
          <span class="hljs-keyword">export</span> <span class="hljs-keyword">const</span> <span class="hljs-title class_">Name</span> = <span class="language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">template</span>&gt;</span>
            {{@name}}
          <span class="hljs-tag">&lt;/<span class="hljs-name">template</span>&gt;</span></span>;
        `
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

      expect(result).toEqual(
        tag('hljs-name', ['{{', tag('punctuation', '@'), tag('params', 'name'), '}}'])
      );
    });

    test('explicit default export', () => {
      let result = parse(
        stripIndent`
          export default <template>
            {{@name}}
          </template>
        `,
        'js'
      );

      console.log(result);
      expect(result).toEqual(
        list(
          tag('hljs-keyword', 'export'),
          ' ',
          tag('hljs-keyword', 'default'),

          tag('hljs-name', ['{{', tag('punctuation', '@'), tag('params', 'name'), '}}'])
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

      expect(result).toEqual();
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

      expect(result).toEqual();
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

      expect(result).toEqual();
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

      expect(result).toEqual();
    });
  });
});
