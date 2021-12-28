import React, {
	CSSProperties,
	Component,
	ContextType,
	MutableRefObject,
	ReactElement,
	RefAttributes,
	RefObject,
	createRef,
} from 'react';

import { ObserverContext } from './ObserverContext';

interface Props {
	id?: string;
	onSticky?: (stuck: boolean) => void;
	sentinels: {
		top: {
			height: CSSProperties['height'];
			top: CSSProperties['top'];
		};
		bottom: {
			height: CSSProperties['height'];
		};
	};
	children: ReactElement & RefAttributes<HTMLElement>;
}

interface State {
	consoleWarningSent: boolean;
	stuck: string | null;
}

// https://stackoverflow.com/a/2117523
function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0,
			v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

const baseSentinelStyles: Partial<CSSProperties> = {
	left: '0',
	position: 'absolute',
	right: '0',
	visibility: 'hidden',
};

export class StickyElement extends Component<Props, State> {
	private readonly topSentinel: RefObject<HTMLDivElement>;
	private readonly btmSentinel: RefObject<HTMLDivElement>;
	private readonly id: string;
	private referencedChild: HTMLElement | null;

	public static contextType = ObserverContext;
	public context!: ContextType<typeof ObserverContext>;

	constructor(props: Props) {
		super(props);

		this.id = props.id ?? uuidv4();
		this.referencedChild = null;
		this.topSentinel = createRef();
		this.btmSentinel = createRef();
		this.state = {
			consoleWarningSent: false,
			stuck: null,
		};
	}

	_handleStuckCallback = (stuck: boolean): void => {
		this.setState({
			stuck: stuck ? '' : null,
		});

		this.props.onSticky?.(stuck);
	};

	componentDidUpdate(_: Readonly<Props>, prevState: Readonly<State>): void {
		if (this.state.consoleWarningSent !== prevState.consoleWarningSent) {
			return;
		}

		if (this.referencedChild === null) {
			return;
		}

		if (process.env.NODE_ENV !== 'production') {
			const styles = getComputedStyle(this.referencedChild);

			if (styles.position !== 'sticky') {
				if (!this.state.consoleWarningSent) {
					console.warn(
						'Warning: The child of this StickyElement was not detected to have `position: sticky`. Is this intentional?'
					);
				}

				this.setState({ consoleWarningSent: true });
			}
		}

		this.context.registerSticky(this.id, this._handleStuckCallback);
		this.context.observers.top?.observe(this.topSentinel.current!);
		this.context.observers.btm?.observe(this.btmSentinel.current!);
	}

	componentWillUnmount(): void {
		this.context.removeSticky(this.id);
		this.context.observers.top?.unobserve(this.topSentinel.current!);
		this.context.observers.btm?.unobserve(this.topSentinel.current!);
	}

	render(): JSX.Element {
		return (
			<>
				<div
					ref={this.topSentinel}
					style={{
						...baseSentinelStyles,
						...this.props.sentinels.top,
					}}
					data-sticky-sentinel-location="top"
					data-sticky-sentinel-for={this.id}
				/>

				{React.cloneElement(this.props.children, {
					ref: (node: any): void => {
						this.referencedChild = node;
						const ref = this.props.children.ref;

						if (typeof ref === 'function') {
							ref(node);
						} else if (ref !== null) {
							(ref as MutableRefObject<HTMLElement>).current = node;
						}
					},
					'data-stuck': this.state.stuck,
				})}

				<div
					ref={this.btmSentinel}
					style={{
						...baseSentinelStyles,
						...this.props.sentinels.bottom,
						bottom: '0',
					}}
					data-sticky-sentinel-location="bottom"
					data-sticky-sentinel-for={this.id}
				/>
			</>
		);
	}
}
