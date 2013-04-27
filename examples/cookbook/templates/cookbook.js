
/**
 * Example:
 *
 *    tower create <%= projectName %> my-<%= projectName %>
 */

exports.create = function(recipe, args){
  var options = parseArgs(args)
    , projectName = args[4];

  recipe.outputDirectory(options.outputDirectory);
  recipe.set('projectName', projectName);
  recipe.directory(projectName, function(){
    recipe.template('recipe.js');
    recipe.directory('templates');
  });
}

exports.remove = function(recipe, args){
  var options = parseArgs(args);
  recipe.outputDirectory(options.outputDirectory);
  recipe.removeDirectory(args[4]);
}

function parseArgs(args) {
  var options = require('commander')
    .option('-o, --output-directory [value]', 'Output directory', process.cwd())
    .parse(args);

  return options;
}