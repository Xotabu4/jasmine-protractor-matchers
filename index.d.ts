/// <reference types="jasmine" />

declare module jasmine {
    interface Matchers<T> {
        toAppear(ms_timeout?: number, custom_message?: string): boolean;
        toDisappear(ms_timeout?: number, custom_message?: string): boolean;
    }
}
