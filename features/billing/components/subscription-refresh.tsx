"use client"

import { useEffect, useRef } from "react"
import { useSession } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

// Clerk stores plan entitlements in session claims. After Billing returns from
// checkout, force a token refresh so `has({ plan: "pro" })` sees the new org
// subscription immediately instead of waiting for Clerk's normal refresh cycle.
export function SubscriptionRefresh() {
  const { isLoaded, session } = useSession()
  const router = useRouter()
  const refreshed = useRef(false)

  useEffect(() => {
    if (
      !isLoaded ||
      !session ||
      refreshed.current ||
      new URLSearchParams(window.location.search).get("subscription") !== "success"
    ) {
      return
    }

    refreshed.current = true

    void session
      .reload()
      .then(() => {
        router.replace("/billing")
        router.refresh()
      })
      .catch(() => {
        // Keep the success URL so a later page load can retry the refresh.
        refreshed.current = false
      })
  }, [isLoaded, router, session])

  return null
}
