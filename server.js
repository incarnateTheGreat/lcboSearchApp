const express = require('express'),
      app = express(),
      path = require('path'),
      port = 8080;

//All static resouces are placed in the 'public' directory.
app.use(express.static("public"));

app.listen(port);
