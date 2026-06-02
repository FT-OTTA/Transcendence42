import { useTranslations } from "next-intl";

interface ConfirmPlayProps {
  onClick: () => void;
  disabled?: boolean;
}


export default function ConfirmPlay({ onClick, disabled }: ConfirmPlayProps) {
  
    const p = useTranslations("Playground");

    return (
	<div className="rounded-lg text-center">
	     <button
  			onClick={onClick}
  			disabled={disabled}
  			className="
    		group relative py-2 px-2
    		bg-gradient-to-r from-blue-900 to-sky-800
    		hover:from-blue-500 hover:to-sky-400
    		active:scale-95 transition-all duration-200
    		rounded-lg shadow-lg shadow-emerald-900/50
    		text-white font-bold tracking-wider
    		uppercase text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)]
  			"
			>
  			{p("confirm_play")}
		</button>
	 </div>
  );
}
