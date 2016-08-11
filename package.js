Package.describe({
    name: 'eslint',
    version: '1.0',
    summary: 'Lint all your JavaScript files with eslint.',
    documentation: 'README.md'
});

Package.registerBuildPlugin({
    name: "linter-eslint",
    sources: [
        'plugin/linter-eslint.js'
    ],
    npmDependencies: {
        "eslint": "3.2.2"
    }
});

Package.onUse(function(api) {
    api.use('isobuild:linter-plugin@1.0.0');
});

Package.onTest(function(api) {
    api.use('tinytest');
    api.use('eslint');
});
