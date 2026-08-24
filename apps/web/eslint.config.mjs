// @ts-check
import { createNextConfig } from '../../packages/config/eslint/nextjs.mjs';

const noHardcodedColorsRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hardcoded indigo and hex color classes in favor of design tokens.',
    },
    messages: {
      noHardcodedColor:
        'Avoid hardcoded color class "{{ forbidden }}" in className. Use design token classes like bg-primary, text-primary, or shared <Button> component instead.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (
      filename.endsWith('globals.css') ||
      filename.endsWith('button.tsx') ||
      filename.endsWith('badge.tsx') ||
      filename.endsWith('status-pill.tsx')
    ) {
      return {};
    }

    const forbiddenRegex =
      /\b((bg|text|border|accent|ring|from|to|via)-(indigo|violet|purple|blue|sky|cyan|emerald|green|teal|amber|orange|rose|red)-[0-9]{2,3}(\/[0-9]{1,3})?|(bg|text|border|hover:bg|hover:text)-\[\#[0-9a-fA-F]{3,8}\])\b/g;

    function checkValue(node, value) {
      if (typeof value !== 'string') return;
      let match;
      while ((match = forbiddenRegex.exec(value)) !== null) {
        context.report({
          node,
          messageId: 'noHardcodedColor',
          data: { forbidden: match[1] },
        });
      }
    }

    return {
      JSXAttribute(node) {
        if (node.name.name === 'className') {
          if (node.value && node.value.type === 'Literal') {
            checkValue(node.value, node.value.value);
          } else if (
            node.value &&
            node.value.type === 'JSXExpressionContainer' &&
            node.value.expression
          ) {
            const expr = node.value.expression;
            if (expr.type === 'Literal') {
              checkValue(expr, expr.value);
            } else if (expr.type === 'TemplateLiteral') {
              expr.quasis.forEach((element) => {
                checkValue(element, element.value.raw);
              });
            }
          }
        }
      },
    };
  },
};

const customColorPlugin = {
  rules: {
    'no-hardcoded-colors': noHardcodedColorsRule,
  },
};

export default [
  ...createNextConfig(),
  {
    plugins: {
      'color-guard': customColorPlugin,
    },
    rules: {
      'color-guard/no-hardcoded-colors': 'error',
    },
  },
];

