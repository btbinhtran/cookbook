
/**
 * Example:
 *
 *    tower create recipe my-recipe
 */

exports.create = function(recipe, args){
  var options = parseArgs(args)
    , projectName = args[4];

  recipe.outputDirectory(options.outputDirectory);
  recipe.set('projectName', projectName);
  recipe.directory(projectName, function(){
    recipe.template('index.js', 'recipe.js');
    recipe.directory('templates');
  });
}

exports.remove = function(recipe, args){
  var options = parseArgs(args);
  recipe.outputDirectory(options.outputDirectory);
  recipe.removeDirectory(args[4]);
}

/**
 * Install a recipe into $HOME/.tower/recipes
 */

exports.install = function(recipe, args){
  var path = require('path');
  var projectName = args[4];

  process.chdir(path.join(process.env.HOME, '.tower/recipes'));

  var spawn = require('child_process').spawn;
  
  spawn('npm', ['install', projectName], { stdio: 'inherit' })
    .on('exit', function(){
      // XXX: need to update the recipe so it looks in node_modules.
      spawn('mv', [path.join('node_modules', projectName), projectName]);
    });
}

function parseArgs(args) {
  var options = require('commander')
    .option('-o, --output-directory [value]', 'Output directory', process.cwd())
    .parse(args);

  return options;
}