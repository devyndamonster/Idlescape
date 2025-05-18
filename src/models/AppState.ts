export interface AppState {
    isPaused: boolean;
    isFastForwarding: boolean;
    requiredSecondsToFastForward: number;
    fastForwardSecondsIncrement: number;
}

export const initialAppState: AppState = {
    isPaused: false,
    isFastForwarding: false,
    requiredSecondsToFastForward: 5,
    fastForwardSecondsIncrement: 5,
};