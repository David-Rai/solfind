import React from "react"
import supabase from '../supabase/supabase'
import { useState,useEffect } from "react"
import {useUser} from '../store/store'

const MyReports=()=>{
const {user,setUser}=useUser()

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);


    useEffect(()=>{
const get=async()=>{
    console.log("getting data ")
    const res=await supabase.from('reports')
    .select("*")
    
    console.log("res from supabase",res)
}
get()
    },[user,setUser])
    return (<>
    <div>
        <h1>My reports</h1>
    </div>
    </>)
}


export default MyReports