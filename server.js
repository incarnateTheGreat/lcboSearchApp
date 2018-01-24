const express = require('express'),
      app = express(),
      path = require('path'),
      port = 9090;

//All static resouces are placed in the 'public' directory.
app.use(express.static("public"));

app.listen(port);
console.log('Running on :9090...');
