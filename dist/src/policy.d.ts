interface PolicyInterface {
    retryCount: number;
    backoff: boolean;
}
export default class Policy {
    policy: PolicyInterface;
    getDefaultPolicy(): PolicyInterface;
    getNextTimeByPolicy(retryCount: number, policy: PolicyInterface): Date;
}
export {};
