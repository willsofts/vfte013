const path = require("path");
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({  
  indexPath: "vfte013.html", //this change target html to specified file name
  outputDir: "vfte013", //this change target folder to spcified name
  pages: {
    index: {
      entry: 'src/vfte013.js',
      title: 'Mail Template Setting',
    }
  },
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' /* this is BASE_URL in index.html */
    ? './' /*+ process.env.CI_PROJECT_NAME + '/'*/
    : './',
  configureWebpack: {
    devtool: "source-map",
    optimization: {
      minimize: false
    },
    resolve: {
      alias: {
        // bind version of jquery-ui
        "jquery-ui": "jquery-ui-dist/jquery-ui.js",
        // bind to modules;
        modules: path.join(__dirname, "node_modules")
      }
    },
    /*
    externals: {
    "./assets/tinymce/js/tinymce/tinymce.js" : "tinymce",
    "./assets/tinymce/js/tinymce/jquery.tinymce.min.js": "jquery.tinymce",
    },
    module: {
      noParse: (content) => { 
        return /tinymce/.test(content); 
      },
    },*/
  }    
})
