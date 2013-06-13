
/**
 * Module dependencies.
 */

var Recipe = require('tower-recipe');
var fs = require('tower-fs');
var noop = function(){};

/**
 * Cookbook lookup paths.
 */

exports.lookupDirectories = [
  fs.join(process.cwd(), 'cookbooks'),
  fs.join(process.cwd(), 'lib/cookbooks'),
  fs.join(process.env.HOME, '.tower/node_modules'),
  fs.join(__dirname, 'examples')
];

/**
 * Lookup a single cookbook.
 *
 * This is resolved from the command line.
 *
 * @param {String} name A cookbook name such as `ec2` or `ec2:instance`.
 * @param {Array} directories An array of directory string paths.
 * @return {Cookbook} A cookbook.
 */

exports.find = function(name, directories){
  var parts = name.split(':');
  var key = parts.shift();
  var cookbook;

  // XXX: cache
  //var paths = findOrCreateCookbookPaths();
  //if (paths && paths[key]) {
  //  
  //}

  directories || (directories = exports.lookupDirectories);

  // XXX: should cache this in ~/.tower/config/packages.json or something.
  directories.forEach(function(directory){
    fs.directoryPathsSync(directory).forEach(function(path){
      var pkg = fs.join(path, 'package.json');
      pkg = fs.existsSync(pkg) && require(pkg);

      if (pkg && key === pkg.cookbook) {
        cookbook = require(path);
        // namespace
        cookbook.ns = pkg.cookbook;
        // XXX: where templates are.
        cookbook.sourcePath = fs.join(path, 'templates');
      }

      return !cookbook;
    });

    return !cookbook; // exit if one was found.
  });

  if (!cookbook) {
    console.log('Cookbook [' + name + '] not found.')
    process.exit();
  }

  // nested cookbook.
  if (parts.length) {
    name = parts.join(':');
    if (cookbook.aliases) {
      while (cookbook.aliases[name])
        name = cookbook.aliases[name];
    }
    // XXX: cache these paths, for faster lookup later.
    cookbook = require(cookbook(name));
  }

  return cookbook;
};

/**
 * Execute `action` on recipe `name`.
 *
 * @param {String} name Name of the recipe.
 * @param {String} action Action (verb) the recipe implements.
 * @param {Array} args Arguments passed in from the command line (process.argv).
 * @param {Function} The executed callback.
 * @api public
 */

exports.exec = function(name, action, args, fn){
  var cookbook = exports.find(name);
  var method = cookbook[action];

  if (!method) {
    console.log('Cookbook [' + name + '] action [' + action + '] is not defined.');
    process.exit();
  }
  
  // XXX: handle source path again.
  var recipe = new Recipe(cookbook.sourcePath);

  // XXX: for nested methods, handle callback.
  if (3 === method.length)
    method.call(recipe, recipe, args, fn || noop);
  else {
    method.call(recipe, recipe, args);
    if (fn) fn();
  }
};

/**
 * Creates ~/.tower/config/cookbooks.json.
 *
 * XXX: We should probably generalize `cookbooks.json`
 *      to include more packages.
 *
 * @return {String} An existin `cookbooks.json` file contents.
 */

function findCookbookPaths() {
  // XXX: refactor
  var path = fs.join(process.env.HOME, '.tower');
  if (!fs.existsSync(path)) fs.mkdirSync(path);
  path = fs.join(path, 'config');
  if (!fs.existsSync(path)) fs.mkdirSync(path);
  path = fs.join(path, 'cookbooks.json');
  if (fs.existsSync(path)) return fs.readFileSync(path);
}