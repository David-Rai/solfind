import React from "react";
import { useNavigate } from "react-router-dom";

const Explore=()=>{
const navigate=useNavigate()

    return (
        <>
        <main>
       <nav>
             explore page
    <button onClick={()=> navigate('/report')}>Report missing </button>
       </nav>
        </main>
        </>
    )
}

export default Explore