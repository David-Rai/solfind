import React from "react";
import { useForm } from "react-hook-form";

const ImageUploadForm = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    // data.image is a FileList (like input.files)
    const file = data.image[0]; // ✅ Get first file
    console.log("File:", file);
    console.log("File name:", file.name);
    console.log("File type:", file.type);
    console.log("File size:", file.size, "bytes");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="file"
        accept="image/*"
        {...register("image", { required: true })}
      />
      <button type="submit">Upload</button>
    </form>
  );
};

export default ImageUploadForm;
