// export const FileUploadUtils = {
//   async upload(file: File): Promise<string> {
//     let uploadUrl;
//     if (process.env.NEXT_PUBLIC_API_URL) {
//       uploadUrl = process.env.NEXT_PUBLIC_API_URL + "/upload";
//     } else {
//       uploadUrl = "/upload";
//     }
//     const formData = new FormData();
//     formData.append("file", file);

//     const res = await fetch(uploadUrl, {
//       method: "POST",
//       body: formData,
//     });

//     if (!res.ok) {
//       throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
//     }

//     const data = await res.json();
//     if (!data.url) {
//       throw new Error("Upload succeeded but no URL returned");
//     }

//     return data.url; // final S3 public URL
//   },
// };
