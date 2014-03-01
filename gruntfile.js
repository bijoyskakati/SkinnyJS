/* globals module */

function renameFn(extOld, extNew) {
    return function (dest, path) {
        return dest + "/" + path.replace(extOld, extNew);
    };
}

module.exports = function (grunt) {
    var config = {
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            uses_defaults: ["gruntfile.js", "js/**/*.js"],
            with_overrides: {
                options: {
                    jshintrc: "test/.jshintrc"
                },
                files: {
                    src: ["test/**/*.js"]
                }
            },
            options: {
                jshintrc: ".jshintrc"
            }
        },
        connect: {
            server: {
                options: {
                    port: 9001,
                    keepalive: false
                }
            }
        },
        mocha: {
            all: {
                options: {
                    urls: ["test/*.unittests.html"]
                }
            },
            dialogSmallScreen: {
                options: {
                    urls: ["test/jquery.modalDialog.*.unittests.html"]
                }
            },
            specific: {
                options: {
                    urls: ["http://localhost:9001/test/jquery.modalDialog.history.unittests.html"]
                }
            },
            options: {
                reporter: "Spec",
                timeout: 20000
            }
        },
        copy: {
            distJs: {
                files: [{
                    expand: true,
                    cwd: "./js/",
                    src: ["**/*.js", "!*modalDialog*"],
                    dest: "dist/"
                }]
            },
            distCss: {
                files: [{
                    expand: true,
                    src: ["./css/jquery.modalDialog.skins.less"],
                    dest: "dist/"
                }]
            },
            distOther: {
                files: [{
                    expand: true,
                    src: ["./images/**"],
                    dest: "dist/"
                }, {
                    expand: true,
                    cwd: "./js/",
                    src: ["./postmessage.htm"],
                    dest: "dist/"
                }, {
                    expand: true,
                    cwd: "./dependencies/",
                    src: ["./*.js"],
                    dest: "dist/dependencies/"
                }]
            }
        },
        uglify: {
            dist: {
                files: [{
                    expand: true,
                    cwd: "dist",
                    src: ["**.js"],
                    dest: "dist",
                    rename: renameFn(".js", ".min.js")
                }]
            }
        },
        concat: {
            options: {
                separator: "\n"
            },
            modalDialog: {
                src: [
                    "js/jquery.modalDialog.header.js",
                    "js/jquery.modalDialog.userAgent.js",
                    "js/jquery.modalDialog.getSettings.js",
                    "js/jquery.modalDialog.js",
                    "js/jquery.modalDialog.deviceFixes.js",
                    "js/jquery.modalDialog.unobtrusive.js",
                    "js/jquery.modalDialog.history.js"
                ],
                dest: "dist/jquery.modalDialog.js"
            },
            modalDialogContent: {
                src: [
                    "js/jquery.modalDialogContent.header.js",
                    "js/jquery.modalDialog.userAgent.js",
                    "js/jquery.modalDialog.getSettings.js",
                    "js/jquery.modalDialogContent.js",
                    "js/jquery.modalDialog.deviceFixes.js",
                    "js/jquery.modalDialog.unobtrusive.js"
                ],
                dest: "dist/jquery.modalDialogContent.js"
            }
        },
        clean: {
            options: {
                force: true
            },
            build: ["./dist"]
        },
        less: {
            main: {
                files: [{
                    expand: true,
                    cwd: "./css",
                    src: ["*.less"],
                    dest: "./dist/css",
                    rename: renameFn(".less", ".css")
                }]
            }
        },
        "strip_code": {
            options: {},
            all: {
                src: "./dist/**.js"
            }
        },
        watch: {
            modalDialog: {
                files: ["./js/**/*.modalDialog*.js"],
                tasks: ["concat:modalDialog", "concat:modalDialogContent"]
            },
            copyJs: {
                files: ["./js/**/*.js", "!**modalDialog**"],
                tasks: ["copy:distJs"]
            },
            less: {
                files: ["./css/**/*.less"],
                tasks: ["less"]
            },
            options: {
                spawn: false
            }
        },
        jsbeautifier : {
            all: {
                src: ["js/**/*.js", "test/**/*.js"],
                options: { js: { jslintHappy: true } }
            }
        },
        lineending : {
            all: {
                files: [
                    {
                        expand: true,
                        cwd: "./js/",
                        src: ["./**/*.js"],
                        dest: "./js/"
                    }, {
                        expand: true,
                        cwd: "./test/",
                        src: ["./**/*.js"],
                        dest: "./test/"
                    }
                ],
                options: {
                    eol: "crlf"
                }
            }
        },
        wget: {
            filesObject: {
                options: {
                    baseUrl: "http://vistaprint.github.io/PointyJS/"
                },
                files: {
                    "dependencies/pointy.js": "dist/pointy.js",
                    "dependencies/pointy.gestures.js": "dist/pointy.gestures.js"
                }
            }
        }
    };

    // Project configuration.
    grunt.initConfig(config);

    // NPM tasks
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-mocha");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-strip-code");
    grunt.loadNpmTasks("grunt-jsbeautifier");
    grunt.loadNpmTasks("grunt-lineending");
    grunt.loadNpmTasks("grunt-wget");

    // Wrap the mocha task
    grunt.renameTask("mocha", "orig-mocha");

    grunt.registerTask("mocha", function (target) {
        var config = grunt.config.get("mocha");

        // Turn mocha.files into urls for conrib-mocha
        var urls = grunt.util._.map(grunt.file.expand(config.all.options.urls), function (file) {
            return "http://localhost:9001/" + file;
        });

        config.all.options.urls = urls;

        // Turn mocha.files into urls for conrib-mocha
        var smallScreenUrls = grunt.util._.map(grunt.file.expand(config.dialogSmallScreen.options.urls), function (file) {
            return "http://localhost:9001/" + file + "?smallscreen=true";
        });

        config.dialogSmallScreen.options.urls = smallScreenUrls;

        grunt.config.set("orig-mocha", config);

        var taskName = "orig-mocha";
        if (target) {
            taskName += ":" + target;
        }

        grunt.task.run(taskName);
    });

    grunt.registerTask("connect-keepalive", function () {
        var config = grunt.config.get("connect");
        config.server.options.keepalive = true;
        grunt.config.set("connect", config);
        grunt.task.run("connect");
    });

    grunt.registerTask("travis", "default");

    grunt.registerTask("default", ["verify", "build"]);

    grunt.registerTask("test", ["less", "connect", "mocha"]);

    //grunt.registerTask("testSpecific", ["less", "connect", "mocha:specific"]);

    grunt.registerTask("verify", ["jshint", "test"]);

    grunt.registerTask("copyDist", ["copy:distJs", "copy:distCss", "copy:distOther"]);

    grunt.registerTask("build", ["update", "clean", "less", "copyDist", "concat:modalDialog", "concat:modalDialogContent", "strip_code", "uglify"]);

    grunt.registerTask("beautify", ["jsbeautifier", "lineending"]);

    grunt.registerTask("update", ["wget"]);
};
