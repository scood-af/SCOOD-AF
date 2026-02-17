import * as React from 'react'

interface ShapeProps extends React.SVGProps<SVGSVGElement> {}

/**
 * Shape 1: Wide complex bubble with 2 small solid satellites
 * Original: 1420x923
 */
export const MyShape1 = ({ className, ...props }: ShapeProps) => (
    <svg
        viewBox="0 0 330 331"
        fill="none"
        width="1em"
        height="1em"
        className={className}
        {...props}
    >
        <path
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M224.734 104.915C336.825 28.6236 380.955 197.722 246.837 187.259C367.941 246.291 244.421 369.36 186.523 247.519C196.566 383.117 28.9142 337.088 105.135 225.711C-6.9571 302.003 -51.3647 133.938 83.0301 143.367C-39.3811 85.0936 84.14 -37.9757 143.345 83.1067C131.995 -51.7345 300.953 -6.46218 224.734 104.915Z"
        />
    </svg>
)

/**
 * Star/Cross Shape
 * Original: 275x275
 */
export const MyShape2 = ({ className, ...props }: ShapeProps) => (
    <svg
        viewBox="0 0 275 275"
        fill="none"
        width="1em"
        height="1em"
        className={className}
        {...props}
    >
        <path
            fill="currentColor"
            d="M145.01 7.78021C117.269 -8.23604 81.7966 1.26872 65.7803 29.0097C49.7638 56.7511 59.2688 92.2229 87.0098 108.239C59.2688 92.2229 23.7968 101.727 7.78029 129.469C-8.23621 157.21 1.2688 192.682 29.0098 208.698C56.7512 224.715 92.2227 215.21 108.239 187.469C92.2227 215.21 101.727 250.682 129.469 266.698C157.21 282.715 192.682 273.21 208.698 245.469C224.715 217.727 215.21 182.256 187.469 166.239C215.21 182.256 250.682 172.751 266.698 145.01C282.714 117.269 273.21 81.7967 245.469 65.7802C217.727 49.7637 182.256 59.2687 166.239 87.0097C182.256 59.2687 172.751 23.7967 145.01 7.78021Z"
        />
    </svg>
)
