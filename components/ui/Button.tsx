import React from 'react';

/**
 * Accessible button component styled with TailwindCSS and supporting dark mode.
 *
 * @param variant Visual style of the button. Defaults to `primary`.
 * @param size Size of the button. Defaults to `md`.
 * @param onClick Callback invoked when the button is activated.
 * @param children Content of the button.
 */
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
}

/**
 * Button component that ensures keyboard accessibility and ARIA role.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  children
}) => {
  const base = 'rounded focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium';
  const variants: Record<string, string> = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400',
    secondary:
      'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-400'
  };
  const sizes: Record<string, string> = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      role="button"
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </button>
  );
};

export default Button;
