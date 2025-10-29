import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FileText, Coins, AlignLeft, Image as ImageIcon } from "lucide-react";
import supabase from "../supabase/supabase";
import { useUser } from "../store/store";

const SubmitFound = () => {
  const navigate = useNavigate();
  const {
    state: { report },
  } = useLocation(); //getting report data
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [storedData, setStoredData] = useState(null);
  const [preview, setPreview] = useState(null);
  const { user, setUser } = useUser();
  const [imageFile, setImageFile] = useState(null);

  // ✅ Check localStorage for submission
  useEffect(() => {
    const userData = localStorage.getItem("userData");

    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/connectWallet");
    }
  }, []);

  // ✅ Handle form submission
  const onSubmit = async (data) => {
    console.log(data)
    try {
      //Getting userID first

      const { description, contact_no } = data;
      let imageUrl = null;

      // ✅ Upload image to Supabase storage
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("submit-images") // your bucket name
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("submit-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      } else {
        return toast.error("image issue");
      }

      // ✅ Insert report data into Supabase
      const { error } = await supabase.from("submits").insert([
        {
          description,
          report_id: report.id,
          image_url: imageUrl,
          contact_no,
          user_id: user.id,
          name: user.name,
        },
      ]);

      if (error) throw error;

      toast.success("✅ Report submitted successfully!");
      navigate("/explore");
      setIsSubmitted(true);
    } catch (error) {
      toast.error("❌ " + error.message);
      setIsSubmitted(false);
    }
  };

  // ✅ Handle image preview
  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <main className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-white">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-96 space-y-6"
      >
        <h1 className="text-2xl font-bold text-center">Submit found</h1>

        {/* conctact number */}
        <div className="flex items-center border border-gray-700 rounded-lg px-3 py-2">
          <FileText className="mr-3 text-gray-400" />
          <input
            type="text"
            placeholder="Contact number"
            className="bg-transparent outline-none w-full"
            {...register("contact_no", {
              required: "contact number is required",
            })}
            disabled={isSubmitted}
          />
        </div>
        {errors.type && (
          <p className="text-red-400 text-sm">{errors.contact_no.message}</p>
        )}

        {/* Description */}
        <div className="flex items-start border border-gray-700 rounded-lg px-3 py-2">
          <AlignLeft className="mr-3 text-gray-400 mt-1" />
          <textarea
            placeholder="Description"
            className="bg-transparent outline-none w-full resize-none h-24"
            {...register("description", {
              required: "Description is required",
            })}
            disabled={isSubmitted}
          />
        </div>
        {errors.description && (
          <p className="text-red-400 text-sm">{errors.description.message}</p>
        )}

        {/* Image Upload */}
        <div className="border border-gray-700 rounded-lg px-3 py-2">
          <label className="flex items-center cursor-pointer">
            <ImageIcon className="mr-3 text-gray-400" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              {...register("image", { required: "Image is required" })}
              onChange={handleImagePreview}
              disabled={isSubmitted}
            />
            <span className="text-gray-400">
              {preview ? "Change Image" : "Upload Image"}
            </span>
          </label>
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-3 rounded-lg w-full h-40 object-cover"
            />
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitted}
          className={`w-full py-2 rounded-lg font-semibold ${
            isSubmitted
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 transition"
          }`}
        >
          {isSubmitted ? "Submitted ✅" : "Submit"}
        </button>
      </form>
    </main>
  );
};

export default SubmitFound;
