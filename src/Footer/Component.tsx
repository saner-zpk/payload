import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []
  const footerAny = footerData as any
  const icpRecord = footerAny?.icpRecord
  const icpHolderName = footerAny?.icpHolderName
  const icpDomain = footerAny?.icpDomain

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}
          </nav>
        </div>
  </div>
      {(icpRecord || icpHolderName || icpDomain) && (
        <div className="container border-t border-border py-3 text-sm text-gray-400">
          <div className="flex flex-col md:flex-row md:justify-between gap-2">
            <div>
              {icpHolderName && <span className="mr-2">{icpHolderName}</span>}
              {icpRecord && <span className="mr-2">备案号：{icpRecord}</span>}
            </div>
            {icpDomain && (
              <div className="md:text-right">
                <span>{icpDomain}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  )
}
