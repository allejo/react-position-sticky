import 'react-app-polyfill/ie11';

import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { StickyElement, StickyViewport } from '../src';

function normalizeTitle(title) {
	return title.replace(/[\s!]/g, '-');
}

const loremIpsum = `
Pulvinar mattis nunc sed blandit libero. Est lorem ipsum dolor sit. Non pulvinar
neque laoreet suspendisse interdum consectetur libero id faucibus. Condimentum
mattis pellentesque id nibh tortor. Porttitor leo a diam sollicitudin tempor.
Eget magna fermentum iaculis eu non diam phasellus. Consequat interdum varius
sit amet. Porttitor leo a diam sollicitudin tempor id eu nisl. Diam maecenas sed
enim ut sem viverra aliquet. A iaculis at erat pellentesque adipiscing commodo
elit. Elementum facilisis leo vel fringilla est ullamcorper eget nulla. Nam
aliquam sem et tortor consequat id. Egestas egestas fringilla phasellus faucibus
scelerisque eleifend donec. Nunc congue nisi vitae suscipit tellus. Ullamcorper
a lacus vestibulum sed arcu. Posuere ac ut consequat semper viverra. Tortor
dignissim convallis aenean et tortor at risus viverra adipiscing. Viverra
aliquet eget sit amet tellus cras. Sapien faucibus et molestie ac feugiat sed
lectus vestibulum mattis. Imperdiet proin fermentum leo vel. Cras fermentum odio
eu feugiat pretium nibh. Turpis in eu mi bibendum neque egestas congue quisque
egestas. Mattis pellentesque id nibh tortor id aliquet. Nunc non blandit massa
enim nec dui nunc mattis enim. Augue neque gravida in fermentum et sollicitudin.
Non blandit massa enim nec dui nunc mattis. Pharetra pharetra massa massa
ultricies mi quis hendrerit. Amet volutpat consequat mauris nunc congue nisi
vitae suscipit. Lacinia quis vel eros donec ac odio tempor orci dapibus.
Suspendisse sed nisi lacus sed viverra tellus. Dui faucibus in ornare quam
viverra orci. Sit amet volutpat consequat mauris nunc. Sagittis aliquam
malesuada bibendum arcu vitae elementum. Aenean pharetra magna ac placerat
vestibulum lectus mauris ultrices eros. Ipsum dolor sit amet consectetur.
Maecenas sed enim ut sem viverra aliquet eget. Dui accumsan sit amet nulla
facilisi morbi tempus iaculis. Proin libero nunc consequat interdum varius sit
amet mattis vulputate. Mauris rhoncus aenean vel elit scelerisque mauris.
Convallis tellus id interdum velit laoreet. Rhoncus est pellentesque elit
ullamcorper dignissim cras. Vel pharetra vel turpis nunc eget lorem dolor sed.
`;

const App = () => {
	const Messages = [
		'No',
		'JavaScript',
		'scroll events',
		'were',
		'used',
		'on',
		'this',
		'page!',
	];
	const ref = React.useRef<HTMLDivElement>(null);
	const [header, setHeader] = React.useState('--');
	const [debug, setDebug] = React.useState(false);

	const handleSticky = (stuck: boolean, header: string) => {
		setHeader(stuck ? header : '--');
	};
	const scrollTo = (event: React.SyntheticEvent<HTMLAnchorElement>): void => {
		event.preventDefault();

		const anchor = event.currentTarget;
		const target = document.querySelector(anchor.getAttribute('href')!);
		const parent = target!.parentElement!.parentElement;

		// Slight px offset so IntersectionObserver triggers.
		// Note: Smooth scroll is taken care of. Container has
		// `scroll-behavior: smooth`.
		ref.current?.scrollTo({ left: 0, top: parent!.offsetTop + 2 });
	};

	return (
		<div>
			<header>
				<h2>Know when sticky positioned elements are stuck.</h2>
				<p>
					This page uses{' '}
					<code>
						<a
							href="https://developers.google.com/web/updates/2016/04/intersectionobserver"
							target="_blank"
							rel="noreferrer"
						>
							IntersectionObserver
						</a>
					</code>{' '}
					to fire an event when each header begins to stick, and vice
					versa. <b>No scroll events</b> were harmed in the making of
					this demo.{' '}
					<a
						href="https://developers.google.com/web/updates/2017/09/sticky-headers"
						target="_blank"
						rel="noreferrer"
					>
						Read more about it
					</a>
					.
				</p>
			</header>

			<p>Instructions: Scroll the container below...</p>

			<div className="sticky-status">
				<span>
					Sticking header: <b>{header}</b>
				</span>
				<button onClick={() => setDebug(!debug)}>
					Toggle debug mode
				</button>
			</div>

			<main className={debug ? 'debug' : ''}>
				<StickyViewport>
					<div id="container" ref={ref}>
						{Messages.map((msg, index) => (
							<div key={index} className="sticky-item">
								<StickyElement
									onSticky={(stuck) => {
										handleSticky(stuck, msg);
									}}
									sentinels={{
										top: {
											top: '0',
											height: '16px',
										},
										bottom: {
											height: '96px',
										},
									}}
								>
									<div className="sticky">
										<h2 id={normalizeTitle(msg)}>{msg}</h2>
									</div>
								</StickyElement>

								<div>{loremIpsum}</div>
							</div>
						))}
					</div>
				</StickyViewport>
				<aside style={{ minWidth: '200px' }}>
					<ul>
						{Messages.map((msg, index) => (
							<li key={index}>
								<a
									href={`#${normalizeTitle(msg)}`}
									onClick={scrollTo}
								>
									{msg}
								</a>
							</li>
						))}
					</ul>
				</aside>
			</main>
		</div>
	);
};

ReactDOM.render(<App />, document.getElementById('root'));
