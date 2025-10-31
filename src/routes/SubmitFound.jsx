import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AlignLeft, Image as ImageIcon, Phone, Upload, CheckCircle } from "lucide-react";
import supabase from "../supabase/supabase";
import { useUser} from "../store/store";

const SubmitFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const report = location.state?.report;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const { user, setUser } = useUser();
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (!report) {
      toast.error("No report found");
      navigate("/explore");
      return;
    }

    const userData = localStorage.getItem("userData");
    if (userData) {
      setUser(JSON.parse(userData));
getpub()
    } else {
      navigate("/connectWallet");
    }
  }, [navigate, setUser, report]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onSubmit = async (data) => {
    if (!imageFile) {
      setImageError("Please upload an image");
      toast.error("Please upload an image");
      return;
    }

    setIsSubmitting(true);
    try {
      const { description, contact_no } = data;

      const fileName = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("submit-images")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("submit-images")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;
       //getting walletaddress
      const res2=await supabase.from("users")
      .select('pubkey')
      .eq("id",useUser.getState().user.id)

      const { error } = await supabase.from("submits").insert([
        {
          description,
          report_id: report.id,
          image_url: imageUrl,
          contact_no,
          user_id: user.id,
          name: user.name,
          pubkey:res2.data[0].pubkey
        },
      ]);

      if (error) throw error;

      toast.success("Submission sent successfully!");
      setTimeout(() => navigate("/explore"), 1500);
    } catch (error) {
      toast.error(error.message);
      setIsSubmitting(false);
    }
  };
const getpub=async ()=>{
         //getting walletaddress
      const res2=await supabase.from("users")
      .select('pubkey')
      .eq("id",useUser.getState().user.id)
}
  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        setImageError("Please upload a valid image file");
        toast.error("Please upload a valid image file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setImageError("Image size must be less than 10MB");
        toast.error("Image size must be less than 10MB");
        return;
      }

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setImageError("");
      setValue("image", file);
      clearErrors("image");
    }
  };

  if (!report) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <ToastContainer position="top-right" theme="dark" />
      
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
            <CheckCircle className="text-green-400" size={32} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
            Submit Found Item
          </h1>
          <p className="text-gray-400">Confirm you found this item</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Original Report Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 h-fit">
            <h2 className="text-xl font-bold mb-4 text-gray-200">Original Report</h2>
            
            {report.image_url && (
              <img
                src={report.image_url}
                alt={report.type}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
            )}
            
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Item Type</span>
                <p className="text-white font-semibold">{report.type}</p>
              </div>
              
              <div>
                <span className="text-gray-400 text-sm">Description</span>
                <p className="text-gray-300 text-sm">{report.description}</p>
              </div>
              
              <div className="flex items-center justify-between py-3 px-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <span className="text-yellow-400 font-semibold text-sm">Reward</span>
                <span className="text-yellow-300 font-bold">{report.reward} SOL</span>
              </div>
              
              <div>
                <span className="text-gray-400 text-sm">Reported by</span>
                <p className="text-gray-300">{report.name}</p>
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 space-y-5"
          >
            <h2 className="text-xl font-bold text-gray-200 mb-4">Your Submission</h2>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Number
              </label>
              <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-green-500 transition-all">
                <Phone className="mr-3 text-gray-400" size={20} />
                <input
                  type="tel"
                  placeholder="Your phone number"
                  className="bg-transparent outline-none w-full text-white placeholder-gray-500"
                  {...register("contact_no", {
                    required: "Contact number is required",
                  })}
                  disabled={isSubmitting}
                />
              </div>
              {errors.contact_no && (
                <p className="text-red-400 text-sm mt-1">{errors.contact_no.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Details
              </label>
              <div className="flex items-start bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-green-500 transition-all">
                <AlignLeft className="mr-3 text-gray-400 mt-1" size={20} />
                <textarea
                  placeholder="Where and when did you find it? Any additional details..."
                  className="bg-transparent outline-none w-full resize-none h-28 text-white placeholder-gray-500"
                  {...register("description", {
                    required: "Description is required",
                    minLength: { value: 10, message: "Please provide more details (at least 10 characters)" }
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
                Upload Photo of Found Item
              </label>
              <div className={`bg-gray-900/50 border-2 border-dashed ${imageError ? 'border-red-500' : 'border-gray-700'} rounded-xl overflow-hidden hover:border-green-500 transition-all`}>
                {preview ? (
                  <div className="relative group">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
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
                        onChange={handleImagePreview}
                        disabled={isSubmitting}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center py-10 cursor-pointer">
                    <ImageIcon className="text-gray-400 mb-3" size={40} />
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
              {imageError && (
                <p className="text-red-400 text-sm mt-1">{imageError}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                isSubmitting
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-green-500/50 active:scale-95"
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
                "Submit Found Item"
              )}
            </button>
          </form>
        </div>

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

export default SubmitFound;