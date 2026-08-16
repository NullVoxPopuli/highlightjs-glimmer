import type { HLJSApi, LanguageFn } from 'highlight.js';

export function setup(hljs: HLJSApi): void;
export function registerLanguage(hljs: HLJSApi): void;
export function registerInjections(hljs: HLJSApi): void;
export function glimmer(hljs: HLJSApi): ReturnType<LanguageFn>;
