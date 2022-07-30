module.exports = {
  plugins: [require('@trivago/prettier-plugin-sort-imports')],
  arrowParens: 'avoid',
  importOrder: ['^@workzen/(.*)$', '^~/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  jsxSingleQuote: true,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
}
