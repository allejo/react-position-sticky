import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { StickyElement, StickyViewport } from '../src';

describe('it', () => {
	it.skip('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(
			<div>
				<StickyViewport>
					<div>
						<StickyElement
							sentinels={{
								top: {
									top: '-24px',
									height: '40px',
								},
								bottom: {
									height: '96px',
								},
							}}
						>
							<div style={{ position: 'sticky' }} />
						</StickyElement>
					</div>
				</StickyViewport>
			</div>,
			div
		);
		ReactDOM.unmountComponentAtNode(div);
	});
});
