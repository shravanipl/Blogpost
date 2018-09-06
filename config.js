"use strict";
//Use mongodb URL to connect locally
exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/blog";
exports.TEST_DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/test-blog";
exports.PORT = process.env.PORT || 8080;



