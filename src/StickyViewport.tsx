import React, {
	ReactElement,
	cloneElement,
	useEffect,
	useRef,
	useState,
} from 'react';

import { IObserverContext, ObserverContext } from './ObserverContext';

interface Props {
	children: ReactElement;
}

const callbacks = new Map<string, (s: boolean) => void>();

function registerSticky(
	id: string,
	callback: (stuck: boolean) => void
): boolean {
	if (callbacks.has(id)) {
		return false;
	}

	callbacks.set(id, callback);

	return true;
}

function removeSticky(id: string): boolean {
	return callbacks.delete(id);
}

export function StickyViewport(props: Props) {
	const ref = useRef();
	const [observers, setObservers] = useState<IObserverContext['observers']>({
		top: null,
		btm: null,
	});

	useEffect(() => {
		if (ref.current === null) {
			return;
		}

		setObservers({
			top: new IntersectionObserver(
				(records) => {
					for (const record of records) {
						const targetID = record.target.getAttribute(
							'data-sticky-sentinel-for'
						);
						const targetInfo = record.boundingClientRect;
						const rootBoundsInfo = record.rootBounds;

						if (rootBoundsInfo === null) {
							continue;
						}

						// Our top sentinel has become invisible meaning our target
						// has gotten stuck.
						if (targetInfo.bottom < rootBoundsInfo.top) {
							callbacks.get(targetID!)?.(true);
						}

						// Our top sentinel has reappeared, meaning our target is
						// now unstuck.
						if (
							targetInfo.bottom >= rootBoundsInfo.top &&
							targetInfo.bottom < rootBoundsInfo.bottom
						) {
							callbacks.get(targetID!)?.(false);
						}
					}
				},
				{
					threshold: [0],
					root: ref.current,
				}
			),
			btm: new IntersectionObserver(
				(records) => {
					for (const record of records) {
						const targetID = record.target.getAttribute(
							'data-sticky-sentinel-for'
						);
						const targetInfo = record.boundingClientRect;
						const rootBoundsInfo = record.rootBounds;
						const ratio = record.intersectionRatio;

						if (rootBoundsInfo === null) {
							continue;
						}

						if (
							targetInfo.bottom > rootBoundsInfo.top &&
							ratio === 1
						) {
							callbacks.get(targetID!)?.(true);
						}

						if (
							targetInfo.top < rootBoundsInfo.top &&
							targetInfo.bottom < rootBoundsInfo.bottom
						) {
							callbacks.get(targetID!)?.(false);
						}
					}
				},
				{
					threshold: [1],
					root: ref.current,
				}
			),
		});
	}, [ref]);

	return (
		<ObserverContext.Provider
			value={{ observers, registerSticky, removeSticky }}
		>
			{cloneElement(props.children, { ref })}
		</ObserverContext.Provider>
	);
}
