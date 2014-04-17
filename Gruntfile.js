/* 
TO DO

1) Reduce CSS duplication
   - Ideally just a single build - global.scss turns into /build/global.css
   - Can Autoprefixer output minified?
   - If it can, is it as good as cssmin?
   - Could Sass be used again to minify instead?
   - If it can, is it as good as cssmin?

  Note: use /DA/  where DA = '**'
    Traverse through all child levels of directory hierarchy
*/    

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      beforeconcat: ['js/charts/init-county.js'],
      //beforeconcat: ['js/charts/*.js'],
      options: {
        reporter: require('jshint-stylish')
        //reporterOutput: can give file for jshint output
      },
      //afterconcat: ['js/lgc.js']
    },

    concat: {
      dist: {
        src: [
          'js/jquery.js',
          'js/jquery.dataTables.min.js'
        ],
        dest: 'js/production.js',
      }
    },

    uglify: {
      build: {
        src: 'js/production.js',
        dest: 'js/production.min.js'
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 2 version']
      },
      multiple_files: {
        expand: true,
        flatten: true,
        src: 'css/*.css',
        dest: 'css/prefixed/'
      }
    },

    //cssmin: {
      //combine: {
        //files: {
          //'css/build/minified/global.css': ['css/build/prefixed/global.css']
        //}
      //}
    //},

    watch: {
      options: {
        livereload: true,
      },
      scripts: {
        files: ['js/**/*.js'],
        tasks: ['concat', 'uglify', 'jshint'],
        options: {
          spawn: false,
        }
      },
      css: {
        files: ['_scss/*.scss'],
        tasks: ['sass', 'autoprefixer'],
        //tasks: ['sass', 'autoprefixer', 'cssmin'],
        options: {
          spawn: false,
        }
      }
    }
  });

  // default is full rebuild
  grunt.registerTask('default', ['concat', 'uglify', 'jshint']);
};
