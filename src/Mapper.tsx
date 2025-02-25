import type { Mapper as MapperType } from './Mapper.type'
import { Content } from './Mapper.content'
import { Ready } from './Mapper.ready'

export const Mapper: MapperType = (props) => {
  return (
    <Ready chain={props.chain}>
      <Content {...props} />
    </Ready>
  )
}

Mapper.Ready = Ready
Mapper.Content = Content
