import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { buildContext } from '@/shared/libs/react-factories/buildContext';

import {
  FIREWALL_RULE_FORM_DEFAULTS,
  schemaFirewallRuleForm,
} from '../rules/form-schema';
import type { ServerFirewallRuleSidepanelProps } from '../rules/types';

export const [ServerFirewallRuleModelProvider, useServerFirewallRuleModel] =
  buildContext(
    'ServerFirewallRuleModel',
    (props: ServerFirewallRuleSidepanelProps) => {
      const { dockerFiltering, serverId, onSuccess = () => {} } = props;
      // The API's own words when it refuses the rule (400 invalid, 409 duplicate).
      const [submitError, setSubmitError] = useState<string | null>(null);

      const form = useForm({
        resolver: zodResolver(schemaFirewallRuleForm),
        mode: 'onChange',
        defaultValues: FIREWALL_RULE_FORM_DEFAULTS,
      });

      return {
        serverId,
        dockerFiltering,
        form,
        onSuccess,
        submitError,
        setSubmitError,
        isSubmitting: form.formState.isSubmitting,
        hasChanges: form.formState.isDirty,
        isValid: form.formState.isValid,
      };
    },
  );
