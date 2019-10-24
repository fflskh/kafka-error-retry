
import moment = require("moment");
interface PolicyInterface {
  retryCount: number,
  backoff: boolean
}

export default class Policy {
  policy: PolicyInterface

  getDefaultPolicy(): PolicyInterface {
    return this.policy = {
      retryCount: 10,
      backoff: true
    };
  }

  getNextTimeByPolicy(retryCount: number, policy: PolicyInterface) {
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