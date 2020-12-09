import React, {
	Component,
	ContextType,
	createRef,
	ReactElement,
	RefObject,
} from 'react';
import { ObserverContext } from './ObserverContext';

interface Props {
	onSticky?: (stuck: boolean) => void;
	children: ReactElement;
}

interface State {
	computedStyles: CSSStyleDeclaration | null;

	/**
	 * An epoch timestamp to determine the last update, because `computedStyles`
	 * is an object, it would be expensive to perform a deep comparison between
	 * the styles.
	 */
	lastUpdate: number;

	stuck: string | null;
}

// https://stackoverflow.com/a/2117523
function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
		const r = (Math.random() * 16) | 0,
			v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export class StickyNotifier extends Component<Props, State> {
	private readonly referencedChild: RefObject<HTMLElement>;
	private readonly topSentinel: RefObject<HTMLDivElement>;
	private readonly btmSentinel: RefObject<HTMLDivElement>;
	private readonly id: string;

	public static contextType = ObserverContext;
	public context!: ContextType<typeof ObserverContext>;

	constructor(props: Props) {
		super(props);

		this.id = uuidv4();
		this.referencedChild = createRef();
		this.topSentinel = createRef();
		this.btmSentinel = createRef();
		this.state = {
			computedStyles: null,
			lastUpdate: 0,
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
		if (this.state.lastUpdate !== prevState.lastUpdate) {
			return;
		}

		if (this.referencedChild.current === null) {
			return;
		}

		this.setState({
			computedStyles: getComputedStyle(this.referencedChild.current),
			lastUpdate: new Date().getTime(),
		});

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
					data-sticky-sentinel-location="top"
					data-sticky-sentinel-for={this.id}
				/>

				{React.cloneElement(this.props.children, {
					ref: this.referencedChild,
					stuck: this.state.stuck,
				})}

				<div
					ref={this.btmSentinel}
					data-sticky-sentinel-location="bottom"
					data-sticky-sentinel-for={this.id}
				/>
			</>
		);
	}
}
