import { JSXElement } from 'solid-js';

interface SuccessAlertProps {
  message: string;
}

export function SuccessAlert(props: SuccessAlertProps): JSXElement {
  return (
    <div role="alert" class="mt-4 alert alert-error">
      <i class="fa-solid fa-circle-exclamation" />{' '}
      <span>{props.message}</span>
    </div>
  );
}
