import type { HTMLAttributes, RefObject } from 'react';

import type { VariantProps } from 'class-variance-authority';

export interface ButtonExtraProps {
  ref?: RefObject<HTMLButtonElement | null>;
  asChild?: boolean;
  disabled?: boolean;
  bubbleUpClick?: boolean;
  /**
   * Inside a form a button submits it unless it says otherwise; pass
   * `"button"` for one that only acts on the page.
   */
  type?: 'button' | 'submit' | 'reset';
}

export type ButtonProps<V extends (...args: any) => any> = ButtonExtraProps &
  HTMLAttributes<HTMLButtonElement> &
  VariantProps<V>;

export interface ButtonActionExtraProps extends ButtonExtraProps {
  buttonState?: ButtonState;
}

export type ButtonActionProps<V extends (...args: any) => any> =
  ButtonActionExtraProps & HTMLAttributes<HTMLButtonElement> & VariantProps<V>;

export type ButtonState = 'initial' | 'loading' | 'success';
