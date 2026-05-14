import clsx from "clsx";
import { cinzel } from "../../fonts"
import { useState } from "react";

const loginCard = clsx
(
  cinzel.className,
  "w-full max-w-md",
  "px-6 py-6",
  "rounded-sm",
  "grid gap-4 md:gap-6",
  "text-xl md:text-2xl lg:text-2xl ",
  "border border-blue-300 bg-transparent text-blue-300",
  "bg-black/35 backdrop-blur-sm",
  "transition-all duration-300",
);


export default function LoginCard()
{

    const [isRegisterMode, setisRegisterMode] = useState(false);
    const [showPassword, setshowPassword] = useState(false);
    const [showConfirmPassword, setshowConfirmPassword] = useState(false);


    return (
    <div className={ loginCard }>
        
        <h2 className="text-2xl md:text-3xl text-center mb-2">
            {isRegisterMode ? "Create Account" : "Welcome Back"}
        </h2>

        {isRegisterMode && (
            <input
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 bg-transparent border border-blue-300 text-blue-200 outline-none"
            /> 
        )}

        <input
            type="text"
            placeholder="Username"
            className="w-full px-3 py-2 bg-transparent border border-blue-300 text-blue-200 outline-none"
        />


        <div className="relative">
            <input
                type={ showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-3 py-2 pr-16 bg-transparent border border-blue-300 text-blue-200 outline-none"
            />
            <button
                type="button"
                onClick={() => setshowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-300 hover:text-white transition"
            >
                {showPassword ? "Hide" : "Show"}
            </button>
        </div>

        {isRegisterMode && (
            <div className="relative">
                <input
                    type={ showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="w-full px-3 py-2 pr-16 bg-transparent border border-blue-300 text-blue-200 outline-none"
                />
                <button
                    type="button"
                    onClick={() => setshowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-300 hover:text-white transition"
                >
                    {showConfirmPassword ? "Hide" : "Show"}
                </button>
            </div>
        )}

        <button className="w-full py-2 border border-blue-300 text-blue-300 hover:bg-blue-300 hover:text-blue-950 transition">
            {isRegisterMode ? "Register" : "Login"}
        </button>
        <div>
            <p className="text-sm md:text-sm text-center mb-2">
                {isRegisterMode ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button 
                type="button"
                onClick={() => setisRegisterMode(!isRegisterMode)}
                className="w-full py-2 text-sm text-blue-300/70 hover:text-blue-200 transition underline">
                {isRegisterMode ? "Sign in" : "Sign up"}
            </button>
        </div>
    </div>


    );
};