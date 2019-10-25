"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
class Policy {
    getDefaultPolicy() {
        return this.policy = {
            retryCount: 10,
            backoff: true
        };
    }
    getNextTimeByPolicy(retryCount, policy) {
        if (!retryCount) {
            retryCount = 1;
        }
        if (policy.backoff) {
            let increaseSeconds = Math.pow(2, retryCount);
            return moment().add(increaseSeconds, "seconds").toDate();
        }
        return moment().add(retryCount, "seconds").toDate();
    }
}
exports.default = Policy;
