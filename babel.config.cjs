module.exports = {
  "presets": [
    [
      "@babel/preset-env", {
        "targets": {
          "node": "current"
        }
      },
      "minify"
    ]
  ],
  "plugins": [
    [
      "@babel/plugin-proposal-class-properties"
    ]
  ]
}