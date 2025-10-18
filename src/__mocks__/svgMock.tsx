import * as React from 'react';

// Mock SVG component for Jest tests
// This replaces actual SVG imports with a simple svg element for testing
const SvgMock = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    (props, ref) => <svg ref={ref} {...props} data-testid="svg-mock" />
);

SvgMock.displayName = 'SvgMock';

export default SvgMock;
