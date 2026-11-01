import { useT } from '@/i18n';
import type { SVGProps } from 'react';

/** The old player's hand-drawn marks, now stroked in the current color. */

export const StatusIcon = (props: SVGProps<SVGSVGElement>) => {
  const t = useT();
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{t('icon.status')}</title>
      <path
        d="M5.17 14.9001C5.07408 15.2326 4.38025 14.9448 4.18511 15.2306C3.2955 16.5374 5.80339 20.9369 7.64174 20.2128C10.0189 19.2766 5.66277 13.1925 5.17 14.9001Z"
        stroke="currentColor"
        strokeWidth="1.31405"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.7695 15.4356C18.7688 13.3561 14.5559 17.3213 14.7399 19.2096C15.0474 22.3731 20.6558 17.2785 19.7695 15.4356Z"
        stroke="currentColor"
        strokeWidth="1.31405"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.7441 14.1997C4.48328 14.4198 6.15475 7.49151 7.2303 6.3312C7.9885 5.51255 9.05354 5.16104 10.0536 4.80494C15.0864 3.01389 18.7085 4.01782 19.924 9.78912C20.3038 11.5913 19.1658 13.3173 18.5469 14.929"
        stroke="currentColor"
        strokeWidth="1.31405"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const SoundOnIcon = (props: SVGProps<SVGSVGElement>) => {
  const t = useT();
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{t('icon.soundOn')}</title>
      <path
        d="M4.89532 8.52426C3.30583 9.68635 4.30567 12.4392 4.36061 14.4082C4.367 14.6433 4.2622 14.9646 4.66596 14.5609C5.61659 13.6102 5.93477 12.9458 7.56962 13.4908C7.96827 13.6237 9.85163 18.9492 10.4732 18.5346C10.9326 18.2279 10.6502 15.8137 10.6266 15.4776C10.5665 14.6439 10.8099 5.26926 10.6266 5.08527C10.3416 4.80098 10.2151 5.31205 10.1678 5.39127C9.43571 6.61149 8.18802 8.69739 6.95821 9.51769C6.93138 9.53558 5.27608 8.24572 4.89532 8.52426Z"
        stroke="currentColor"
        strokeWidth="1.27772"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.0717 9.05901C13.9501 10.8159 13.9935 12.4111 13.2243 13.9495"
        stroke="currentColor"
        strokeWidth="1.27772"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.6705 7.07211C16.7846 8.74338 17.9819 12.7082 16.2819 14.4082"
        stroke="currentColor"
        strokeWidth="1.27772"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.2678 6.15536C19.4868 7.37431 19.5411 9.37076 19.9487 11.0459C20.3594 12.7344 19.5104 14.0824 18.4205 15.1723"
        stroke="currentColor"
        strokeWidth="1.27772"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const SoundOffIcon = (props: SVGProps<SVGSVGElement>) => {
  const t = useT();
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{t('icon.soundOff')}</title>
      <path
        d="M4.89532 8.52426C3.30583 9.68635 4.30567 12.4392 4.36061 14.4082C4.367 14.6433 4.2622 14.9646 4.66596 14.5609C5.61659 13.6102 5.93477 12.9458 7.56962 13.4908C7.96827 13.6237 9.85163 18.9492 10.4732 18.5346C10.9326 18.2279 10.6502 15.8137 10.6266 15.4776C10.5665 14.6439 10.8099 5.26926 10.6266 5.08527C10.3416 4.80098 10.2151 5.31205 10.1678 5.39127C9.43571 6.61149 8.18802 8.69739 6.95821 9.51769C6.93138 9.53558 5.27608 8.24572 4.89532 8.52426Z"
        stroke="currentColor"
        strokeWidth="1.27772"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.2502 7.83333C17.345 10.1197 15.8208 12.6983 14.1223 15.1423"
        stroke="currentColor"
        strokeWidth="1.5418"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.4148 8.36368C13.3756 8.36368 13.2671 8.33824 13.2968 8.36368C14.4394 9.34593 15.6574 10.2406 16.7746 11.2521C17.765 12.1489 18.4568 13.4513 19.1914 14.553"
        stroke="currentColor"
        strokeWidth="1.5418"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ChatBubbleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M2.6 3.4h10.8v7.2H7.2l-3.4 2.8v-2.8H2.6z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const CollapseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M2.5 5l4.5 4 4.5-4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SendIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M2.4 2.6 13.8 8 2.4 13.4l1.8-5.4-1.8-5.4Zm1.8 5.4h9.6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

/** The old player's hand-drawn settings flower. */
export const GearIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M13.3607 7.37877C12.1866 6.8756 11.8904 5.27875 11.0138 4.3509C9.7372 2.99899 8.43975 5.93066 8.43975 6.77307C8.43975 7.16864 9.6676 9.63322 9.49988 9.80158C9.43848 9.86234 6.88531 9.10473 6.32011 9.34713C5.29668 9.78575 4.36627 12.5655 5.56311 13.2839C6.06185 13.5826 7.35617 13.1079 7.68275 13.4352C7.83402 13.5864 7.39987 13.7605 7.22834 13.889C6.77391 14.2301 6.11314 14.9086 5.86566 15.4035C5.31566 16.5042 5.51438 17.7852 6.47135 18.5827C8.04605 19.8947 10.0841 18.6371 10.7113 17.0687C10.7347 17.0099 10.9733 16.1466 11.0138 16.1605C12.2119 16.5599 12.9613 20.3397 15.1018 18.7339C15.9468 18.1004 15.7987 16.1909 15.4043 15.4035C15.3442 15.2826 14.7987 14.4168 14.7987 14.4947C14.7987 15.7928 18.7449 16.8611 19.1898 14.1921C19.3626 13.1548 17.4974 11.1503 16.6158 10.7098C16.162 10.4826 14.5942 10.8611 15.1018 10.8611C16.7278 10.8611 16.9702 5.30912 14.9506 5.71356C14.148 5.87369 13.9328 7.62434 13.3607 7.37877Z"
      stroke="currentColor"
      strokeWidth="1.26583"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.6356 11.618C10.3704 11.8478 9.79759 12.3586 10.1058 12.5263C11.2356 13.1427 12.7824 9.75854 10.6356 11.618Z"
      stroke="currentColor"
      strokeWidth="1.26583"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path
      d="m3 8.4 3.4 3.3L13 4.8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
