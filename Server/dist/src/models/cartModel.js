"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var cartItemSchema = new mongoose_1.default.Schema({
    student: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Student",
        requied: true
    },
    course: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "courseModel",
            requied: true
        }
    ],
});
var CartModel = mongoose_1.default.model("cart", cartItemSchema);
exports.default = CartModel;
