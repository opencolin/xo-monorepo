"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { usePhone } from "@/context/PhoneContext"

/**
 * In-app top bar. Back chevron on the left, app title centered.
 * The back action either pops the in-app back stack or, if empty,
 * goes to the home screen.
 */
export function NavBar({ title }: { title: string }) {
  const { backStack, pop, goHome } = usePhone()
  const router = useRouter()

  function onBack() {
    if (backStack.length > 0) {
      pop()
      router.back()
    } else {
      goHome()
      router.push("/")
    }
  }

  return (
    <div className="relative z-30 h-12 px-3 flex items-center border-b border-phone-divider bg-phone-card/80 backdrop-blur">
      <button
        onClick={onBack}
        className="text-lime-300 hover:text-lime-200 flex items-center gap-1 px-2 py-1 rounded font-medium text-sm"
        aria-label="Back"
      >
        <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden>
          <path
            d="M9 1L2 8l7 7"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden xs:inline">Back</span>
      </button>
      <div className="absolute inset-x-0 text-center pointer-events-none text-white font-semibold text-sm truncate px-12">
        {title}
      </div>
    </div>
  )
}
