const path=require('path');  
function resolve (dir) {  
    path.join(__dirname, dir);  
}  

module.exports = {
  css: {
    extract: false
  },
  configureWebpack: {
    output: {
      libraryExport: 'default'
    },
    resolve: {  
      extensions: ['js', 'vue'],  
      alias: {  
                '@': resolve('src')  
            }  
    } 

  }
}