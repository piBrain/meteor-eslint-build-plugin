import { linter } from 'eslint'
var radium = Npm.require('radium')
const stripJsonComments = Npm.require('strip-json-comments')

Plugin.registerLinter(
    {
        extensions: ["js","jsx"],
        filenames: [".eslintrc"]
    },
    () => {
        return new EsLinter();
    }
);

class EsLinter {

  constructor() {

      this.defaults = JSON.stringify({
          env: {
            meteor: true,
            browser: true
          },
          parserOptions: {
            ecmaVersion: 6,
            sourceType: "module",
            ecmaFeatures: {
              jsx: true
            }
          }
      });
      this._cacheByPackage = {};
  }

  processFilesForPackage(files, options) {
      var globals = options.globals;

      // Assumes that this method gets called once per package.
      const packageName = files[0].getPackageName();
      if (! this._cacheByPackage.hasOwnProperty(packageName)) {
          this._cacheByPackage[packageName] = {
              configString: this.defaults,
              files: {}
          };
      }
      const cache = this._cacheByPackage[packageName];

      var configs = files.filter(function (file) {
          return file.getBasename() === '.eslintrc';
      });
      if (configs.length > 1) {
          configs[0].error({
              message: "Found multiple .eslintrc files in package " + packageName +
              ": " +
              configs.map((c) => { return c.getPathInPackage(); }).join(', ')
          });
          return;
      }

      if (configs.length) {
          var newConfigString = configs[0].getContentsAsString();
          if (cache.configString !== newConfigString) {
              // Reset cache.
              cache.files = {};
              cache.configString = newConfigString;
          }
      } else {
          if (cache.configString !== this.defaults) {
              // Reset cache.
              cache.files = {};
              cache.configString = this.defaults;
          }
      }

      try {
          var config = JSON.parse(stripJsonComments(cache.configString));
      } catch (err) {
          // This should really not happen for this.defaults :)
          configs[0].error({
              message: "Failed to parse " + configs[0].getPathInPackage() +
              ": not valid JSON: " + err.message
          });
          return;
      }

      files.map((file) => {
          if (file.getBasename() === '.eslintrc') return

          // skip files we already linted
          let cacheKey = JSON.stringify([file.getPathInPackage(), file.getArch()]);
          if (cache.files.hasOwnProperty(cacheKey) &&
          cache.files[cacheKey].hash === file.getSourceHash()) {
              this.reportErrors(file, cache.files[cacheKey].errors);
              return;
          }

          let errors = linter.verify(file.getContentsAsString(), config);
          if(errors) this.reportErrors(file, errors);

          cache.files[cacheKey] = { hash: file.getSourceHash(), errors: errors };
      });


  }

  reportErrors(file, errors) {
      errors.map((err) => {
          file.error({
              message: err.message,
              line: err.line,
              column: err.column
          });
      });
  }

}
