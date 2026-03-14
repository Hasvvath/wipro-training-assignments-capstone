import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthUserState } from './auth.models';

export const authActions = createActionGroup({
  source: 'Auth',
  events: {
    'Set Session': props<{ user: AuthUserState | null }>(),
    'Clear Session': emptyProps()
  }
});
