// // frontend/src/lib/endpoints.ts
// import api from "./api";

// export async function getSubmissions() {
//     const res = await api.get("/api/submissions");
//     return res.data;
// }

// export async function postSubmission(payload: any) {
//     const res = await api.post("/api/submissions", payload);
//     return res.data;
// }

// export async function uploadFile(formData: FormData) {
//     const res = await api.post("/api/uploads", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//     });
//     return res.data;
// }
