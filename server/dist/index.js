"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const v1_1 = __importDefault(require("./api/v1"));
const users_1 = __importDefault(require("./api/users"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const middleware_1 = require("./middleware/middleware");
const cors = require("cors");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
(0, db_1.connectToDB)();
// middlewares
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// root route
app.get("/", (req, res) => {
    //   redirect to /api/v1
    res.redirect("/api/v1");
});
app.use("/api/v1", middleware_1.authenticateUser, v1_1.default);
app.use('/api/users', users_1.default);
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map