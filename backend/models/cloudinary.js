 import axios from "axios"
 const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "quickchat"); 

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dmors7zbo/image/upload",
      formData
    );
    return response.data.secure_url;
  };

export default uploadToCloudinary