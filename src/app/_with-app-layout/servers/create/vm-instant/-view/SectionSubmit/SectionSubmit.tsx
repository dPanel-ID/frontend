import { useNavigate } from '@tanstack/react-router';

import { useDialog } from '@/services/dialog';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import { useForm } from '../../-model';
import {
  isAwsProvider,
  isBiznetGioProvider,
  isDigitalOceanProvider,
  isGcpProvider,
} from '../../-model/provider';

export default function SectionSubmit() {
  const [openToaster] = useToaster();
  const [openDialog] = useDialog();

  const navigate = useNavigate();

  const { handleFormReset, form } = useForm();

  const handleSubmit = form.handleSubmit(async (values) => {
    const usesBiznetGio = isBiznetGioProvider(values.provider);
    const usesGcp = isGcpProvider(values.provider);
    const usesDigitalOcean = isDigitalOceanProvider(values.provider);
    const usesAws = isAwsProvider(values.provider);
    const vmName = values.spec.vmName.trim();
    const username = values.login.username.trim();
    const password = values.login.password?.trim() ?? '';
    const cloudProjectId = String(values.cloud.projectID);
    const sshKeyId = String(values.cloud.sshKeyID);
    const payload = usesBiznetGio
      ? {
          provider: values.provider,
          cloud_project_id: cloudProjectId,
          secret_id: sshKeyId,
          vm: {
            product_id: values.spec.productID,
            cycle: values.spec.billingCycle,
            select_os: values.spec.osTemplate,
            keypair_name: values.spec.keypairName?.trim() || `dpanel-${vmName}`,
            vm_name: vmName,
            description:
              values.spec.description?.trim() || 'dPanel managed NEO Lite VM',
            ssh_and_console_user: username,
            console_password: password,
            promocode: values.spec.promocode?.trim() || 'AFNLDPANEL',
            pay_invoice_with_cc: values.spec.payInvoiceWithCC ?? 'no',
            reserve_public_ip: values.spec.reservePublicIP !== false,
          },
        }
      : usesGcp
        ? {
            provider: values.provider,
            cloud_project_id: cloudProjectId,
            secret_id: sshKeyId,
            vm: {
              name: vmName,
              region: values.regionSlug,
              zone: values.cloud.zoneSlug,
              machine_type: values.spec.machineType,
              source_image: values.spec.osTemplate,
              disk_size_gb: values.spec.diskSizeGB,
              // The API logs in as ubuntu; dpanel is reserved for setup.
              // No network: the VM joins dpanel-network, created on first use.
              reserve_public_ip: values.spec.reservePublicIP !== false,
            },
          }
        : usesDigitalOcean
          ? {
              provider: values.provider,
              cloud_project_id: cloudProjectId,
              secret_id: sshKeyId,
              vm: {
                name: vmName,
                region: values.regionSlug,
                size: values.spec.machineType,
                image: values.spec.osTemplate,
                username,
                vpc_uuid: values.vpcBulk.id || undefined,
                reserve_public_ip: values.spec.reservePublicIP !== false,
              },
            }
          : usesAws
            ? {
                provider: values.provider,
                cloud_project_id: cloudProjectId,
                secret_id: sshKeyId,
                vm: {
                  name: vmName,
                  region: values.regionSlug,
                  instance_type: values.spec.machineType,
                  image_id: values.spec.osTemplate,
                  // No subnet: the VM joins dpanel-network, created on first use.
                  reserve_public_ip: values.spec.reservePublicIP,
                },
              }
            : {
                provider: values.provider,
                cloud_project_id: cloudProjectId,
                secret_id: sshKeyId,
                vm: {
                  name: vmName,
                  region: values.regionSlug,
                  os_template_id: values.spec.osTemplate,
                  os_name: values.spec.osName,
                  os_version: values.spec.osVersion,
                  disks: values.spec.diskSizeGB,
                  vcpu: values.spec.cpuCore,
                  ram: values.spec.ramSizeGB * 1024,
                  username,
                  password,
                  billing_account_id: values.cloud.billingAccountID,
                  network_uuid: values.vpcBulk.id,
                  reserve_public_ip: values.spec.reservePublicIP !== false,
                },
              };

    try {
      const createResponse = await ApiServer.Create.doPost({
        payload,
      });

      if (createResponse.$status !== 'success') {
        throw createResponse.error;
      }

      const newServerId = createResponse.id;
      if (!newServerId) throw Error('New server ID is empty!');

      openDialog({
        title: 'VM creation queued',
        content:
          'The manager created the server record and queued provider VM creation. Standard setup will start automatically after the provider VM is ready.',
        variant: 'info',
        actions: [
          {
            label: 'Create another',
            onClick: () => {
              handleFormReset();
            },
          },
          {
            label: 'Go to server',
            isPrimary: true,
            onClick: () => {
              navigate({
                to: '/servers/$id',
                params: {
                  id: String(newServerId),
                },
              });
            },
          },
        ],
      });
    } catch (error) {
      openToaster({
        message: getApiErrorDetail(error),
        variant: 'error',
        title: 'Failed to create instant VM',
      });
    }
  });

  return (
    <div className="sticky bottom-0 z-10 -mx-1 mt-2 border-t bg-background/95 px-1 py-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button asChild buttonStyle="ghost" buttonColor="secondary">
          <button type="button" onClick={handleFormReset}>
            Clear
          </button>
        </Button>
        <Button
          asChild
          disabled={form.formState.isSubmitting}
          className="min-w-32"
        >
          <button type="button" onClick={handleSubmit}>
            {form.formState.isSubmitting ? (
              <Spinner className="text-primary-foreground" />
            ) : (
              'Create VM'
            )}
          </button>
        </Button>
      </div>
    </div>
  );
}
