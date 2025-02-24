import gql from 'graphql-tag'

export function getMXCBurn() {
  return gql`
    {
        bundle(id: 1) {
            burn
        }
        mxcdayDatas(first: 1000) {
            id
            date
            burn
        }
    }
  `
}
