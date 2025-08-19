import { AgentForm } from "@/app/types/AgentCreationSchema";

export async function handleSubmitAgent(args: AgentForm) {
  // Convert blob URL to file
  const response = await fetch(args.tokenImage as string);
  const blob = await response.blob();
  const file = new File([blob], "token-image.png", { type: blob.type });

  // Upload image
  const imageForm = new FormData();
  imageForm.append("image", file);

  const imageRes = await fetch(process.env.BACKEND_BASE_URL + "/upload/image", {
    method: "POST",
    body: imageForm,
  });

  const { url: imageUrl } = await imageRes.json();

  // Create agent
  const agentForm = new FormData();
  agentForm.set("tokenName", args.tokenName);
  agentForm.set("tokenTicker", args.tokenTicker);
  agentForm.set("tokenDescription", args.tokenDescription);
  agentForm.set("imageUrl", imageUrl);

  const agentRes = await fetch(process.env.BACKEND_BASE_URL + "/agents", {
    method: "POST",
    body: agentForm,
  });

  return await agentRes.json();
}
