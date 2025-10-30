import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FileText, Coins, AlignLeft, Image as ImageIcon, Phone, Upload } from "lucide-react";
import supabase from "../supabase/supabase";
import { useUser } from "../store/store";

const Report = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const { user, setUser } = useUser();
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/connectWallet");
    }
  }, [navigate, setUser]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const { type, reward, description, contact_no } = data;
      let imageUrl = null;

      if (!imageFile) {
        toast.error("Please upload an image");
        setIsSubmitting(false);
        return;
      }

      const fileName = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("report-images")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("report-images")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;

      const { error } = await supabase
        .from("reports")
        .insert([{
          type,
          reward,
          description,
          image_url: imageUrl,
          contact_no,
          user_id: user.id,
          name: user.name
        }]);

      if (error) throw error;

      toast.success("Report submitted successfully!");
      setTimeout(() => navigate("/explore"), 1500);
    } catch (error) {
      toast.error(error.message);
      setIsSubmitting(false);
    }
  };

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <ToastContainer position="top-right" theme="dark" />
      
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Report Missing Item
          </h1>
          <p className="text-gray-400">Help others find what you've lost</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700/50 space-y-5"
        >
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Item Type
            </label>
            <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all">
              <FileText className="mr-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="e.g., Wallet, Phone, Keys"
                className="bg-transparent outline-none w-full text-white placeholder-gray-500"
                {...register("type", { required: "Item type is required" })}
                disabled={isSubmitting}
              />
            </div>
            {errors.type && (
              <p className="text-red-400 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contact Number
            </label>
            <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all">
              <Phone className="mr-3 text-gray-400" size={20} />
              <input
                type="tel"
                placeholder="Your phone number"
                className="bg-transparent outline-none w-full text-white placeholder-gray-500"
                {...register("contact_no", { required: "Contact number is required" })}
                disabled={isSubmitting}
              />
            </div>
            {errors.contact_no && (
              <p className="text-red-400 text-sm mt-1">{errors.contact_no.message}</p>
            )}
          </div>

          {/* Reward */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reward Amount (SOL)
            </label>
            <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-yellow-500 transition-all">
              <Coins className="mr-3 text-yellow-400" size={20} />
              <input
                type="number"
                step="0.01"
                placeholder="0.0"
                className="bg-transparent outline-none w-full text-white placeholder-gray-500"
                {...register("reward", {
                  required: "Reward is required",
                  min: { value: 0.1, message: "Minimum 0.1 SOL" },
                })}
                disabled={isSubmitting}
              />
              <span className="text-gray-400 ml-2 text-sm">SOL</span>
            </div>
            {errors.reward && (
              <p className="text-red-400 text-sm mt-1">{errors.reward.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <div className="flex items-start bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all">
              <AlignLeft className="mr-3 text-gray-400 mt-1" size={20} />
              <textarea
                placeholder="Provide details about the item (color, brand, location lost, etc.)"
                className="bg-transparent outline-none w-full resize-none h-28 text-white placeholder-gray-500"
                {...register("description", {
                  required: "Description is required",
                  minLength: { value: 10, message: "Description must be at least 10 characters" }
                })}
                disabled={isSubmitting}
              />
            </div>
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload Image
            </label>
            <div className="bg-gray-900/50 border-2 border-dashed border-gray-700 rounded-xl overflow-hidden hover:border-blue-500 transition-all">
              {preview ? (
                <div className="relative group">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="mx-auto mb-2 text-white" size={32} />
                      <span className="text-white font-medium">Change Image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      {...register("image", { required: "Image is required" })}
                      onChange={handleImagePreview}
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-12 cursor-pointer">
                  <ImageIcon className="text-gray-400 mb-3" size={48} />
                  <span className="text-gray-400 font-medium mb-1">Click to upload image</span>
                  <span className="text-gray-500 text-sm">PNG, JPG up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImagePreview}
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
              isSubmitting
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/50 active:scale-95"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Report"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/explore")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Explore
          </button>
        </div>
      </div>
    </main>
  );
};

export default Report;