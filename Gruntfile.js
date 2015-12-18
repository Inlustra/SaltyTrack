module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', 'public/js/**/*.js', 'test/**/*.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        },
        wiredep: {
            task: {
                src: [
                    'public/**/*.html',   // .html support...
                ],

                options: {
                    // See wiredep's configuration documentation for the options
                    // you may pass:

                    // https://github.com/taptapship/wiredep#configuration
                }
            }
        },
        includeSource: {
            options: {
                basePath: 'public/'
            },
            myTarget: {
                files: {
                    'public/index.html': 'public/index.html'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.registerTask('default', ['jshint']);
    grunt.loadNpmTasks('grunt-include-source');

    grunt.registerTask('default', ['wiredep', 'includeSource']);

};