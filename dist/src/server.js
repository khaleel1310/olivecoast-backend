"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables before importing app to ensure they are available
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 4000;
app_1.default.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` 🍽️  Olive Coast Mediterranean Kitchen API Active`);
    console.log(` 🚀 Server is running smoothly on port: ${PORT}`);
    console.log(`===================================================`);
});
