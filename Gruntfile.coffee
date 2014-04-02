module.exports = (grunt)->
  # Do grunt-related things in here
  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    coffee:
      compileBare:
        options:
          bare: true
        files:
          'lib/launcher.js': 'src/launcher.coffee',
          'lib/ssql.js': 'src/ssql.coffee',
          'lib/ui.js': 'src/ui.coffee',
          'lib/utils.js': 'src/utils.coffee',
          'phantom.js': 'src/phantom.coffee',
          'result.js': 'src/result.coffee'
    watch:
      coffee:
        files: ['src/*.coffee']
        tasks: ['coffee']
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.registerTask 'default', ['coffee', 'watch']