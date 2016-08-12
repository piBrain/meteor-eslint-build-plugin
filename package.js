Package.describe({
    name: 'pibrain:eslint',
    version: '1.0.0',
    summary: 'Lint all your JavaScript files with eslint.',
    documentation: 'README.md',
});

Package.registerBuildPlugin({
    name: "linter-eslint",
    sources: [ 'plugin/linter-eslint.js' ],
    use: [ 'ecmascript' ],
    npmDependencies: {
        "eslint": "3.2.2",
        "eslint-plugin-react": "6.0.0",
        "strip-json-comments": "1.0.4"
    }
});

Package.onUse(function(api) {
    api.versionsFrom('1.4.0.1');
    api.use('isobuild:linter-plugin@1.0.0');
    api.use('ecmascript');
});

Npm.depends({
    "eslint": "3.2.2"
})

Package.onTest(function(api) {
    api.use('ecmascript');
    api.use('tinytest');
});
