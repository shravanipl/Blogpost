"use strict";
//Use mongodb URL to connect locally
exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb://test:test1234@ds141972.mlab.com:41972/blog";
exports.TEST_DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/test-blog";
exports.PORT = process.env.PORT || 8080;



