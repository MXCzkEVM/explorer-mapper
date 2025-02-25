import type { PropsWithChildren } from 'react'
import { PROCESS_ENV } from './source/env'

export function Ready(props: PropsWithChildren<{ chain: string | number }>) {
  PROCESS_ENV.NEXT_PUBLIC_NETWORK_ID = props.chain

  return props.children
}
