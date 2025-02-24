import type { ReactNode } from 'react'

export interface MapperContentProps {
  routeQuery?: any
}

export interface MapperProps extends MapperContentProps {
  chain: number | string
}

export interface Mapper {
  (props: MapperProps): ReactNode
}
