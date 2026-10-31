import { useNavigate } from '@tanstack/react-router';

import { useDialog } from '@/services/dialog';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';

import { useForm } from '../-model';
import type { FormSchema } from '../-model/form';
import {
  isAlibabaCloudProvider,
  isAwsProvider,
  isBiznetGioProvider,
  isDigitalOceanProvider,
  isGcpProvider,
  isTencentProvider,
} from '../-model/provider';

/** Builds the provider-specific VM create request from the form values. */
export function buildLaunchPayload(values: FormSchema) {
  const vmName = values.spec.vmName.trim();
  const username = values.login.username.trim();
  const password = values.login.password?.trim() ?? '';
  const base = {
    provider: values.provider,
    cloud_project_id: String(values.cloud.projectID),
    secret_id: String(values.cloud.sshKeyID),
  };

  if (isBiznetGioProvider(values.provider)) {
    return {
      ...base,
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
    };
  }

  if (isGcpProvider(values.provider)) {
    return {
      ...base,
      vm: {
        name: vmName,
        region: values.regionSlug,
        zone: values.cloud.zoneSlug,
        machine_type: values.spec.machineType,
        source_image: values.spec.osTemplate,
        disk_size_gb: values.spec.diskSizeGB,
        // No network and no username: the VM joins dpanel-network, created
        // on first use, and the API logs in as ubuntu.
        reserve_public_ip: values.spec.reservePublicIP !== false,
      },
    };
  }

  if (isDigitalOceanProvider(values.provider)) {
    return {
      ...base,
      vm: {
        name: vmName,
        region: values.regionSlug,
        size: values.spec.machineType,
        image: values.spec.osTemplate,
        username,
        vpc_uuid: values.vpcBulk.id || undefined,
        reserve_public_ip: values.spec.reservePublicIP !== false,
      },
    };
  }

  if (isAwsProvider(values.provider)) {
    return {
      ...base,
      vm: {
        name: vmName,
        region: values.regionSlug,
        instance_type: values.spec.machineType,
        image_id: values.spec.osTemplate,
        // No subnet: the VM joins dpanel-network, created on first use.
        reserve_public_ip: values.spec.reservePublicIP,
      },
    };
  }

  if (isAlibabaCloudProvider(values.provider)) {
    return {
      ...base,
      vm: {
        name: vmName,
        region: values.regionSlug,
        zone: values.cloud.zoneSlug,
        instance_type: values.spec.machineType,
        image_id: values.spec.osTemplate,
        system_disk_size: values.spec.diskSizeGB,
        // No vSwitch: the VM joins dpanel-network, created on first use.
        reserve_public_ip: values.spec.reservePublicIP,
      },
    };
  }

  if (isTencentProvider(values.provider)) {
    return {
      ...base,
      vm: {
        name: vmName,
        region: values.regionSlug,
        zone: values.cloud.zoneSlug,
        instance_type: values.spec.machineType,
        image_id: values.spec.osTemplate,
        // No subnet: the VM joins dpanel-network, created on first use.
        reserve_public_ip: values.spec.reservePublicIP,
      },
    };
  }

  return {
    ...base,
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
}

/**
 * Submits the launch request. On success it offers to open the new server
 * or start another; on failure it shows the API's reason.
 */
export default function useLaunch() {
  const [openToaster] = useToaster();
  const [openDialog] = useDialog();
  const navigate = useNavigate();
  const { form, handleFormReset } = useForm();

  const launch = form.handleSubmit(async (values) => {
    try {
      const created = await ApiServer.Create.doPost({
        payload: buildLaunchPayload(values),
      });
      if (created.$status !== 'success') throw created.error;
      if (!created.id) throw Error('New server ID is empty!');

      openDialog({
        title: 'Your server is being created',
        content:
          'dPanel asked the provider for the VM. Setup starts on its own once the VM is up, which takes about 10 to 20 minutes. You can follow progress on the server page.',
        variant: 'info',
        actions: [
          { label: 'Launch another', onClick: handleFormReset },
          {
            label: 'Open server',
            isPrimary: true,
            onClick: () =>
              navigate({
                to: '/servers/$id',
                params: { id: String(created.id) },
              }),
          },
        ],
      });
    } catch (error) {
      openToaster({
        variant: 'error',
        title: 'Could not launch the server',
        message: getApiErrorDetail(error),
      });
    }
  });

  return {
    launch,
    reset: handleFormReset,
    isSubmitting: form.formState.isSubmitting,
  };
}
