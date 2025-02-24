import type { Mapper as MapperType } from './Mapper.type'
import { Ready } from './components/Ready'
import { Content } from './Mapper.content'

export const Mapper: MapperType = (props) => {
  return (
    <Ready chain={props.chain}>
      <Content />
    </Ready>
  )
}
