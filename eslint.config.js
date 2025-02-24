import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  rules: {
    'react/prefer-destructuring-assignment': 'off',
  },
})
