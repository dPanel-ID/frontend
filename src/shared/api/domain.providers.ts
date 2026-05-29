import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

export interface ProviderIcon {
  fallback?: string;
  type?: string;
  url?: string;
  value?: string;
}

export interface ProviderFieldOption {
  label?: string;
  value?: string;
}

export interface ProviderField {
  aliases?: string[];
  default?: string;
  help?: string;
  key?: string;
  label?: string;
  options?: ProviderFieldOption[];
  placeholder?: string;
  required?: boolean;
  secret?: boolean;
  type?: string;
}

export interface ProviderRule {
  fields?: string[];
  message?: string;
  type?: string;
}

export interface ProviderContract {
  capabilities?: string[];
  credential_example?: Record<string, string>;
  credential_fields?: ProviderField[];
  credential_rules?: ProviderRule[];
  icon?: ProviderIcon;
  label?: string;
  notes?: string[];
  provider?: string;
  supported_record_types?: string[];
}

export interface DomainPayloadExample {
  credential?: Record<string, string>;
  domain?: string;
  is_public?: boolean;
  name?: string;
  provider?: string;
}

export interface RecordPayloadExample {
  comment?: string;
  content?: string;
  name?: string;
  proxied?: boolean;
  ttl?: number;
  type?: string;
}

export interface Dto {
  domain_fields?: ProviderField[];
  domain_payload_example?: DomainPayloadExample;
  providers?: ProviderContract[];
  record_fields?: ProviderField[];
  record_payload_example?: RecordPayloadExample;
}

export interface RecipeParams {}

export function recipe(): GetRequestRecipe {
  return {
    url: '/v1/domain/providers',
  };
}

export function useGet(params: WithApiGetOptions<RecipeParams> = {}) {
  return useApiGet<Dto>(recipe(), params.options);
}
