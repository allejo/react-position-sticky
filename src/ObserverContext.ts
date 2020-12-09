import { createContext } from 'react';

export interface IObserverContext {
	observers: {
		top: IntersectionObserver | null;
		btm: IntersectionObserver | null;
	};
	registerSticky: (id: string, callback: (stuck: boolean) => void) => boolean;
	removeSticky: (id: string) => boolean;
}

export const ObserverContext = createContext<IObserverContext>({
	observers: {
		top: null,
		btm: null,
	},
	registerSticky: () => false,
	removeSticky: () => false,
});
