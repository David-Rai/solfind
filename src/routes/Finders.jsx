import React from 'react'
import { useLocation } from 'react-router-dom'

const Finders=()=>{
const {state:{r:{id}}}=useLocation()
console.log(id)
  return (
    <>
    hey
    </>
  )
}

export default Finders