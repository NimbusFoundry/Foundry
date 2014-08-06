/*global module:false*/
module.exports = function(grunt) {
  coffeeFiles = [
  'forum/plugins/account/index.coffee',
  'forum/plugins/forum/components/todolist/index.coffee',
  'forum/plugins/forum/components/example/index.coffee',
  'forum/plugins/forum/index.coffee',
  'forum/app.coffee',
  'core/directives/directives.coffee' 

  ]
  coffeeForCompile = coffeeFiles.reduce(function (pre, current, idx) {
    pre[current.replace(/coffee/,"js")] = current;
    return pre;
  }, {});
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner:'\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      core : {
        src : [
          'core/ga.js',
          'core/core.js',
          'core/plugins/document/*.js',
          'core/plugins/user/*.js',
          'core/plugins/workspace/*.js',
          'core/analytic.js',
          'core/directives/*.js',
          'core/filters/*.js'
        ],
        dest : 'dist/core.js'
      },
      dist: {
        src: [
              'vendor/base64utils.js',
              'vendor/jquery.min.js',
              'vendor/underscore-min.js',
              'vendor/moment.min.js',
              'vendor/angular.min.js',
              'vendor/angular-sanitize.min.js',
              'vendor/angular-route.js',
              'vendor/spinjs/spin.js',
              'vendor/iosOverlay.min.js',
              'vendor/nimbus.min.js',
              'vendor/require.js',
              'vendor/dialog.js',
              'vendor/bootstrap.js',
              'vendor/bootstrap-tab.js',
              'vendor/bootbox.min.js',
              'vendor/bootstrap-wysihtml5/js/wysihtml5-0.3.0.min.js',
              'vendor/bootstrap-wysihtml5/js/bootstrap-wysihtml5.js',
              'vendor/bootstrap-wysihtml5/js/custom_image_and_upload_wysihtml5.js',
              'vendor/ngDialog/js/ngDialog.min.js',
              'vendor/ui-bootstrap/*.js',
              'dist/mailComposer.min.js',
              // 'dist/app.js',
              'dist/core.js'
              ],
        dest: 'dist/main.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/main.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        globals: {
          jQuery: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    },
    nodeunit: {
      files: ['test/**/*_test.js']
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'nodeunit']
      },
      coffeeScripts: {
        files: coffeeFiles,
        tasks: ['coffee','concat'],
        options: {
          spawn: false,
        }
      },
      js: {
        files: [
          'vendor/bootstrap-wysihtml5/js/custom_image_and_upload_wysihtml5.js',
          'vendor/bootstrap-wysihtml5/js/wysihtml5-0.3.0.min.js'
          ],
        tasks: ['concat'],
        options: {
          spawn: false,
        }
      }
    },
    cssmin: {
         options: {
             keepSpecialComments: 0
         },
         compress: {
             files: {
                 'dist/css/default.css': [
                    "assets/bootstrap/css/bootstrap.min.css",
                    "assets/fontawesome/css/font-awesome.min.css",
                    "assets/icheck/skins/square/square.css", 
                    "assets/css/styles.css",
                    "assets/jasny-bootstrap/css/jasny-bootstrap.min.css",
                    "vendor/dialogs.css",
                    "vendor/iosOverlay.css",
                    "vendor/bootstrap-tagsinput/bootstrap-tagsinput.css",
                    "vendor/ngDialog/css/ngDialog.css",
                    "vendor/ngDialog/css/ngDialog-theme-default.css",
                    "vendor/ng-tags-input/ng-tags-input.css",
                    "vendor/bootstrap-wysihtml5/css/bootstrap-wysihtml5.css",
                    "assets/calendar/zabuto_calendar.css",
                    "vendor/fullcalendar/fullcalendar.css"
                 ]
             }
         }
     },
     coffee: {
      jason: {
        files: coffeeForCompile
      }
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-coffee');

  // Default task.
  grunt.registerTask('default', ['jshint', 'nodeunit', 'concat', 'uglify']);

  grunt.registerTask('build', ['concat', 'uglify','cssmin']);

};
