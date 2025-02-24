import { lazy, Suspense } from 'react'

export function Content(props: any) {
  const Component = lazy(() => import('./source/Mapper'))
  return (
    <Suspense>
      <Component {...props} />
    </Suspense>
  )
}
