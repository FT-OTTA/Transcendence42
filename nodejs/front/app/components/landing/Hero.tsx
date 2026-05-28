
import ScrollHint from "./ScrollHint";
import HeroTitle from "./HeroTitle";
import StartButton from "./StartButton";

type HeroProps = {
  setIsLogin: (value: boolean) => void;
};

export default function Hero({setIsLogin}: HeroProps)
{
	return (
		<section className=" h-screen flex flex-col">
			
			<div className=" flex-1 flex flex-col items-center justify-around ">
				<HeroTitle />
				<StartButton setIsLogin={setIsLogin}/>
			</div>
        
			<ScrollHint />
      	
		</section>
	);
}