import { Card } from "@prisma/client";
import CardSlot from "./CardSlot";

interface LargeCardViewProps {
  card: Card;
}

export default function LargeCardView({ card }: LargeCardViewProps) {
  return (
	<div className="w-72 aspect-square">
	  <CardSlot card={card} />
	</div>
  );
}
