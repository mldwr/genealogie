import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="inline-flex" aria-label="Genealogy">
     {/*  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28">
        <path
          className="fill-blue-500"
          fillRule="evenodd"
          d="M15.052 0c6.914.513 12.434 6.033 12.947 12.947h-5.015a7.932 7.932 0 0 1-7.932-7.932V0Zm-2.105 22.985V28C6.033 27.487.513 21.967 0 15.053h5.015a7.932 7.932 0 0 1 7.932 7.932Z"
          clipRule="evenodd"
        />
        <path
          className="fill-blue-300"
          fillRule="evenodd"
          d="M0 12.947C.513 6.033 6.033.513 12.947 0v5.015a7.932 7.932 0 0 1-7.932 7.932H0Zm22.984 2.106h5.015C27.486 21.967 21.966 27.487 15.052 28v-5.015a7.932 7.932 0 0 1 7.932-7.932Z"
          clipRule="evenodd"
        />
      </svg> */}
      <svg height="100" width="300" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="20" stroke="black" strokeWidth="2" fill="lightgray" />
        
        <line x1="50" y1="30" x2="50" y2="70" stroke="black" strokeWidth="2" />
        <line x1="50" y1="50" x2="65" y2="36" stroke="black" strokeWidth="2" />
        <line x1="50" y1="50" x2="65" y2="64" stroke="black" strokeWidth="2" />

        <text x="90" y="60" font-family="Georgia" font-size="30" fill="black">Genealogie</text>
      </svg>

    </Link>
  );
}
