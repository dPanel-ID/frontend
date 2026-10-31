import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import type { DnsRecord } from '@/entities/domain/rules/schema/parts';

import { ApiDomain } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useDomainRecordsModel } from '../-model/domain-records';

/** Asks, then deletes one record at the DNS provider and reloads the list. */
export function useRecordDelete() {
  const t = useDevetekTranslations();
  const [openDialog] = useDialog();
  const [openToaster] = useToaster();
  const [domainId, refreshRecords] = useDomainRecordsModel((s) => [
    s.domainId,
    s.refreshRecords,
  ]);

  return useHandler((record: DnsRecord) => {
    const recordName = record.name;

    openDialog({
      title: t('dialog.domainRecordDelete.title'),
      content: t('dialog.domainRecordDelete.message', { recordName }),
      variant: 'warning',
      actions: {
        variant: 'YesNo',
        yes: async () => {
          const response = await ApiDomain.Origin.$Id.$RecordId.doDelete({
            domainId,
            recordId: record.id,
          });

          if (response.$status === 'success') {
            openToaster({
              variant: 'success',
              message: t('toaster.domainRecordDelete.success', { recordName }),
            });
            refreshRecords();
            return;
          }

          openToaster({
            variant: 'error',
            title: t('toaster.domainRecordDelete.error', { recordName }),
            message: getApiErrorDetail(response.error),
          });
        },
      },
    });
  });
}
