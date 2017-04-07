declare module jasmine {
    interface Matchers {
        toAppear(ms_timeout?: number, custom_message?: string): boolean;
        toDisappear(ms_timeout?: number, custom_message?: string): boolean;
    }
}