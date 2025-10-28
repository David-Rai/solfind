import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FileText, Coins, AlignLeft, Image as ImageIcon } from "lucide-react";
import supabase from "../supabase/supabase";
import { useUser } from "../store/store";

const Report = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [storedData, setStoredData] = useState(null);
  const [preview, setPreview] = useState(null);
  const { user, setUser } = useUser();

  // ✅ Check localStorage for submission
  useEffect(() => {
    const userData = localStorage.getItem("userData");

    if (userData) {
      setUser(JSON.parse(userData));
    }else{
        navigate("/connectWallet")
    }
  }, []);

  // ✅ Handle form submission
  const onSubmit = async (data) => {
    console.log(data)
    try {

        //Getting userID first

      const { type, reward, description, image } = data;
      let imageUrl = null;

      console.log("image",image[0])
      // ✅ Upload image to Supabase storage
      if (image && image[0]) {
        const file = image[0];
        const fileName = `${Date.now()}-${file.name}`;

        return
        const { error: uploadError } = await supabase.storage
          .from("report-images") // your bucket name
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("report-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      return
      // ✅ Insert report data into Supabase
      const { error } = await supabase
        .from("reports")
        .insert([{ type, reward, description, image_url: imageUrl, user_id:user.id }]);

      if (error) throw error;

      toast.success("✅ Report submitted successfully!");
      const reportInfo = { type, reward, description, imageUrl };
      localStorage.setItem("reportSubmitted", "true");
      localStorage.setItem("reportData", JSON.stringify(reportInfo));
      setStoredData(reportInfo);
      setIsSubmitted(true);
    } catch (error) {
      toast.error("❌ " + error.message);
      setIsSubmitted(false);
    }
  };

  // ✅ Handle image preview
  const handleImagePreview = (e) => {
    const file = e.target.files[0];
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
        <h1 className="text-2xl font-bold text-center">Report Page</h1>

        {/* Type */}
        <div className="flex items-center border border-gray-700 rounded-lg px-3 py-2">
          <FileText className="mr-3 text-gray-400" />
          <input
            type="text"
            placeholder="Type of Report"
            className="bg-transparent outline-none w-full"
            {...register("type", { required: "Type is required" })}
            disabled={isSubmitted}
          />
        </div>
        {errors.type && (
          <p className="text-red-400 text-sm">{errors.type.message}</p>
        )}

        {/* Reward */}
        <div className="flex items-center border border-gray-700 rounded-lg px-3 py-2">
          <Coins className="mr-3 text-gray-400" />
          <input
            type="number"
            placeholder="Set Reward in SOL"
            className="bg-transparent outline-none w-full"
            {...register("reward", {
              required: "Reward is required",
              min: { value: 0.1, message: "Minimum 0.1 SOL" },
            })}
            disabled={isSubmitted}
          />
        </div>
        {errors.reward && (
          <p className="text-red-400 text-sm">{errors.reward.message}</p>
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
              {...register("image")}
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

      {/* ✅ Display submitted report info */}
      {storedData && (
        <div className="mt-6 bg-gray-800 p-6 rounded-xl shadow-lg text-sm space-y-2 w-96">
          <h2 className="text-lg font-semibold text-center mb-2">
            Your Submitted Report
          </h2>
          <p>
            <span className="text-gray-400">📋 Type:</span> {storedData.type}
          </p>
          <p>
            <span className="text-gray-400">💰 Reward:</span>{" "}
            {storedData.reward} SOL
          </p>
          <p>
            <span className="text-gray-400">📝 Description:</span>{" "}
            {storedData.description}
          </p>
          {storedData.imageUrl && (
            <img
              src={storedData.imageUrl}
              alt="Uploaded"
              className="rounded-lg mt-2 w-full h-40 object-cover"
            />
          )}
        </div>
      )}
    </main>
  );
};

export default Report;
