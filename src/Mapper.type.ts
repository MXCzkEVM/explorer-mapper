import type { PropsWithChildren, ReactNode } from 'react'

export interface MapperContentProps {
  query?: any
}
export interface MapperReadyProps extends PropsWithChildren {
  chain: number | string
}
export interface MapperProps extends MapperContentProps {
  chain: number | string
}

export interface Mapper {
  (props: MapperProps): ReactNode
  Content: (props: MapperContentProps) => ReactNode
  Ready: (props: MapperReadyProps) => ReactNode
}
