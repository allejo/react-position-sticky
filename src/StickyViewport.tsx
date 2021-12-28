import React, {
	MutableRefObject,
	ReactElement,
	RefAttributes,
	cloneElement,
	useEffect,
	useRef,
	useState,
} from 'react';

import { IObserverContext, ObserverContext } from './ObserverContext';

interface Props {
	useBrowserViewport?: boolean;
	children: ReactElement & RefAttributes<HTMLElement>;
}

const callbacks = new Map<string, (s: boolean) => void>();

function registerSticky(id: string, cb: (stuck: boolean) => void): boolean {
	if (callbacks.has(id)) {
		return false;
	}

	callbacks.set(id, cb);

	return true;
}

function removeSticky(id: string): boolean {
	return callbacks.delete(id);
}

export function StickyViewport({
	children,
	useBrowserViewport = false,
}: Props) {
	const childRef = useRef(null);
	const [observers, setObservers] = useState<IObserverContext['observers']>({
		top: null,
		btm: null,
	});

	useEffect(() => {
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
					root: childRef.current,
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
					root: childRef.current,
				}
			),
		});
	}, [childRef]);

	// If we're using an element as the sticky viewport, then let's save a ref
	// to it for our `IntersectionObserver`s.
	const clonedProps = {
		ref: (node: any): void => {
			childRef.current = node;
			const ref_ = children.ref;

			if (typeof ref_ === 'function') {
				ref_(node);
			} else if (ref_ !== null) {
				(ref_ as MutableRefObject<HTMLElement>).current = node;
			}
		},
	};

	return (
		<ObserverContext.Provider
			value={{ observers, registerSticky, removeSticky }}
		>
			{useBrowserViewport
				? children
				: cloneElement(children, clonedProps)}
		</ObserverContext.Provider>
	);
}
