import React, { createContext, FC, useContext } from 'react'
import { io, Socket } from 'socket.io-client'

const socket = io('http://localhost:8081/')

const SocketIOContext = createContext<SocketIOState>(null)
type SocketIOState = {
  socket: Socket
}

export const SocketIOProvider: FC<unknown> = ({ children }) => {
  return (
    <SocketIOContext.Provider value={{ socket }}>
      {children}
    </SocketIOContext.Provider>
  )
}
export const useSocketIO: () => { socket: Socket } = () => {
  const { socket } = useContext(SocketIOContext)

  return {
    socket
  }
}