
import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import supabase from '../supabase/supabase'
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User, Mail, Phone } from "lucide-react"; // icons
import { useUser, useWallet } from "../store/store";

const UserDetails = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {setUser,user}=useUser()
  const {walletAddress}=useWallet()
  const navigate=useNavigate()

    // ✅ Check if user data is already submitted
  useEffect(() => {
    const userData = localStorage.getItem("userData");

    if (userData) {
      setUser(JSON.parse(userData))
      navigate('/explore')
    }
  }, []);

  // ✅ Form submit handler
  const onSubmit = async (formData) => {
    setIsSubmitting(true);

    const { name, email, contact_no } = formData;

    const { error,data } = await supabase.from("users").insert([
      { name, email, contact_no },
    ])
      .select()

    if (error) {
      toast.error("❌ Failed to save data: " + error.message);
      setIsSubmitting(false);
    } else {
      console.log(data)
      navigate('/explore')
      toast.success("✅ User added successfully!");
      localStorage.setItem("userData", JSON.stringify(data[0]));
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen flex-col bg-gray-900 text-white">
      <ToastContainer />
        <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg font-semibold">
          Connected: {walletAddress}
        </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-96 space-y-6"
      >
        <h1 className="text-2xl font-bold text-center">User Details</h1>

        {/* Name */}
        <div className="flex items-center border border-gray-700 rounded-lg px-3 py-2">
          <User className="mr-3 text-gray-400" />
          <input
            type="text"
            placeholder="Name"
            className="bg-transparent outline-none w-full"
            {...register("name", { required: "Name is required" })}
          />
        </div>
        {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}

        {/* Email */}
        <div className="flex items-center border border-gray-700 rounded-lg px-3 py-2">
          <Mail className="mr-3 text-gray-400" />
          <input
            type="email"
            placeholder="Email"
            className="bg-transparent outline-none w-full"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
          />
        </div>
        {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}

        {/* Contact Number */}
        <div className="flex items-center border border-gray-700 rounded-lg px-3 py-2">
          <Phone className="mr-3 text-gray-400" />
          <input
            type="text"
            placeholder="Contact Number"
            className="bg-transparent outline-none w-full"
            {...register("contact_no", {
              required: "Contact number is required",
              minLength: { value: 10, message: "Must be at least 10 digits" },
            })}
          />
        </div>
        {errors.contact_no && (
          <p className="text-red-400 text-sm">{errors.contact_no.message}</p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded-lg font-semibold ${
            isSubmitting
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 transition"
          }`}
        >
          {isSubmitting ? "Submitted ✅" : "Submit"}
        </button>
      </form>
    </main>
  );
};

export default UserDetails;
