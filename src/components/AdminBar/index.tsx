"use client"

import type { PayloadAdminBarProps, PayloadMeUser } from '@payloadcms/admin-bar'

import { cn } from '@/utilities/ui'
import { useSelectedLayoutSegments } from 'next/navigation'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import './index.scss'

import { getClientSideURL } from '@/utilities/getURL'

const baseClass = 'admin-bar'

const collectionLabels = {
  pages: { plural: 'Pages', singular: 'Page' },
  posts: { plural: 'Posts', singular: 'Post' },
  projects: { plural: 'Projects', singular: 'Project' },
}

const Title: React.FC = () => (
  <div className="admin-bar__title">
    <img src="/media/saner-zpk-avatar-300x199.jpg" alt="logo" style={{ height: 28, borderRadius: 6 }} />
  </div>
)

export const AdminBar: React.FC<{ adminBarProps?: PayloadAdminBarProps }> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  const collection = (collectionLabels[segments?.[1] as keyof typeof collectionLabels] ? segments[1] : 'pages') as keyof typeof collectionLabels
  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id))
  }, [])

  return (
    <div className={cn(baseClass, 'py-2 bg-black text-white', { block: show, hidden: !show })}>
      <div className="container">
        <PayloadAdminBar cmsURL={getClientSideURL()} collectionSlug={collection} className="py-2 text-white" logo={<Title />} onAuthChange={onAuthChange} />
      </div>
    </div>
  )
}

