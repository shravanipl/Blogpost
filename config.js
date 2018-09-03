"use strict";

exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/posts";
exports.TEST_DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/test-posts";
exports.PORT = process.env.PORT || 8080;
