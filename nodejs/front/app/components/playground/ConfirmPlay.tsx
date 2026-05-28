interface ConfirmPlayProps {
  onClick: () => void;
  disabled?: boolean;
}


export default function ConfirmPlay({ onClick, disabled }: ConfirmPlayProps) {
  return (
	<div className="p-6 bg-slate-900/80 rounded-lg border border-slate-700/50 text-center">
	     <button
  			onClick={onClick}
  			disabled={disabled}
  			className="
    		group relative w-full mt-4 py-3 px-6
    		bg-gradient-to-r from-emerald-600 to-green-500
    		hover:from-emerald-500 hover:to-green-400
    		active:scale-95 transition-all duration-200
    		rounded-lg shadow-lg shadow-emerald-900/50
    		border border-emerald-400/30 text-white font-bold tracking-wider
    		uppercase text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)]
  			"
			>
  			Confirm Play
		</button>
	 </div>
  );
}
