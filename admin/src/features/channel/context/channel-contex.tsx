// context/ChannelContext.tsx
'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { Channel } from '@avc/generated/graphql'

interface ChannelContextProps {
  currentChannel: Channel | null
  setCurrentChannel: (channel: Channel) => void
  channels: Channel[]
}

const ChannelContext = createContext<ChannelContextProps | undefined>(undefined)

interface ChannelProviderProps {
  children: ReactNode
  initialChannels?: Channel[]
}

export const ChannelProvider: React.FC<ChannelProviderProps> = ({
  children,
  initialChannels = [],
}) => {
  const [currentChannel, setCurrentChannelState] = useState<Channel | null>(
    () => {
      const channelToken = Cookies.get('channel_token')

      if (channelToken) {
        const channel = initialChannels.find((c) => c.token === channelToken)
        if (channel) return channel
      }

      const defaultChannel = initialChannels.find((c) => c.isDefault)
      if (defaultChannel) {
        Cookies.set('channel_token', defaultChannel.token, { expires: 365 })
        return defaultChannel
      }

      return null
    }
  )

  const setCurrentChannel = (channel: Channel) => {
    setCurrentChannelState(channel)
    Cookies.set('channel_token', channel.token, { expires: 7 })
  }

  return (
    <ChannelContext.Provider
      value={{ currentChannel, setCurrentChannel, channels: initialChannels }}
    >
      {children}
    </ChannelContext.Provider>
  )
}

export const useChannelContext = (): ChannelContextProps => {
  const context = useContext(ChannelContext)
  if (context === undefined) {
    throw new Error('useChannelContext must be used within a ChannelProvider')
  }
  return context
}
