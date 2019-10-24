"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function debug(message, level) {
    if (!level) {
        level = "info";
    }
    if (level === "off") {
        return;
    }
    console[level](message);
}
exports.default = debug;
//# sourceMappingURL=debug.js.map