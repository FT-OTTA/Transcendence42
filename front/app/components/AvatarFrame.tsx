import clsx from "clsx";

const frameClass = clsx(
	"w-24 h-24",
	"overflow-hidden rounded-xl",
	"border border-[1px] border-sky-600/20 bg-black/50",
)

type Props = {
	avatarUrl?: string | null;
};

export default function AvatarFrame({ avatarUrl }: Props)
{
	return (
		<div className={frameClass}>
			<img 
				draggable={false}
				src={
					avatarUrl
						? `http://localhost:3000${avatarUrl}`
						: "/default_avatar.png"
					}
			alt="User avatar"
			className="w-full h-full object-cover"
			/>
		</div>
	);
}