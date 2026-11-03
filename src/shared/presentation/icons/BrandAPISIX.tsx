import type { LucideProps } from 'lucide-react';

/** The Apache APISIX logo (apache/apisix-website, Apache-2.0). */
export default function IconBrandAPISIX(props: LucideProps) {
  return (
    <svg
      viewBox="0 0 185 156"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0 155.5L94 0L185 155.5H140L94 83L42.5 155.5H0Z"
        fill="#F8423F"
      />
      <path
        d="M94 82.5L42.5 155H0L76.5 57L94 82.5Z"
        fill="url(#brand-apisix-a)"
      />
      <path d="M140 155.5H185L94 0L140 155.5Z" fill="url(#brand-apisix-b)" />
      <defs>
        <linearGradient
          id="brand-apisix-a"
          x1="222.5"
          y1="50"
          x2="85"
          y2="223.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.536111" stopColor="#FC0A04" />
          <stop offset="1" stopColor="#CF0500" stopOpacity="0.77" />
        </linearGradient>
        <linearGradient
          id="brand-apisix-b"
          x1="139.5"
          y1="0"
          x2="226"
          y2="136"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.473466" stopColor="#E2423E" />
          <stop offset="1" stopColor="#E2423E" stopOpacity="0.77" />
        </linearGradient>
      </defs>
    </svg>
  );
}
