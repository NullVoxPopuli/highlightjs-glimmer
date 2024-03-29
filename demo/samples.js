// @ts-check
/* eslint-disable no-useless-escape */

/**
 * @typedef {Object} Sample
 * @property {string} name;
 * @property {string} language;
 * @property {string} sample;
 *
 */

/** @type { Sample } */
export const glimmer = {
  name: 'Glimmer',
  language: 'glimmer',
  sample: `<Nested::Component
  class="some classes
    {{if (this.someHelper this.foo 12)
       "classes when true"
       "classes when false"
    }}
  "
  @doAction={{fn this.someAction 120}}
  @argB={{hash
    foo="string"
    bar=true
    baz=120
    yolo=(array 12 "string" (hash foo=this.something))
    bax=(fn this.someAction 120)
  }}
  {{resize this.handleResize (fn this.idk 2 "str")}}
  as |foo|
>
  <:block as |foo, baz|>
    {{foo}}

    {{#let foo.bar 12 as |fooBar num|}}
      <fooBar @num={{num}} @arg={{12}} />
    {{/let}}

    {{! comment }}
    {{!-- block }}
      TODO: Indentation is broken after that
      comment --}}

    <baz.component />
  </:block>
</Nested::Component>

<input {{on 'input' (fn this.doSomething 12 "string")}}

{{#each-in this.keyedCollection as |key value|}}
  {{this.localHelper (global-helper key value)}}
{{/each-in}}

{{#each this.listCollection as |value|}}
  <button
    type="button"
    {{on "click" (fn this.handleClick value)}}
  >
    {{value}}
  </button>
{{/each}}

{{#block-component
    property=@value
    prop-erty=this.value
    string="testing"
    onClick=(action "someAction" withParam)
    as |returnValue|
}}
  {{#if foo}}
    \{{escaped handlebars}}
  {{else}}
    <a
      href="#"
      class="{{if inside 'still highlight'}}"
      onclick={{action foo}}
    >

      {{escaped}}
      {{{unescaped}}}

    </a>
    {{textarea}}
  {{/if}}
{{/block-component}}


<style data-demo="true" data-x={{(foo "bar")}}>
  button {
    font-weight: bold;
    text-decoration: underline;
    color: red;
    background: #554433;
  }

  [type="button"] {
    border: 1px solid;
  }
</style>
`,
};

/** @type { Sample } */
export const gjs = {
  name: '.gjs',
  language: 'js',
  sample: `import { on } from '@ember/modifier';

export const Name = <template>
  {{@name}}
</template>;

export default class Hello {
  @tracked name = 'world';

  <template>
    <button {{on 'click' @onClick}}>
      Hello, <Name @name={{this.name}} />!
    </button>

    <style scoped>
      button {
        background: transparent;
      }
    </style>
  </template>
}
`,
};

/** @type { Sample } */
export const gjsTemplateOnly = {
  name: 'template-only .gjs',
  language: 'js',
  sample: `import { helper } from '@ember/component/helper';
import { modifier } from 'ember-modifier';

const plusOne = helper(([num]) => num + 1);

const setScrollPosition = modifier((element, [position]) => {
  element.scrollTop = position
});

<template>
  <div class="scroll-container" {{setScrollPosition @scrollPos}}>
    {{#each @items as |item index|}}
      Item #{{plusOne index}}: {{item}}
    {{/each}}
  </div>

  <style>
    .scroll-container {
      border: 1px solid;
    }
  </style>
</template>
  `,
};

export const multipleTemplateOnly = {
  name: 'multiple template-only .gjs',
  language: 'js',
  sample: `import WeatherSummary from './weather-summary.js';

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
};

/** @type { Sample } */
export const jsWithHbs = {
  name: 'hbs template string literal',
  language: 'js',
  sample: `import { hbs } from 'ember-template-imports';

const Option = hbs\`
  <option selected={{@selected}} value={{@value}}>
    {{or @title @value}}
  </option>
\`;

export const CustomSelect = hbs\`
  <select>
    {{#each @options as |option|}}
      <Option
        @value={{option.value}}
        @selected={{eq option @selectedOption}}
      />
    {{/each}}
  </select>
\`;
`,
};
