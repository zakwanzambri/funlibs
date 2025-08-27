import React from 'react';
import Button from './Button';

/**
 * Simple form wrapper that forwards submit events and supports Tailwind styling.
 *
 * @param onSubmit Callback when the form is submitted.
 * @param children Form fields to render inside the form.
 * @param submitLabel Label for the submit button. Defaults to `Submit`.
 */
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  submitLabel?: string;
}

export const Form: React.FC<FormProps> = ({ submitLabel = 'Submit', children, ...rest }) => (
  <form className="space-y-4" role="form" {...rest}>
    {children}
    <Button type="submit">{submitLabel}</Button>
  </form>
);

export default Form;
