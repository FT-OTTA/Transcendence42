import clsx from "clsx";
import { Card } from "otta-shared-types/card";
import { useTranslations } from "next-intl";
import { useLocale } from 'next-intl';

const container = clsx(
	"flex flex-col gap-2 p-3",
	"bg-black/20 backdrop-blur-sm rounded-sm",
	"border border-blue-300/20",
	"text-sm transition-all duration-200",
)

type Props = {
	card: Card | null;
};

function cardLocalizer(card: Card, locale: string)
{
	return {
        id: card.idInGame,
        name: (card[`name_${locale}`] || card.name_en) as string, 
        type: (card[`type_${locale}`] || card.type_en) as string,
        effectText: (card[`effect_text_${locale}`] || card.effect_text_en) as string,
        cost: card.rune_cost,
        illustration: card.illustration,
    };
}

export default function CardDetails({card} : Props)
{
	const p = useTranslations("Playground");
	const l = useLocale();

	if (!card)
		return (
			<div className={clsx(container, "text-sky-200/30 italic text-xs")}>
				{p("hover_a_card")}
			</div>
		);

	const localizedCard = cardLocalizer(card, l);

	return (
		<div className={container}>
			<div className="flex items-center justify-between">
				<span className="font-semibold text-blue-100">
					{localizedCard.name}
				</span>
				<span className="text-yellow-400 font-bold text-xs">
					{localizedCard.cost}R
				</span>
			</div>
				<span className="text-[9px] text-blue-200/40 uppercase tracking-wider">
					{localizedCard.type}
				</span>
				{localizedCard?.effectText && (
					<p className="text-xs text-slate-300 leading-5 border-t border-blue-300/20 pt-2">
						{localizedCard.effectText}
					</p>
				)}
		</div>
	);
}
