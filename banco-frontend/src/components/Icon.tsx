import type { SVGProps } from "react";

const PATHS: Record<string, string> = {
  home:
    "M3 10.5 12 3l9 7.5M5.5 9v10h13V9M9 19v-6h6v6",

  wallet:
    "M4 6.5h14a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6.5A2.5 2.5 0 0 1 4.5 4H17M16 13h.01",

  walletCard:
    "M5 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3ZM2 11h19M16 14h.01",

  file:
    "M14 2H6a2 2 0 0 0-2 2v16h16V8zM14 2v6h6M8 13h8M8 17h5",

  plus:
    "M12 5v14M5 12h14",

  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",

  /*
   * Usuario ajustado ópticamente hacia abajo
   * para quedar centrado dentro del viewBox.
   */
  user:
    "M20 21.8a8 8 0 0 0-16 0M12 13.8a4 4 0 1 0 0-8 4 4 0 0 0 0 8",

  bell:
    "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",

  logout:
    "M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-5",

  arrow:
    "M5 12h14M13 6l6 6-6 6",

  check:
    "m5 12 4 4L19 6",

  close:
    "m6 6 12 12M18 6 6 18",

  search:
    "m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15",

  settings:
    "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-1.41 1.41-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21h-2v-.5a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06-1.41-1.41.06-.06A1.7 1.7 0 0 0 8.1 15a1.7 1.7 0 0 0-1.56-1.03H6v-2h.54A1.7 1.7 0 0 0 8.1 10.9a1.7 1.7 0 0 0-.34-1.87L7.7 8.97l1.41-1.41.06.06a1.7 1.7 0 0 0 1.87.34A1.7 1.7 0 0 0 12.07 6.4V6h2v.4a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06 1.41 1.41-.06.06A1.7 1.7 0 0 0 18.1 10.9a1.7 1.7 0 0 0 1.56 1.03H20v2h-.4A1.7 1.7 0 0 0 19.4 15Z",
};

type IconName = keyof typeof PATHS;

type Props = SVGProps<SVGSVGElement> & {
  name: IconName;
};

function Icon({
  name,
  className = "icon",
  ...props
}: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export default Icon;