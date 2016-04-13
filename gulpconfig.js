module.exports = {

    all: {
        scss: 'src/scss/**/*.scss',

        js: 'src/js/**/*.js',

        dist: 'dist/**'
    },

    src: {

        scss: {
            autocomplete: [
                'src/scss/autocomplete.scss'
            ]
        },

        js: {
    	    autocomplete: [
                'src/js/autocomplete.js'
            ]
        }

    },

    dist: {
        css: 'dist/css',
        js: 'dist/js'
    }

};
