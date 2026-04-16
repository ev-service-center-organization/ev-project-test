exports.config = {
  tests: './tests/*_test.js',
  output: './output',
  helpers: {
    REST: {
      endpoint: 'http://localhost:8080/api', 
      defaultHeaders: {
        'Content-Type': 'application/json'
      }
    },
    JSONResponse: {}
  },
  include: {
    I: './steps_file.js'
  },
  name: 'ev-project-test'
};