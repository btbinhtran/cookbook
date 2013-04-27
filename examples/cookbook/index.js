
/**
 * Example:
 *
 *    tower create cookbook my-cookbook
 */

exports.create = function(recipe, args){
  var options = parseArgs(args)
    , projectName = args[4];

  recipe.outputDirectory(options.outputDirectory);
  recipe.set('projectName', projectName);
  recipe.set('strcase', require('tower-strcase'));
  recipe.directory(projectName, function(){
    recipe.template('index.js', 'cookbook.js');
    recipe.template('package.json');
    recipe.template('.gitignore');
    recipe.template('.npmignore');
    recipe.template('README.md', 'README.md');
    recipe.directory('templates');
  });
}

exports.remove = function(recipe, args){
  var options = parseArgs(args);
  recipe.outputDirectory(options.outputDirectory);
  recipe.removeDirectory(args[4]);
}

/**
 * Install a cookbook into $HOME/.tower/node_modules
 */

exports.install = function(recipe, args){
  var path = require('path');
  var projectName = args[4];

  process.chdir(path.join(process.env.HOME, '.tower'));

  var spawn = require('child_process').spawn;
  
  spawn('npm', ['install', projectName], { stdio: 'inherit' })
    .on('exit', function(){
      // XXX: need to update the recipe so it looks in node_modules.
    });
}

function parseArgs(args) {
  var options = require('commander')
    .option('-o, --output-directory [value]', 'Output directory', process.cwd())
    .parse(args);

  return options;
}