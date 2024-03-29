import { createContext } from 'react';
import { createContextualCan } from '@casl/react';
import type { AnyAbility } from '@casl/ability';

// eslint-disable-next-line
// @ts-ignore
export const AbilityContext = createContext<AnyAbility>(null);
export const Can = createContextualCan(AbilityContext.Consumer);
