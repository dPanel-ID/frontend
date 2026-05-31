import type { JSX, ReactNode } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/presentation/atoms/Accordion';
import { Tooltip } from '@/shared/presentation/atoms/Tooltip';

export default function TemplateCardInfo(props: TemplateCardInfoProps) {
  const {
    title,
    subtitle,
    sshPubKey,
    logoAreaMain,
    logoAreaMainTooltip,
    additionalInfos,
  } = props;

  return (
    <div className="flex flex-col">
      <div className="py-2.5 px-3 border-b flex justify-between gap-3 md:gap-6 min-h-14">
        <div className="flex flex-col gap-1">
          <h2 className="font-bold text-md break-all">{title}</h2>
          <h5 className="font-semibold text-sm break-all opacity-70">
            {subtitle}
          </h5>
        </div>

        <div className="w-6 h-6 relative shrink-0">
          <Tooltip message={logoAreaMainTooltip}>{logoAreaMain}</Tooltip>
        </div>
      </div>

      <div className="py-2 px-3">
        <div className="flex flex-col gap-y-1">
          {additionalInfos.map((additional, idx) => {
            const { icon, text, iconTooltip } = additional;

            return (
              <div key={idx} className="flex items-center gap-1">
                <Tooltip message={iconTooltip}>{icon}</Tooltip>
                <p className="text-sm">{text}</p>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-y-1 mt-8">
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={['public']}
            orientation="horizontal"
          >
            <AccordionItem value="public">
              <AccordionTrigger
                disabled
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mb-4"
              >
                PUBLIC KEY
              </AccordionTrigger>
              <AccordionContent className="w-full">
                <textarea
                  className="w-full p-2 relative rounded bg-muted border font-mono text-sm font-semibold"
                  rows={9}
                  defaultValue={sshPubKey}
                  disabled
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="secret">
              <AccordionTrigger
                disabled
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mb-4 mt-4"
              >
                SECRET KEY
              </AccordionTrigger>
              <AccordionContent className="w-full">
                <div className="w-full rounded bg-muted border p-3 text-sm text-primary/60">
                  Private key material is stored encrypted and is not displayed.
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export interface TemplateCardInfoProps {
  title: ReactNode;
  subtitle?: ReactNode;
  sshPubKey?: string;
  logoAreaMain: JSX.Element;
  logoAreaMainTooltip: string;
  additionalInfos: AdditionalInfo[];
}

export interface AdditionalInfo {
  icon: JSX.Element;
  iconTooltip: string;
  text: string;
}
