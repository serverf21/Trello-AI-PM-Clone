"use client";
import Image from "@/node_modules/next/image"
import Avatar from "react-avatar"
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { useBoardStore } from "@/store/BoardStore";
import { useEffect, useState } from "react";
import fetchSuggestion from "@/lib/fetchSuggestion";

const Header = () => {
    const [board, searchString, setSearchString] = useBoardStore((state) => [
        state.board,
        state.searchString,
        state.setSearchString
    ]);
    const [loading, setLoading] = useState<boolean>(false);
    const [suggestion, setSuggestion] = useState<string>("");
    useEffect(() => {
        if(board.columns.size === 0) return;
        setLoading(true);
        const fetchSuggestionFunc = async() => {
            const suggestion = await fetchSuggestion(board);
            setSuggestion(suggestion);
            setLoading(false);
        }
    }, [board])
  return (
    <header>
        <div className="flex flex-col md:flex-row items-center p-5 bg-gray-500/10 rounded-b-2xl">
            {/* For gradient */}
            <div
            className="absolute top-0 left-0 w-full h-96 
            bg-gradient-to-br
            from-pink-700
            to-[#0055D1]
            rounded-md
            filter
            blur-3xl
            opacity-50
            -z-50
            "
            />
            
            <Image
                src="https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Trello_logo.svg/1280px-Trello_logo.svg.png"
                alt="Logo"
                width={250}
                height={60}
                className="w-44 md:w-56 pb-10 md:pb-0 object-contain"
            />
            <div className="flex items-center space-x-5 flex-1 justify-end w-full">
                {/* Search Box */}
                <form className="flex items-center space-x-5 bg-white rounded-md p-2 shadow-md flex-1 md:flex-initial">
                    <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                    <input
                    type="text"
                    placeholder="Search"
                    onChange={(e)=>setSearchString(e.target.value)}
                    className="flex-1 outline-none p-2" />
                    <button hidden type="submit">Search</button>
                </form>
                {/* Avatar */}
                <Avatar name="Sarvagya Saxena" round size="50" color="#0055D1" />
            </div>
        </div>

        {/* GPT-Suggestion */}
        <div className="flex items-center justify-center px-5 py-2 md:py-5">
            <p className="flex items-center text-sm p-5 font-light pr-5 shadow-xl rounded-xl w-fit bg-white italic max-w-3xl text-[#0055D1]">
                <UserCircleIcon
                    className={`inline-block h-10 w-10 text-[#0055D1] mr-1
                    ${loading && "animate-spin"}`}
                />
                {
                    suggestion && !loading ?
                    suggestion :
                    "Hi, Mr. Sarvagya! Summary of your tasks - one in todo, one in progress, and already finished two. Have a productive day."
                }
            </p>
        </div>
    </header>
  )
}

export default Header