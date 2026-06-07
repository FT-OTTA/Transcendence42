import clsx from "clsx";

const titleRuneImg = clsx
(
  "absolute inset-0",
  "bg-[url('/faded_rune.png')]",
  "bg-contain bg-center bg-no-repeat",
  "scale-[2.5]",
  "drop-shadow-[0_0_40px_rgba(120,180,255,0.5)]" 
);

export default function HeroTitle()
{
    return (

    <div className="relative inline-block translate-y-25">
            <div className={ titleRuneImg + " z-0 "} />

      <img 
      src="/otta_logo.svg"
      draggable={ false }
      
      className="select-none pr-5 relative z-10 -sky-200 drop-shadow-[0_0_40px_rgba(120,180,255,0.5)]"
      />
        </div>
    );
}