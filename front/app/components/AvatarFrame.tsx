"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { Pencil } from "lucide-react";

const frameClass = clsx(
	"w-24 h-24",
	"overflow-hidden rounded-xl",
	"border border-[1px] border-sky-600/20 bg-black/50",
	"group",
)

type Props = {
	avatarUrl?: string | null;
	isOwner?: boolean;
	onUpload?: (file: File) => void;
};

export default function AvatarFrame({
	avatarUrl,
	isOwner,
	onUpload,
 }: Props)
{
	const inputRef = useRef<HTMLInputElement>(null);
	const [hover, setHover] = useState(false);

	function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file && onUpload) {
			onUpload(file);
		}
	}

	return (
		<div className={frameClass}>
			<div
				className="relative w-full h-full"
				onClick={() => isOwner && inputRef.current?.click()}
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
			>
			<img 
				src={
					avatarUrl
					? `http://localhost:3000${avatarUrl}`
					: "/default_avatar.png"
				}
				className="w-full h-full object-cover"
				alt="User avatar"
				draggable={false}
				/>

				{isOwner && hover && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/40">
						<Pencil className="text-white" size={20} />
					</div>
				)}
			</div>

			{isOwner && (
				<input
				ref={inputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={handleFile}
				/>
			)}
		</div>
	);
}