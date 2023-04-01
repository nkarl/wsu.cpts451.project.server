var logger = require("morgan");
var express = require("express");
var cookieParser = require("cookie-parser");

var path = require("path");

var indexRouter = require("./routes/index");
//var usersRouter = require("./routes/users");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, "public")));

app.use("/v1", indexRouter);
//app.use("/users", usersRouter);

module.exports = app;
